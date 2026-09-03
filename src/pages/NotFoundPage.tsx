import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle(t("pages.notFound.title"), undefined, { noindex: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
        404
      </p>
      <h1 className="mt-3">{t("pages.notFound.title")}</h1>
      <p className="mt-4 text-lg text-ink-muted">
        {t("pages.notFound.description")}
      </p>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.home}>{t("pages.notFound.backHome")}</Link>
        </Button>
        {/* General Wellness is reachable only from dead ends like this one. */}
        <Link
          to={paths.conditions.generalWellness}
          className="text-sm font-medium text-petrol-700 underline-offset-4 hover:underline"
        >
          {t("pages.notFound.notSure")}
        </Link>
      </div>
    </div>
  );
}
