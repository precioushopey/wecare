import {
  isComplete,
  QUESTIONS,
  TOTAL_QUESTIONS,
  type AssessmentAnswers,
} from "./questions";

/**
 * The guided pass: postcode + the six questions + one "final checks" safety
 * step. The safety / exclusion questions were briefly a separate
 * `/assessment/medical-review` page (PO decision B2, 2026-09-03); the funnel
 * re-sequence (2026-09-08) folds them back into this pass, before the product,
 * and the medical-review record is created when the pass finishes.
 */
export type Phase = "postcode" | "questions" | "safety";

/** postcode (1) + the six questions + the safety step (1). */
export const TOTAL_STEPS = 1 + TOTAL_QUESTIONS + 1;

/** Where the questions phase opens. A landing-page `?problem=` prefill still
 *  shows q1 (so the user can confirm / change it); otherwise resume at the
 *  first gap. */
export function firstQuestionStep(
  answers: AssessmentAnswers,
  prefilled: boolean,
): number {
  if (prefilled) return 0;
  const i = QUESTIONS.findIndex((q) => !answers[q.id]);
  return i === -1 ? 0 : i;
}

export function deriveStartPhase(input: {
  postcode?: string;
  answers: AssessmentAnswers;
  /** Present once the safety step has been completed for this assessment. */
  exclusions?: unknown;
  prefilled: boolean;
}): { phase: Phase; step: number } {
  const { postcode, answers, exclusions, prefilled } = input;
  if (!postcode) return { phase: "postcode", step: 0 };
  // All six done but the safety step not yet → resume straight into it.
  // (But never skip past q1 if a landing-page prefill is in progress.)
  if (
    !prefilled &&
    isComplete(answers) &&
    (exclusions === undefined || exclusions === null)
  ) {
    return { phase: "safety", step: 0 };
  }
  return { phase: "questions", step: firstQuestionStep(answers, prefilled) };
}

export function overallStepIndex(phase: Phase, step: number): number {
  if (phase === "postcode") return 0;
  if (phase === "safety") return 1 + TOTAL_QUESTIONS;
  return 1 + step;
}

/** True once postcode + all six questions are done. (Unchanged — the safety
 *  step is tracked separately, via the `exclusions` record.) */
export function assessmentComplete(
  postcode: string | undefined,
  answers: AssessmentAnswers,
): boolean {
  return Boolean(postcode) && isComplete(answers);
}
