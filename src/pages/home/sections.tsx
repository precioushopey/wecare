import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  LifeBuoy,
  ListChecks,
  Lock,
  MapPin,
  Minus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { FloatingChip } from "@/components/marketing/FloatingChip";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { IMG, siteImage } from "@/data/siteImages";
import { CONDITIONS, type ConditionKey } from "@/features/conditions/conditions";

function assessmentLink(problem?: string) {
  return problem
    ? `${paths.assessment.start}?problem=${problem}`
    : paths.assessment.start;
}

/* ── 1. Hero ──────────────────────────────────────────────────────────────── */

export function HeroSection() {
  const { t } = useTranslation("home");
  const trustPoints = t("hero.trustPoints", {
    returnObjects: true,
  }) as string[];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:gap-12">
        <div className="max-w-xl space-y-6 lg:flex-1">
          <h1>{t("hero.title")}</h1>
          <p className="text-lg text-ink-muted">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild variant="cta" size="xl">
              <Link to={assessmentLink()}>{t("hero.primaryCta")}</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to={paths.howItWorks}>{t("hero.secondaryCta")}</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-2 pt-2">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1 text-sm text-ink-muted ring-1 ring-white/60 backdrop-blur-sm"
              >
                <Check className="size-3.5 text-sage-500" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Layered hero: the cut-out photo sits against a quiet Assessment Ring
            arc, with two chips naming the effort and the payoff. The photo is
            static (no drift) and bleeds flush to the section's bottom edge. */}
        <div className="relative -mb-12 self-end lg:flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-6 hidden opacity-70 lg:block"
          >
            <AssessmentRing
              variant="decoration"
              tone="brand"
              size={460}
              strokeWidth={3}
            />
          </div>

          <div className="image-glow relative">
            <ImageWithFallback
              src={siteImage(IMG.homeHero)}
              alt={t("hero.ariaImage")}
              width={1034}
              height={952}
              className="relative block w-full drop-shadow-[0_45px_70px_-35px_rgba(13,68,75,0.5)]"
            />
          </div>

          <FloatingChip
            icon={<Clock className="size-4" />}
            className="absolute left-1 top-8 hidden sm:inline-flex"
          >
            {t("hero.chipTime")}
          </FloatingChip>
          <FloatingChip
            icon={<Sparkles className="size-4" />}
            className="absolute bottom-24 right-0 hidden sm:inline-flex"
          >
            {t("hero.chipMatch")}
          </FloatingChip>
        </div>
      </div>
    </section>
  );
}

/* ── 2. What do you need help with? ──────────────────────────────────────── */

export function ChooseProblemSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="raised" id="anliegen">
      <Reveal>
        <SectionHeading
          eyebrow={t("chooseProblem.eyebrow")}
          title={t("chooseProblem.title")}
          intro={t("chooseProblem.intro")}
        />
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CONDITIONS.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.key} delayMs={i * 60}>
              <Link
                to={assessmentLink(c.assessmentProblem)}
                className="group flex h-full flex-col overflow-hidden rounded-3xl glass glass-hover"
              >
                <div className="image-glow relative aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={siteImage(IMG.problem[c.key])}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="-mt-11 mb-1 inline-flex size-11 items-center justify-center rounded-2xl glass-strong text-petrol-700 shadow-[0_10px_24px_-12px_rgba(13,68,75,0.4)]">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-3 text-lg">
                    {t(`chooseProblem.cards.${c.key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-ink-muted">
                    {t(`chooseProblem.cards.${c.key}.description`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-petrol-700">
                    {t(`chooseProblem.cards.${c.key}.cta`)}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ── 3. How WeCare works ──────────────────────────────────────────────────── */

const HOW_STEPS = ["choose", "assessment", "match", "continue"] as const;

export function HowItWorksSection() {
  const { t } = useTranslation("home");

  return (
    // `#how-it-works` is the redirect target for the retired /how-it-works page.
    <Section tone="surface" id="how-it-works" className="scroll-mt-24">
      <Reveal>
        <SectionHeading
          eyebrow={t("howItWorks.eyebrow")}
          title={t("howItWorks.title")}
          intro={t("howItWorks.intro")}
        />
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-14">
        <Reveal className="order-last h-full lg:order-first">
          <div className="image-glow flex h-full items-center justify-center">
            <ImageWithFallback
              src={siteImage(IMG.homeProcess)}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="image-fade-b w-full max-w-md drop-shadow-[0_40px_65px_-32px_rgba(13,68,75,0.45)]"
            />
          </div>
        </Reveal>

        <Reveal className="h-full">
          <ol className="flex h-full flex-col justify-center gap-6 glass-strong rounded-3xl p-6 sm:p-8">
            {HOW_STEPS.map((step, i) => (
              <li key={step} className="relative flex gap-4">
                {i < HOW_STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[1.375rem] top-12 h-[calc(100%+1.75rem)] w-px bg-gradient-to-b from-petrol-300 to-petrol-300/0"
                  />
                ) : null}
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 font-display text-lg text-petrol-700 ring-1 ring-white/70">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="text-base">
                    {t(`howItWorks.steps.${step}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {t(`howItWorks.steps.${step}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 4. Simple recommendations. No confusing catalog. ────────────────────── */

const SOLUTION_CARDS: readonly ConditionKey[] = [
  "sleep",
  "pain",
  "stressAnxiety",
  "migraine",
];

export function SolutionsPreviewSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="mint">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading
              eyebrow={t("solutionsPreview.eyebrow")}
              title={t("solutionsPreview.title")}
              intro={t("solutionsPreview.intro")}
            />
          </Reveal>

          <Reveal>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
              <span className="flex max-w-[8.5rem] flex-wrap gap-1" aria-hidden>
                {Array.from({ length: 21 }).map((_, k) => (
                  <span
                    key={k}
                    className="size-1.5 rounded-full bg-petrol-400/40"
                  />
                ))}
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-petrol-500"
                aria-hidden
              />
              <span className="flex shrink-0 gap-1" aria-hidden>
                <span className="size-2.5 rounded-full bg-petrol-600" />
                <span className="size-2.5 rounded-full bg-sage-500" />
              </span>
              <span>{t("solutionsPreview.narrowNote")}</span>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {SOLUTION_CARDS.map((key, i) => {
              const Icon = CONDITIONS.find((c) => c.key === key)!.icon;
              return (
                <Reveal key={key} delayMs={i * 60}>
                  <Link
                    to={assessmentLink(key)}
                    className="flex h-full flex-col glass glass-hover rounded-3xl p-6"
                  >
                    <span className="mb-3 inline-flex size-11 items-center justify-center rounded-2xl [background-image:var(--cta-gradient)] text-white shadow-[0_10px_24px_-10px_rgba(42,167,176,0.55)]">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="text-base">
                      {t(`solutionsPreview.cards.${key}.title`)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-ink-muted">
                      {t(`solutionsPreview.cards.${key}.description`)}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-8">
            <Button asChild variant="cta">
              <Link to={assessmentLink()}>{t("solutionsPreview.cta")}</Link>
            </Button>
          </div>
        </div>

        <Reveal className="hidden lg:block">
          <div className="image-glow">
            <ImageWithFallback
              src={siteImage(IMG.homeGuidance)}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="image-fade-b w-full drop-shadow-[0_40px_65px_-32px_rgba(13,68,75,0.4)]"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 5. A guided and responsible experience ──────────────────────────────── */

const TRUST_ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: "discreet", icon: Lock },
  { key: "clear", icon: ListChecks },
  { key: "guidance", icon: BookOpen },
  { key: "support", icon: LifeBuoy },
  { key: "austria", icon: MapPin },
];

export function TrustSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="surface">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={t("trust.eyebrow")}
            title={t("trust.title")}
            intro={t("trust.intro")}
          />
        </Reveal>
        <Reveal className="hidden lg:block">
          <div className="image-glow">
            <ImageWithFallback
              src={siteImage(IMG.homeTrust)}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="image-fade-b w-full drop-shadow-[0_40px_65px_-32px_rgba(13,68,75,0.4)]"
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST_ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} delayMs={i * 60}>
            <div className="flex h-full gap-3.5 glass rounded-3xl p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-petrol-600/10 text-petrol-700">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h3 className="text-base">{t(`trust.items.${key}.title`)}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {t(`trust.items.${key}.description`)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Comparison — guided vs. catalog (added Aug 2026, owner request) ─────── */

const COMPARISON_ROWS = ["start", "result", "review", "focus", "market"] as const;

export function ComparisonSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="raised">
      <Reveal>
        <SectionHeading
          eyebrow={t("comparison.eyebrow")}
          title={t("comparison.title")}
          intro={t("comparison.intro")}
        />
      </Reveal>
      <Reveal>
        <div className="mt-10 overflow-hidden rounded-3xl glass-strong">
          <div className="grid grid-cols-2 border-b border-white/50 text-sm font-semibold">
            <div className="p-4 text-ink-muted sm:p-5">
              {t("comparison.themLabel")}
            </div>
            <div className="bg-petrol-600/5 p-4 text-petrol-800 sm:p-5">
              {t("comparison.usLabel")}
            </div>
          </div>
          <dl className="divide-y divide-white/40">
            {COMPARISON_ROWS.map((row) => (
              <div key={row} className="grid grid-cols-2 text-sm">
                <dt className="flex items-start gap-2 p-4 text-ink-muted sm:p-5">
                  <Minus
                    className="mt-0.5 size-4 shrink-0 text-ink-muted/60"
                    aria-hidden
                  />
                  {t(`comparison.rows.${row}.them`)}
                </dt>
                <dd className="flex items-start gap-2 bg-petrol-600/5 p-4 text-ink sm:p-5">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-sage-500"
                    aria-hidden
                  />
                  {t(`comparison.rows.${row}.us`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </Section>
  );
}

/* ── 6. Final CTA ────────────────────────────────────────────────────────── */

export function FinalCtaSection() {
  const { t } = useTranslation("home");

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b2f45_0%,#0d444b_55%,#12586c_100%)] px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <h2 className="max-w-2xl text-white">{t("finalCta.title")}</h2>
          <p className="max-w-xl text-sage-100">{t("finalCta.subtitle")}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="cta" size="xl">
              <Link to={assessmentLink()}>{t("finalCta.cta")}</Link>
            </Button>
            <FloatingChip tone="dark" icon={<Check className="size-4" />}>
              {t("finalCta.chip")}
            </FloatingChip>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 opacity-40 sm:block"
          >
            <AssessmentRing
              variant="decoration"
              tone="mint"
              size={360}
              strokeWidth={3}
            />
          </div>
          <ImageWithFallback
            src={siteImage(IMG.homeDoctor)}
            alt=""
            width={1613}
            height={943}
            loading="lazy"
            decoding="async"
            className="image-fade-b relative z-[1] w-full object-contain drop-shadow-[0_30px_50px_-20px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </section>
  );
}
