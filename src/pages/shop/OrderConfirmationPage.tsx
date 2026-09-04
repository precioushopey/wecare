import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { SUPPORT_EMAIL } from "@/config";
import { CheckoutSteps } from "@/components/marketing/CheckoutSteps";
import { NextSteps } from "@/components/marketing/NextSteps";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { SOLUTION_BY_ID } from "@/data/solutions";
import { getOrders } from "@/features/orders/orders";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

export function OrderConfirmationPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const location = useLocation();

  // Prefer the id handed over by checkout; fall back to the most recent stored
  // order so a refresh or a direct visit still resolves instead of bouncing.
  const state = location.state as { orderId?: string } | null;
  const orders = getOrders();
  const order = orders.find((o) => o.id === state?.orderId) ?? orders[0];

  if (!order) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <CheckoutSteps current="complete" className="mb-8" />
      <CheckCircle2
        className="mx-auto size-12 text-sage-500"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="mt-4 text-ink-muted">{t("confirmation.body")}</p>
      <p className="mt-4 font-mono text-sm text-ink">
        {t("confirmation.orderLabel", { id: order.id })}
      </p>

      {/* Order recap + where it's going — the two things a confirmation page
          must make immediately scannable (Baymard order-tracking guidance). */}
      <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-raised/60 p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {t("confirmation.itemsHeading")}
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {order.lines.map((l) => {
              const s = SOLUTION_BY_ID[l.productId];
              return (
                <li key={l.productId} className="flex items-center gap-2.5">
                  <SolutionMark
                    solution={s}
                    className="size-8 shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 flex-1 text-ink-muted">
                    {s.name} · {t("cart.grams", { count: l.quantity })}
                  </span>
                  <span className="shrink-0 font-mono text-ink">
                    {formatPriceEur(s.priceEur * l.quantity, language)}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t("confirmation.totalLabel")}</dt>
              <dd className="font-mono font-medium text-ink">
                {formatPriceEur(order.totalEur, language)}
              </dd>
            </div>
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
        </div>

        {order.shipTo ? (
          <div className="rounded-2xl border border-border bg-surface-raised/60 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {t("confirmation.shipToHeading")}
            </p>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ink">
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

      {/* Forward-looking status, not an "IF it's approved" sentence
          (stakeholder feedback, Sept 2026). */}
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {t("confirmation.stepsHeading")}
      </p>
      <div className="mx-auto mt-4 max-w-md text-left">
        <NextSteps
          steps={(["received", "review", "dispatch"] as const).map((k) => ({
            title: t(`confirmation.steps.${k}.title`),
            body: t(`confirmation.steps.${k}.body`),
          }))}
        />
        <p className="mt-4 text-xs text-ink-muted">
          {t("confirmation.timingNote")}
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.dashboardOrders}>{t("confirmation.toOrders")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={paths.dashboard}>{t("confirmation.toHome")}</Link>
        </Button>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        {t("confirmation.support", { email: SUPPORT_EMAIL })}
      </p>
    </div>
  );
}
