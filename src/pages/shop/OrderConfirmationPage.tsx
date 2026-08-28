import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";

export function OrderConfirmationPage() {
  const { t } = useTranslation("shop");
  const location = useLocation();
  usePageTitle(t("confirmation.title"));

  const state = location.state as { orderId?: string } | null;
  const orderId = state?.orderId;

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

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="cta">
          <Link to={paths.dashboardOrders}>{t("confirmation.toOrders")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={paths.home}>{t("confirmation.toHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
