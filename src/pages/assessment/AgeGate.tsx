import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { PageShell } from "@/components/marketing/PageShell";
import { calculateAge } from "@/features/age/age";

import { OptionTile } from "./OptionTile";
import { StepFrame } from "./StepFrame";

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
    const age = calculateAge(dob);
    // `min`/`max` on the input guard the picker; this also catches a
    // hand-typed date outside a plausible range.
    if (age < 18 || age > 120) {
      setTooYoung(true);
      return;
    }
    onConfirm(dob);
  }

  return (
    <PageShell className="py-10">
      <StepFrame
        eyebrow={t("phase.leadIn")}
        title={t("ageGate.title")}
        subtitle={t("ageGate.body")}
      >
        <OptionTile
          type="checkbox"
          id="age-gate-confirm"
          checked={checked}
          onChange={() => setChecked((c) => !c)}
          label={t("ageGate.checkbox")}
        />

        <div className="mt-4">
          <label
            htmlFor="age-gate-dob"
            className="text-sm md:text-base font-medium text-ink"
          >
            {t("ageGate.dobLabel")}
          </label>
          <input
            id="age-gate-dob"
            type="date"
            required
            min="1926-01-01"
            max={todayIso()}
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setTooYoung(false);
            }}
            className="mt-1.5 block w-full rounded-xl border-2 border-border bg-white/85 px-4 py-3 text-ink"
          />
          <p className="mt-1.5 text-sm md:text-base text-ink-muted">{t("ageGate.dobNote")}</p>
          {tooYoung ? (
            <p role="alert" className="mt-2 text-sm md:text-base text-danger-600">
              {t("ageGate.dobTooYoung")}
            </p>
          ) : null}
        </div>

        {/* `sm:flex-row-reverse`: "Back to home" on the left, the primary on the
            right (Mischa/owner, 2026-09-25) — a visual swap only. The DOM order
            stays primary-first so Tab goes from the date field straight to
            Continue, and the stacked phone layout keeps Continue on top. */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:flex-wrap sm:items-center sm:justify-center">
          <Button
            type="button"
            variant="cta"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {t("ageGate.continue")}
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link to={paths.home}>{t("ageGate.back")}</Link>
          </Button>
        </div>

        <p className="mt-4 text-center text-sm md:text-base text-ink-muted">{t("ageGate.under")}</p>
      </StepFrame>
    </PageShell>
  );
}
