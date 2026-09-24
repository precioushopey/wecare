import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { useFunnelProgress } from "@/components/layout/FunnelChrome";
import { PageShell } from "@/components/marketing/PageShell";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  confirmNewCustomer,
  isNewCustomerConfirmed,
} from "@/features/assessment/existingCustomer";
import { useAuth } from "@/features/auth/AuthContext";
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
import { ExistingCustomerStep } from "./ExistingCustomerStep";
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

/** Steps counted by the thin progress line under the funnel header:
 *  existing-customer, age, legal, postcode, the six questions, final checks. */
const PROGRESS_STEPS = 3 + 1 + TOTAL_QUESTIONS + 1;

/** Single reusable, state-based assessment engine — no route changes between
 *  steps (spec §7). Step model: existing-customer -> age -> legal -> postcode ->
 *  questions -> safety -> product. The first three are once-per-device gates.
 *  Every question auto-advances on selection (question 6 included); a secondary
 *  Next / Continue stays as the keyboard / changed-mind path. The safety /
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

  // "Have you already received a prescription through WeCare?" — the first
  // step (owner request, 2026-09-24). A signed-in visitor, or a device that has
  // already said "No", skips it; "Yes" sends the visitor to log in.
  const { isAuthenticated } = useAuth();
  const [existingOk, setExistingOk] = useState(
    () => isAuthenticated || isNewCustomerConfirmed(),
  );
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
    if (!existingOk || !ageOk || !legalOk || startedTracked.current) return;
    startedTracked.current = true;
    track(AnalyticsEvent.assessmentStarted, {
      problem: problemParam && isConditionKey(problemParam) ? problemParam : null,
      resumed: QUESTIONS.some((q) => Boolean(answers[q.id])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingOk, ageOk, legalOk]);

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
    const last = isLast;
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      // The last question hands off to the "final checks" step, like Next does.
      if (last) setPos({ phase: "safety", step: 0 });
      else setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
    }, delay);
  }
  useEffect(() => () => clearAdvanceTimer(), []);

  function recordAnswer(id: QuestionId, value: string) {
    setAnswer(id, value);
    track(AnalyticsEvent.assessmentQuestionAnswered, {
      question: id,
      questionIndex: step,
      auto_advanced: true,
    });
    if (id === "q1") {
      track(AnalyticsEvent.problemSelected, { problem: value, source: "assessment" });
    }
    // Every question auto-advances, the last one included (Mischa, 2026-09-24:
    // "from 1-6 it did take me automatically" — question 6 should too). The
    // last one used to wait for an explicit CTA so finishing was never an
    // accidental tap; that no longer applies, because it now only leads to the
    // "final checks" step — nothing is submitted until those are answered.
    // The Continue button stays as the keyboard / changed-mind path.
    armAdvance();
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

  // The thin line under the funnel header: where the visitor is among all the
  // steps (a device that already did the gates opens partway along). Must run
  // before the early returns below (hook order).
  const progressIndex = !existingOk
    ? 0
    : !ageOk
      ? 1
      : !legalOk
        ? 2
        : phase === "postcode"
          ? 3
          : phase === "questions"
            ? 4 + step
            : PROGRESS_STEPS - 1;
  useFunnelProgress((progressIndex + 1) / PROGRESS_STEPS);

  if (!existingOk) {
    return (
      <ExistingCustomerStep
        onExisting={() => navigate(paths.login)}
        onNew={() => {
          confirmNewCustomer();
          setExistingOk(true);
        }}
      />
    );
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

  // Every step draws its own centred eyebrow + title (`StepFrame`); the
  // question steps' eyebrow is "Question N of 6" — the same count the "six
  // short questions" promise uses. Overall progress is the thin line under the
  // funnel header (`useFunnelProgress` above), which replaced the ring here
  // (owner request, 2026-09-24).
  return (
    // No bottom padding on a phone while the sticky action bar is showing (the
    // questions phase): the page then ends exactly at the button group instead
    // of scrolling past it into empty space (owner request, 2026-09-24). From
    // `sm` up the floating bar keeps its breathing room.
    <PageShell
      className={
        phase === "questions"
          ? "flex flex-1 flex-col pt-10 pb-0 sm:block sm:flex-none sm:pb-36"
          : "pt-10 pb-10 sm:pb-36"
      }
    >
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
              eyebrow={t("start.progress", {
                current: step + 1,
                total: TOTAL_QUESTIONS,
              })}
              intro={step === 0 ? t("start.intro") : undefined}
              topNote={
                step === 0 && prefilledFromLanding && current
                  ? t("start.prefilledNote", {
                      condition: t(`questions.q1.options.${current}`),
                    })
                  : undefined
              }
            />
          </div>

          <p className="mb-6 mt-4 flex items-center justify-center gap-1.5 text-sm md:text-base text-ink-muted sm:mb-0">
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
          <div className="sticky bottom-0 sm:bottom-4 z-20 mt-auto sm:mt-6 -mx-4 flex flex-row flex-nowrap items-center justify-between gap-3 border-0 bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-18px_32px_-14px_rgba(42,167,176,0.5)] backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:border-white/60 sm:pb-3 sm:shadow-[var(--shadow-float)]">
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
            initial={exclusions ?? undefined}
            onComplete={handleSafetyComplete}
          />
          <button
            type="button"
            onClick={backToLastQuestion}
            className="mx-auto mt-4 flex items-center gap-1.5 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("exclusion.back")}
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
