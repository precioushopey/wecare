import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Mail, Truck } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { SUPPORT_EMAIL } from "@/config";
import { PageShell } from "@/components/marketing/PageShell";
import { getProductImage } from "@/data/products";
import { solutionHeroStrain, SOLUTION_BY_ID } from "@/data/solutions";
import { getOrders } from "@/features/orders/orders";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

import { clearCheckoutSubmitted } from "./checkoutSubmission";

export function OrderConfirmationPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const location = useLocation();

  usePageTitle(t("confirmation.title"), undefined, { noindex: true });

  // Having reached the confirmation page, CheckoutPage's "just submitted"
  // grace flag (see checkoutSubmission.ts) has done its job — clear it so a
  // later, genuinely stale /checkout visit is guarded normally again.
  useEffect(() => {
    clearCheckoutSubmitted();
  }, []);

  // Prefer the id handed over by checkout; fall back to the most recent stored
  // order so a refresh or a direct visit still resolves instead of bouncing.
  const state = location.state as { orderId?: string } | null;
  const orders = getOrders();
  const order = orders.find((o) => o.id === state?.orderId) ?? orders[0];

  if (!order) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <PageShell maxWidth="max-w-2xl" className="py-10 text-center">
      <CheckCircle2
        className="mx-auto size-12 text-sage-500"
        strokeWidth={1.5}
        aria-hidden
      />
      {/* A thank-you page for a placed order (Mischa, 2026-09-25): it opens with
          a headline that says so — until now it had none, only an icon and a
          paragraph, and read as a status page — then, in his order: shipping
          cut-off, order summary, the email note, "check your orders". This
          describes the TARGET flow (order placed + paid, doctor already
          approved in the flow); see the launch dependencies in CLAUDE.md. */}
      <h1 className="mt-4 font-display text-2xl md:text-3xl text-ink">
        {t("confirmation.heading")}
      </h1>
      <p className="mt-3 text-ink-muted">{t("confirmation.body")}</p>
      <p className="mt-3 font-mono text-sm md:text-base text-ink">
        {t("confirmation.orderLabel", { id: order.id })}
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-sage-50 p-4 text-left">
        <Truck className="mt-0.5 size-5 shrink-0 text-petrol-600" aria-hidden />
        <p className="text-sm md:text-base text-ink">
          <span className="font-semibold">{t("confirmation.shippingHeading")}</span>{" "}
          {t("confirmation.shipping")}
        </p>
      </div>

      {/* Order recap + where it's going — the two things a confirmation page
          must make immediately scannable (Baymard order-tracking guidance). */}
      <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-raised/60 p-4">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {t("confirmation.itemsHeading")}
          </p>
          <ul className="mt-2 space-y-2 text-sm md:text-base">
            {order.lines.map((l) => {
              const s = SOLUTION_BY_ID[l.productId];
              return (
                <li key={l.productId} className="flex items-center gap-2.5">
                  <ImageWithFallback
                    src={getProductImage(solutionHeroStrain(s))}
                    alt=""
                    className="size-8 shrink-0 rounded-lg bg-sage-50/70 object-contain p-0.5"
                  />
                  <span className="min-w-0 flex-1 text-ink-muted">
                    {s.name} · {t("cart.grams", { count: l.quantity })}
                  </span>
                  {order.totalEur != null ? (
                    <span className="shrink-0 font-mono text-ink">
                      {formatPriceEur(s.priceEur * l.quantity, language)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {order.totalEur != null || order.paymentMethod ? (
            <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm md:text-base">
              {order.totalEur != null ? (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">
                    {t("confirmation.totalLabel")}
                  </dt>
                  <dd className="font-mono font-medium text-ink">
                    {formatPriceEur(order.totalEur, language)}
                  </dd>
                </div>
              ) : null}
              {order.paymentMethod ? (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">
                    {t("confirmation.paymentLabel")}
                  </dt>
                  <dd className="text-ink">
                    {t(`checkout.paymentMethods.${order.paymentMethod}`)}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>

        {order.shipTo ? (
          <div className="rounded-2xl border border-border bg-surface-raised/60 p-4">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {t("confirmation.shipToHeading")}
            </p>
            <address className="mt-2 text-sm md:text-base not-italic leading-relaxed text-ink">
              {order.shipTo.firstName} {order.shipTo.lastName}
              <br />
              {order.shipTo.street}
              <br />
              {order.shipTo.postalCode} {order.shipTo.city}
              <br />
              {order.shipTo.country}
              {order.shipTo.phone ? (
                <>
                  <br />
                  {order.shipTo.phone}
                </>
              ) : null}
            </address>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-start gap-3 text-left">
        <Mail className="mt-0.5 size-5 shrink-0 text-petrol-600" aria-hidden />
        <p className="text-sm md:text-base text-ink">{t("confirmation.emailNote")}</p>
      </div>

      {/* `sm:flex-row-reverse`: "Back to home" left, "Check your orders" right
          (owner request, 2026-09-25 — same as the assessment gates). Visual only:
          the DOM stays primary-first and it stacks primary-on-top on a phone. */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row-reverse sm:flex-wrap sm:justify-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.dashboardOrders}>{t("confirmation.toOrders")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={paths.home}>{t("confirmation.toHome")}</Link>
        </Button>
      </div>

      <p className="mt-6 text-sm md:text-base text-ink-muted">
        {t("confirmation.support", { email: SUPPORT_EMAIL })}
      </p>
    </PageShell>
  );
}
