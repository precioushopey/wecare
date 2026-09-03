import {
  isComplete,
  QUESTIONS,
  TOTAL_QUESTIONS,
  type AssessmentAnswers,
} from "./questions";

/**
 * The assessment is now just postcode + the six questions (PO decision B2,
 * 2026-09-03). The safety / exclusion questions moved out to the
 * `/assessment/medical-review` step, collected when the user continues to
 * medical review from the Solution page.
 */
export type Phase = "postcode" | "questions";

/** postcode (1) + the six questions. */
export const TOTAL_STEPS = 1 + TOTAL_QUESTIONS;

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
  prefilled: boolean;
}): { phase: Phase; step: number } {
  const { postcode, answers, prefilled } = input;
  if (!postcode) return { phase: "postcode", step: 0 };
  return { phase: "questions", step: firstQuestionStep(answers, prefilled) };
}

export function overallStepIndex(phase: Phase, step: number): number {
  if (phase === "postcode") return 0;
  return 1 + step;
}

/** True once postcode + all six questions are done. */
export function assessmentComplete(
  postcode: string | undefined,
  answers: AssessmentAnswers,
): boolean {
  return Boolean(postcode) && isComplete(answers);
}
