import { useState } from "react";
import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { PageShell } from "@/components/marketing/PageShell";

/**
 * Legal-consent gate shown once (per device) before the assessment, after
 * `AgeGate` (PO request, 2026-09-14). Links to the real `/legal/terms` and
 * `/legal/privacy` documents rather than restating or inventing their
 * content — those pages carry their own "draft, not yet in effect" notice.
 */
export function LegalConsentGate({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation("assessment");
  const [checked, setChecked] = useState(false);

  return (
    <PageShell maxWidth="max-w-xl" className="py-16">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl md:text-3xl text-ink">
          {t("legalGate.title")}
        </h1>
        <p className="mt-3 text-ink-muted">{t("legalGate.body")}</p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-surface-raised p-4 text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-petrol-600"
          />
          <span>
            <Trans
              t={t}
              i18nKey="legalGate.checkbox"
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="cta"
            disabled={!checked}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {t("legalGate.continue")}
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link to={paths.home}>{t("legalGate.back")}</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
