import { Navigate } from "react-router";

import { paths } from "@/app/paths";
import { getMedicalReview } from "@/features/review/review";

/**
 * `/assessment/medical-review` is no longer a form — the safety questions moved
 * into the assessment pass and the review is created there (funnel re-sequence,
 * 2026-09-08). This route now just forwards: to the status page if a review
 * exists, else back to the start of the assessment.
 */
export function MedicalReviewFormPage() {
  return (
    <Navigate
      to={getMedicalReview() ? paths.assessment.review : paths.assessment.start}
      replace
    />
  );
}
