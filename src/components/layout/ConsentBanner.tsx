import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { useConsent } from "@/features/consent/useConsent";

/**
 * Prototype consent notice. Two categories the site actually has:
 * **Essential** (locked on — language, cart, questionnaire progress, sign-in,
 * this choice) and **Analytics** (optional — the PostHog EU measurement seam).
 * "Accept all" / "Essential only" are one-click paths; the Analytics toggle +
 * "Save choices" lets a visitor pick. Gates non-essential analytics only —
 * essential storage always runs.
 *
 * A real deployment replaces this with a consent-management platform
 * (Usercentrics — see CLAUDE.md / DESIGN-SPECIFICATION.md): that adds vendor
 * scanning, consent logging/proof and pre-consent script blocking this
 * prototype does not do.
 */
export function ConsentBanner() {
  const { needsChoice } = useConsent();
  // Remount the body each time the banner (re)opens so the toggle re-seeds
  // from the stored choice.
  if (!needsChoice) return null;
  return <ConsentBannerBody />;
}

function ConsentBannerBody() {
  const { t } = useTranslation();
  const { analyticsAllowed, acceptAll, essentialOnly, setChoice } = useConsent();
  const [analytics, setAnalytics] = useState(analyticsAllowed);

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

        <ul className="mt-4 space-y-2.5">
          <li className="flex items-start gap-3 rounded-xl border border-border bg-surface-raised/60 p-3">
            <input
              type="checkbox"
              checked
              disabled
              aria-label={t("consent.categories.essential.label")}
              className="mt-0.5 size-4 shrink-0 accent-petrol-600"
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                {t("consent.categories.essential.label")}
                <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-petrol-700">
                  {t("consent.alwaysOn")}
                </span>
              </span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                {t("consent.categories.essential.desc")}
              </span>
            </span>
          </li>
          <li className="rounded-xl border border-border bg-surface-raised/60 p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-petrol-600"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">
                  {t("consent.categories.analytics.label")}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {t("consent.categories.analytics.desc")}
                </span>
              </span>
            </label>
          </li>
        </ul>

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
            onClick={() => setChoice(analytics ? "all" : "essential")}
            className="w-full sm:w-auto"
          >
            {t("consent.save")}
          </Button>
          <Button
            type="button"
            variant="ghost"
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
