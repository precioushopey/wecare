import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Info,
  LifeBuoy,
  LogOut,
  Package,
  RotateCcw,
  Sparkles,
  Truck,
} from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { AustriaMap } from "@/components/marketing/AustriaMap";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { COMMERCE_ENABLED, PRICES_CONFIRMED, SUPPORT_EMAIL } from "@/config";
import { IMG, siteImage } from "@/data/siteImages";
import { SOLUTION_BY_ID } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import {
  clearFollowUp,
  FOLLOW_UP_CHOICES,
  getFollowUp,
  setFollowUp,
  type FollowUpEntry,
} from "@/features/followup/followup";
import { getOrders, type OrderStatus } from "@/features/orders/orders";
import { getMedicalReview, type ReviewStatus } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatDate, formatPriceEur } from "@/lib/format";
import { resizeImageToDataUrl } from "@/lib/image";

import {
  Avatar,
  DashboardHero,
  DashboardJourney,
  EmptyState,
  HeroCta,
  HeroEyebrow,
  HeroStat,
  MedallionIcon,
  orderPillTone,
  reviewPillTone,
  RowLink,
  SectionCard,
  StatusPill,
} from "./ui";

/** The six assessment questions as short recap rows (label key → question id). */
const RECAP_ROWS = [
  { key: "problem", qid: "q1" },
  { key: "frequency", qid: "q2" },
  { key: "strength", qid: "q3" },
  { key: "tried", qid: "q4" },
  { key: "experience", qid: "q5" },
  { key: "formatPref", qid: "q6" },
] as const;

/**
 * Where the four-stage journey sits, from real records only:
 * assessment complete → review (active until `approved`) → prescription
 * (active once approved, no order) → delivery (active once an order exists,
 * done once it's delivered).
 */
function journeyState(
  reviewStatus: ReviewStatus | null,
  orderStatus: string | null,
): { current: number; complete: boolean } {
  let current = 1; // assessment done, review is the active stage
  if (reviewStatus === "approved") current = 2;
  if (orderStatus) current = 3;
  return { current, complete: orderStatus === "delivered" };
}

/** Delivery-tracker stage from the real `Order.status` — no fabricated van
 *  position / ETA (that needs a carrier-tracking integration). */
const DELIVERY_STAGE: Record<OrderStatus, number> = {
  inReview: 1,
  processing: 1,
  shipped: 2,
  delivered: 3,
};
const DELIVERY_STEP_KEYS = [
  "ordered",
  "preparing",
  "onTheWay",
  "delivered",
] as const;

/** Small uppercase section label used to group content within a page. */
function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </p>
  );
}

/* ── Overview ────────────────────────────────────────────────────────────── */

export function DashboardHomePage() {
  const { t } = useTranslation("dashboard");
  const { t: ta } = useTranslation("assessment");
  const { t: ts } = useTranslation("shop");
  const { t: th } = useTranslation("home");
  const { t: tc } = useTranslation();
  const { language } = useLanguage();
  const { result, answers } = useAssessment();
  const [followUp] = useState(() => getFollowUp());
  const latestOrder = getOrders()[0];
  const review = getMedicalReview();

  if (!result) {
    return (
      <EmptyState
        icon={ClipboardList}
        text={t("home.empty")}
        ctaLabel={t("home.emptyCta")}
        to={paths.assessment.start}
      />
    );
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];

  // The single most useful "what now?" — order in flight beats review status
  // beats "submit for review".
  let hero: { pill?: ReactNode; text: string; cta: string; to: string };
  if (latestOrder) {
    hero = {
      pill: (
        <StatusPill
          label={t(`orders.statuses.${latestOrder.status}`)}
          tone={orderPillTone(latestOrder.status)}
        />
      ),
      text: t("home.orderInFlight"),
      cta: t("home.viewOrders"),
      to: paths.dashboardOrders,
    };
  } else if (review) {
    hero = {
      pill: (
        <StatusPill
          label={ta(`review.statuses.${review.status}.label`)}
          tone={reviewPillTone(review.status)}
        />
      ),
      text: ta(`review.statuses.${review.status}.body`),
      cta:
        review.status === "approved"
          ? t("recommendation.view")
          : ta("result.viewReviewCta"),
      to:
        review.status === "approved"
          ? paths.shopProduct(result.primarySolutionId)
          : paths.assessment.review,
    };
  } else {
    // No review yet — the next step is to look at the recommended Solution
    // and continue to medical review from there (PO decision B1).
    hero = {
      text: t("home.nextReviewPending"),
      cta: t("recommendation.view"),
      to: paths.shopProduct(result.primarySolutionId),
    };
  }

  const journey = journeyState(
    review?.status ?? null,
    latestOrder?.status ?? null,
  );
  const journeySteps = [
    t("journey.steps.assessment"),
    t("journey.steps.review"),
    t("journey.steps.prescription"),
    t("journey.steps.delivery"),
  ];

  const priceLabel = ts("card.pricePerGram", {
    price: formatPriceEur(primary.priceEur, language),
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ── 1 · Your recommendation + next step — the hero ────────────────
          Most important thing on the page: the branded gradient, the top
          slot, full width. Merges the old "recommendation" and "next step"
          cards so the row no longer has a short card + gap. */}
      <DashboardHero>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* the recommended solution — 1/2 at lg, 1/3 from xl, 1/2 again at 2xl */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <HeroEyebrow>{t("home.recommendationHeading")}</HeroEyebrow>
              <Link
                to={paths.dashboardRecommendation}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {t("home.viewRecommendation")}
                <ChevronRight
                  className="size-3.5"
                  aria-hidden
                  strokeWidth={2}
                />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <SolutionMark
                solution={primary}
                variant="badge"
                className="size-14 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-display text-xl leading-tight text-white">
                  {primary.name}
                </p>
                <p className="text-sm font-medium text-sky-200">
                  {ts(`solutions.${primary.id}.category`)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/80">
              {ts(`solutions.${primary.id}.blurb`)}
            </p>

            <dl className="mt-5 flex flex-wrap gap-2.5 [&>*]:min-w-[10rem] [&>*]:flex-1">
              <HeroStat
                label={ts("solution.thcRangeLabel")}
                value={<span className="font-mono">{primary.thcRange}</span>}
              />
              <HeroStat
                label={t("home.recommendationPrice")}
                value={<span className="font-mono">{priceLabel}</span>}
              />
            </dl>
            {!PRICES_CONFIRMED ? (
              <p className="mt-2 text-xs text-white/55">
                {ts("pricesIndicative")}
              </p>
            ) : null}
          </div>

          {/* what to do next — 1/2 at lg, 2/3 from xl, 1/2 again at 2xl; inside
              it a 50/50 split from xl: left = text + CTA, right = the image
              (owner request, Sept 2026) */}
          <div className="flex min-w-0 rounded-2xl border border-white/15 bg-white/10 p-5 lg:flex-1 xl:flex-[2] 2xl:flex-1">
            <div className="flex flex-1 flex-col gap-4 2xl:flex-row 2xl:items-center">
              <div className="flex min-w-0 flex-col 2xl:w-1/2">
                <HeroEyebrow>{t("home.nextStep")}</HeroEyebrow>
                {hero.pill ? <div className="mt-3">{hero.pill}</div> : null}
                <p className="mt-2 text-sm text-white/90">{hero.text}</p>
                {/* CTA — on desktop it lives in this text column; on mobile it
                    moves below the image (see the image column) */}
                <HeroCta to={hero.to} className="mt-4 hidden 2xl:inline-flex">
                  {hero.cta}
                </HeroCta>
              </div>
              {/* photo half — feathered on the left / bottom / right edges (top
                  stays crisp), stuck to the panel's bottom-right corner on
                  desktop; on mobile the CTA sits flush beneath it. */}
              <div className="flex flex-col 2xl:w-1/2 2xl:self-end">
                <ImageWithFallback
                  src={siteImage(IMG.medicalReview) ?? ""}
                  alt=""
                  loading="lazy"
                  className="image-fade-lrb block max-h-44 w-full object-contain object-bottom 2xl:-mb-5 2xl:max-h-52"
                />
                <HeroCta to={hero.to} className="w-full 2xl:hidden">
                  {hero.cta}
                </HeroCta>
              </div>
            </div>
          </div>
        </div>
      </DashboardHero>

      {/* Journey stepper — below `2xl` it's a full-width band directly under
          the hero (out of the grid); from `2xl` up it moves into the grid's
          left column, above the recap (owner request, Sept 2026). */}
      <div className="2xl:hidden">
        <DashboardJourney
          steps={journeySteps}
          current={journey.current}
          complete={journey.complete}
        />
      </div>

      {/* ── 2 · Your answers + safety (left) · delivery (right) ───────── */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="hidden 2xl:block">
            <DashboardJourney
              steps={journeySteps}
              current={journey.current}
              complete={journey.complete}
            />
          </div>
          <SectionCard
            title={t("home.assessmentSnapshot")}
            action={{
              label: t("assessment.retake"),
              to: paths.assessment.start,
            }}
          >
            <dl className="grid gap-2 sm:grid-cols-2">
              {RECAP_ROWS.map(({ key, qid }) =>
                answers[qid] ? (
                  <div
                    key={qid}
                    className="rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5"
                  >
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      {t(`assessment.${key}`)}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">
                      {ta(`questions.${qid}.options.${answers[qid]}`)}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </SectionCard>

          <SectionCard title={t("home.goodToKnowHeading")}>
            <div className="flex gap-3">
              <MedallionIcon icon={Info} />
              <p className="text-sm text-ink-muted">
                {tc("medicalNotice.body")}
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard title={th("deliveryBanner.eyebrow")}>
          <div className="flex gap-3">
            <MedallionIcon icon={Truck} tone="sage" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                {th("deliveryBanner.headline")}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {th("deliveryBanner.body")}
              </p>
            </div>
          </div>

          {/* Live tracker if an order is on its way — the real `Order.status`,
              not a fabricated van position. */}
          {latestOrder ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface-raised/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {t("delivery.track.heading")}
                </p>
                <StatusPill
                  label={t(`orders.statuses.${latestOrder.status}`)}
                  tone={orderPillTone(latestOrder.status)}
                />
              </div>
              <DashboardJourney
                bare
                className="mt-3"
                steps={DELIVERY_STEP_KEYS.map((k) =>
                  t(`delivery.track.steps.${k}`),
                )}
                current={DELIVERY_STAGE[latestOrder.status]}
                complete={latestOrder.status === "delivered"}
              />
              <p className="mt-3 text-xs text-ink-muted">
                {t("delivery.track.noVan")}
              </p>
            </div>
          ) : null}

          {/* Before an order exists: the coverage map. Once it does: where the
              parcel is going (the map is moot then, and WeCare has no
              fulfilment origin to draw a route from yet). */}
          {!latestOrder ? (
            <>
              <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {t("delivery.coverage")}
              </p>
              <div className="relative mt-2 overflow-hidden rounded-2xl bg-petrol-900/90 p-3">
                {/* Dot-grid across the whole panel, not just clipped inside the
                    map's landmass (owner request, Sept 2026) — same treatment as
                    the homepage DeliveryBannerSection so map + panel read as one
                    atlas surface. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1.6px)] [background-size:22px_22px]"
                />
                <div className="relative">
                  <AustriaMap />
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {th("deliveryBanner.coverageNote")}
              </p>
            </>
          ) : latestOrder.shipTo ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface-raised/60 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {t("delivery.shipTo")}
              </p>
              <address className="mt-1.5 text-sm not-italic leading-relaxed text-ink">
                {latestOrder.shipTo.firstName} {latestOrder.shipTo.lastName}
                <br />
                {latestOrder.shipTo.street}
                <br />
                {latestOrder.shipTo.postalCode} {latestOrder.shipTo.city}
                <br />
                {latestOrder.shipTo.country}
              </address>
            </div>
          ) : null}
        </SectionCard>
      </div>

      {/* ── 4 · Staying in touch — two equal-height cards ─────────────── */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <SectionCard
          title={t("nav.followUp")}
          action={{
            label: t("home.followUpCta"),
            to: paths.dashboardFollowUp,
          }}
        >
          <div className="flex gap-3">
            <MedallionIcon icon={CalendarCheck} tone="sage" />
            <p className="text-sm text-ink-muted">
              {followUp ? t("home.followUpDone") : t("home.followUpReminder")}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title={t("home.supportHeading")}
          action={{ label: t("home.supportCta"), to: paths.dashboardSupport }}
        >
          <div className="flex gap-3">
            <MedallionIcon icon={LifeBuoy} tone="sage" />
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">{t("support.body")}</p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {tc("pages.contact.hoursValue")}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ── My assessment ──────────────────────────────────────────────────────── */

export function DashboardAssessmentPage() {
  const { t } = useTranslation("dashboard");
  const { t: ta } = useTranslation("assessment");
  const { language } = useLanguage();
  const { answers, completedAt, result } = useAssessment();
  const review = getMedicalReview();
  const latestOrder = getOrders()[0];

  if (!completedAt || !result) {
    return (
      <EmptyState
        icon={ClipboardList}
        text={t("assessment.empty")}
        ctaLabel={t("assessment.emptyCta")}
        to={paths.assessment.start}
      />
    );
  }

  const journey = journeyState(
    review?.status ?? null,
    latestOrder?.status ?? null,
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero — your assessment is in, and where its review stands. Content on
          the left, a feathered photo on the right (owner request, Sept 2026). */}
      <DashboardHero>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
            {/* Eyebrow + review status on one wrapping row. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <HeroEyebrow>{t("nav.assessment")}</HeroEyebrow>
              {review ? (
                <StatusPill
                  label={ta(`review.statuses.${review.status}.label`)}
                  tone={reviewPillTone(review.status)}
                />
              ) : null}
            </div>
            <p className="max-w-md text-sm text-white/85">
              {review
                ? ta(`review.statuses.${review.status}.body`)
                : t("assessment.completedNote")}
            </p>
            {/* Highlights from the real answers; the full 6-row recap is the
                SectionCard below (owner request, Sept 2026 — fill the hero). */}
            <dl className="mt-1 grid w-full max-w-lg gap-2.5 sm:grid-cols-3">
              <HeroStat
                label={t("assessment.completedLabel")}
                value={formatDate(completedAt, language)}
              />
              {(["q1", "q2"] as const).map((qid) =>
                answers[qid] ? (
                  <HeroStat
                    key={qid}
                    label={t(
                      `assessment.${qid === "q1" ? "problem" : "frequency"}`,
                    )}
                    value={ta(`questions.${qid}.options.${answers[qid]}`)}
                  />
                ) : null,
              )}
            </dl>
            {/* Retake — on `sm+` it lives here; on mobile it drops below the
                image, flush (see the image column). */}
            <HeroCta
              to={paths.assessment.start}
              className="mt-2 hidden sm:inline-flex"
            >
              {t("assessment.retake")}
            </HeroCta>
          </div>
          <div className="relative flex w-full flex-col sm:w-1/2 sm:self-end lg:w-[22rem]">
            <ImageWithFallback
              src={siteImage(IMG.homeHero) ?? ""}
              alt=""
              loading="lazy"
              className="image-fade-lrb block max-h-48 w-full object-contain object-bottom sm:max-h-56"
            />
            <HeroCta to={paths.assessment.start} className="w-full sm:hidden">
              {t("assessment.retake")}
            </HeroCta>
          </div>
        </div>
      </DashboardHero>

      <DashboardJourney
        steps={[
          t("journey.steps.assessment"),
          t("journey.steps.review"),
          t("journey.steps.prescription"),
          t("journey.steps.delivery"),
        ]}
        current={journey.current}
        complete={journey.complete}
      />

      {/* All six answers — the full context handed to the reviewing doctor. */}
      <SectionCard title={t("home.assessmentSnapshot")}>
        <dl className="grid gap-2 sm:grid-cols-2">
          {RECAP_ROWS.map(({ key, qid }) =>
            answers[qid] ? (
              <div
                key={qid}
                className="rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5"
              >
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {t(`assessment.${key}`)}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {ta(`questions.${qid}.options.${answers[qid]}`)}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </SectionCard>
    </div>
  );
}

/* ── My recommendation ──────────────────────────────────────────────────── */

export function DashboardRecommendationPage() {
  const { t } = useTranslation("dashboard");
  const { t: ts } = useTranslation("shop");
  const { t: ta } = useTranslation("assessment");
  const { language } = useLanguage();
  const { result } = useAssessment();
  const review = getMedicalReview();
  const latestOrder = getOrders()[0];

  if (!result) {
    return (
      <EmptyState
        icon={Sparkles}
        text={t("recommendation.empty")}
        ctaLabel={t("recommendation.emptyCta")}
        to={paths.assessment.start}
      />
    );
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];
  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];
  const journey = journeyState(
    review?.status ?? null,
    latestOrder?.status ?? null,
  );

  const secondaryPriceLabel = ts("card.pricePerGram", {
    price: formatPriceEur(secondary.priceEur, language),
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero — the recommended Solution + where its medical review stands. */}
      <DashboardHero>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* the recommended solution — 1/2 at lg, 1/3 from xl, 1/2 again at 2xl */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <HeroEyebrow>{t("recommendation.primary")}</HeroEyebrow>
              <Link
                to={paths.shopProduct(result.primarySolutionId)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {t("home.viewRecommendation")}
                <ChevronRight
                  className="size-3.5"
                  aria-hidden
                  strokeWidth={2}
                />
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <SolutionMark
                solution={primary}
                variant="badge"
                className="size-14 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-display text-xl leading-tight text-white">
                  {primary.name}
                </p>
                <p className="text-sm font-medium text-sky-200">
                  {ts(`solutions.${primary.id}.category`)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/80">
              {ts(`solutions.${primary.id}.blurb`)}
            </p>
            <dl className="mt-5 flex flex-wrap gap-2.5 [&>*]:min-w-[10rem] [&>*]:flex-1">
              <HeroStat
                label={ts("solution.thcRangeLabel")}
                value={<span className="font-mono">{primary.thcRange}</span>}
              />
              <HeroStat
                label={t("home.recommendationPrice")}
                value={
                  <span className="font-mono">
                    {ts("card.pricePerGram", {
                      price: formatPriceEur(primary.priceEur, language),
                    })}
                  </span>
                }
              />
            </dl>
            {!PRICES_CONFIRMED ? (
              <p className="mt-2 text-xs text-white/55">
                {ts("pricesIndicative")}
              </p>
            ) : null}
          </div>

          {/* medical review + next action — half the row; 50/50 inside:
              status + CTA | image (matches the Overview hero, owner request) */}
          <div className="flex min-w-0 rounded-2xl border border-white/15 bg-white/10 p-5 lg:flex-1 xl:flex-[2] 2xl:flex-1">
            <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:items-center">
              <div className="flex min-w-0 flex-col xl:w-1/2">
                <HeroEyebrow>{t("recommendation.reviewLabel")}</HeroEyebrow>
                {review ? (
                  <div className="mt-3">
                    <StatusPill
                      label={ta(`review.statuses.${review.status}.label`)}
                      tone={reviewPillTone(review.status)}
                    />
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-white/90">
                  {review
                    ? ta(`review.statuses.${review.status}.body`)
                    : t("recommendation.notSubmitted")}
                </p>
                {/* CTA — desktop position; on mobile it moves below the image */}
                <HeroCta
                  to={
                    review ? paths.assessment.review : paths.assessment.result
                  }
                  className="mt-4 hidden xl:inline-flex"
                >
                  {review
                    ? ta("result.viewReviewCta")
                    : ta("result.submitReviewCta")}
                </HeroCta>
              </div>
              <div className="flex flex-col xl:w-1/2 xl:self-end">
                <ImageWithFallback
                  src={siteImage(IMG.medicalReview) ?? ""}
                  alt=""
                  loading="lazy"
                  className="image-fade-lrb block max-h-44 w-full object-contain object-bottom xl:-mb-5 xl:max-h-52"
                />
                <HeroCta
                  to={
                    review ? paths.assessment.review : paths.assessment.result
                  }
                  className="w-full xl:hidden"
                >
                  {review
                    ? ta("result.viewReviewCta")
                    : ta("result.submitReviewCta")}
                </HeroCta>
              </div>
            </div>
          </div>
        </div>
      </DashboardHero>

      <DashboardJourney
        steps={[
          t("journey.steps.assessment"),
          t("journey.steps.review"),
          t("journey.steps.prescription"),
          t("journey.steps.delivery"),
        ]}
        current={journey.current}
        complete={journey.complete}
      />

      {/* What the primary suits / how it's used — real per-Solution copy. */}
      <SectionCard title={ts("solution.detailsHeading")}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {ts("solution.suitabilityHeading")}
            </dt>
            <dd className="mt-1 text-sm text-ink-muted">
              {ts(`solutions.${primary.id}.suitability`)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {ts("solution.usageHeading")}
            </dt>
            <dd className="mt-1 text-sm text-ink-muted">
              {ts(`solutions.${primary.id}.usage`)}
            </dd>
          </div>
        </dl>
        {!PRICES_CONFIRMED ? (
          <p className="mt-3 text-xs text-ink-muted">
            {ts("pricesIndicative")}
          </p>
        ) : null}
      </SectionCard>

      {/* Alternative — demoted below the primary, a single quiet row. */}
      <SectionCard title={t("recommendation.secondary")}>
        <Link
          to={paths.shopProduct(secondary.id)}
          className="-m-2 flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-white/40"
        >
          <SolutionMark
            solution={secondary}
            className="size-12 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base text-ink">{secondary.name}</p>
            <p className="text-sm font-medium text-petrol-600">
              {ts(`solutions.${secondary.id}.category`)}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {ts(`solutions.${secondary.id}.blurb`)}
            </p>
            <p className="mt-1.5 font-mono text-xs text-ink-muted">
              {ts("solution.thcRangeLabel")}: {secondary.thcRange} ·{" "}
              {secondaryPriceLabel}
            </p>
          </div>
          <ChevronRight
            className="mt-1 size-5 shrink-0 text-ink-muted"
            aria-hidden
          />
        </Link>
      </SectionCard>
    </div>
  );
}

/* ── My orders ──────────────────────────────────────────────────────────── */

export function DashboardOrdersPage() {
  const { t } = useTranslation("dashboard");
  const { t: th } = useTranslation("home");
  const { t: ts } = useTranslation("shop");
  const { language } = useLanguage();
  const { items: cartItems, subtotalEur } = useCart();
  const orders = getOrders();

  if (orders.length === 0) {
    // A cart isn't an order yet — it becomes one only once checkout is
    // completed and the required confirmations are ticked. If the user has a
    // pending cart, surface it here (linking straight to checkout) instead of
    // a flat "no orders" message.
    if (cartItems.length > 0) {
      return (
        <DashboardHero>
          <HeroEyebrow>{t("orders.pending.heading")}</HeroEyebrow>
          <p className="mt-2 max-w-md text-sm text-white/85">
            {t("orders.pending.note")}
          </p>

          <ul className="mt-5 divide-y divide-white/15 border-y border-white/15">
            {cartItems.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="text-white">
                  {SOLUTION_BY_ID[item.productId].name} ·{" "}
                  {t("orders.grams", { count: item.quantity })}
                </span>
                {COMMERCE_ENABLED ? (
                  <span className="font-mono text-white">
                    {formatPriceEur(
                      SOLUTION_BY_ID[item.productId].priceEur * item.quantity,
                      language,
                    )}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          {COMMERCE_ENABLED ? (
            <>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-medium text-white">
                  {t("orders.pending.total")}
                </span>
                <span className="font-mono font-medium text-white">
                  {formatPriceEur(subtotalEur, language)}
                </span>
              </div>
              <HeroCta to={paths.checkout} className="mt-5 w-full sm:w-auto">
                {t("orders.pending.cta")}
              </HeroCta>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm text-white/85">
                {ts("cart.finalPriceNote")}
              </p>
              <HeroCta
                to={paths.dashboardRecommendation}
                className="mt-5 w-full sm:w-auto"
              >
                {ts("checkoutUnavailable.cta")}
              </HeroCta>
            </>
          )}
        </DashboardHero>
      );
    }

    return (
      <EmptyState
        icon={Package}
        text={t("orders.empty")}
        ctaLabel={t("orders.emptyCta")}
        to={paths.dashboardRecommendation}
      />
    );
  }

  const latestOrder = orders[0];
  const lineSummary = (order: (typeof orders)[number]) =>
    order.lines
      .map(
        (l) =>
          `${SOLUTION_BY_ID[l.productId].name} · ${t("orders.grams", {
            count: l.quantity,
          })}`,
      )
      .join(", ");

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero — the order you're most likely checking on: the latest one. */}
      <DashboardHero>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <HeroEyebrow>{t("orders.latestHeading")}</HeroEyebrow>
            <p className="mt-2 font-mono text-lg text-white">
              {latestOrder.id}
            </p>
            <p className="text-sm text-white/70">
              {t("orders.placedOn", {
                date: formatDate(latestOrder.placedAt, language),
              })}
            </p>
            {latestOrder.paymentMethod ? (
              <p className="text-sm text-white/70">
                {t("orders.paymentLabel")}:{" "}
                {ts(`checkout.paymentMethods.${latestOrder.paymentMethod}`)}
              </p>
            ) : null}
          </div>
          <StatusPill
            label={t(`orders.statuses.${latestOrder.status}`)}
            tone={orderPillTone(latestOrder.status)}
          />
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-white/80">
          <Truck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {th("deliveryBanner.body")}
        </p>
        {latestOrder.shipTo ? (
          <div className="mt-4 max-w-xs rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white/60">
              {t("delivery.shipTo")}
            </p>
            <address className="mt-1 text-sm not-italic leading-relaxed text-white">
              {latestOrder.shipTo.firstName} {latestOrder.shipTo.lastName}
              <br />
              {latestOrder.shipTo.street}
              <br />
              {latestOrder.shipTo.postalCode} {latestOrder.shipTo.city}
              <br />
              {latestOrder.shipTo.country}
            </address>
          </div>
        ) : null}
      </DashboardHero>

      {/* Desktop — a records table (best-practice for a list you reference). */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[42rem] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-2 font-medium">{t("orders.col.id")}</th>
              <th className="px-4 py-2 font-medium">{t("orders.col.date")}</th>
              <th className="px-4 py-2 font-medium">{t("orders.col.items")}</th>
              <th className="px-4 py-2 text-right font-medium">
                {t("orders.col.total")}
              </th>
              <th className="px-4 py-2 font-medium">
                {t("orders.col.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="glass">
                <td className="rounded-l-2xl px-4 py-3 font-mono text-ink">
                  {order.id}
                  {order.shipTo ? (
                    <span className="mt-1 block font-sans text-xs font-normal text-ink-muted">
                      {order.shipTo.postalCode} {order.shipTo.city}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  {formatDate(order.placedAt, language)}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {lineSummary(order)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-ink">
                  {formatPriceEur(order.totalEur, language)}
                </td>
                <td className="rounded-r-2xl px-4 py-3">
                  <StatusPill
                    label={t(`orders.statuses.${order.status}`)}
                    tone={orderPillTone(order.status)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — the same records as cards. */}
      <ul className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <li key={order.id} className="glass rounded-2xl md:rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-ink">
                  {t("orders.orderLabel", { id: order.id })}
                </p>
                <p className="text-xs text-ink-muted">
                  {t("orders.placedOn", {
                    date: formatDate(order.placedAt, language),
                  })}
                </p>
              </div>
              <StatusPill
                label={t(`orders.statuses.${order.status}`)}
                tone={orderPillTone(order.status)}
              />
            </div>
            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              {order.lines.map((l) => {
                const s = SOLUTION_BY_ID[l.productId];
                return (
                  <li key={l.productId}>
                    {s.name} · {t("orders.grams", { count: l.quantity })}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 font-mono text-sm text-ink">
              {formatPriceEur(order.totalEur, language)}
            </p>
            {order.shipTo ? (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {t("delivery.shipTo")}
                </p>
                <address className="mt-1 text-sm not-italic leading-relaxed text-ink">
                  {order.shipTo.firstName} {order.shipTo.lastName}
                  <br />
                  {order.shipTo.street}
                  <br />
                  {order.shipTo.postalCode} {order.shipTo.city}
                  <br />
                  {order.shipTo.country}
                </address>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Follow-up ──────────────────────────────────────────────────────────── */

const FOLLOW_UP_ACTION_ICON = {
  reorder: RotateCcw,
  trySecondary: Sparkles,
  retake: ClipboardList,
  contact: LifeBuoy,
} as const;

export function DashboardFollowUpPage() {
  const { t } = useTranslation("dashboard");
  const { result } = useAssessment();
  const [entry, setEntry] = useState<FollowUpEntry | null>(() => getFollowUp());

  if (!result) {
    return (
      <EmptyState
        icon={CalendarCheck}
        text={t("followUp.empty")}
        ctaLabel={t("followUp.emptyCta")}
        to={paths.assessment.start}
      />
    );
  }

  if (!entry) {
    return (
      <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-8">
        <p className="font-display text-xl text-ink">{t("followUp.prompt")}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {t("followUp.promptHint")}
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {FOLLOW_UP_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => {
                setEntry(setFollowUp(choice));
                track(AnalyticsEvent.followupSubmitted, { answer: choice });
              }}
              className="rounded-2xl border-2 border-border bg-surface-raised p-4 text-left text-ink transition-colors hover:border-petrol-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
            >
              {t(`followUp.options.${choice}`)}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          {t("followUp.windowNote")}
        </p>
      </div>
    );
  }

  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];
  // Where "Update My Recommendation" sends the user. "I need more guidance" /
  // "I would like a different option" go to the recommendation overview to
  // review options with support — NOT straight to a stronger/lighter product
  // (PO decision B4: the follow-up must not nudge self-adjusting strength).
  const updateTarget =
    entry.choice === "format" || entry.choice === "support"
      ? paths.dashboardSupport
      : paths.dashboardRecommendation;

  const actions = [
    { key: "reorder", to: paths.shopProduct(result.primarySolutionId) },
    { key: "trySecondary", to: paths.shopProduct(secondary.id) },
    { key: "retake", to: paths.assessment.start },
    { key: "contact", to: paths.dashboardSupport },
  ] as const;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero — what you told us at check-in, and what to do about it. */}
      <DashboardHero>
        <HeroEyebrow>{t("followUp.yourAnswer")}</HeroEyebrow>
        <p className="mt-1.5 font-display text-lg text-white">
          {t(`followUp.options.${entry.choice}`)}
        </p>
        <p className="mt-3 text-sm text-white/85">
          {t(`followUp.responses.${entry.choice}`)}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <HeroCta to={updateTarget}>{t("followUp.updateCta")}</HeroCta>
          <button
            type="button"
            onClick={() => {
              clearFollowUp();
              setEntry(null);
            }}
            className="text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {t("followUp.change")}
          </button>
        </div>
      </DashboardHero>

      <SectionCard title={t("followUp.actionsHeading")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((a) => (
            <RowLink
              key={a.key}
              icon={FOLLOW_UP_ACTION_ICON[a.key]}
              title={t(`followUp.actions.${a.key}`)}
              to={a.to}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ── Support ────────────────────────────────────────────────────────────── */

export function DashboardSupportPage() {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation();
  return (
    <DashboardHero>
      <div className="flex items-start gap-4">
        <MedallionIcon icon={LifeBuoy} className="size-14" />
        <p className="max-w-md text-sm text-white/85">{t("support.body")}</p>
      </div>
      <dl className="mt-5 grid gap-3 sm:max-w-lg sm:grid-cols-2">
        <HeroStat
          label={tc("pages.contact.emailHeading")}
          value={<span className="break-all">{SUPPORT_EMAIL}</span>}
        />
        <HeroStat
          label={tc("pages.contact.hoursHeading")}
          value={tc("pages.contact.hoursValue")}
        />
      </dl>
      <HeroCta to={paths.contact} className="mt-5 w-full sm:w-auto">
        {t("support.contactCta")}
      </HeroCta>
    </DashboardHero>
  );
}

/* ── Profile ────────────────────────────────────────────────────────────── */

export function DashboardProfilePage() {
  const { t } = useTranslation("dashboard");
  const { user, signOut, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState(false);

  function startEdit() {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setSavedAt(null);
    setEditing(true);
  }

  async function onPickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(false);
    try {
      updateProfile({ avatarUrl: await resizeImageToDataUrl(file) });
    } catch {
      setPhotoError(true);
    }
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    updateProfile({ name: name.trim() || user?.name, phone });
    setEditing(false);
    setSavedAt(Date.now());
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero — who you are. */}
      <DashboardHero>
        <div className="flex items-center gap-4">
          <Avatar
            name={user?.name ?? ""}
            src={user?.avatarUrl}
            className="size-14 text-base ring-2 ring-white/25"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-xl text-white">
              {user?.name}
            </p>
            <p className="truncate text-sm text-white/70">{user?.email}</p>
          </div>
        </div>
      </DashboardHero>

      {/* Details + Language on the left, the "More" list on the right
          (owner request, Sept 2026) — this reinstates a 2-column Profile
          layout that was briefly single-column. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Details */}
          <div className="glass rounded-2xl md:rounded-3xl p-5">
            <GroupLabel>{t("profile.detailsLabel")}</GroupLabel>

            {/* Profile photo — resized + stored client-side (mock auth). */}
            <div className="mb-5 flex items-center gap-4">
              <Avatar
                name={user?.name ?? ""}
                src={user?.avatarUrl}
                className="size-16 text-lg"
              />
              <div className="min-w-0">
                <input
                  ref={photoInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickPhoto}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInput.current?.click()}
                  >
                    {t("profile.changePhoto")}
                  </Button>
                  {user?.avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => updateProfile({ avatarUrl: "" })}
                      className="text-sm text-ink-muted underline-offset-4 hover:underline"
                    >
                      {t("profile.removePhoto")}
                    </button>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {photoError
                    ? t("profile.photoError")
                    : t("profile.photoHint")}
                </p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">{t("profile.name")}</Label>
                  <Input
                    id="profile-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">{t("profile.phone")}</Label>
                  <Input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={t("profile.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {t("profile.email")}
                  </p>
                  <p className="mt-1 text-ink">{user?.email}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t("profile.emailNote")}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    variant="cta"
                    className="w-full sm:w-auto"
                  >
                    {t("profile.save")}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-sm text-ink-muted underline-offset-4 hover:underline"
                  >
                    {t("profile.cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {t("profile.name")}
                  </p>
                  <p className="mt-1 text-ink">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {t("profile.phone")}
                  </p>
                  <p className="mt-1 text-ink">
                    {user?.phone || t("profile.phoneNone")}
                  </p>
                </div>
                {savedAt ? (
                  <p className="text-sm text-sage-700">{t("profile.saved")}</p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  className="w-full sm:w-auto"
                >
                  {t("profile.edit")}
                </Button>
              </div>
            )}
          </div>

          {/* Language (was an "Appearance" group with a theme toggle too, before
          dark mode was removed — Sept 2026). */}
          <div className="glass flex items-center justify-between gap-4 rounded-2xl md:rounded-3xl p-5">
            <span className="text-sm font-medium text-ink">
              {t("profile.language")}
            </span>
            <LanguageToggle />
          </div>
        </div>

        {/* More */}
        <div className="space-y-3">
          <GroupLabel>{t("profile.more")}</GroupLabel>
          <RowLink
            icon={CalendarCheck}
            tone="sage"
            title={t("nav.followUp")}
            to={paths.dashboardFollowUp}
          />
          <RowLink
            icon={LifeBuoy}
            tone="sage"
            title={t("nav.support")}
            to={paths.dashboardSupport}
          />
          <RowLink
            icon={ArrowUpRight}
            title={t("profile.exploreSite")}
            to={paths.home}
          />
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full text-danger-700"
          >
            <LogOut className="size-4" aria-hidden />
            {t("profile.signOut")}
          </Button>
        </div>
      </div>
    </div>
  );
}
