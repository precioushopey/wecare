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

import { OptionTile } from "./OptionTile";
import { StepFrame } from "./StepFrame";

type YesNo = "yes" | "no" | undefined;

/** A required Yes / No question: the question as a small heading, two tiles
 *  side by side. */
function YesNoRow({
  name,
  question,
  value,
  onChange,
  yes,
  no,
}: {
  name: string;
  question: string;
  value: YesNo;
  onChange: (v: "yes" | "no") => void;
  yes: string;
  no: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-2 text-base md:text-lg font-medium text-ink">
        {question}
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {(["yes", "no"] as const).map((opt) => (
          <OptionTile
            key={opt}
            id={`${name}-${opt}`}
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            label={opt === "yes" ? yes : no}
          />
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
  initial,
}: {
  onComplete: (x: AssessmentExclusions) => void;
  /** Seed the answers — so stepping back to a prior question and returning
   *  doesn't wipe the safety answers (the step is keyed / remounts). */
  initial?: AssessmentExclusions;
}) {
  const { t } = useTranslation("assessment");
  const [pregnancy, setPregnancy] = useState<YesNo>(initial?.pregnancy);
  const [recentSupply, setRecentSupply] = useState<YesNo>(initial?.recentSupply);
  const [conditions, setConditions] = useState<ExclusionConditionKey[]>(
    initial?.conditions ?? [],
  );

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
    <StepFrame
      eyebrow={t("phase.finalChecks")}
      title={t("exclusion.heading")}
      subtitle={t("exclusion.sub")}
    >
      <YesNoRow
        name="safety-pregnancy"
        question={t("exclusion.pregnancy.q")}
        value={pregnancy}
        onChange={setPregnancy}
        yes={t("exclusion.yes")}
        no={t("exclusion.no")}
      />
      <YesNoRow
        name="safety-recent-supply"
        question={t("exclusion.recentSupply.q")}
        value={recentSupply}
        onChange={setRecentSupply}
        yes={t("exclusion.yes")}
        no={t("exclusion.no")}
      />

      <fieldset className="mt-6">
        <legend className="mb-2 text-base md:text-lg font-medium text-ink">
          {t("exclusion.conditions.q")}
        </legend>
        <div className="grid gap-3">
          {[...EXCLUSION_CONDITION_KEYS, "none" as const].map((key) => (
            <OptionTile
              key={key}
              type="checkbox"
              id={`safety-condition-${key}`}
              checked={conditions.includes(key)}
              onChange={() => setConditions((c) => toggleCondition(c, key))}
              label={t(`exclusion.conditions.${key}`)}
            />
          ))}
        </div>
      </fieldset>

      {showNote ? (
        <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm md:text-base text-ink-muted">
          {t("exclusion.flaggedNote")}
        </p>
      ) : null}

      {!canSubmit ? (
        <p className="mt-4 text-center text-sm md:text-base text-ink-muted">
          {t("exclusion.requiredPrompt")}
        </p>
      ) : null}
      <div className="mt-4 flex justify-center">
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
    </StepFrame>
  );
}
