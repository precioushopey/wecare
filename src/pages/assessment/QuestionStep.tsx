import { useTranslation } from "react-i18next";

import type { Question } from "@/features/assessment/questions";

/** One assessment question — the frosted card with a radio option list.
 *  Selection is reported via `onSelect`; the parent decides whether to
 *  auto-advance. */
export function QuestionStep({
  question,
  current,
  onSelect,
}: {
  question: Question;
  current: string | undefined;
  onSelect: (value: string) => void;
}) {
  const { t } = useTranslation("assessment");
  const note = t(`questions.${question.id}.note`, { defaultValue: "" });

  return (
    <fieldset className="glass-strong mt-8 rounded-2xl md:rounded-3xl p-6 sm:p-8">
      <legend className="float-left mb-1 w-full font-display text-xl md:text-2xl text-ink">
        {t(`questions.${question.id}.title`)}
      </legend>
      {note ? (
        <p className="clear-both text-sm text-ink-muted">{note}</p>
      ) : null}
      <div className="grid gap-4 clear-both mt-16">
        {question.options.map((opt) => {
          const id = `${question.id}-${opt}`;
          const hint = t(`questions.${question.id}.hints.${opt}`, {
            defaultValue: "",
          });
          return (
            <label
              key={opt}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-surface-raised p-4 transition-colors hover:border-petrol-300 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol-600"
            >
              <input
                type="radio"
                id={id}
                name={question.id}
                value={opt}
                checked={current === opt}
                onChange={() => onSelect(opt)}
                className="mt-0.5 size-4 shrink-0 accent-petrol-600"
              />
              <span className="min-w-0">
                <span className="block text-ink">
                  {t(`questions.${question.id}.options.${opt}`)}
                </span>
                {hint ? (
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {hint}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
