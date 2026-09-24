import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { Question } from "@/features/assessment/questions";

import { OptionTile } from "./OptionTile";
import { StepFrame } from "./StepFrame";

/** One assessment question — a centred title with a stack of option tiles.
 *  Selection is reported via `onSelect`; the parent decides whether to
 *  auto-advance. `intro` (the first question's "about 60 to 90 seconds, not a
 *  medical form" line) replaces the question's own note as the subtitle;
 *  `topNote` sits above the tiles (the "pre-selected from the page you came
 *  from" line). */
export function QuestionStep({
  question,
  current,
  onSelect,
  eyebrow,
  intro,
  topNote,
}: {
  question: Question;
  current: string | undefined;
  onSelect: (value: string) => void;
  eyebrow?: ReactNode;
  intro?: ReactNode;
  topNote?: ReactNode;
}) {
  const { t } = useTranslation("assessment");
  const note = t(`questions.${question.id}.note`, { defaultValue: "" });
  const titleId = `${question.id}-title`;

  return (
    <StepFrame
      eyebrow={eyebrow}
      title={t(`questions.${question.id}.title`)}
      titleId={titleId}
      subtitle={intro ?? (note || undefined)}
    >
      {topNote ? (
        <p className="mb-4 rounded-lg bg-sage-50 px-4 py-3 text-center text-sm md:text-base text-petrol-700">
          {topNote}
        </p>
      ) : null}
      <div role="radiogroup" aria-labelledby={titleId} className="grid gap-3">
        {question.options.map((opt) => (
          <OptionTile
            key={opt}
            id={`${question.id}-${opt}`}
            name={question.id}
            value={opt}
            checked={current === opt}
            onChange={() => onSelect(opt)}
            label={t(`questions.${question.id}.options.${opt}`)}
            hint={t(`questions.${question.id}.hints.${opt}`, {
              defaultValue: "",
            })}
          />
        ))}
      </div>
    </StepFrame>
  );
}
