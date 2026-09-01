import { useEffect, useMemo, useRef, useState } from "react";
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
  type QuestionId,
} from "@/features/assessment/questions";
import { isConditionKey } from "@/features/conditions/conditions";
import { confirmAge, isAgeConfirmed } from "@/features/age/age";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { AgeGate } from "./AgeGate";

/** Single reusable, state-based assessment engine — no route changes between
 *  questions (spec Section 7). */
export function AssessmentEnginePage() {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();
  const { answers, setAnswer, submit, prefillProblem, reset } = useAssessment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  usePageTitle(t("start.title"), tCommon("pages.assessmentStart.description"));

  // 18+ self-declaration before the assessment (owner decision D14).
  const [ageOk, setAgeOk] = useState(isAgeConfirmed);

  const problemParam = params.get("problem");

  useEffect(() => {
    if (problemParam && isConditionKey(problemParam)) {
      prefillProblem(problemParam);
    }
  }, [problemParam, prefillProblem]);

  const startedTracked = useRef(false);
  useEffect(() => {
    if (!ageOk || startedTracked.current) return;
    startedTracked.current = true;
    track(AnalyticsEvent.assessmentStarted, {
      problem: problemParam && isConditionKey(problemParam) ? problemParam : null,
      resumed: answeredCount(answers) > 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageOk]);

  function recordAnswer(id: QuestionId, value: string) {
    setAnswer(id, value);
    // Question id + position only — the answer value is health data (D16).
    track(AnalyticsEvent.assessmentQuestionAnswered, {
      question: id,
      questionIndex: step,
    });
    if (id === "q1") {
      // The problem category is an allowed coarse dimension.
      track(AnalyticsEvent.problemSelected, { problem: value, source: "assessment" });
    }
  }

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
    track(AnalyticsEvent.assessmentBackClicked, { question: question.id });
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    if (!current) return;
    if (isLast) {
      const rec = submit();
      if (rec) {
        track(AnalyticsEvent.assessmentCompleted, { problem: rec.problem });
        navigate(paths.assessment.result);
      }
      return;
    }
    setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
  }

  if (!ageOk) {
    return (
      <AgeGate
        onConfirm={(dobIso) => {
          confirmAge(dobIso);
          setAgeOk(true);
        }}
      />
    );
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

      <fieldset className="glass-strong mt-8 rounded-2xl md:rounded-3xl p-6 sm:p-8">
        {/* `float-left w-full` pulls the <legend> into the fieldset's content
            box — without it the browser renders it straddling/above the top
            border, so it appears to break out of the rounded card. The next
            block `clear-both`s so it drops below rather than sitting beside. */}
        <legend className="float-left mb-1 w-full font-display text-xl md:text-2xl text-ink">
          {t(`questions.${question.id}.title`)}
        </legend>
        {(() => {
          // Optional plain-language note under the question (e.g. q6 tells a
          // beginner they can safely pick "Not sure").
          const note = t(`questions.${question.id}.note`, { defaultValue: "" });
          return note ? (
            <p className="clear-both text-sm text-ink-muted">{note}</p>
          ) : null;
        })()}
        <div className="grid gap-4 clear-both mt-16">
          {question.options.map((opt) => {
            const id = `${question.id}-${opt}`;
            // Short gloss for cannabis-format words so a beginner isn't asked
            // to choose between undefined terms (audit WC-05).
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
                  onChange={() => recordAnswer(question.id, opt)}
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
        {!current ? (
          <p className="mt-3 text-sm text-ink-muted">
            {t("start.selectPrompt")}
          </p>
        ) : null}
      </fieldset>

      {/* Wraps on narrow screens: "Back" stays on the first line, the
          "Start over" + primary CTA group drops to a full-width second row so
          the long submit label never overflows. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("start.back")}
        </Button>

        <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-sm text-ink-muted underline-offset-4 hover:underline"
          >
            {t("start.restart")}
          </button>
          <Button
            type="button"
            variant={isLast ? "cta" : "default"}
            onClick={goNext}
            disabled={!current}
            className="min-w-0 max-sm:flex-1"
          >
            <span className="truncate">
              {isLast ? t("start.submit") : t("start.next")}
            </span>
            {!isLast ? (
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
