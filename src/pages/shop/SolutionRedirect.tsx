import { Navigate } from "react-router";

import { paths } from "@/app/paths";
import { useAssessment } from "@/features/assessment/AssessmentContext";

/** `/solution` → the recommended product page, or the shop if there's no result yet. */
export function SolutionRedirect() {
  const { result } = useAssessment();
  return (
    <Navigate
      to={
        result
          ? paths.shopProduct(result.primarySolutionId)
          : paths.shop
      }
      replace
    />
  );
}
