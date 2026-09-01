import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router";
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
import {
  getMedicalReview,
  submitMedicalReview,
} from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatPriceEur } from "@/lib/format";

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-4">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

/** Compact cannabinoid line for the starting oil — makes the disclosure's
 *  "& ingredient details" label honest (audit WC-18). CBD/CBG/CBN are
 *  universal symbols and stay untranslated. */
function oilProfileSummary(solution: Solution): string {
  const f = solution.oilFormulation;
  const parts = [
    `CBD ${f.cbd}`,
    f.cbg ? `CBG ${f.cbg}` : null,
    f.cbn ? `CBN ${f.cbn}` : null,
    f.melatonin ? "+ Melatonin" : null,
  ].filter(Boolean) as string[];
  return parts.join(" · ");
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
  notes,
  detailsLabel,
  footer,
}: {
  heading: string;
  solution: Solution;
  explanation: string;
  notes?: ReactNode;
  detailsLabel: string;
  footer: ReactNode;
}) {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();

  return (
    <div className="glass-strong rounded-3xl p-6">
      {/* Left image panel + right content panel — the same split the
          Recommended Solution page uses (owner request, Sept 2026). Stacks
          image-over-content below `md`. */}
      <div className="grid gap-6 md:grid-cols-[13rem_1fr] md:items-start md:gap-8">
        <div className="mx-auto aspect-square w-full max-w-[13rem] overflow-hidden rounded-2xl border border-white/50 bg-white/40 md:mx-0 md:max-w-none dark:border-white/15 dark:bg-white/[0.04]">
          <div className="image-glow flex size-full items-center justify-center p-5">
            <ImageWithFallback
              src={solutionImage(solution)}
              alt=""
              className="size-full object-contain drop-shadow-[0_18px_32px_rgba(13,68,75,0.24)]"
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {heading}
          </p>
          <p className="mt-1 font-display text-xl text-ink">{solution.name}</p>
          <p className="text-xs font-medium text-petrol-600">
            {t(`solutions.${solution.id}.category`)}
          </p>

          <p className="mt-4 text-sm text-ink-muted">{explanation}</p>
          {notes}

          <Accordion type="single" collapsible className="mt-3">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm">
                {detailsLabel}
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-ink-muted">
                      {t("solution.thcRangeLabel")}
                    </dt>
                    <dd className="font-mono text-ink">{solution.thcRange}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-ink-muted">
                      {t("solution.priceLabel")}
                    </dt>
                    <dd className="font-mono text-ink">
                      {t("solution.pricePerGram", {
                        price: formatPriceEur(solution.priceEur, language),
                      })}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink-muted">
                      {t("solution.oilProfileLabel")}
                    </dt>
                    <dd className="text-right font-mono text-ink">
                      {oilProfileSummary(solution)}
                    </dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-5">{footer}</div>
        </div>
      </div>
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
        onClick={() =>
          track(AnalyticsEvent.recommendationCtaClicked, {
            target: "alternative",
            solution: solution.id,
          })
        }
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
  const { t: tCommon } = useTranslation();
  const { result, answers } = useAssessment();
  const navigate = useNavigate();
  usePageTitle(t("result.title"), tCommon("pages.result.description"));

  const problem = result?.problem;
  useEffect(() => {
    if (!problem) return;
    track(AnalyticsEvent.recommendationViewed, { problem });
  }, [problem]);

  if (!result) {
    return <Navigate to={paths.assessment.start} replace />;
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];
  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];
  const existingReview = getMedicalReview();

  function submitForReview() {
    if (!result) return;
    submitMedicalReview({ problem: result.problem, answers });
    track(AnalyticsEvent.medicalReviewSubmitted, { problem: result.problem });
    navigate(paths.assessment.review);
  }

  // Owner decision D1 — frequency and format preference personalise the
  // recommendation copy and are noted for the medical review; they never
  // change the match or push a stronger / higher-THC option.
  const q2 = answers.q2;
  const q6 = answers.q6;
  const personalisation = (
    <>
      {q2 ? (
        <p className="mt-2 text-sm text-ink-muted">
          {/* frequency reads as an adverb here ("… affects you daily") — lower-
              cased in both languages; German q2 labels are adverbial too. */}
          {t("result.frequencyNote", {
            frequency: t(`questions.q2.options.${q2}`).toLowerCase(),
          })}
        </p>
      ) : null}
      {q6 === "flower" || q6 === "vape" ? (
        <p className="mt-2 text-sm text-ink-muted">
          {/* format is a noun — keep the label's own casing so German stays
              correct ("… dass du Blüte bevorzugst", not "blüte"). */}
          {t("result.formatPreferenceNote", {
            format: t(`questions.q6.options.${q6}`),
          })}
        </p>
      ) : null}
    </>
  );

  const primaryCta = (
    <div className="flex flex-col items-start gap-2">
      {existingReview ? (
        <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
          <Link to={paths.assessment.review}>{t("result.viewReviewCta")}</Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="w-full sm:w-auto"
          onClick={submitForReview}
        >
          {t("result.submitReviewCta")}
        </Button>
      )}
      <Link
        to={paths.shopProduct(primary.id)}
        onClick={() =>
          track(AnalyticsEvent.recommendationCtaClicked, {
            target: "view_solution",
            solution: primary.id,
          })
        }
        className="text-sm text-petrol-700 underline-offset-4 hover:underline"
      >
        {t("result.orViewSolution")}
      </Link>
    </div>
  );

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
          notes={personalisation}
          detailsLabel={t("result.detailsLabel")}
          footer={primaryCta}
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

        {/* The trailing notes — review-required, the gentle-start nudge when it
            applies, and the "not medical advice" line — consolidated into one
            info panel instead of three separate blocks (owner request, Sept
            2026). Kept visible, not behind a disclosure: the "prescription-
            only / reviewed by a doctor / only if appropriate" line is
            compliance copy the spec wants on this page. */}
        <div className="mt-8 flex items-start gap-2.5 rounded-2xl bg-sage-50 p-4 text-sm leading-relaxed text-ink-muted">
          <Info
            className="mt-0.5 size-4 shrink-0 text-petrol-600"
            aria-hidden
          />
          <div className="space-y-2">
            <p>{t("result.reviewRequiredNote")}</p>
            {result.gentleFirst ? <p>{t("result.gentleNudge")}</p> : null}
            <p>{t("result.disclaimer")}</p>
          </div>
        </div>

        {/* The primary CTA now lives on the recommendation card above;
            "Change My Answers" is the one action left for this row. */}
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link
              to={paths.assessment.start}
              onClick={() =>
                track(AnalyticsEvent.recommendationCtaClicked, {
                  target: "change_answers",
                })
              }
            >
              {t("result.changeAnswers")}
            </Link>
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
