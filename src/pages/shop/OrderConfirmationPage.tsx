import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { NextSteps } from "@/components/marketing/NextSteps";
import { getOrders } from "@/features/orders/orders";

export function OrderConfirmationPage() {
  const { t } = useTranslation("shop");
  const location = useLocation();

  // Prefer the id handed over by checkout; fall back to the most recent stored
  // order so a refresh or a direct visit still resolves instead of bouncing.
  const state = location.state as { orderId?: string } | null;
  const orderId = state?.orderId ?? getOrders()[0]?.id;

  if (!orderId) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <CheckCircle2
        className="mx-auto size-12 text-sage-500"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="mt-4 text-ink-muted">{t("confirmation.body")}</p>
      <p className="mt-4 font-mono text-sm text-ink">
        {t("confirmation.orderLabel", { id: orderId })}
      </p>

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
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.dashboardOrders}>{t("confirmation.toOrders")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={paths.dashboard}>{t("confirmation.toHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
