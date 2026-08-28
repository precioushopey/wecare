import { Link, Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import {
  SOLUTION_BY_ID,
  solutionImage,
  type Solution,
} from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-4">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

function RecommendationCard({
  heading,
  solution,
}: {
  heading: string;
  solution: Solution;
}) {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();

  return (
    <Link
      to={paths.shopProduct(solution.id)}
      className="group glass glass-hover flex gap-4 rounded-3xl p-5"
    >
      <div className="image-glow size-20 shrink-0 rounded-xl">
        <ImageWithFallback
          src={solutionImage(solution)}
          alt=""
          className="size-full object-contain p-1 drop-shadow-[0_10px_18px_rgba(13,68,75,0.22)]"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {heading}
        </p>
        <p className="mt-1 font-display text-lg text-ink group-hover:underline">
          {solution.name}
        </p>
        <p className="text-xs font-medium text-petrol-600">
          {t(`solutions.${solution.id}.category`)}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {t(`solutions.${solution.id}.blurb`)}
        </p>
        <p className="mt-1 font-mono text-sm text-ink">
          THC {solution.thcRange} ·{" "}
          {t("solution.pricePerGram", {
            price: formatPriceEur(solution.priceEur, language),
          })}
        </p>
      </div>
    </Link>
  );
}

export function ResultPage() {
  const { t } = useTranslation("assessment");
  const { result, answers } = useAssessment();
  usePageTitle(t("result.title"));

  if (!result) {
    return <Navigate to={paths.assessment.start} replace />;
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];
  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="solution" className="mb-8" />
      <div className="flex items-start gap-5">
        <AssessmentRing variant="complete" tone="deep" size={72} animate />
        <div>
          <h1>{t("result.title")}</h1>
          <p className="mt-2 text-lg text-ink-muted">{t("result.intro")}</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg">{t("result.summaryHeading")}</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <SummaryItem
          label={t("result.labels.problem")}
          value={t(`questions.q1.options.${result.problem}`)}
        />
        {answers.q2 ? (
          <SummaryItem
            label={t("result.labels.frequency")}
            value={t(`questions.q2.options.${answers.q2}`)}
          />
        ) : null}
        {answers.q3 ? (
          <SummaryItem
            label={t("result.labels.strength")}
            value={t(`questions.q3.options.${answers.q3}`)}
          />
        ) : null}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <RecommendationCard
          heading={t("result.primaryHeading")}
          solution={primary}
        />
        <RecommendationCard
          heading={
            result.secondaryIsAdvanced
              ? t("result.advancedHeading")
              : t("result.secondaryHeading")
          }
          solution={secondary}
        />
      </div>

      <h2 className="mt-10 text-lg">{t("result.explanationHeading")}</h2>
      <p className="mt-2 text-ink-muted">{t(result.explanationKey)}</p>

      {result.gentleFirst ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("result.gentleNudge")}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-ink-muted">{t("result.reviewRequiredNote")}</p>

      <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-ink-muted">
        {t("result.disclaimer")}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild variant="cta" size="lg">
          <Link to={paths.shopProduct(result.primarySolutionId)}>
            {t("result.viewSolution")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to={paths.assessment.start}>{t("result.changeAnswers")}</Link>
        </Button>
      </div>

      {/* What's still ahead — review and delivery come after you pick the solution. */}
      <div className="mt-10 rounded-3xl glass p-6">
        <h2 className="text-base">{t("result.nextHeading")}</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {(["view", "review", "delivery"] as const).map((k, i) => (
            <li key={k} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 font-display text-sm text-petrol-700">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {t(`result.next.${k}.title`)}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {t(`result.next.${k}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
