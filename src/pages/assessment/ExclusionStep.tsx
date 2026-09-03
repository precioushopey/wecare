import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import {
  EXCLUSION_CONDITION_KEYS,
  hasAnyFlag,
  toggleCondition,
  type AssessmentExclusions,
  type ExclusionConditionKey,
} from "@/features/assessment/exclusions";

type YesNo = "yes" | "no" | undefined;

function YesNoRow({
  question,
  value,
  onChange,
  yes,
  no,
}: {
  question: string;
  value: YesNo;
  onChange: (v: "yes" | "no") => void;
  yes: string;
  no: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-medium text-ink">{question}</legend>
      <div className="mt-2 flex gap-3">
        {(["yes", "no"] as const).map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
          >
            <input
              type="radio"
              className="size-4 accent-petrol-600"
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt === "yes" ? yes : no}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Safety questions collected on the way to medical review (PO decision B2).
 * The two Yes/No questions are **required** before submission; the conditions
 * checklist stays optional. Still purely informational — no "Yes = rejected"
 * logic; the answers are inputs for the reviewing doctor.
 */
export function ExclusionStep({
  onComplete,
  hideHeading = false,
}: {
  onComplete: (x: AssessmentExclusions) => void;
  /** The page already supplies a heading + context (medical-review page). */
  hideHeading?: boolean;
}) {
  const { t } = useTranslation("assessment");
  const [pregnancy, setPregnancy] = useState<YesNo>(undefined);
  const [recentSupply, setRecentSupply] = useState<YesNo>(undefined);
  const [conditions, setConditions] = useState<ExclusionConditionKey[]>([]);

  const payload = useMemo<AssessmentExclusions>(
    () => ({
      pregnancy,
      recentSupply,
      conditions: conditions.length ? conditions : undefined,
    }),
    [pregnancy, recentSupply, conditions],
  );

  const canSubmit = pregnancy !== undefined && recentSupply !== undefined;
  const showNote = hasAnyFlag(payload);

  return (
    <div className="mt-8">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
        {hideHeading ? null : (
          <h2 className="font-display text-xl md:text-2xl text-ink">
            {t("exclusion.heading")}
          </h2>
        )}
        <p className={hideHeading ? "text-sm text-ink-muted" : "mt-2 text-sm text-ink-muted"}>
          {t("exclusion.sub")}
        </p>

        <YesNoRow
          question={t("exclusion.pregnancy.q")}
          value={pregnancy}
          onChange={setPregnancy}
          yes={t("exclusion.yes")}
          no={t("exclusion.no")}
        />
        <YesNoRow
          question={t("exclusion.recentSupply.q")}
          value={recentSupply}
          onChange={setRecentSupply}
          yes={t("exclusion.yes")}
          no={t("exclusion.no")}
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink">
            {t("exclusion.conditions.q")}
          </legend>
          <div className="mt-2 grid gap-2">
            {[...EXCLUSION_CONDITION_KEYS, "none" as const].map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 text-sm text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-petrol-600"
                  checked={conditions.includes(key)}
                  onChange={() =>
                    setConditions((c) => toggleCondition(c, key))
                  }
                />
                {t(`exclusion.conditions.${key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        {showNote ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm text-ink-muted">
            {t("exclusion.flaggedNote")}
          </p>
        ) : null}
      </div>

      {!canSubmit ? (
        <p className="mt-3 text-sm text-ink-muted">
          {t("exclusion.requiredPrompt")}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="cta"
          disabled={!canSubmit}
          onClick={() => onComplete(payload)}
          className="w-full sm:w-auto"
        >
          {t("exclusion.continue")}
        </Button>
      </div>
    </div>
  );
}
