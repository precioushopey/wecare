import { Link, Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Info } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { Reveal } from "@/components/marketing/Reveal";
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

/**
 * The one dominant card — name, why it's recommended, and a CTA up front.
 * THC/CBD numbers and price-per-gram sit behind a collapsed "details"
 * disclosure so a beginner isn't handed unexplained specs before any
 * reasoning (owner/beginner-feedback pass, Aug 2026).
 */
function PrimaryRecommendationCard({
  heading,
  solution,
  explanation,
  detailsLabel,
  cta,
}: {
  heading: string;
  solution: Solution;
  explanation: string;
  detailsLabel: string;
  cta: string;
}) {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();

  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="image-glow size-24 shrink-0 rounded-xl">
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
          <p className="mt-1 font-display text-xl text-ink">{solution.name}</p>
          <p className="text-xs font-medium text-petrol-600">
            {t(`solutions.${solution.id}.category`)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-muted">{explanation}</p>

      <Accordion type="single" collapsible className="mt-3">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm">{detailsLabel}</AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">{t("solution.thcRangeLabel")}</dt>
                <dd className="font-mono text-ink">{solution.thcRange}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">{t("solution.amountLabel")}</dt>
                <dd className="font-mono text-ink">
                  {t("solution.pricePerGram", {
                    price: formatPriceEur(solution.priceEur, language),
                  })}
                </dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button asChild variant="cta" size="lg" className="mt-5 w-full sm:w-auto">
        <Link to={paths.shopProduct(solution.id)}>{cta}</Link>
      </Button>
    </div>
  );
}

/** The secondary solution, demoted to a quiet link — not a second full spec
 * card competing with the primary recommendation for attention. `hint` is a
 * small low-key strength signal ("usually a stronger option, for later") —
 * only passed when the label itself doesn't already say so (i.e. not for the
 * "Advanced option" case, where that word already carries the meaning). */
function AlternativeSolutionLink({
  heading,
  label,
  hint,
  solution,
}: {
  heading: string;
  label: string;
  hint?: string;
  solution: Solution;
}) {
  const { t } = useTranslation("shop");

  return (
    <>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {heading}
      </p>
      <Link
        to={paths.shopProduct(solution.id)}
        className="group mt-2 flex items-center gap-3 rounded-2xl glass glass-hover p-3"
      >
        <span className="image-glow size-11 shrink-0 rounded-lg">
          <ImageWithFallback
            src={solutionImage(solution)}
            alt=""
            className="size-full object-contain p-0.5"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink group-hover:underline">
            {solution.name}
          </span>
          <span className="block text-xs text-ink-muted">
            {label} · {t(`solutions.${solution.id}.category`)}
          </span>
          {hint ? (
            <span className="block text-xs text-ink-muted/70">{hint}</span>
          ) : null}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </>
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
      <Reveal>
        <JourneyStepper current="solution" className="mb-8" />
        {/* Column on narrow viewports (owner request, Aug 2026 — the ring
            beside the heading was overflowing/clipping the text at small
            widths), row again from `sm` where there's room for both. */}
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <AssessmentRing variant="complete" tone="deep" size={72} animate />
          <div>
            <h1>{t("result.title")}</h1>
            <p className="mt-1 text-sm font-medium text-petrol-700">
              {t("result.reassure")}
            </p>
            <p className="mt-2 text-lg text-ink-muted">{t("result.intro")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal>
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
      </Reveal>

      <Reveal className="mt-8">
        <PrimaryRecommendationCard
          heading={t("result.primaryHeading")}
          solution={primary}
          explanation={t(result.explanationKey)}
          detailsLabel={t("result.detailsLabel")}
          cta={t("result.viewSolution")}
        />

        <AlternativeSolutionLink
          heading={t("result.altHeading")}
          label={
            result.secondaryIsAdvanced
              ? t("result.advancedHeading")
              : t("result.altLabelDefault")
          }
          hint={
            result.secondaryIsAdvanced
              ? undefined
              : t("result.altStrongerHint")
          }
          solution={secondary}
        />

        {result.gentleFirst ? (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t("result.gentleNudge")}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-ink-muted">
          {t("result.reviewRequiredNote")}
        </p>

        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-ink-muted">
          {t("result.disclaimer")}
        </p>

        {/* The primary CTA now lives on the recommendation card above;
            "Change My Answers" is the one action left for this row. */}
        <div className="mt-6">
          <Button asChild variant="outline" size="lg">
            <Link to={paths.assessment.start}>{t("result.changeAnswers")}</Link>
          </Button>
        </div>
      </Reveal>

      {/* What's still ahead — review and delivery come after you pick the solution. */}
      <Reveal className="mt-10 rounded-3xl glass p-6">
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
      </Reveal>
    </div>
  );
}
