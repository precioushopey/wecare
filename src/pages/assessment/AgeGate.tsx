import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { calculateAge } from "@/features/age/age";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 18+ gate shown once (per device) before the assessment (owner decision
 * D14, revised — PO decision set 4, Sept 2026: collects an actual date of
 * birth, not just a checkbox). Not identity verification — the regulated
 * check is done later by the medical / pharmacy partner.
 */
export function AgeGate({ onConfirm }: { onConfirm: (dobIso: string) => void }) {
  const { t } = useTranslation("assessment");
  const [checked, setChecked] = useState(false);
  const [dob, setDob] = useState("");
  const [tooYoung, setTooYoung] = useState(false);

  const canSubmit = checked && dob !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    if (calculateAge(dob) < 18) {
      setTooYoung(true);
      return;
    }
    onConfirm(dob);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
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

        <div className="mt-4">
          <label
            htmlFor="age-gate-dob"
            className="text-sm font-medium text-ink"
          >
            {t("ageGate.dobLabel")}
          </label>
          <input
            id="age-gate-dob"
            type="date"
            required
            max={todayIso()}
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setTooYoung(false);
            }}
            className="mt-1.5 block w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink"
          />
          <p className="mt-1.5 text-xs text-ink-muted">{t("ageGate.dobNote")}</p>
          {tooYoung ? (
            <p className="mt-2 text-sm text-danger-600">
              {t("ageGate.dobTooYoung")}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="cta"
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
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
