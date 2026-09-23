import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PageShell } from "@/components/marketing/PageShell";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle(t("pages.notFound.title"), undefined, { noindex: true });

  return (
    <PageShell className="py-24">
      <PageHeader
        eyebrow="404"
        title={t("pages.notFound.title")}
        intro={t("pages.notFound.description")}
      />

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.home}>{t("pages.notFound.backHome")}</Link>
        </Button>
        {/* General Wellness is reachable only from dead ends like this one. */}
        <Link
          to={paths.conditions.generalWellness}
          className="text-sm md:text-base font-medium text-petrol-700 underline-offset-4 hover:underline"
        >
          {t("pages.notFound.notSure")}
        </Link>
      </div>
    </PageShell>
  );
}
