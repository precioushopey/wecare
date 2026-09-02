import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
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
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { AustriaMap } from "@/components/marketing/AustriaMap";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { PRICES_CONFIRMED, SUPPORT_EMAIL } from "@/config";
import { SOLUTION_BY_ID } from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { pairCounterpart } from "@/features/assessment/recommendation";
import { useAuth } from "@/features/auth/AuthContext";
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

import {
  Avatar,
  DashboardJourney,
  EmptyState,
  MedallionIcon,
  orderPillTone,
  reviewPillTone,
  RowLink,
  SectionCard,
  StatTile,
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
    hero = {
      text: t("home.nextReviewPending"),
      cta: ta("result.submitReviewCta"),
      to: paths.assessment.result,
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
      {/* The four-stage journey — the anchor of the page. */}
      <DashboardJourney
        steps={journeySteps}
        current={journey.current}
        complete={journey.complete}
      />

      {/* Recommendation (wide) beside the "what now?" card. */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <SectionCard
          title={t("home.recommendationHeading")}
          action={{
            label: t("home.viewRecommendation"),
            to: paths.dashboardRecommendation,
          }}
          className="lg:col-span-2"
        >
          <div className="flex gap-4">
            <SolutionMark
              solution={primary}
              className="size-16 shrink-0 rounded-2xl"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg text-ink">{primary.name}</p>
              <p className="text-sm font-medium text-petrol-600">
                {ts(`solutions.${primary.id}.category`)}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {ts(`solutions.${primary.id}.blurb`)}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <StatTile
              label={ts("solution.thcRangeLabel")}
              value={<span className="font-mono">{primary.thcRange}</span>}
            />
            <StatTile
              label={t("home.recommendationPrice")}
              value={<span className="font-mono">{priceLabel}</span>}
            />
          </dl>
          {!PRICES_CONFIRMED ? (
            <p className="mt-2 text-xs text-ink-muted">
              {ts("pricesIndicative")}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard title={t("home.nextStep")}>
          <div className="flex flex-1 flex-col">
            <MedallionIcon icon={ShieldCheck} />
            {hero.pill ? <div className="mt-3">{hero.pill}</div> : null}
            <p className="mt-2 flex-1 text-sm text-ink">{hero.text}</p>
            <Button asChild variant="cta" className="mt-4 w-full">
              <Link to={hero.to}>
                {hero.cta}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Full assessment recap beside the delivery card. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <SectionCard
          title={t("home.assessmentSnapshot")}
          action={{ label: t("assessment.retake"), to: paths.assessment.start }}
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

          {/* Coverage map — the seven cities WeCare delivers to. */}
          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {t("delivery.coverage")}
          </p>
          <div className="mt-2 overflow-hidden rounded-2xl bg-petrol-900/90 p-3">
            <AustriaMap />
          </div>
        </SectionCard>
      </div>

      {/* Follow-up · support · good-to-know. */}
      <div className="grid gap-4 lg:grid-cols-3 lg:items-start lg:gap-6">
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

        <SectionCard title={t("home.goodToKnowHeading")}>
          <div className="flex gap-3">
            <MedallionIcon icon={Info} />
            <p className="text-sm text-ink-muted">{tc("medicalNotice.body")}</p>
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
    <div className="space-y-4 lg:max-w-3xl lg:space-y-6">
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

      <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            {t("assessment.completedNote")}
          </p>
          {review ? (
            <StatusPill
              label={ta(`review.statuses.${review.status}.label`)}
              tone={reviewPillTone(review.status)}
            />
          ) : null}
        </div>
        {/* All six answers — the full context handed to the reviewing doctor. */}
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
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
        <Button asChild variant="outline" className="mt-5 w-full sm:w-auto">
          <Link to={paths.assessment.start}>
            <RotateCcw className="size-4" aria-hidden />
            {t("assessment.retake")}
          </Link>
        </Button>
      </div>
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

  return (
    <div className="space-y-4 lg:max-w-3xl lg:space-y-6">
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

      <div className="glass rounded-2xl md:rounded-3xl p-5">
        <div className="flex items-center gap-3.5">
          <MedallionIcon icon={ShieldCheck} />
          <p className="min-w-0 flex-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("recommendation.reviewLabel")}
          </p>
          {review ? (
            <StatusPill
              label={ta(`review.statuses.${review.status}.label`)}
              tone={reviewPillTone(review.status)}
            />
          ) : null}
        </div>
        <p className="mt-2.5 text-sm text-ink-muted">
          {review
            ? ta(`review.statuses.${review.status}.body`)
            : t("recommendation.notSubmitted")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: t("recommendation.primary"), s: primary },
          { label: t("recommendation.secondary"), s: secondary },
        ].map(({ label, s }) => (
          <Link
            key={s.id}
            to={paths.shopProduct(s.id)}
            className="glass glass-hover flex flex-col gap-3 rounded-2xl md:rounded-3xl p-5"
          >
            <div className="flex gap-4">
              <SolutionMark
                solution={s}
                className="size-14 shrink-0 rounded-2xl"
              />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-petrol-600">
                  {label}
                </p>
                <p className="mt-1 font-display text-lg text-ink">{s.name}</p>
                {/* Category, not a bare THC number — the beginner-safe framing
                    the result page settled on (audit WC-10). */}
                <p className="mt-0.5 text-sm text-ink-muted">
                  {ts(`solutions.${s.id}.category`)}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-muted">
              {ts(`solutions.${s.id}.blurb`)}
            </p>
            <dl className="mt-auto grid grid-cols-2 gap-2">
              <StatTile
                label={ts("solution.thcRangeLabel")}
                value={<span className="font-mono">{s.thcRange}</span>}
              />
              <StatTile
                label={t("home.recommendationPrice")}
                value={
                  <span className="font-mono">
                    {ts("card.pricePerGram", {
                      price: formatPriceEur(s.priceEur, language),
                    })}
                  </span>
                }
              />
            </dl>
          </Link>
        ))}
      </div>

      {/* What the primary suits / how it's used — real per-Solution copy. */}
      <div className="glass rounded-2xl md:rounded-3xl p-5">
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
          <p className="mt-3 text-xs text-ink-muted">{ts("pricesIndicative")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {review ? (
          <Button asChild variant="cta" className="w-full sm:w-auto">
            <Link to={paths.assessment.review}>
              {ta("result.viewReviewCta")}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="cta" className="w-full sm:w-auto">
            <Link to={paths.assessment.result}>
              {ta("result.submitReviewCta")}
            </Link>
          </Button>
        )}
        <Link
          to={paths.shopProduct(result.primarySolutionId)}
          className="text-sm text-petrol-700 underline-offset-4 hover:underline"
        >
          {t("recommendation.view")}
        </Link>
      </div>
    </div>
  );
}

/* ── My orders ──────────────────────────────────────────────────────────── */

export function DashboardOrdersPage() {
  const { t } = useTranslation("dashboard");
  const { t: th } = useTranslation("home");
  const { language } = useLanguage();
  const orders = getOrders();

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        text={t("orders.empty")}
        ctaLabel={t("orders.emptyCta")}
        to={paths.shop}
      />
    );
  }

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
    <>
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
              <th className="px-4 py-2 font-medium">{t("orders.col.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="glass">
                <td className="rounded-l-2xl px-4 py-3 font-mono text-ink">
                  {order.id}
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
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
        <Truck className="mt-0.5 size-4 shrink-0" aria-hidden />
        {th("deliveryBanner.body")}
      </p>
    </>
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
      <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-8 lg:max-w-2xl">
        <p className="font-display text-xl text-ink">{t("followUp.prompt")}</p>
        <p className="mt-2 text-sm text-ink-muted">{t("followUp.promptHint")}</p>
        <div className="mt-5 grid gap-2.5">
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
        <p className="mt-4 text-xs text-ink-muted">{t("followUp.windowNote")}</p>
      </div>
    );
  }

  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];
  // Which solution "Update My Recommendation" moves the user toward.
  const updateTarget =
    entry.choice === "stronger"
      ? paths.shopProduct(pairCounterpart(result.problem, "stronger"))
      : entry.choice === "lighter"
        ? paths.shopProduct(pairCounterpart(result.problem, "lighter"))
        : entry.choice === "format" || entry.choice === "support"
          ? paths.dashboardSupport
          : paths.dashboardRecommendation;

  const actions = [
    { key: "reorder", to: paths.shopProduct(result.primarySolutionId) },
    { key: "trySecondary", to: paths.shopProduct(secondary.id) },
    { key: "retake", to: paths.assessment.start },
    { key: "contact", to: paths.dashboardSupport },
  ] as const;

  return (
    <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-8 lg:max-w-2xl">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-petrol-600">
        {t("followUp.yourAnswer")}
      </p>
      <p className="mt-1 font-display text-lg text-ink">
        {t(`followUp.options.${entry.choice}`)}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        {t(`followUp.responses.${entry.choice}`)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <RowLink
            key={a.key}
            icon={FOLLOW_UP_ACTION_ICON[a.key]}
            title={t(`followUp.actions.${a.key}`)}
            to={a.to}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={updateTarget}>{t("followUp.updateCta")}</Link>
        </Button>
        <button
          type="button"
          onClick={() => {
            clearFollowUp();
            setEntry(null);
          }}
          className="text-sm text-ink-muted underline-offset-4 hover:underline"
        >
          {t("followUp.change")}
        </button>
      </div>
    </div>
  );
}

/* ── Support ────────────────────────────────────────────────────────────── */

export function DashboardSupportPage() {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation();
  return (
    <div className="glass-strong flex flex-col items-start rounded-2xl md:rounded-3xl p-5 sm:p-8 lg:max-w-2xl">
      <MedallionIcon icon={LifeBuoy} className="size-14" />
      <p className="mt-4 text-ink-muted">{t("support.body")}</p>
      <dl className="mt-5 grid w-full gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5">
          <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {tc("pages.contact.emailHeading")}
          </dt>
          <dd className="mt-0.5 break-all text-sm font-medium text-ink">
            {SUPPORT_EMAIL}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5">
          <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {tc("pages.contact.hoursHeading")}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">
            {tc("pages.contact.hoursValue")}
          </dd>
        </div>
      </dl>
      <Button asChild variant="cta" className="mt-5 w-full sm:w-auto">
        <Link to={paths.contact}>{t("support.contactCta")}</Link>
      </Button>
    </div>
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

  function startEdit() {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setSavedAt(null);
    setEditing(true);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    updateProfile({ name: name.trim() || user?.name, phone });
    setEditing(false);
    setSavedAt(Date.now());
  }

  return (
    <div className="space-y-4 lg:grid lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
      {/* Left column — who you are + editable details. */}
      <div className="space-y-4">
      {/* Identity */}
      <div className="glass-strong flex items-center gap-4 rounded-2xl md:rounded-3xl p-5">
        <Avatar name={user?.name ?? ""} className="size-14 text-base" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-ink">{user?.name}</p>
          <p className="truncate text-sm text-ink-muted">{user?.email}</p>
        </div>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl md:rounded-3xl p-5">
        <GroupLabel>{t("profile.detailsLabel")}</GroupLabel>
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
              <Button type="submit" variant="cta" className="w-full sm:w-auto">
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
      </div>

      {/* Right column — settings, shortcuts, sign out. */}
      <div className="space-y-4">
      {/* Language (was an "Appearance" group with a theme toggle too, before
          dark mode was removed — Sept 2026). */}
      <div className="glass flex items-center justify-between gap-4 rounded-2xl md:rounded-3xl p-5">
        <span className="text-sm font-medium text-ink">
          {t("profile.language")}
        </span>
        <LanguageToggle />
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
      </div>

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
  );
}
