import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  type QuestionId,
} from "@/features/assessment/questions";
import { deriveStartPhase, type Phase } from "@/features/assessment/steps";
import { isConditionKey } from "@/features/conditions/conditions";
import { confirmAge, isAgeConfirmed } from "@/features/age/age";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { AgeGate } from "./AgeGate";
import { PostcodeStep } from "./PostcodeStep";
import { QuestionStep } from "./QuestionStep";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const FADE = "animate-in fade-in duration-200 motion-reduce:animate-none";

/** Single reusable, state-based assessment engine — no route changes between
 *  steps (spec §7). Phase model: postcode -> questions -> result. Questions
 *  auto-advance on selection; a secondary Next stays as the keyboard /
 *  changed-mind path; the last question keeps an explicit CTA. The safety /
 *  exclusion questions are collected later, on the way to medical review
 *  (PO decision B2). */
export function AssessmentEnginePage() {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();
  const { answers, postcode, setAnswer, submit, prefillProblem, reset } =
    useAssessment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  usePageTitle(t("start.title"), tCommon("pages.assessmentStart.description"), {
    noindex: true,
  });

  // 18+ self-declaration before the assessment (owner decision D14).
  const [ageOk, setAgeOk] = useState(isAgeConfirmed);

  const problemParam = params.get("problem");
  const prefilledFromLanding = useMemo(
    () => Boolean(problemParam && isConditionKey(problemParam)),
    [problemParam],
  );

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
      resumed: QUESTIONS.some((q) => Boolean(answers[q.id])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageOk]);

  const [{ phase, step }, setPos] = useState<{ phase: Phase; step: number }>(() =>
    deriveStartPhase({
      postcode: postcode ?? undefined,
      answers,
      prefilled: prefilledFromLanding,
    }),
  );
  const setStep = (updater: number | ((s: number) => number)) =>
    setPos((p) => ({
      ...p,
      step: typeof updater === "function" ? updater(p.step) : updater,
    }));

  const question = QUESTIONS[step];
  const current = answers[question.id];
  const isLast = step === TOTAL_QUESTIONS - 1;

  // --- auto-advance ----------------------------------------------------------
  const advanceTimer = useRef<number | null>(null);
  function clearAdvanceTimer() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }
  function armAdvance() {
    clearAdvanceTimer();
    const delay = prefersReducedMotion() ? 120 : 350;
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
    }, delay);
  }
  useEffect(() => () => clearAdvanceTimer(), []);

  function recordAnswer(id: QuestionId, value: string) {
    setAnswer(id, value);
    track(AnalyticsEvent.assessmentQuestionAnswered, {
      question: id,
      questionIndex: step,
      auto_advanced: !isLast,
    });
    if (id === "q1") {
      track(AnalyticsEvent.problemSelected, { problem: value, source: "assessment" });
    }
    // Only the last question waits for an explicit CTA — finishing the
    // assessment should never be an accidental tap.
    if (!isLast) armAdvance();
  }

  function goBack() {
    clearAdvanceTimer();
    track(AnalyticsEvent.assessmentBackClicked, { question: question.id });
    setStep((s) => Math.max(0, s - 1));
  }

  function startOver() {
    clearAdvanceTimer();
    reset();
    setPos({ phase: "postcode", step: 0 });
  }

  function goNext() {
    clearAdvanceTimer();
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

  // Progress is measured in the six questions — the same count the eyebrow
  // ("Question N of 6") and the "six short questions" promise use. The ring +
  // bar only show in the questions phase (the postcode step is a lead-in).
  const progressCurrent = step + 1;
  const eyebrow =
    phase === "questions"
      ? t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })
      : t("phase.delivery");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="assessment" className="mb-8" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {t("start.title")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{eyebrow}</p>
        </div>
        {phase === "questions" ? (
          <AssessmentRing
            value={progressCurrent}
            total={TOTAL_QUESTIONS}
            size={72}
            label={tCommon("journey.stepOf", {
              current: progressCurrent,
              total: TOTAL_QUESTIONS,
            })}
          />
        ) : null}
      </div>

      {phase === "questions" && step === 0 ? (
        <p className="mt-4 text-ink-muted">{t("start.intro")}</p>
      ) : null}

      {phase === "questions" && step === 0 && prefilledFromLanding && current ? (
        <p className="mt-6 rounded-lg bg-sage-50 px-4 py-3 text-sm text-petrol-700">
          {t("start.prefilledNote", {
            condition: t(`questions.q1.options.${current}`),
          })}
        </p>
      ) : null}

      {phase === "postcode" ? (
        <div key="postcode" className={FADE}>
          <PostcodeStep
            onComplete={() => setPos({ phase: "questions", step: 0 })}
          />
        </div>
      ) : null}

      {phase === "questions" ? (
        <>
          <div key={step} className={FADE}>
            <QuestionStep
              question={question}
              current={current}
              onSelect={(value) => recordAnswer(question.id, value)}
            />
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            {current ? t("start.privacyNote") : t("start.selectAndPrivacy")}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {/* On mobile the rows stack — "Back" sits below the primary
                Next / Start-over row (owner request, Sept 2026). Desktop
                keeps Back on the left, Next on the right. */}
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="max-sm:order-2"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("start.back")}
            </Button>

            <div className="flex items-center gap-3 max-sm:order-1 max-sm:w-full max-sm:justify-between">
              <button
                type="button"
                onClick={startOver}
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
        </>
      ) : null}
    </div>
  );
}
