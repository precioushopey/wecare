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

  return (
    <>
      {/* Hero — from `lg` up the condition photo is a full-bleed background
          anchored to the right as a band, with the brand blue gradient
          filling the left and feathering over it. On tighter screens the
          photo becomes a full-width band beneath the copy and the gradient
          rotates to run top→bottom, so the copy sits on solid blue and
          feathers into the photo below. */}
      <section className="relative isolate overflow-hidden rounded-b-4xl px-4 pt-14 [background-image:linear-gradient(120deg,#0a2c42_0%,#0d444b_50%,#123f52_100%)] sm:px-6 sm:pt-20 lg:min-h-[30rem] lg:pb-28">
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
                <Link to={assessmentLink(conditionKey)}>{ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="relative z-0 -mx-4 mt-6 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_26%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_26%)] sm:-mx-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:mt-0 lg:w-[64%] lg:[mask-image:none] lg:[-webkit-mask-image:none]"
        >
          <ImageWithFallback
            src={siteImage(IMG.conditionHero[conditionKey])}
            alt=""
            className="block h-auto w-full object-cover object-center lg:size-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_bottom,#0a2c42_0%,#0a2c42_34%,rgba(13,68,75,0.62)_54%,rgba(18,88,108,0.22)_76%,rgba(18,88,108,0)_100%)] lg:[background-image:linear-gradient(100deg,#0a2c42_0%,#0a2c42_36%,rgba(13,68,75,0.82)_54%,rgba(18,88,108,0.34)_74%,rgba(18,88,108,0)_92%)]"
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
          <SectionHeading title={t("shared.howWeHelpHeading")} invert />
        </Reveal>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {helpSteps.map((step, i) => (
            <Reveal key={i} delayMs={i * 60}>
              <li className="flex h-full flex-col glass-strong rounded-3xl p-5">
                <span className="font-mono text-sm font-semibold text-petrol-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm text-ink">{step}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {isConditionKey(conditionKey) ? (
        <Section tone="surface" reveal={false}>
          {/* Two panels: the section heading + the standing medical-safety
              notice on the left; the matched pair (+ assessment CTA) on the
              right. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div>
              <Reveal>
                <SectionHeading
                  title={t("shared.matchedHeading")}
                  intro={t("shared.matchedNote")}
                />
              </Reveal>
              <Reveal className="mt-8">
                <MedicalNotice />
              </Reveal>
            </div>

            <div>
              <Reveal>
                <ComboCard problem={conditionKey} showHeader={false} />
              </Reveal>
              <div className="mt-8">
                {/* Full-width while the two panels are stacked (< lg), so the
                    CTA doesn't float mid-row on mobile; natural width once
                    the columns split. */}
                <Button
                  asChild
                  variant="cta"
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  <Link to={assessmentLink(conditionKey)}>{ctaLabel}</Link>
                </Button>
              </div>
            </div>
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
