import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { COMMERCE_ENABLED, PRICES_CONFIRMED } from "@/config";
import { CheckoutSteps } from "@/components/marketing/CheckoutSteps";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { NextSteps } from "@/components/marketing/NextSteps";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { SOLUTION_BY_ID } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { AT_POSTCODE_RE } from "@/features/delivery/delivery";
import { addOrder } from "@/features/orders/orders";
import {
  ENABLED_PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/features/payments/payments";
import { getMedicalReview } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatPriceEur } from "@/lib/format";

const DELIVERY_FEE_EUR = 0;

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
 * Checkout form (doc section 11). Collects customer details, shipping address,
 * a payment-method choice, and two required confirmations. No real payment is
 * taken — "Place order" records a local mock order.
 */
export function CheckoutPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const { items, subtotalEur, hasPrescriptionItem, clear } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { postcode, deliveryRegion } = useAssessment();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState<PaymentMethodId>(
    ENABLED_PAYMENT_METHODS[0]?.id ?? "invoice",
  );
  const [termsOk, setTermsOk] = useState(false);
  const [disclaimerOk, setDisclaimerOk] = useState(false);

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
    // Only a checkout that will actually render the form counts as "started" —
    // not a hit that redirects to medical review or lands on the gated panel.
    if (
      checkoutTracked.current ||
      !isAuthenticated ||
      items.length === 0 ||
      !COMMERCE_ENABLED ||
      getMedicalReview()?.status !== "approved"
    ) {
      return;
    }
    checkoutTracked.current = true;
    track(AnalyticsEvent.checkoutStarted, {
      itemCount: items.length,
      value: subtotalEur,
    });
  }, [isAuthenticated, items.length, subtotalEur]);

  // Once the order is placed we clear the cart, which empties `items`. Without
  // the `placed` guard the empty-cart redirect below would fire on that same
  // render and pre-empt the navigation to the confirmation page.
  if (items.length === 0 && !placed) {
    return <Navigate to={paths.cart} replace />;
  }

  // Auth is enforced one level up by `DashboardLayout` (this page is a
  // `/dashboard/*` route now), which also forwards `reason: "checkout"` to
  // the login page.

  // No regulated product can be ordered before the medical review is approved
  // (PO decision B1). Every cart item is prescription-only, so gate the whole
  // checkout: send the user to their review (or to start it).
  if (!placed && getMedicalReview()?.status !== "approved") {
    return (
      <Navigate
        to={
          getMedicalReview()
            ? paths.assessment.review
            : paths.assessment.medicalReview
        }
        replace
      />
    );
  }

  // Commercial checkout is off until real pharmacy prices exist (PO decision —
  // hard production blocker). Show what the flow will be, not a "Place order"
  // running on placeholder totals.
  if (!COMMERCE_ENABLED && !placed) {
    return (
      <div className="mx-auto max-w-2xl">
        <CheckoutSteps current="review" className="mb-6" />
        <div className="rounded-2xl md:rounded-3xl glass-strong p-6 text-center">
          <h2 className="text-lg">{t("checkoutUnavailable.heading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t("checkoutUnavailable.body")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="cta" className="w-full sm:w-auto">
              <Link to={paths.dashboardRecommendation}>
                {t("checkoutUnavailable.cta")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={paths.cart}>{t("checkout.backToCart")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalEur = subtotalEur + DELIVERY_FEE_EUR;
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
    if (Object.keys(nextErrors).length > 0 || !termsOk || !disclaimerOk) {
      setErrors(nextErrors);
      setTouched(
        Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, true])),
      );
      const first = ADDRESS_FIELDS.find((f) => nextErrors[f.name]);
      if (first) document.getElementById(first.name)?.focus();
      return;
    }

    setSubmitting(true);
    setPlaced(true);
    const v = (k: FieldName) => values[k].trim();
    const order = addOrder({
      lines: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      totalEur,
      status: hasPrescriptionItem ? "inReview" : "processing",
      paymentMethod: payment,
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
    track(AnalyticsEvent.orderPlaced, {
      orderId: order.id,
      value: totalEur,
      paymentMethod: payment,
    });
    navigate(paths.orderConfirmation, {
      state: { orderId: order.id },
      replace: true,
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <CheckoutSteps current="details" className="mb-6" />
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {/* The customer is already signed in to reach checkout — show the
              account email as a confirmation instead of asking for it again
              (stakeholder feedback, Sept 2026: re-entering the email here was a
              redundant step). */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium text-ink">
              {t("checkout.customerHeading")}
            </legend>
            <p className="rounded-xl border border-border bg-surface-raised p-3 text-sm text-ink-muted">
              {t("checkout.signedInAs")}{" "}
              <span className="font-medium text-ink">{user?.email}</span>
            </p>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-ink">
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
                      <p id="phone-hint" className="text-xs text-ink-muted">
                        {t("checkout.fields.phoneHint")}
                      </p>
                    ) : null}
                    {showError ? (
                      <p
                        id={`${f.name}-error`}
                        role="alert"
                        className="text-sm text-danger-600"
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
            <legend className="text-lg font-medium text-ink">
              {t("checkout.paymentHeading")}
            </legend>
            {ENABLED_PAYMENT_METHODS.map(({ id }) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
              >
                <input
                  type="radio"
                  name="payment"
                  value={id}
                  checked={payment === id}
                  onChange={() => setPayment(id)}
                  className="size-4 accent-petrol-600"
                />
                <span className="text-sm text-ink">
                  {t(`checkout.paymentMethods.${id}`)}
                </span>
              </label>
            ))}
            <p className="text-sm text-ink-muted">{t("checkout.paymentNote")}</p>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg font-medium text-ink">
              {t("checkout.termsHeading")}
            </legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
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
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
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
          <h2 className="text-base">{t("checkout.summaryHeading")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => {
              const s = SOLUTION_BY_ID[i.productId];
              return (
                <li key={i.productId} className="flex items-center gap-3">
                  <SolutionMark
                    solution={s}
                    className="size-9 shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 flex-1 text-ink-muted">
                    {s.name} · {t("cart.grams", { count: i.quantity })}
                  </span>
                  <span className="shrink-0 font-mono text-ink">
                    {formatPriceEur(s.priceEur * i.quantity, language)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">{t("cart.subtotal")}</span>
              <span className="font-mono text-ink">
                {formatPriceEur(subtotalEur, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">
                {t("checkout.deliveryLabel")}
              </span>
              <span className="text-ink">
                {DELIVERY_FEE_EUR === 0
                  ? t("checkout.deliveryFree")
                  : formatPriceEur(DELIVERY_FEE_EUR, language)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink-muted">{t("checkout.reviewLine")}</span>
              <Link
                to={paths.costs}
                className="text-right text-ink underline underline-offset-2 hover:text-ink-muted"
              >
                {t("checkout.reviewLineValue")}
              </Link>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
            <span className="font-medium text-ink">{t("cart.total")}</span>
            <span className="font-mono font-medium text-ink">
              {formatPriceEur(totalEur, language)}
            </span>
          </div>
          {!PRICES_CONFIRMED ? (
            <p className="mt-2 text-xs text-ink-muted">
              {t("pricesIndicative")}
            </p>
          ) : null}

          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
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
            size="lg"
            className="mt-5 w-full"
            disabled={!canSubmit}
          >
            {t("checkout.placeOrder")}
          </Button>
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
            <Link to={paths.cart}>{t("checkout.backToCart")}</Link>
          </Button>
        </aside>
      </form>
    </div>
  );
}
