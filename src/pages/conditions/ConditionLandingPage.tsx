import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { MedicalNotice } from "@/components/marketing/MedicalNotice";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { IMG, siteImage } from "@/data/siteImages";
import { SOLUTION_BY_ID, solutionImage } from "@/data/solutions";
import { matchedSolutionIds } from "@/features/assessment/recommendation";
import {
  isConditionKey,
  type ConditionKey,
} from "@/features/conditions/conditions";

type LandingKey = ConditionKey | "generalWellness";

function assessmentLink(key: LandingKey) {
  return isConditionKey(key)
    ? `${paths.assessment.start}?problem=${key}`
    : paths.assessment.start;
}

/**
 * Shared template for the four problem landing pages (+ the General Wellness
 * fallback). The assessment is always the primary call to action; the matched
 * solutions are shown only as a low-emphasis preview, never before the
 * assessment as the main focus (Problem Landing Pages guideline).
 */
export function ConditionLandingPage({
  conditionKey,
}: {
  conditionKey: LandingKey;
}) {
  const { t } = useTranslation("conditions");
  const { t: tc } = useTranslation("common");
  const { t: ts } = useTranslation("shop");
  usePageTitle(t(`${conditionKey}.hero.title`));

  const situations = Object.values(
    t(`${conditionKey}.situations`, { returnObjects: true }) as Record<
      string,
      string
    >,
  );
  const helpSteps = Object.values(
    t(`${conditionKey}.helpSteps`, { returnObjects: true }) as Record<
      string,
      string
    >,
  );
  const ctaLabel = t(`${conditionKey}.assessmentCta`);
  const matched = isConditionKey(conditionKey)
    ? matchedSolutionIds(conditionKey).map((id) => SOLUTION_BY_ID[id])
    : [];

  return (
    <>
      <Section tone="surface" className="pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
              {t(`${conditionKey}.shortTitle`)}
            </p>
            <h1 className="max-w-2xl">{t(`${conditionKey}.hero.title`)}</h1>
            <p className="max-w-xl text-lg text-ink-muted">
              {t(`${conditionKey}.hero.subtitle`)}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild variant="cta" size="xl">
                <Link to={assessmentLink(conditionKey)}>{ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to={paths.howItWorks}>{tc("cta.howItWorks")}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <ImageWithFallback
              src={siteImage(IMG.conditionHero[conditionKey])}
              alt=""
              className="ml-auto aspect-square w-full max-w-sm rounded-3xl object-cover shadow-[0_30px_60px_-24px_rgba(13,68,75,0.3)]"
            />
          </div>
        </div>
      </Section>

      <Section tone="raised">
        <Reveal className="max-w-3xl">
          <SectionHeading title={t("shared.explanationHeading")} />
          <p className="mt-4 text-lg text-ink-muted">
            {t(`${conditionKey}.explanation`)}
          </p>
        </Reveal>
      </Section>

      <Section tone="surface">
        <Reveal>
          <SectionHeading title={t("shared.situationsHeading")} />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {situations.map((s, i) => (
            <Reveal key={i} delayMs={i * 50}>
              <li className="flex items-start gap-3 glass p-4">
                <Check
                  className="mt-0.5 size-5 shrink-0 text-sage-500"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-ink">{s}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="mint">
        <Reveal>
          <SectionHeading title={t("shared.howWeHelpHeading")} />
        </Reveal>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {helpSteps.map((step, i) => (
            <Reveal key={i} delayMs={i * 60}>
              <li className="flex h-full flex-col glass rounded-3xl p-5">
                <span className="text-sm font-semibold text-petrol-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm text-ink">{step}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {matched.length > 0 ? (
        <Section tone="surface">
          <Reveal>
            <SectionHeading
              title={t("shared.matchedHeading")}
              intro={t("shared.matchedNote")}
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {matched.map((s, i) => (
              <Reveal key={s.id} delayMs={i * 60}>
                <div className="flex items-center gap-4 glass rounded-3xl p-4">
                  <div className="image-glow size-14 shrink-0 rounded-lg">
                    <ImageWithFallback
                      src={solutionImage(s)}
                      alt=""
                      className="size-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-base text-ink">{s.name}</p>
                    <p className="text-xs font-medium text-petrol-600">
                      {ts(`solutions.${s.id}.category`)}
                    </p>
                    <p className="mt-0.5 font-mono text-sm text-ink-muted">
                      THC {s.thcRange}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="cta" size="lg">
              <Link to={assessmentLink(conditionKey)}>{ctaLabel}</Link>
            </Button>
          </div>
        </Section>
      ) : null}

      <Section tone="surface">
        <Reveal className="mx-auto max-w-3xl">
          <MedicalNotice />
        </Reveal>
      </Section>

      <Section tone="brand">
        <div className="flex flex-col items-start gap-6">
          <h2 className="max-w-2xl text-white">
            {t(`${conditionKey}.hero.title`)}
          </h2>
          <Button asChild variant="cta" size="xl">
            <Link to={assessmentLink(conditionKey)}>{ctaLabel}</Link>
          </Button>
          {conditionKey !== "generalWellness" ? (
            <Link
              to={paths.conditions.generalWellness}
              className="inline-flex items-center gap-1.5 text-sm text-sage-100 underline-offset-4 hover:underline"
            >
              {t("shared.notSurePrompt")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </Section>
    </>
  );
}
