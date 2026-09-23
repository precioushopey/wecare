import { startTransition, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { usePageTitle } from "@/app/usePageTitle";
import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { NextSteps } from "@/components/marketing/NextSteps";
import { PageShell } from "@/components/marketing/PageShell";
import { getProductImage } from "@/data/products";
import { solutionHeroStrain, SOLUTION_BY_ID } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { AT_POSTCODE_RE } from "@/features/delivery/delivery";
import { addOrder } from "@/features/orders/orders";
import { getMedicalReview } from "@/features/review/review";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { hasJustSubmittedCheckout, markCheckoutSubmitted } from "./checkoutSubmission";

/** One address field's markup + keyboard/autofill config (Baymard / WHATWG
 *  autocomplete guidance). `phone` is the only optional field. */
const ADDRESS_FIELDS = [
  { name: "firstName", autoComplete: "given-name", autoCapitalize: "words" },
  { name: "lastName", autoComplete: "family-name", autoCapitalize: "words" },
  { name: "street", autoComplete: "street-address", autoCapitalize: "words" },
  {
    name: "postalCode",
    autoComplete: "postal-code",
    autoCapitalize: "off",
    inputMode: "numeric" as const,
    maxLength: 4,
  },
  { name: "city", autoComplete: "address-level2", autoCapitalize: "words" },
  {
    name: "phone",
    autoComplete: "tel",
    autoCapitalize: "off",
    inputMode: "tel" as const,
    type: "tel",
    optional: true,
  },
] as const;

type FieldName = (typeof ADDRESS_FIELDS)[number]["name"];

/** Trim-and-check. Returns a `checkout.errors.*` key (field-specific, so the
 *  message is adaptive — Baymard) or "" when valid. */
function validateField(name: FieldName, value: string): string {
  const v = value.trim();
  if (name === "phone") return ""; // optional, no strict format check
  if (name === "postalCode") return AT_POSTCODE_RE.test(v) ? "" : "postalCode";
  if (!v) return name; // "firstName" | "lastName" | "street" | "city"
  return "";
}

/**
 * "Review & confirm your request" (funnel re-sequence, 2026-09-08). Collects a
 * shipping address and — for a signed-out visitor — inline account fields, plus
 * two required confirmations. No price, no payment: "Submit my request" records
 * a local request order (`totalEur: null`) and routes to the confirmation page.
 * The price and any medical-review fee are confirmed after the review.
 */
export function CheckoutPage() {
  const { t } = useTranslation("shop");
  const { items, hasPrescriptionItem, clear } = useCart();
  const { isAuthenticated, user, signIn } = useAuth();
  const { postcode, deliveryRegion } = useAssessment();
  const navigate = useNavigate();

  usePageTitle(t("checkout.title"), undefined, { noindex: true });

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [termsOk, setTermsOk] = useState(false);
  const [disclaimerOk, setDisclaimerOk] = useState(false);

  // Account fields — only collected for a signed-out visitor. This page is no
  // longer behind an auth guard (funnel re-sequence): on submit we
  // `signIn(email, name)` so the request order has a persistent identity to be
  // tracked against.
  const [account, setAccount] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [accountErrors, setAccountErrors] = useState<
    Partial<Record<"email" | "password" | "passwordConfirm", string>>
  >({});

  function validateAccount(): boolean {
    if (isAuthenticated) return true;
    const e: typeof accountErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) e.email = "email";
    if (account.password.length < 8) e.password = "password";
    if (account.password !== account.passwordConfirm)
      e.passwordConfirm = "passwordConfirm";
    setAccountErrors(e);
    return Object.keys(e).length === 0;
  }

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
      phone: user?.phone ?? "",
    };
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );

  const setField = (name: FieldName, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: validateField(name, value) || undefined }));
    }
  };
  const blurField = (name: FieldName) => {
    setTouched((tch) => ({ ...tch, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validateField(name, values[name]) || undefined }));
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

  const canSubmit = termsOk && disclaimerOk && !submitting;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    // Validate every address field; on failure show the errors, mark all
    // touched, and jump focus to the first offending field (Baymard: autoscroll
    // to the first error).
    const nextErrors: Partial<Record<FieldName, string>> = {};
    for (const f of ADDRESS_FIELDS) {
      const err = validateField(f.name, values[f.name]);
      if (err) nextErrors[f.name] = err;
    }
    const accountOk = validateAccount();
    if (
      Object.keys(nextErrors).length > 0 ||
      !termsOk ||
      !disclaimerOk ||
      !accountOk
    ) {
      setErrors(nextErrors);
      setTouched(Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, true])));
      const first = ADDRESS_FIELDS.find((f) => nextErrors[f.name]);
      if (first) document.getElementById(first.name)?.focus();
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
      totalEur: null,
      status: hasPrescriptionItem ? "inReview" : "processing",
      shipTo: {
        firstName: v("firstName"),
        lastName: v("lastName"),
        street: v("street"),
        postalCode: v("postalCode"),
        city: v("city"),
        country: t("checkout.countryValue"),
        ...(v("phone") ? { phone: v("phone") } : {}),
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
        signIn(account.email.trim(), `${v("firstName")} ${v("lastName")}`.trim());
      });
    }
  }

  return (
    <PageShell>
      {/* Collapsed order summary, mobile only — the full summary otherwise
          sits in the right-hand aside, which stacks to the very bottom on
          narrow screens (after the whole address form). This lets a phone
          visitor confirm what they're ordering before filling anything in,
          without duplicating the submit button / next-steps block below. */}
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
        <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm md:text-base text-petrol-700">
          {t("checkout.priceAfterReview")}
        </p>
      </details>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {isAuthenticated ? (
            <fieldset className="space-y-3">
              <legend className="text-lg md:text-xl font-medium text-ink">
                {t("checkout.customerHeading")}
              </legend>
              <p className="rounded-xl border border-border bg-surface-raised p-3 text-sm md:text-base text-ink-muted">
                {t("checkout.signedInAs")}{" "}
                <span className="font-medium text-ink">{user?.email}</span>
              </p>
            </fieldset>
          ) : (
            <fieldset className="space-y-4">
              <legend className="text-lg md:text-xl font-medium text-ink">
                {t("checkout.accountHeading")}
              </legend>
              <p className="text-sm md:text-base text-ink-muted">
                {t("checkout.accountIntro")}
              </p>
              {(["email", "password", "passwordConfirm"] as const).map((k) => (
                <div key={k} className="space-y-1.5">
                  <Label htmlFor={`acct-${k}`}>{t(`checkout.fields.${k}`)}</Label>
                  {k === "email" ? (
                    <Input
                      id={`acct-${k}`}
                      type="email"
                      autoComplete="email"
                      value={account[k]}
                      onChange={(e) =>
                        setAccount((a) => ({ ...a, [k]: e.target.value }))
                      }
                      aria-invalid={Boolean(accountErrors[k]) || undefined}
                      aria-describedby={
                        accountErrors[k] ? `acct-${k}-error` : undefined
                      }
                      required
                    />
                  ) : (
                    <PasswordInput
                      id={`acct-${k}`}
                      autoComplete="new-password"
                      value={account[k]}
                      onChange={(e) =>
                        setAccount((a) => ({ ...a, [k]: e.target.value }))
                      }
                      aria-invalid={Boolean(accountErrors[k]) || undefined}
                      aria-describedby={
                        accountErrors[k] ? `acct-${k}-error` : undefined
                      }
                      required
                    />
                  )}
                  {accountErrors[k] ? (
                    <p
                      id={`acct-${k}-error`}
                      role="alert"
                      className="text-sm md:text-base text-danger-600"
                    >
                      {t(`checkout.errors.${accountErrors[k]}`)}
                    </p>
                  ) : null}
                </div>
              ))}
            </fieldset>
          )}

          <fieldset className="space-y-4">
            <legend className="text-lg md:text-xl font-medium text-ink">
              {t("checkout.shippingHeading")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {ADDRESS_FIELDS.map((f) => {
                const showError = Boolean(errors[f.name] && touched[f.name]);
                const optional = "optional" in f && f.optional;
                // First/last sit side by side; street + phone span the row.
                const wide = f.name === "street" || f.name === "phone";
                const describedBy =
                  [
                    showError ? `${f.name}-error` : null,
                    f.name === "phone" ? "phone-hint" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined;
                return (
                  <div
                    key={f.name}
                    className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                  >
                    <Label htmlFor={f.name}>
                      {t(`checkout.fields.${f.name}`)}
                      {optional ? (
                        <span className="ml-1 font-normal text-ink-muted">
                          {t("checkout.optionalLabel")}
                        </span>
                      ) : null}
                    </Label>
                    <Input
                      id={f.name}
                      name={f.name}
                      type={"type" in f ? f.type : "text"}
                      inputMode={"inputMode" in f ? f.inputMode : undefined}
                      maxLength={"maxLength" in f ? f.maxLength : undefined}
                      autoComplete={f.autoComplete}
                      autoCapitalize={f.autoCapitalize}
                      autoCorrect="off"
                      spellCheck={false}
                      required={!optional}
                      value={values[f.name]}
                      onChange={(e) => setField(f.name, e.target.value)}
                      onBlur={() => blurField(f.name)}
                      aria-invalid={showError || undefined}
                      aria-describedby={describedBy}
                    />
                    {f.name === "phone" ? (
                      <p id="phone-hint" className="text-sm md:text-base text-ink-muted">
                        {t("checkout.fields.phoneHint")}
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
              <div className="space-y-1.5">
                <Label htmlFor="country">{t("checkout.fields.country")}</Label>
                <Input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={t("checkout.countryValue")}
                  readOnly
                />
              </div>
            </div>
            {postcode ? (
              <DeliveryConfirmation
                postcode={postcode}
                region={deliveryRegion}
              />
            ) : null}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg md:text-xl font-medium text-ink">
              {t("checkout.termsHeading")}
            </legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm md:text-base text-ink">
              <input
                type="checkbox"
                checked={termsOk}
                onChange={(e) => setTermsOk(e.target.checked)}
                required
                className="mt-0.5 size-4 accent-petrol-600"
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
            <label className="flex cursor-pointer items-start gap-3 text-sm md:text-base text-ink">
              <input
                type="checkbox"
                checked={disclaimerOk}
                onChange={(e) => setDisclaimerOk(e.target.checked)}
                required
                className="mt-0.5 size-4 accent-petrol-600"
              />
              <span>{t("checkout.disclaimerLabel")}</span>
            </label>
          </fieldset>
        </div>

        <aside className="h-fit rounded-2xl md:rounded-3xl glass-strong p-6">
          <h2 className="text-base md:text-lg">{t("checkout.summaryHeading")}</h2>
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
          <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm md:text-base text-petrol-700">
            {t("checkout.priceAfterReview")}
          </p>

          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {t("checkout.nextHeading")}
            </p>
            <div className="mt-3">
              <NextSteps
                steps={(["received", "review", "dispatch"] as const).map((k) => ({
                  title: t(`confirmation.steps.${k}.title`),
                  body: t(`confirmation.steps.${k}.body`),
                }))}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="cta"
            className="mt-5 w-full"
            disabled={!canSubmit}
          >
            {t("checkout.placeOrder")}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            {/* Was linking to paths.assessment.result — which redirects to the
                product page, not the cart, since a "Back to cart" button
                should self-evidently open the cart (bug fix, 2026-09-14). */}
            <Link to={paths.cart}>{t("checkout.backToCart")}</Link>
          </Button>
        </aside>
      </form>
    </PageShell>
  );
}
