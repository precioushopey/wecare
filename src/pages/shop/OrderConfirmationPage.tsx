import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { getOrders } from "@/features/orders/orders";

export function OrderConfirmationPage() {
  const { t } = useTranslation("shop");
  const location = useLocation();
  usePageTitle(t("confirmation.title"));

  // Prefer the id handed over by checkout; fall back to the most recent stored
  // order so a refresh or a direct visit still resolves instead of bouncing.
  const state = location.state as { orderId?: string } | null;
  const orderId = state?.orderId ?? getOrders()[0]?.id;

  if (!orderId) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <CheckCircle2
        className="mx-auto size-12 text-sage-500"
        strokeWidth={1.5}
        aria-hidden
      />
      <h1 className="mt-4">{t("confirmation.title")}</h1>
      <p className="mt-3 text-ink-muted">{t("confirmation.body")}</p>
      <p className="mt-4 font-mono text-sm text-ink">
        {t("confirmation.orderLabel", { id: orderId })}
      </p>

      {/* Forward-looking status, not an "IF it's approved" sentence
          (stakeholder feedback, Sept 2026). */}
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {t("confirmation.stepsHeading")}
      </p>
      <ol className="mx-auto mt-4 grid max-w-md gap-4 text-left">
        {(["received", "review", "dispatch"] as const).map((k, i) => (
          <li key={k} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 font-display text-sm text-petrol-700">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                {t(`confirmation.steps.${k}.title`)}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t(`confirmation.steps.${k}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.dashboardOrders}>{t("confirmation.toOrders")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={paths.home}>{t("confirmation.toHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
