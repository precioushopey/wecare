import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { PageShell } from "@/components/marketing/PageShell";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  exclusionFlagCount,
  hasAnyFlag,
  type AssessmentExclusions,
} from "@/features/assessment/exclusions";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  type QuestionId,
} from "@/features/assessment/questions";
import { deriveStartPhase, type Phase } from "@/features/assessment/steps";
import { useCart } from "@/features/cart/CartContext";
import { submitMedicalReview } from "@/features/review/review";
import { isConditionKey } from "@/features/conditions/conditions";
import { confirmAge, isAgeConfirmed } from "@/features/age/age";
import { acceptLegalGate, isLegalGateAccepted } from "@/features/legal/legalGate";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { AgeGate } from "./AgeGate";
import { ExclusionStep } from "./ExclusionStep";
import { LegalConsentGate } from "./LegalConsentGate";
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
 *  steps (spec §7). Phase model: postcode -> questions -> safety -> result.
 *  Questions auto-advance on selection; a secondary Next stays as the keyboard /
 *  changed-mind path; the last question keeps an explicit CTA. The safety /
 *  exclusion questions are the final "final checks" step of the pass; the
 *  medical-review record is created when they're answered (funnel re-sequence,
 *  2026-09-08). */
export function AssessmentEnginePage() {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();
  const {
    answers,
    postcode,
    exclusions,
    setAnswer,
    setExclusions,
    submit,
    prefillProblem,
    reset,
  } = useAssessment();
  const { clear: clearCart } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  usePageTitle(t("start.title"), tCommon("pages.assessmentStart.description"), {
    noindex: true,
  });

  // 18+ self-declaration before the assessment (owner decision D14).
  const [ageOk, setAgeOk] = useState(isAgeConfirmed);
  // Legal-consent acknowledgment, shown after the age gate (PO request,
  // 2026-09-14).
  const [legalOk, setLegalOk] = useState(isLegalGateAccepted);

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
    if (!ageOk || !legalOk || startedTracked.current) return;
    startedTracked.current = true;
    track(AnalyticsEvent.assessmentStarted, {
      problem: problemParam && isConditionKey(problemParam) ? problemParam : null,
      resumed: QUESTIONS.some((q) => Boolean(answers[q.id])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageOk, legalOk]);

  const [{ phase, step }, setPos] = useState<{ phase: Phase; step: number }>(() =>
    deriveStartPhase({
      postcode: postcode ?? undefined,
      answers,
      exclusions: exclusions ?? undefined,
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
      // The last question hands off to the "final checks" safety step; the
      // recommendation + review are created once that's answered.
      setPos({ phase: "safety", step: 0 });
      return;
    }
    setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
  }

  function handleSafetyComplete(x: AssessmentExclusions) {
    clearAdvanceTimer();
    setExclusions(x);
    const rec = submit();
    if (!rec) return;
    // A new review replaces the single stored one (submitMedicalReview
    // overwrites, doesn't append) — so any cart items from an earlier
    // assessment attempt no longer belong to any review at all. Clear the
    // cart here too, or a retake silently bundles orphaned past-review items
    // into this checkout (reported as a bug, 2026-09-14).
    clearCart();
    submitMedicalReview({
      problem: rec.problem,
      answers,
      postcode,
      exclusions: x,
    });
    track(AnalyticsEvent.assessmentExclusionCompleted, {
      flagged: hasAnyFlag(x),
      flag_count: exclusionFlagCount(x),
    });
    track(AnalyticsEvent.medicalReviewSubmitted, { problem: rec.problem });
    track(AnalyticsEvent.assessmentCompleted, { problem: rec.problem });
    // Steps 2+3 merged into one screen (2026-09-14) — go straight to the
    // matched Solution's product page instead of a separate Result page.
    navigate(paths.shopProduct(rec.primarySolutionId));
  }

  function backToLastQuestion() {
    setPos({ phase: "questions", step: TOTAL_QUESTIONS - 1 });
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

  if (!legalOk) {
    return (
      <LegalConsentGate
        onConfirm={() => {
          acceptLegalGate();
          setLegalOk(true);
        }}
      />
    );
  }

  // Progress is measured in the six questions — the same count the eyebrow
  // ("Question N of 6") and the "six short questions" promise use. The ring
  // only shows in the questions phase; the postcode step is framed as a
  // one-off lead-in ("Getting started"), not "Your assessment · Question 1".
  const progressCurrent = step + 1;

  return (
    <PageShell className="pt-14 pb-28 sm:pb-36">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {phase === "questions"
              ? t("start.title")
              : phase === "safety"
                ? t("phase.finalChecks")
                : t("phase.leadIn")}
          </p>
          <p className="mt-1 text-sm md:text-base text-ink-muted">
            {phase === "questions"
              ? t("start.progress", {
                  current: step + 1,
                  total: TOTAL_QUESTIONS,
                })
              : phase === "safety"
                ? t("phase.finalChecksNote")
                : t("phase.leadInNote")}
          </p>
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
        ) : phase === "safety" ? (
          <AssessmentRing
            value={TOTAL_QUESTIONS}
            total={TOTAL_QUESTIONS}
            size={72}
            label={t("phase.finalChecks")}
          />
        ) : null}
      </div>

      {phase === "questions" && step === 0 ? (
        <p className="mt-4 text-ink-muted">{t("start.intro")}</p>
      ) : null}

      {phase === "questions" && step === 0 && prefilledFromLanding && current ? (
        <p className="mt-6 rounded-lg bg-sage-50 px-4 py-3 text-sm md:text-base text-petrol-700">
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

          <p className="mt-4 flex items-center gap-1.5 text-sm md:text-base text-ink-muted">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            {current ? t("start.privacyNote") : t("start.selectAndPrivacy")}
          </p>

          {/* A frosted bar pinned to the viewport bottom so "Continue" is
              reachable without scrolling a long question (Mischa, 2026-09-09) —
              on every width. On mobile it runs edge-to-edge and flush
              (bottom-0, no rounding, no border — just a soft blurred petrol
              glow above it, no hard edge), with safe-area padding for the
              home-indicator area; from sm up it reverts to the original
              floating rounded card with its border. Back / Start over / Next
              stay one row at every width; Next shrinks to fit its label
              instead of stretching. */}
          <div className="sticky bottom-0 sm:bottom-4 z-20 mt-6 -mx-4 flex flex-row flex-nowrap items-center justify-between gap-3 border-0 bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-18px_32px_-14px_rgba(42,167,176,0.5)] backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:border-white/60 sm:pb-3 sm:shadow-[var(--shadow-float)]">
            <button
              type="button"
              onClick={startOver}
              className="shrink-0 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
            >
              {t("start.restart")}
            </button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
                <ArrowLeft className="size-4" aria-hidden />
                {t("start.back")}
              </Button>
              <Button
                type="button"
                variant={isLast ? "cta" : "default"}
                onClick={goNext}
                disabled={!current}
                className="w-fit"
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

      {phase === "safety" ? (
        <div key="safety" className={FADE}>
          <ExclusionStep
            hideHeading
            initial={exclusions ?? undefined}
            onComplete={handleSafetyComplete}
          />
          <button
            type="button"
            onClick={backToLastQuestion}
            className="mt-4 inline-flex items-center gap-1.5 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("exclusion.back")}
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
