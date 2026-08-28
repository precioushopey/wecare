import { Link, Navigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { useAssessment } from "@/features/assessment/AssessmentContext";

const STEPS = ["review", "outcome", "next"] as const;

/** Calm status page between Result and the doctor-review flow (spec Section 9).
 *  A waiting state, not a form. */
export function MedicalReviewPage() {
  const { t } = useTranslation("assessment");
  const { result } = useAssessment();
  usePageTitle(t("medicalReview.title"));

  if (!result) {
    return <Navigate to={paths.assessment.start} replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <JourneyStepper current="product" className="mb-10" />
      <div className="flex flex-col items-center text-center">
        <AssessmentRing variant="complete" tone="brand" size={112} animate />
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1 text-xs font-medium text-petrol-700">
          <span className="size-1.5 rounded-full bg-sage-500" aria-hidden />
          {t("medicalReview.statusValue")}
        </span>
        <h1 className="mt-4">{t("medicalReview.title")}</h1>
        <p className="mt-3 text-lg text-ink-muted">{t("medicalReview.intro")}</p>
      </div>

      <div className="mt-8 space-y-3 glass rounded-3xl p-6 text-sm text-ink-muted">
        <p>{t("medicalReview.turnaround")}</p>
        <p>{t("medicalReview.notGuaranteed")}</p>
      </div>

      <h2 className="mt-10 text-lg">{t("medicalReview.stepsHeading")}</h2>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-petrol-700">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-ink">
                {t(`medicalReview.steps.${step}.title`)}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {t(`medicalReview.steps.${step}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button asChild variant="cta">
          <Link to={paths.dashboard}>{t("medicalReview.toDashboard")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={paths.shopProduct(result.primarySolutionId)}>
            {t("medicalReview.toSolution")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
