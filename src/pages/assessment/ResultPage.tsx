import { Navigate } from "react-router";

import { paths } from "@/app/paths";
import { useAssessment } from "@/features/assessment/AssessmentContext";

/**
 * `/assessment/result` is no longer a standalone screen — Steps 2 (product
 * name) and 3 (choose amount) were merged into one screen on the matched
 * Solution's product page (owner request, 2026-09-14). This route now just
 * forwards: to the matched Solution's product page if a result exists, else
 * back to the start of the assessment. Same pattern as the retired
 * `/assessment/medical-review` route.
 */
export function ResultPage() {
  const { result } = useAssessment();
  return (
    <Navigate
      to={
        result
          ? paths.shopProduct(result.primarySolutionId)
          : paths.assessment.start
      }
      replace
    />
  );
}
