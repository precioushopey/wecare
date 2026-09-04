import { Link, Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useAuth } from "@/features/auth/AuthContext";
import { getMedicalReview, type ReviewStatus } from "@/features/review/review";

/** The four stages the status page visualises (spec: "Submitted → In review →
 *  More info needed → Approved"). Each real `ReviewStatus` maps to how far the
 *  bar has filled: `done` stages show a check, `current` is highlighted, the
 *  rest are dim. `notApproved` stops before "Approved"; the status copy above
 *  carries that outcome. */
const REVIEW_STAGES = ["submitted", "inReview", "infoRequired", "approved"] as const;

const STAGE_PROGRESS: Record<ReviewStatus, { done: number; current: number }> = {
  submitted: { done: 0, current: 0 },
  inReview: { done: 1, current: 1 },
  infoRequired: { done: 1, current: 2 },
  consultation: { done: 1, current: 2 },
  approved: { done: 4, current: -1 },
  notApproved: { done: 2, current: -1 },
};

/**
 * Medical-review status page (owner decision D3). Reads the mock review
 * record; a real build drives this from backend state and fires an email on
 * every status change. Reachable only once an assessment has been submitted
 * for review.
 */
export function ReviewStatusPage() {
  const { t } = useTranslation("assessment");
  const { result } = useAssessment();
  const { isAuthenticated } = useAuth();
  usePageTitle(t("review.pageTitle"), undefined, { noindex: true });

  const review = getMedicalReview();
  if (!review) {
    return <Navigate to={paths.assessment.result} replace />;
  }

  const s = review.status;
  const { done, current } = STAGE_PROGRESS[s];
  const showSolution = s === "approved";
  const showSupport =
    s === "infoRequired" || s === "notApproved" || s === "consultation";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
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

      {/* Status-aware progress: which stage the review is at, not a generic
          explainer. */}
      <h2 className="mt-10 text-lg">{t("review.progressHeading")}</h2>
      <ol className="mt-4 space-y-4">
        {REVIEW_STAGES.map((stage, i) => {
          const isDone = i < done;
          const isCurrent = i === current;
          return (
            <li
              key={stage}
              className="flex gap-3"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg font-display text-sm",
                  isDone && "bg-sage-100 text-petrol-700",
                  isCurrent && "bg-petrol-600 text-white",
                  !isDone && !isCurrent &&
                    "border border-border text-ink-muted",
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-ink" : "text-ink-muted",
                    isDone && "text-ink",
                  )}
                >
                  {t(`review.stages.${stage}.label`)}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {t(`review.stages.${stage}.body`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          {/* A new user has no account yet — send them to sign up (they land
              on the dashboard after). A signed-in user goes straight there. */}
          <Link to={isAuthenticated ? paths.dashboard : paths.signup}>
            {t("review.toDashboard")}
          </Link>
        </Button>
        {showSolution && result ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={paths.shopProduct(result.primarySolutionId)}>
              {t("review.toSolution")}
            </Link>
          </Button>
        ) : null}
        {showSupport ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={paths.contact}>{t("review.toSupport")}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
