import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";

/**
 * 18+ self-declaration shown once (per browser) before the assessment
 * (owner decision D14). Not identity verification — the regulated check is
 * done later by the medical / pharmacy partner.
 */
export function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation("assessment");
  const [checked, setChecked] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl text-ink">{t("ageGate.title")}</h1>
        <p className="mt-3 text-ink-muted">{t("ageGate.body")}</p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-surface-raised p-4 text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-petrol-600"
          />
          <span>{t("ageGate.checkbox")}</span>
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="cta"
            size="lg"
            disabled={!checked}
            onClick={onConfirm}
          >
            {t("ageGate.continue")}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to={paths.home}>{t("ageGate.back")}</Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-ink-muted">{t("ageGate.under")}</p>
      </div>
    </div>
  );
}
