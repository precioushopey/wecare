import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { SOLUTION_BY_ID } from "@/data/solutions";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { addOrder } from "@/features/orders/orders";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatPriceEur } from "@/lib/format";

const CONTACT_FIELDS = ["email"] as const;
const ADDRESS_FIELDS = [
  "firstName",
  "lastName",
  "street",
  "postalCode",
  "city",
] as const;
const PAYMENT_METHODS = ["invoice", "bankTransfer"] as const;
const DELIVERY_FEE_EUR = 0;

/**
 * Checkout form (doc section 11). Collects customer details, shipping address,
 * a payment-method choice, and two required confirmations. No real payment is
 * taken — "Place order" records a local mock order.
 */
export function CheckoutPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const { items, subtotalEur, hasPrescriptionItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  usePageTitle(t("checkout.title"));

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]>(
    "invoice",
  );
  const [termsOk, setTermsOk] = useState(false);
  const [disclaimerOk, setDisclaimerOk] = useState(false);

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || !isAuthenticated || items.length === 0)
      return;
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

  // Checkout is for signed-in users — send guests to log in first, then back.
  if (!isAuthenticated) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: paths.checkout, reason: "checkout" }}
      />
    );
  }

  const totalEur = subtotalEur + DELIVERY_FEE_EUR;
  const canSubmit = termsOk && disclaimerOk && !submitting;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!termsOk || !disclaimerOk || submitting) return;
    setSubmitting(true);
    setPlaced(true);
    const order = addOrder({
      lines: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      totalEur,
      status: hasPrescriptionItem ? "inReview" : "processing",
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
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="product" className="mb-8" />
      <h1>{t("checkout.title")}</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-ink">
              {t("checkout.customerHeading")}
            </legend>
            {CONTACT_FIELDS.map((f) => (
              <div key={f} className="space-y-1.5">
                <Label htmlFor={f}>{t(`checkout.fields.${f}`)}</Label>
                <Input id={f} name={f} type="email" required autoComplete="email" />
              </div>
            ))}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-ink">
              {t("checkout.shippingHeading")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {ADDRESS_FIELDS.map((f) => (
                <div
                  key={f}
                  className={
                    f === "street" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"
                  }
                >
                  <Label htmlFor={f}>{t(`checkout.fields.${f}`)}</Label>
                  <Input id={f} name={f} required />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label htmlFor="country">{t("checkout.fields.country")}</Label>
                <Input
                  id="country"
                  name="country"
                  value={t("checkout.countryValue")}
                  readOnly
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg font-medium text-ink">
              {t("checkout.paymentHeading")}
            </legend>
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
              >
                <input
                  type="radio"
                  name="payment"
                  value={m}
                  checked={payment === m}
                  onChange={() => setPayment(m)}
                  className="size-4 accent-petrol-600"
                />
                <span className="text-sm text-ink">
                  {t(`checkout.paymentMethods.${m}`)}
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

        <aside className="h-fit rounded-3xl glass-strong p-6">
          <h2 className="text-base">{t("checkout.summaryHeading")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => {
              const s = SOLUTION_BY_ID[i.productId];
              return (
                <li key={i.productId} className="flex justify-between gap-3">
                  <span className="text-ink-muted">
                    {s.name} · {t("cart.grams", { count: i.quantity })}
                  </span>
                  <span className="font-mono text-ink">
                    {formatPriceEur(s.priceEur * i.quantity, language)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-ink-muted">{t("cart.subtotal")}</span>
            <span className="font-mono text-ink">
              {formatPriceEur(subtotalEur, language)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-ink-muted">{t("checkout.deliveryLabel")}</span>
            <span className="text-ink">
              {DELIVERY_FEE_EUR === 0
                ? t("checkout.deliveryFree")
                : formatPriceEur(DELIVERY_FEE_EUR, language)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
            <span className="font-medium text-ink">{t("cart.total")}</span>
            <span className="font-mono font-medium text-ink">
              {formatPriceEur(totalEur, language)}
            </span>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            {t("checkout.reviewFeeNote")}{" "}
            <Link
              to={paths.costs}
              className="underline underline-offset-2 hover:text-ink"
            >
              {t("checkout.reviewFeeLink")}
            </Link>
          </p>
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
