import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  answeredCount,
  QUESTIONS,
  TOTAL_QUESTIONS,
} from "@/features/assessment/questions";
import { isConditionKey } from "@/features/conditions/conditions";

/** Single reusable, state-based assessment engine — no route changes between
 *  questions (spec Section 7). */
export function AssessmentEnginePage() {
  const { t } = useTranslation("assessment");
  const { answers, setAnswer, submit, prefillProblem, reset } = useAssessment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  usePageTitle(t("start.title"));

  const problemParam = params.get("problem");

  useEffect(() => {
    if (problemParam && isConditionKey(problemParam)) {
      prefillProblem(problemParam);
    }
  }, [problemParam, prefillProblem]);

  const [step, setStep] = useState(() => {
    const firstUnanswered = QUESTIONS.findIndex((q) => !answers[q.id]);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  const question = QUESTIONS[step];
  const current = answers[question.id];
  const isLast = step === TOTAL_QUESTIONS - 1;
  const answered = answeredCount(answers);

  const prefilledFromLanding = useMemo(
    () => Boolean(problemParam && isConditionKey(problemParam)),
    [problemParam],
  );

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    if (!current) return;
    if (isLast) {
      const rec = submit();
      if (rec) navigate(paths.assessment.result);
      return;
    }
    setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <JourneyStepper current="assessment" className="mb-8" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {t("start.title")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })}
          </p>
        </div>
        <AssessmentRing
          value={answered}
          total={TOTAL_QUESTIONS}
          size={72}
          label={t("start.progress", {
            current: answered,
            total: TOTAL_QUESTIONS,
          })}
        />
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_QUESTIONS}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#7ea9dd,#218390)] transition-[width] duration-300"
          style={{ width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      {step === 0 ? (
        <div className="mt-4 space-y-1">
          <p className="text-ink-muted">{t("start.intro")}</p>
          <p className="text-sm text-ink-muted">{t("start.reassurance")}</p>
        </div>
      ) : null}

      {step === 0 && prefilledFromLanding && current ? (
        <p className="mt-6 rounded-lg bg-sage-50 px-4 py-3 text-sm text-petrol-700">
          {t("start.prefilledNote", {
            condition: t(`questions.q1.options.${current}`),
          })}
        </p>
      ) : null}

      <fieldset className="glass-strong mt-8 rounded-3xl p-6 sm:p-8">
        {/* `float-left w-full` pulls the <legend> into the fieldset's content
            box — without it the browser renders it straddling/above the top
            border, so it appears to break out of the rounded card. The next
            block `clear-both`s so it drops below rather than sitting beside. */}
        <legend className="float-left mb-1 w-full font-display text-2xl text-ink">
          {t(`questions.${question.id}.title`)}
        </legend>
        <div className="mt-5 grid gap-3 clear-both">
          {question.options.map((opt) => {
            const id = `${question.id}-${opt}`;
            return (
              <label
                key={opt}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border bg-surface-raised p-4 transition-colors hover:border-petrol-300 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol-600"
              >
                <input
                  type="radio"
                  id={id}
                  name={question.id}
                  value={opt}
                  checked={current === opt}
                  onChange={() => setAnswer(question.id, opt)}
                  className="size-4 accent-petrol-600"
                />
                <span className="text-ink">
                  {t(`questions.${question.id}.options.${opt}`)}
                </span>
              </label>
            );
          })}
        </div>
        {!current ? (
          <p className="mt-3 text-sm text-ink-muted">
            {t("start.selectPrompt")}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("start.back")}
        </Button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="text-sm text-ink-muted underline-offset-4 hover:underline"
          >
            {t("start.restart")}
          </button>
          <Button
            type="button"
            variant={isLast ? "cta" : "default"}
            onClick={goNext}
            disabled={!current}
          >
            {isLast ? t("start.submit") : t("start.next")}
            {!isLast ? <ArrowRight className="size-4" aria-hidden /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
