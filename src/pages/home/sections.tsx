import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BadgeCheck,
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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { ComboCarousel } from "@/components/marketing/ComboCarousel";
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
    <>
    <section className="relative overflow-hidden px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 py-12 lg:flex-row lg:items-start lg:gap-12 lg:pt-28">
        <div className="max-w-xl space-y-6 lg:flex-1">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
              {t("hero.kicker")}
            </p>
            <h1>{t("hero.title")}</h1>
          </div>
          <p className="text-lg text-ink-muted">{t("hero.subtitle")}</p>
          {/* Desktop keeps the CTA + "How It Works" pair here. On mobile both
              move out: "How It Works" is dropped and the primary CTA is
              rendered full-width, flush under the photo (see below). */}
          <div className="hidden flex-wrap items-center gap-3 pt-1 lg:flex">
            <Button asChild variant="cta" size="xl">
              <Link to={assessmentLink()}>{t("hero.primaryCta")}</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to={paths.howItWorks}>{t("hero.secondaryCta")}</Link>
            </Button>
          </div>
        </div>

        {/* Layered hero: the cut-out photo rests on a soft radial glow
            (`.image-glow`) at every width, with two chips naming the effort
            and the payoff, and a 3/4 Assessment Ring arc behind it that
            signals the quiz. The photo and chips are static (no drift); the
            one motion here is the ring's arc sweeping in once on load — the
            AssessmentRing's own sanctioned animation, reduced-motion aware —
            with the trail dots + "7/10" label fading in as it finishes. */}
        <div className="relative isolate lg:-mb-12 lg:flex-1 lg:self-end">
          {/* The ring + trail dots + "7/10" label ride behind the photo
              (`-z-10`) at every width — scaled down on mobile, full size from
              `lg`. From `lg` it's pulled in over the subject so her (opaque)
              form masks the ring's body and only the arc peeks past her,
              rather than the arc crossing the cut-out's transparent zone. */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 -top-3 -z-10 block origin-top-right scale-[0.52] opacity-90 lg:right-16 lg:-top-4 lg:scale-100 lg:opacity-80"
          >
            <AssessmentRing
              variant="decoration"
              tone="brand"
              value={3}
              total={4}
              size={430}
              strokeWidth={16}
              animate
              drawDurationMs={1400}
              drawDelayMs={250}
              trail
              startLabel="7/10"
            />
          </div>

          <div className="image-glow relative">
            <ImageWithFallback
              src={siteImage(IMG.homeHero)}
              alt={t("hero.ariaImage")}
              width={1648}
              height={1080}
              className="hero-photo-mask relative block w-full drop-shadow-[0_45px_70px_-35px_rgba(13,68,75,0.5)]"
            />
          </div>

          {/* Mobile-only CTA — full-width and flush to the bottom of the photo
              (no gap) so the image reads as standing on the button. */}
          <Button asChild variant="cta" size="xl" className="flex w-full lg:hidden">
            <Link to={assessmentLink()}>{t("hero.primaryCta")}</Link>
          </Button>

          <FloatingChip
            icon={<Clock className="size-3.5 sm:size-4" />}
            className="wc-float-a absolute left-1 top-4 gap-1.5 px-2.5 py-1 text-[11px] sm:top-8 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            {t("hero.chipTime")}
          </FloatingChip>
          <FloatingChip
            icon={<Sparkles className="size-3.5 sm:size-4" />}
            className="wc-float-b absolute bottom-32 right-1 gap-1.5 px-2.5 py-1 text-[11px] sm:bottom-24 sm:right-0 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            {t("hero.chipMatch")}
          </FloatingChip>
        </div>
      </div>
    </section>

    {/* Trust strip — the hero assurance points in a glass pill capped at the
        section width (no longer a full-bleed band). Below `lg` the row is
        wider than the pill and auto-scrolls as a gentle marquee (list
        rendered twice for a seamless loop); from `lg` up it fits and sits
        static, centred. */}
    <div className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-full border border-white/50 bg-white/40 px-6 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
        <div className="trust-marquee">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              data-marquee-clone={copy === 1 ? "" : undefined}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0 items-center gap-x-6 pr-6 text-xs text-ink-muted"
            >
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Check
                    className="size-3.5 shrink-0 text-sage-500"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

/* ── 2. What do you need help with? ──────────────────────────────────────── */

export function ChooseProblemSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="surface" id="anliegen" reveal={false}>
      <Reveal>
        <SectionHeading
          eyebrow={t("chooseProblem.eyebrow")}
          title={t("chooseProblem.title")}
          intro={t("chooseProblem.intro")}
        />
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CONDITIONS.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.key} delayMs={i * 60}>
              <Link
                to={assessmentLink(c.assessmentProblem)}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl glass glass-hover"
              >
                {/* Own clip layer: `overflow-hidden` + `rounded` on the card
                    alone doesn't reliably clip a transformed child (the hover
                    zoom) at the rounded corners in Chrome, so the photo leaks a
                    hairline past the radius. translateZ(0) bakes the rounded
                    clip into a composited layer. */}
                <div className="absolute inset-0 overflow-hidden rounded-[inherit] [transform:translateZ(0)]">
                  <ImageWithFallback
                    src={siteImage(IMG.problem[c.key])}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105 dark:brightness-90 dark:contrast-[1.03]"
                  />
                </div>
                {/* The text panel's own background is the fade: opaque white at
                    the bottom edge → fully transparent at the top, so the photo
                    reads through the whole text area, strongest behind the
                    title. */}
                <div className="relative flex flex-col bg-gradient-to-t from-white from-30% via-white/90 via-50% to-transparent px-5 pb-5 pt-28 dark:from-[var(--color-surface-raised)] dark:via-[color-mix(in_srgb,var(--color-surface-raised)_92%,transparent)]">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl glass-strong text-petrol-700 shadow-[0_10px_24px_-12px_rgba(13,68,75,0.4)]">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="text-lg leading-tight text-petrol-700">
                      {t(`chooseProblem.cards.${c.key}.title`)}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
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
    <Section
      tone="surface"
      id="how-it-works"
      className="scroll-mt-24"
      reveal={false}
    >
      <Reveal>
        <SectionHeading
          eyebrow={t("howItWorks.eyebrow")}
          title={t("howItWorks.title")}
          intro={t("howItWorks.intro")}
        />
      </Reveal>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_STEPS.map((step, i) => (
          <Reveal key={step} delayMs={i * 60}>
            <li className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl glass glass-hover">
              <div className="absolute inset-0 overflow-hidden rounded-[inherit] [transform:translateZ(0)]">
                <ImageWithFallback
                  src={siteImage(IMG.process[step])}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105 dark:brightness-90 dark:contrast-[1.03]"
                />
              </div>
              <div className="relative flex flex-col bg-gradient-to-t from-white from-30% via-white/90 via-50% to-transparent px-5 pb-5 pt-28 dark:from-[var(--color-surface-raised)] dark:via-[color-mix(in_srgb,var(--color-surface-raised)_92%,transparent)]">
                <div className="mb-2 flex items-center gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl font-display text-lg text-white shadow-[0_10px_24px_-10px_rgba(42,167,176,0.55)] [background-image:var(--cta-gradient)]">
                    {i + 1}
                  </span>
                  <h3 className="text-lg leading-tight text-petrol-700">
                    {t(`howItWorks.steps.${step}.title`)}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {t(`howItWorks.steps.${step}.description`)}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
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
    <Section tone="brand" reveal={false}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading
              eyebrow={t("solutionsPreview.eyebrow")}
              title={t("solutionsPreview.title")}
              intro={t("solutionsPreview.intro")}
              invert
            />
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {SOLUTION_CARDS.map((key, i) => {
              const Icon = CONDITIONS.find((c) => c.key === key)!.icon;
              return (
                <Reveal key={key} delayMs={i * 60}>
                  <Link
                    to={assessmentLink(key)}
                    className="flex h-full flex-col glass-strong glass-hover rounded-3xl p-6"
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

        </div>

        {/* A carousel of the recommended solution pairs — one per problem —
            in place of a single photo. The section CTA sits below it. The
            column stretches to the height of the cards on the left. */}
        <Reveal className="lg:h-full">
          <div className="mx-auto flex w-full max-w-sm flex-col lg:max-w-none lg:h-full">
            <ComboCarousel className="lg:min-h-0 lg:flex-1" />
            <Button
              asChild
              variant="cta"
              size="xl"
              className="mt-6 flex w-full"
            >
              <Link to={assessmentLink()}>{t("solutionsPreview.cta")}</Link>
            </Button>
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
  { key: "noObligation", icon: BadgeCheck },
];

export function TrustSection() {
  const { t } = useTranslation("home");

  return (
    <Section tone="surface" reveal={false}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
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
              className="image-fade-rb w-full drop-shadow-[0_40px_65px_-32px_rgba(13,68,75,0.4)]"
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST_ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} delayMs={i * 60}>
            <div className="flex h-full gap-3.5 glass rounded-3xl p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-petrol-600/10 text-petrol-700 dark:bg-petrol-400/15">
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
    // No bottom border — this frosted band runs straight into FaqSection
    // (also `raised`) so the two share one continuous surface.
    <Section tone="raised" className="border-b-0" reveal={false}>
      <Reveal>
        <SectionHeading
          eyebrow={t("comparison.eyebrow")}
          title={t("comparison.title")}
          intro={t("comparison.intro")}
        />
      </Reveal>
      <Reveal>
        <div className="mt-10 overflow-hidden rounded-3xl glass-strong">
          <div className="grid grid-cols-2 border-b border-white/50 text-sm font-semibold dark:border-white/10">
            <div className="p-4 text-ink-muted sm:p-5">
              {t("comparison.themLabel")}
            </div>
            <div className="bg-petrol-600/5 p-4 text-petrol-800 sm:p-5 dark:bg-petrol-400/10">
              {t("comparison.usLabel")}
            </div>
          </div>
          <dl className="divide-y divide-white/40 dark:divide-white/10">
            {COMPARISON_ROWS.map((row) => (
              <div key={row} className="grid grid-cols-2 text-sm">
                <dt className="flex items-start gap-2 p-4 text-ink-muted sm:p-5">
                  <Minus
                    className="mt-0.5 size-4 shrink-0 text-ink-muted/60"
                    aria-hidden
                  />
                  {t(`comparison.rows.${row}.them`)}
                </dt>
                <dd className="flex items-start gap-2 bg-petrol-600/5 p-4 text-ink sm:p-5 dark:bg-petrol-400/10">
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
    <section className="relative overflow-hidden rounded-2xl md:rounded-4xl mx-4 sm:mx-6 xl:mx-12 [background-image:var(--brand-band-gradient)] px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Text group is centred on mobile, left-aligned from `lg`. The CTA
            here is desktop-only — on mobile it renders full-width flush under
            the photo (below), so the image reads as standing on the button. */}
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <h2 className="max-w-2xl text-white">{t("finalCta.title")}</h2>
          <p className="max-w-xl text-white/80">{t("finalCta.subtitle")}</p>
          <Button
            asChild
            variant="cta"
            size="xl"
            className="hidden lg:inline-flex"
          >
            <Link to={assessmentLink()}>{t("finalCta.cta")}</Link>
          </Button>
        </div>

        {/* Mobile: photo above a full-width CTA, no gap (the image reads as
            standing on the button). From `lg` it's the original — the column
            stretches to the row's full height and the bottom-anchored photo
            bleeds off the section edge; the CTA here is hidden (it's in the
            text column on desktop). */}
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:-mb-24 lg:max-w-xl lg:flex-row lg:items-end lg:justify-center lg:self-stretch">
          <ImageWithFallback
            src={siteImage(IMG.homeDoctor)}
            alt=""
            width={1613}
            height={943}
            loading="lazy"
            decoding="async"
            className="image-fade-b relative z-[1] h-auto max-h-full w-auto max-w-full -scale-x-100 object-contain drop-shadow-[0_30px_50px_-20px_rgba(0,0,0,0.45)] lg:h-full"
          />
          <Button
            asChild
            variant="cta"
            size="xl"
            className="flex w-full lg:hidden"
          >
            <Link to={assessmentLink()}>{t("finalCta.cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ── 8. FAQ ─────────────────────────────────────────────────────────────── */

const FAQ_KEYS = [
  "how",
  "prescription",
  "time",
  "appointment",
  "privacy",
] as const;

export function FaqSection() {
  const { t } = useTranslation("home");

  return (
    // No top border — continues the ComparisonSection frosted band above it.
    <Section tone="raised" className="border-t-0" reveal={false}>
      <Reveal className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          intro={t("faq.intro")}
        />

        <Accordion type="single" collapsible className="mt-8">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>{t(`faq.items.${key}.q`)}</AccordionTrigger>
              <AccordionContent className="text-ink-muted">
                {t(`faq.items.${key}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-sm text-ink-muted">
          {t("faq.more")}{" "}
          <Link
            to={paths.faq}
            className="font-medium text-petrol-700 underline-offset-4 hover:underline"
          >
            {t("faq.moreLink")}
          </Link>
        </p>
      </Reveal>
    </Section>
  );
}
