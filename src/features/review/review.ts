import type { AssessmentAnswers } from "@/features/assessment/questions";
import type { ConditionKey } from "@/features/conditions/conditions";

/**
 * Medical-review record (owner decision D3). MOCK — localStorage only, no
 * backend. A real implementation creates this server-side on submission, keeps
 * it separate from the commerce `Order`, transfers the assessment context to
 * the responsible licensed medical professional, and moves the status as the
 * review progresses (with an email on each change).
 *
 * User-scoped: cleared on sign-out / account switch (see AuthContext).
 */

const STORAGE_KEY = "wecare.review";

export const REVIEW_STATUSES = [
  "submitted",
  "inReview",
  "infoRequired",
  "approved",
  "notApproved",
  "consultation",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface MedicalReview {
  id: string;
  submittedAt: string;
  status: ReviewStatus;
  problem: ConditionKey;
  /** The assessment context handed to the reviewing doctor. */
  answers: AssessmentAnswers;
}

function isReviewStatus(v: unknown): v is ReviewStatus {
  return (
    typeof v === "string" && (REVIEW_STATUSES as readonly string[]).includes(v)
  );
}

export function getMedicalReview(): MedicalReview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MedicalReview>;
    if (
      parsed &&
      typeof parsed.id === "string" &&
      isReviewStatus(parsed.status) &&
      typeof parsed.problem === "string"
    ) {
      return {
        id: parsed.id,
        submittedAt: parsed.submittedAt ?? new Date().toISOString(),
        status: parsed.status,
        problem: parsed.problem as ConditionKey,
        answers: parsed.answers ?? {},
      };
    }
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

export function submitMedicalReview(input: {
  problem: ConditionKey;
  answers: AssessmentAnswers;
}): MedicalReview {
  const review: MedicalReview = {
    id: `WR-${Date.now().toString(36).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    // A real backend would start at "submitted"; the mock jumps straight to
    // "inReview" so the status page shows a live-looking state.
    status: "inReview",
    problem: input.problem,
    answers: input.answers,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
  } catch {
    /* ignore */
  }
  return review;
}

export function clearMedicalReview(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
