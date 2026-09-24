import { startTransition, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { usePageTitle } from "@/app/usePageTitle";
import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { PRICES_CONFIRMED, REVIEW_FEE_EUR, SHIPPING_FEE_EUR } from "@/config";
import { FUNNEL_MAX_W_WIDE } from "@/components/layout/FunnelChrome";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { PageShell } from "@/components/marketing/PageShell";
import { getProductImage } from "@/data/products";
import { solutionHeroStrain, SOLUTION_BY_ID } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { calculateAge, getStoredDob } from "@/features/age/age";
import type { DeliveryCountry } from "@/features/delivery/country";
import { countryForPostcode, isValidPostcode } from "@/features/delivery/delivery";
import { addOrder } from "@/features/orders/orders";
import {
  CHECKOUT_PAYMENT_METHODS,
  ENABLED_PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/features/payments/payments";
import { getMedicalReview } from "@/features/review/review";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatPriceEur } from "@/lib/format";

import { hasJustSubmittedCheckout, markCheckoutSubmitted } from "./checkoutSubmission";
import { PhoneVerification } from "./PhoneVerification";

/** One delivery field's markup + keyboard/autofill config (Baymard / WHATWG
 *  autocomplete guidance), in the changes-matrix order (2026-09-24): name,
 *  street, PLZ, city, country, birthday, email. Every field is required. The
 *  phone number is not here — it has its own SMS-verified block above.
 *  `dob` is prefilled from the age gate's device-level date and re-validated
 *  18+ here because this one is tied to the customer's name and goes to the
 *  medical/pharmacy identity chain. `country` is Austria or Germany (Mischa,
 *  2026-09-24: "Germany is wanted to market too"); it decides which postcode
 *  format is valid (4 digits AT / 5 digits DE). `email` is the account email:
 *  read-only when already signed in. */
const ADDRESS_FIELDS = [
  { name: "firstName", autoComplete: "given-name", autoCapitalize: "words" },
  { name: "lastName", autoComplete: "family-name", autoCapitalize: "words" },
  { name: "street", autoComplete: "street-address", autoCapitalize: "words" },
  {
    name: "postalCode",
    autoComplete: "postal-code",
    autoCapitalize: "off",
    inputMode: "numeric" as const,
  },
  { name: "city", autoComplete: "address-level2", autoCapitalize: "words" },
  { name: "country", autoComplete: "country", autoCapitalize: "off" },
  { name: "dob", autoComplete: "bday", autoCapitalize: "off", type: "date" },
  {
    name: "email",
    autoComplete: "email",
    autoCapitalize: "off",
    inputMode: "email" as const,
    type: "email",
  },
] as const;

type FieldName = (typeof ADDRESS_FIELDS)[number]["name"];

/** Fields that carry a muted helper line under the input (`checkout.fields.<key>`). */
const HINT_KEYS: Partial<Record<FieldName, string>> = {
  dob: "dobHint",
};

/** Local-date `YYYY-MM-DD` for the date input's `max` (not UTC, so it doesn't
 *  allow "tomorrow" late in the evening). */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A native `<select>` styled like `Input` (there's no shadcn Select vendored). */
const SELECT_CLASS =
  "border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const MIN_AGE = 18;
const MAX_PLAUSIBLE_AGE = 120;

/** Trim-and-check. Returns a `checkout.errors.*` key (field-specific, so the
 *  message is adaptive — Baymard) or "" when valid. */
function validateField(
  name: FieldName,
  value: string,
  country: DeliveryCountry,
): string {
  const v = value.trim();
  if (name === "country") return ""; // fixed value
  if (name === "email") return /^\S+@\S+\.\S+$/.test(v) ? "" : "email";
  if (name === "postalCode") {
    if (isValidPostcode(v, country)) return "";
    return country === "DE" ? "postalCodeDe" : "postalCode";
  }
  if (name === "dob") {
    const age = calculateAge(v);
    // Empty / unparseable / future / implausible → the generic "enter your date
    // of birth" message; a real date under 18 gets its own message.
    if (!v || age < 0 || v > todayIso() || age > MAX_PLAUSIBLE_AGE) return "dob";
    return age >= MIN_AGE ? "" : "dobUnderage";
  }
  if (!v) return name; // "firstName" | "lastName" | "street" | "city"
  return "";
}

/**
 * "Review & confirm your request" (funnel re-sequence, 2026-09-08). Collects a
 * phone number verified by SMS (changes-matrix, 2026-09-24: no password), the
 * delivery details, and two required confirmations. No price, no payment: "Submit my request" records
 * a local request order (`totalEur: null`) and routes to the confirmation page.
 * The price and any medical-review fee are confirmed after the review.
 */
export function CheckoutPage() {
  const { t, i18n } = useTranslation("shop");
  const { items, hasPrescriptionItem, clear } = useCart();
  const { isAuthenticated, user, signIn, updateProfile } = useAuth();
  const { postcode, deliveryRegion } = useAssessment();
  const navigate = useNavigate();

  usePageTitle(t("checkout.title"), undefined, { noindex: true });

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [termsOk, setTermsOk] = useState(false);
  // Wire transfer is preselected (the first method that can be taken today);
  // card / Apple Pay / crypto are listed but disabled until a provider is wired.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(
    () => ENABLED_PAYMENT_METHODS.find((m) => m.id === "bankTransfer")?.id ?? "bankTransfer",
  );

  // Phone number confirmed by SMS (changes-matrix, 2026-09-24) — replaces the old
  // email + password account block. This page is no longer behind an auth guard
  // (funnel re-sequence): on submit a signed-out visitor gets `signIn(email,
  // name, phone)` so the request order has a persistent identity to be tracked
  // against. A signed-in visitor whose saved number is already verified skips
  // the SMS step.
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() =>
    user?.phone && user.phoneVerified ? user.phone : null,
  );
  const [phoneError, setPhoneError] = useState<string | undefined>();

  // Address fields — controlled so input survives a validation error (Baymard:
  // never clear form data on error) and so we can validate on blur.
  const [values, setValues] = useState<Record<FieldName, string>>(() => {
    const [first = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
    return {
      firstName: first,
      lastName: rest.join(" "),
      street: "",
      postalCode: postcode ?? "",
      city: "",
      // Germany when the delivery postcode from the assessment has 5 digits.
      country: countryForPostcode(postcode ?? "") ?? "AT",
      dob: getStoredDob() ?? "",
      email: user?.email ?? "",
    };
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );

  const country: DeliveryCountry = values.country === "DE" ? "DE" : "AT";

  const setField = (name: FieldName, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    const nextCountry: DeliveryCountry =
      name === "country" ? (value === "DE" ? "DE" : "AT") : country;
    if (errors[name]) {
      setErrors((e) => ({
        ...e,
        [name]: validateField(name, value, nextCountry) || undefined,
      }));
    }
    // Switching country changes which postcode format is valid.
    if (name === "country" && touched.postalCode) {
      setErrors((e) => ({
        ...e,
        postalCode:
          validateField("postalCode", values.postalCode, nextCountry) || undefined,
      }));
    }
  };
  const blurField = (name: FieldName) => {
    setTouched((tch) => ({ ...tch, [name]: true }));
    setErrors((e) => ({
      ...e,
      [name]: validateField(name, values[name], country) || undefined,
    }));
  };

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || items.length === 0) return;
    checkoutTracked.current = true;
    track(AnalyticsEvent.checkoutStarted, { itemCount: items.length });
  }, [items.length]);

  // Once the order is placed we clear the cart, which empties `items`. Without
  // the `placed` guard the empty-cart redirect below would fire on that same
  // render and pre-empt the navigation to the confirmation page. `placed`
  // alone isn't enough, though: a signed-out submit's `signIn()` remounts this
  // component (see checkoutSubmission.ts), which resets `placed` to `false` —
  // `hasJustSubmittedCheckout()` covers that remount.
  if (items.length === 0 && !placed && !hasJustSubmittedCheckout()) {
    return <Navigate to={paths.assessment.result} replace />;
  }
  // A request cannot be submitted without a medical review behind it. The
  // review is created at the end of the assessment pass; a visitor who reached
  // /checkout without one (e.g. a deep link into /shop/:id) is sent to start.
  if (!placed && !getMedicalReview() && !hasJustSubmittedCheckout()) {
    return <Navigate to={paths.assessment.start} replace />;
  }

  // Order summary (Mischa, 2026-09-24): per-product name / grams / price per
  // gram, DHL shipping, subtotal, doctor's fee, total. Shipping and the fee are
  // `null` until confirmed, and the total only exists once both are known.
  const lines = items.map((i) => {
    const solution = SOLUTION_BY_ID[i.productId];
    return { solution, grams: i.quantity, lineTotal: solution.priceEur * i.quantity };
  });
  const productsEur = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const subtotalEur = productsEur + (SHIPPING_FEE_EUR ?? 0);
  const totalEur =
    SHIPPING_FEE_EUR !== null && REVIEW_FEE_EUR !== null
      ? subtotalEur + REVIEW_FEE_EUR
      : null;
  const money = (v: number | null) =>
    v === null ? t("checkout.summary.tbc") : formatPriceEur(v, i18n.language);

  const canSubmit = termsOk && !submitting;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    // Validate every address field; on failure show the errors, mark all
    // touched, and jump focus to the first offending field (Baymard: autoscroll
    // to the first error).
    const nextErrors: Partial<Record<FieldName, string>> = {};
    for (const f of ADDRESS_FIELDS) {
      const err = validateField(f.name, values[f.name], country);
      if (err) nextErrors[f.name] = err;
    }
    const phone = verifiedPhone;
    if (
      Object.keys(nextErrors).length > 0 ||
      !termsOk ||
      !phone
    ) {
      setErrors(nextErrors);
      setTouched(Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, true])));
      if (!phone) {
        // The phone block is the first thing on the page, so it gets focus first.
        setPhoneError("phoneUnverified");
        (
          document.getElementById("phone-code") ??
          document.getElementById("phone")
        )?.focus();
      } else {
        const first = ADDRESS_FIELDS.find((f) => nextErrors[f.name]);
        if (first) document.getElementById(first.name)?.focus();
      }
      return;
    }

    // Set before any state update so it's already true on whatever render
    // comes next — including a remounted one from the signIn()-triggered
    // provider remount below.
    markCheckoutSubmitted();
    setSubmitting(true);
    setPlaced(true);
    const v = (k: FieldName) => values[k].trim();

    const order = addOrder({
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      totalEur,
      paymentMethod,
      status: hasPrescriptionItem ? "inReview" : "processing",
      shipTo: {
        firstName: v("firstName"),
        lastName: v("lastName"),
        street: v("street"),
        postalCode: v("postalCode"),
        city: v("city"),
        country: t(`checkout.countries.${country}`),
        phone,
        dateOfBirth: v("dob"),
      },
    });
    clear();
    // (existing) the cart context is keyed by sessionKey; a signed-out submit
    // calls signIn() below, which remounts CartProvider — remove the key so the
    // remounted provider loads an empty cart.
    try {
      window.localStorage.removeItem("wecare.cart");
    } catch {
      /* ignore */
    }
    track(AnalyticsEvent.requestSubmitted, { reference: order.id });
    navigate(paths.orderConfirmation, {
      state: { orderId: order.id },
      replace: true,
    });
    if (!isAuthenticated) {
      // Defer account creation to the router's transition lane so the
      // sessionKey-driven remount lands in the same commit as the route
      // change (at /order-confirmation), not an intermediate one at /checkout.
      startTransition(() => {
        signIn(v("email"), `${v("firstName")} ${v("lastName")}`.trim(), phone);
      });
    } else if (!(user?.phone === phone && user.phoneVerified)) {
      updateProfile({ phone, phoneVerified: true });
    }
  }

  return (
    <PageShell maxWidth={FUNNEL_MAX_W_WIDE}>
      <h1 className="mb-6 font-display text-2xl md:text-3xl text-ink">
        {t("checkout.heading")}
      </h1>

      {/* Collapsed order summary, mobile only — the full summary otherwise
          sits in the right-hand aside, which stacks to the very bottom on
          narrow screens (after the whole address form). This lets a phone
          visitor confirm what they're ordering before filling anything in,
          without duplicating the submit button below. */}
      <details className="group mb-6 rounded-2xl glass-strong p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm md:text-base font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          <span>
            {t("checkout.summaryHeading")} ·{" "}
            {t("checkout.summaryCount", { count: items.length })}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <ul className="mt-4 space-y-3 text-sm md:text-base">
          {items.map((i) => {
            const s = SOLUTION_BY_ID[i.productId];
            return (
              <li key={i.productId} className="flex items-center gap-3">
                <ImageWithFallback
                  src={getProductImage(solutionHeroStrain(s))}
                  alt=""
                  className="size-9 shrink-0 rounded-lg bg-sage-50/70 object-contain p-0.5"
                />
                <span className="min-w-0 flex-1 text-ink-muted">
                  {s.name} · {t("cart.grams", { count: i.quantity })}
                </span>
              </li>
            );
          })}
        </ul>
      </details>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <PhoneVerification
            verifiedPhone={verifiedPhone}
            initialPhone={user?.phone ?? ""}
            error={phoneError}
            onVerified={(p) => {
              setVerifiedPhone(p);
              setPhoneError(undefined);
            }}
            onReset={() => setVerifiedPhone(null)}
          />

          <fieldset className="space-y-4">
            <legend className="text-lg md:text-xl font-medium text-ink">
              {t("checkout.shippingHeading")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {ADDRESS_FIELDS.map((f) => {
                const showError = Boolean(errors[f.name] && touched[f.name]);
                // The account email can't be edited once signed in.
                const readOnly = f.name === "email" && isAuthenticated;
                // First/last and PLZ/city sit side by side; street, date of
                // birth and email span the row (the DOB helper line wraps badly
                // in a half-width cell).
                const wide =
                  f.name === "street" || f.name === "dob" || f.name === "email";
                const hintKey = HINT_KEYS[f.name];
                const describedBy =
                  [
                    showError ? `${f.name}-error` : null,
                    hintKey ? `${f.name}-hint` : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined;
                return (
                  <div
                    key={f.name}
                    className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                  >
                    <Label htmlFor={f.name}>{t(`checkout.fields.${f.name}`)}</Label>
                    {f.name === "country" ? (
                      <select
                        id="country"
                        name="country"
                        autoComplete={f.autoComplete}
                        value={country}
                        onChange={(e) => setField("country", e.target.value)}
                        className={SELECT_CLASS}
                      >
                        {(["AT", "DE"] as const).map((c) => (
                          <option key={c} value={c}>
                            {t(`checkout.countries.${c}`)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={f.name}
                        name={f.name}
                        type={"type" in f ? f.type : "text"}
                        inputMode={"inputMode" in f ? f.inputMode : undefined}
                        maxLength={
                          f.name === "postalCode" ? (country === "DE" ? 5 : 4) : undefined
                        }
                        max={f.name === "dob" ? todayIso() : undefined}
                        autoComplete={f.autoComplete}
                        autoCapitalize={f.autoCapitalize}
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        readOnly={readOnly}
                        value={values[f.name]}
                        onChange={(e) => setField(f.name, e.target.value)}
                        onBlur={() => blurField(f.name)}
                        aria-invalid={showError || undefined}
                        aria-describedby={describedBy}
                      />
                    )}
                    {hintKey ? (
                      <p
                        id={`${f.name}-hint`}
                        className="text-sm md:text-base text-ink-muted"
                      >
                        {t(`checkout.fields.${hintKey}`)}
                      </p>
                    ) : null}
                    {showError ? (
                      <p
                        id={`${f.name}-error`}
                        role="alert"
                        className="text-sm md:text-base text-danger-600"
                      >
                        {t(`checkout.errors.${errors[f.name]}`)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {postcode ? (
              <DeliveryConfirmation
                postcode={postcode}
                region={deliveryRegion}
              />
            ) : null}
          </fieldset>
        </div>

        <aside className="h-fit space-y-5 rounded-2xl md:rounded-3xl glass-strong p-6">
          <h2 className="text-base md:text-lg">{t("checkout.summaryHeading")}</h2>

          <ul className="space-y-3 text-sm md:text-base">
            {lines.map(({ solution: sol, grams, lineTotal }) => (
              <li key={sol.id} className="flex items-start gap-3">
                <ImageWithFallback
                  src={getProductImage(solutionHeroStrain(sol))}
                  alt=""
                  className="size-9 shrink-0 rounded-lg bg-sage-50/70 object-contain p-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{sol.name}</span>
                  <span className="block text-ink-muted">
                    {t("checkout.summary.perGram", {
                      grams,
                      price: formatPriceEur(sol.priceEur, i18n.language),
                    })}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {formatPriceEur(lineTotal, i18n.language)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border pt-4 text-sm md:text-base">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-muted">{t("checkout.summary.shipping")}</dt>
              <dd className="tabular-nums text-ink-muted">{money(SHIPPING_FEE_EUR)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-medium text-ink">{t("checkout.summary.subtotal")}</dt>
              <dd className="tabular-nums font-medium text-ink">
                {formatPriceEur(subtotalEur, i18n.language)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-muted">{t("checkout.summary.reviewFee")}</dt>
              <dd className="tabular-nums text-ink-muted">{money(REVIEW_FEE_EUR)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-base md:text-lg">
              <dt className="font-semibold text-ink">{t("checkout.summary.total")}</dt>
              <dd className="tabular-nums font-semibold text-ink">{money(totalEur)}</dd>
            </div>
          </dl>
          <p className="text-xs md:text-sm text-ink-muted">{t("checkout.vatNote")}</p>
          {!PRICES_CONFIRMED ? (
            <p className="rounded-xl bg-sage-50 p-3 text-sm md:text-base text-petrol-700">
              {t("pricesIndicative")}
            </p>
          ) : null}

          <div className="border-t border-border pt-4">
          <fieldset>
            <legend className="mb-2 text-base md:text-lg font-medium text-ink">
              {t("checkout.payment.heading")}
            </legend>
            <div className="grid gap-2">
              {CHECKOUT_PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 border-petrol-900/10 bg-white/85 px-4 py-3 text-sm md:text-base text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol-600",
                    m.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    disabled={!m.enabled}
                    onChange={() => setPaymentMethod(m.id)}
                    className="size-4 shrink-0 accent-petrol-600"
                  />
                  <span className="min-w-0 flex-1">{t(`checkout.paymentMethods.${m.id}`)}</span>
                  {!m.enabled ? (
                    <span className="shrink-0 text-xs md:text-sm text-ink-muted">
                      {t("checkout.payment.soon")}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          </fieldset>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm md:text-base text-ink">
            <input
              type="checkbox"
              checked={termsOk}
              onChange={(e) => setTermsOk(e.target.checked)}
              required
              className="mt-0.5 size-4 shrink-0 accent-petrol-600"
            />
            <span>
              <Trans
                t={t}
                i18nKey="checkout.termsLabel"
                components={{
                  terms: (
                    <Link
                      to={paths.legal.terms}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-ink"
                    />
                  ),
                  privacy: (
                    <Link
                      to={paths.legal.privacy}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-ink"
                    />
                  ),
                }}
              />
            </span>
          </label>

          <div>
            <Button
              type="submit"
              variant="cta"
              className="w-full"
              disabled={!canSubmit}
            >
              {t("checkout.placeOrder")}
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to={paths.cart}>{t("checkout.backToCart")}</Link>
            </Button>
          </div>
        </aside>
      </form>
    </PageShell>
  );
}
