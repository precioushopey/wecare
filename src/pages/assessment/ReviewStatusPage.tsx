import { Link, Navigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { getMedicalReview } from "@/features/review/review";

const STEP_KEYS = ["a", "b", "c", "d"] as const;

/**
 * Medical-review status page (owner decision D3). Reads the mock review
 * record; a real build drives this from backend state and fires an email on
 * every status change. Reachable only once an assessment has been submitted
 * for review.
 */
export function ReviewStatusPage() {
  const { t } = useTranslation("assessment");
  const { result } = useAssessment();
  usePageTitle(t("review.pageTitle"));

  const review = getMedicalReview();
  if (!review) {
    return <Navigate to={paths.assessment.result} replace />;
  }

  const s = review.status;
  const showSolution = s === "approved";
  const showSupport =
    s === "infoRequired" || s === "notApproved" || s === "consultation";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row">
        <AssessmentRing variant="complete" tone="deep" size={72} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {t("review.heading")}
          </p>
          <h1 className="mt-1">{t(`review.statuses.${s}.title`)}</h1>
          <p className="mt-2 font-mono text-sm text-ink-muted">
            {t("review.idLabel", { id: review.id })}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-petrol-700">
          {t(`review.statuses.${s}.label`)}
        </span>
      </div>

      {/* Status body + "we'll email you" + "not guaranteed" as one paragraph
          rather than three size-stepped blocks with a divider (owner request,
          Sept 2026). */}
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        {t(`review.statuses.${s}.body`)} {t("review.reassure")}{" "}
        {t("review.notGuaranteed")}
      </p>

      <h2 className="mt-10 text-lg">{t("review.stepsHeading")}</h2>
      <ol className="mt-4 space-y-3">
        {STEP_KEYS.map((k, i) => (
          <li key={k} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 font-display text-sm text-petrol-700">
              {i + 1}
            </span>
            <p className="text-sm text-ink">{t(`review.steps.${k}`)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild variant="cta">
          <Link to={paths.dashboard}>{t("review.toDashboard")}</Link>
        </Button>
        {showSolution && result ? (
          <Button asChild variant="outline">
            <Link to={paths.shopProduct(result.primarySolutionId)}>
              {t("review.toSolution")}
            </Link>
          </Button>
        ) : null}
        {showSupport ? (
          <Button asChild variant="outline">
            <Link to={paths.contact}>{t("review.toSupport")}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
