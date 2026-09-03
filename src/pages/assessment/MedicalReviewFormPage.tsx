import { Navigate, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import type { AssessmentExclusions } from "@/features/assessment/exclusions";
import {
  exclusionFlagCount,
  hasAnyFlag,
} from "@/features/assessment/exclusions";
import { getMedicalReview, submitMedicalReview } from "@/features/review/review";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { ExclusionStep } from "./ExclusionStep";

/**
 * Safety questions + review submission (PO decision B1/B2). Reached from the
 * Solution page's "Continue to medical review" CTA. Collects the two required
 * Yes/No safety answers (plus an optional conditions checklist), then creates
 * the medical review and hands off to the status page. The answers are inputs
 * for the reviewing doctor — no "Yes = rejected" logic here.
 */
export function MedicalReviewFormPage() {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();
  const { result, answers, postcode, setExclusions } = useAssessment();
  const navigate = useNavigate();
  usePageTitle(
    t("medicalReview.pageTitle"),
    tCommon("pages.assessmentStart.description"),
    { noindex: true },
  );

  // No recommendation yet → back to the assessment. Already submitted → the
  // status page.
  if (!result) return <Navigate to={paths.assessment.start} replace />;
  if (getMedicalReview()) {
    return <Navigate to={paths.assessment.review} replace />;
  }

  function handleSubmit(exclusions: AssessmentExclusions) {
    if (!result) return;
    setExclusions(exclusions);
    submitMedicalReview({
      problem: result.problem,
      answers,
      postcode,
      exclusions,
    });
    track(AnalyticsEvent.assessmentExclusionCompleted, {
      flagged: hasAnyFlag(exclusions),
      flag_count: exclusionFlagCount(exclusions),
    });
    track(AnalyticsEvent.medicalReviewSubmitted, { problem: result.problem });
    track(AnalyticsEvent.recommendationContinueClicked, {
      problem: result.problem,
      path: "submit_review",
    });
    navigate(paths.assessment.review);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="product" className="mb-8" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
        {t("medicalReview.eyebrow")}
      </p>
      <h1 className="mt-1">{t("medicalReview.heading")}</h1>
      <p className="mt-2 text-lg text-ink-muted">{t("medicalReview.intro")}</p>

      <ExclusionStep onComplete={handleSubmit} hideHeading />
    </div>
  );
}
