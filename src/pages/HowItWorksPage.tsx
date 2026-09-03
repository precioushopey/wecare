import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { Reveal } from "@/components/marketing/Reveal";
import { Section } from "@/components/marketing/Section";
import { BreadcrumbJsonLd } from "@/seo/StructuredData";

const STEPS = [
  "problem",
  "assessment",
  "recommendation",
  "review",
  "fulfilment",
  "followUp",
] as const;

/**
 * Standalone "So funktioniert WeCare" page (PO decision A2). Expands the
 * homepage `HowItWorksSection` into a trust/education page — indexable, but
 * kept out of the primary nav. Describes the process only; no medical claims
 * (LEGAL REVIEW scope, SEO-FOUNDATION.md §H).
 */
export function HowItWorksPage() {
  const { t } = useTranslation("home");
  const { t: tCommon } = useTranslation();
  usePageTitle(
    t("howItWorksPage.title"),
    tCommon("pages.howItWorks.description"),
  );

  return (
    <>
      <BreadcrumbJsonLd
        trail={[{ name: t("howItWorksPage.title"), path: paths.howItWorks }]}
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {t("howItWorksPage.eyebrow")}
          </p>
          <h1 className="mt-2">{t("howItWorksPage.title")}</h1>
          <p className="mt-3 text-lg text-ink-muted">
            {t("howItWorksPage.intro")}
          </p>
        </Reveal>

        <ol className="mt-12 space-y-8">
          {STEPS.map((step, i) => (
            <Reveal key={step} delayMs={i * 40}>
              <li className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sage-100 font-display text-base text-petrol-700">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-lg">
                    {t(`howItWorksPage.steps.${step}.title`)}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {t(`howItWorksPage.steps.${step}.body`)}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      <Section tone="brand">
        <Reveal className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <AssessmentRing variant="decoration" tone="mint" size={56} />
            <p className="font-display text-xl text-white">
              {t("howItWorksPage.ctaHeading")}
            </p>
          </div>
          <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
            <Link to={paths.assessment.start}>{t("howItWorksPage.cta")}</Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
