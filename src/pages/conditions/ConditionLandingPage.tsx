import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { ComboCard } from "@/components/marketing/ComboCard";
import { MedicalNotice } from "@/components/marketing/MedicalNotice";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { IMG, siteImage } from "@/data/siteImages";
import {
  isConditionKey,
  type ConditionKey,
} from "@/features/conditions/conditions";
import { AnalyticsEvent, track } from "@/lib/analytics";

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
  const { t: tCommon } = useTranslation();
  usePageTitle(
    t(`${conditionKey}.hero.title`),
    tCommon(`pages.conditions.${conditionKey}.description`),
  );

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
  const onCtaClick = () =>
    track(AnalyticsEvent.problemPageCtaClicked, { problem: conditionKey });

  return (
    <>
      {/* Hero — from `lg` up the condition photo is a full-bleed background
          anchored to the right as a band, with the brand blue gradient
          filling the left and feathering over it. On tighter screens the
          photo becomes a full-width band beneath the copy and the gradient
          rotates to run top→bottom, so the copy sits on solid blue and
          feathers into the photo below. */}
      <section className="relative isolate overflow-hidden rounded-b-2xl md:rounded-b-4xl px-4 pt-14 [background-image:linear-gradient(120deg,#0a2c42_0%,#0d444b_50%,#123f52_100%)] sm:px-6 sm:pt-20 lg:min-h-[30rem] lg:pb-28">
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-lg space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-300">
              {t(`${conditionKey}.shortTitle`)}
            </p>
            <h1 className="text-white">{t(`${conditionKey}.hero.title`)}</h1>
            <p className="text-lg text-white/80">
              {t(`${conditionKey}.hero.subtitle`)}
            </p>
            <div className="pt-1">
              <Button
                asChild
                variant="cta"
                size="xl"
                className="w-full sm:w-auto"
              >
                <Link to={assessmentLink(conditionKey)} onClick={onCtaClick}>
                  {ctaLabel}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile fade widened (owner request, Aug 2026 — the gradient-to-
            photo cut read as a hard edge): the photo's own mask now fades in
            over its top half instead of just the top quarter, and the
            overlay below keeps some tint much further down instead of
            clearing by 76%, so the two overlap generously wherever the photo
            actually starts instead of depending on exact text length. */}
        <div
          aria-hidden
          className="relative z-0 -mx-4 mt-6 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_50%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_50%)] sm:-mx-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:mt-0 lg:w-[64%] lg:[mask-image:none] lg:[-webkit-mask-image:none]"
        >
          <ImageWithFallback
            src={siteImage(IMG.conditionHero[conditionKey])}
            alt=""
            className="block h-auto w-full object-cover object-center lg:size-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_bottom,#0a2c42_0%,#0a2c42_30%,rgba(13,68,75,0.7)_48%,rgba(18,88,108,0.4)_66%,rgba(18,88,108,0.15)_84%,rgba(18,88,108,0)_100%)] lg:[background-image:linear-gradient(100deg,#0a2c42_0%,#0a2c42_36%,rgba(13,68,75,0.82)_54%,rgba(18,88,108,0.34)_74%,rgba(18,88,108,0)_92%)]"
        />
      </section>

      <Section tone="surface" reveal={false}>
        <Reveal className="max-w-3xl">
          <SectionHeading title={t("shared.explanationHeading")} />
          <p className="mt-4 text-lg text-ink-muted">
            {t(`${conditionKey}.explanation`)}
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="text-lg">{t("shared.situationsHeading")}</h3>
        </Reveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
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

      <Section tone="brand" reveal={false}>
        <Reveal>
          <SectionHeading
            title={t("shared.howWeHelpHeading")}
            invert
            align="center-mobile"
          />
        </Reveal>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {helpSteps.map((step, i) => (
            <Reveal key={i} delayMs={i * 60}>
              {/* number + sentence sit in a row on mobile (full-width cards),
                  back to a stack from `sm` where the grid narrows them. */}
              <li className="flex h-full flex-row items-baseline gap-3 glass-strong rounded-3xl p-5 sm:flex-col sm:items-stretch sm:gap-0">
                <span className="shrink-0 font-mono text-sm font-semibold text-petrol-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-ink sm:mt-2">{step}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {isConditionKey(conditionKey) ? (
        <Section tone="surface" reveal={false}>
          {/* Mobile order: heading, then the matched pair + CTA, then the
              safety notice. On lg it resolves to two columns — heading above
              the notice on the left, the matched pair + CTA spanning the
              right (grid auto-placement + `lg:row-span-2` on the pair). */}
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-16 lg:gap-y-0">
            <Reveal>
              <SectionHeading
                title={t("shared.matchedHeading")}
                intro={t("shared.matchedNote")}
              />
            </Reveal>

            <div className="lg:row-span-2">
              <Reveal>
                <ComboCard problem={conditionKey} showHeader={false} />
              </Reveal>
              <div className="mt-8">
                {/* Full-width while the panels are stacked (< lg), so the CTA
                    doesn't float mid-row on mobile; natural width once the
                    columns split. */}
                <Button
                  asChild
                  variant="cta"
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  <Link to={assessmentLink(conditionKey)} onClick={onCtaClick}>
                  {ctaLabel}
                </Link>
                </Button>
              </div>
            </div>

            <Reveal className="lg:mt-8">
              <MedicalNotice />
            </Reveal>
          </div>
        </Section>
      ) : (
        <Section tone="surface" reveal={false}>
          <Reveal className="mx-auto max-w-3xl">
            <MedicalNotice />
          </Reveal>
        </Section>
      )}
    </>
  );
}
