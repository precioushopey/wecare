import { useEffect } from "react";
import type { ReactNode } from "react";
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
import { SolutionMark } from "@/components/brand/SolutionMark";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { NextSteps } from "@/components/marketing/NextSteps";
import { Reveal } from "@/components/marketing/Reveal";
import { SOLUTION_BY_ID, type Solution } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { hasAnyFlag } from "@/features/assessment/exclusions";
import { getMedicalReview } from "@/features/review/review";
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
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl [background-image:var(--brand-band-gradient)] p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 size-56 rounded-full bg-sky-400/15 blur-3xl"
      />

      <div className="relative min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
          {heading}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <SolutionMark
            solution={solution}
            variant="badge"
            className="size-14"
          />
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight text-white">
              {solution.name}
            </p>
            <p className="text-xs font-medium text-sky-200">
              {t(`solutions.${solution.id}.category`)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-white/85">{explanation}</p>
        {notes}

          <Accordion
            type="single"
            collapsible
            className="mt-3"
            onValueChange={(value) => {
              // Learn-more disclosure open, not close — the mobile-vs-desktop
              // recommendation funnel PostHog decision (Sept 2026).
              if (value) {
                track(AnalyticsEvent.recommendationLearnMoreOpened, {
                  solution: solution.id,
                });
              }
            }}
          >
            <AccordionItem value="details" className="border-white/15">
              <AccordionTrigger className="text-sm text-white hover:no-underline [&>svg]:text-white/70">
                {detailsLabel}
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-white/60">
                      {t("solution.thcRangeLabel")}
                    </dt>
                    <dd className="font-mono text-white">{solution.thcRange}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-white/60">{t("solution.priceLabel")}</dt>
                    <dd className="font-mono text-white">
                      {t("solution.pricePerGram", {
                        price: formatPriceEur(solution.priceEur, language),
                      })}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-white/60">
                      {t("solution.oilProfileLabel")}
                    </dt>
                    <dd className="text-right font-mono text-white">
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
          track(AnalyticsEvent.recommendationAlternativeSelected, {
            solution: solution.id,
          })
        }
        className="group mt-2 flex items-center gap-3 rounded-2xl glass glass-hover p-3"
      >
        <SolutionMark solution={solution} className="size-11 shrink-0 rounded-lg" />
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
  const { result, answers, postcode, deliveryRegion, exclusions } =
    useAssessment();
  usePageTitle(t("result.title"), tCommon("pages.result.description"), {
    noindex: true,
  });

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

  // Owner decision D1 — frequency and format preference personalise the
  // recommendation copy and are noted for the medical review; they never
  // change the match or push a stronger / higher-THC option.
  const q2 = answers.q2;
  const q6 = answers.q6;
  const personalisation = (
    <>
      {q2 ? (
        <p className="mt-2 text-sm text-white/80">
          {/* frequency reads as an adverb here ("… affects you daily") — lower-
              cased in both languages; German q2 labels are adverbial too. */}
          {t("result.frequencyNote", {
            frequency: t(`questions.q2.options.${q2}`).toLowerCase(),
          })}
        </p>
      ) : null}
      {q6 === "flower" || q6 === "vape" ? (
        <p className="mt-2 text-sm text-white/80">
          {/* format is a noun — keep the label's own casing so German stays
              correct ("… dass du Blüte bevorzugst", not "blüte"). */}
          {t("result.formatPreferenceNote", {
            format: t(`questions.q6.options.${q6}`),
          })}
        </p>
      ) : null}
    </>
  );

  // PO decision B1 — the Result page introduces the Solution, it does not ask
  // the user to submit medical data. Primary CTA opens the Solution page,
  // where "Continue to medical review" lives. A returning user with a review
  // already in flight is sent straight to its status instead.
  // On the branded gradient card a solid-white pill is the highest-contrast
  // primary action (same as the dashboard gradient heroes).
  const ctaClass =
    "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm font-semibold text-petrol-800 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.55)] transition-colors hover:bg-white/90 sm:w-auto";
  const primaryCta = existingReview ? (
    <Link
      to={paths.assessment.review}
      onClick={() =>
        track(AnalyticsEvent.recommendationContinueClicked, {
          path: "existing_review",
        })
      }
      className={ctaClass}
    >
      {t("result.viewReviewCta")}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  ) : (
    <Link
      to={paths.shopProduct(primary.id)}
      onClick={() =>
        track(AnalyticsEvent.recommendationPrimarySelected, {
          solution: primary.id,
        })
      }
      className={ctaClass}
    >
      {t("result.viewSolution")}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
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
            {postcode ? (
              <DeliveryConfirmation
                postcode={postcode}
                region={deliveryRegion}
                className="mt-3"
              />
            ) : null}
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
            {hasAnyFlag(exclusions ?? undefined) ? (
              <p>{t("result.exclusionNote")}</p>
            ) : null}
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
              onClick={() => track(AnalyticsEvent.recommendationChangeAnswers)}
            >
              {t("result.changeAnswers")}
            </Link>
          </Button>
        </div>
      </Reveal>

      {/* What's still ahead — review and delivery come after you pick the solution. */}
      <Reveal className="mt-10 rounded-2xl md:rounded-3xl glass p-6">
        <h2 className="text-base">{t("result.nextHeading")}</h2>
        <div className="mt-4">
          <NextSteps
            steps={(["view", "review", "delivery"] as const).map((k) => ({
              title: t(`result.next.${k}.title`),
              body: t(`result.next.${k}.body`),
            }))}
          />
        </div>
      </Reveal>
    </div>
  );
}
