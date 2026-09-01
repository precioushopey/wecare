import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { useConsent } from "@/features/consent/useConsent";

/**
 * Prototype consent notice. Shown until the visitor makes a choice (or reopens
 * it from the footer). Gates non-essential analytics only — essential storage
 * always runs. A real deployment replaces this with a consent-management
 * platform (see DESIGN-SPECIFICATION.md).
 */
export function ConsentBanner() {
  const { t } = useTranslation();
  const { needsChoice, acceptAll, essentialOnly } = useConsent();

  if (!needsChoice) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("consent.title")}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border glass-strong p-5 shadow-[var(--shadow-float)]">
        <p className="font-display text-base text-ink">{t("consent.title")}</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          {t("consent.body")}{" "}
          <Link
            to={paths.legal.cookies}
            className="underline underline-offset-2 hover:text-ink"
          >
            {t("consent.policyLink")}
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="cta"
            size="sm"
            onClick={acceptAll}
            className="w-full sm:w-auto"
          >
            {t("consent.acceptAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={essentialOnly}
            className="w-full sm:w-auto"
          >
            {t("consent.essentialOnly")}
          </Button>
        </div>
      </div>
    </div>
  );
}
