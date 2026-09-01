import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  LogOut,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
import { getOrders } from "@/features/orders/orders";
import { getMedicalReview } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatDate, formatPriceEur } from "@/lib/format";

import {
  Avatar,
  EmptyState,
  MedallionIcon,
  orderPillTone,
  reviewPillTone,
  RowLink,
  StatTile,
  StatusPill,
} from "./ui";

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

  const problemLabel = ta(`questions.q1.options.${result.problem}`);
  const frequencyLabel = answers.q2
    ? ta(`questions.q2.options.${answers.q2}`)
    : null;
  const strengthLabel = answers.q3
    ? ta(`questions.q3.options.${answers.q3}`)
    : null;

  return (
    <div className="space-y-4">
      {/* Next step */}
      <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <MedallionIcon icon={ShieldCheck} />
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t("home.nextStep")}
            </p>
            {hero.pill ? <div className="mt-1.5">{hero.pill}</div> : null}
            <p className="mt-2 text-sm text-ink">{hero.text}</p>
          </div>
        </div>
        <Button asChild variant="cta" className="mt-4 w-full sm:w-auto">
          <Link to={hero.to}>
            {hero.cta}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* Assessment snapshot */}
      <Link
        to={paths.dashboardAssessment}
        className="glass glass-hover block rounded-2xl md:rounded-3xl p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <GroupLabel>{t("home.assessmentSnapshot")}</GroupLabel>
          <ChevronRight
            className="size-4 shrink-0 text-ink-muted"
            aria-hidden
            strokeWidth={1.75}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatTile
            label={t("assessment.problem")}
            value={problemLabel}
            className="col-span-2 sm:col-span-1"
          />
          {frequencyLabel ? (
            <StatTile
              label={t("assessment.frequency")}
              value={frequencyLabel}
            />
          ) : null}
          {strengthLabel ? (
            <StatTile label={t("assessment.strength")} value={strengthLabel} />
          ) : null}
        </div>
      </Link>

      {/* Everything else */}
      <div className="space-y-3">
        <RowLink
          icon={Sparkles}
          title={t("nav.recommendation")}
          subtitle={`${primary.name} · ${ts(`solutions.${primary.id}.category`)}`}
          to={paths.dashboardRecommendation}
        />
        <RowLink
          icon={CalendarCheck}
          tone="sage"
          title={t("nav.followUp")}
          subtitle={
            followUp ? t("home.followUpDone") : t("home.followUpReminder")
          }
          to={paths.dashboardFollowUp}
        />
        <RowLink
          icon={LifeBuoy}
          tone="sage"
          title={t("nav.support")}
          subtitle={t("support.body")}
          to={paths.dashboardSupport}
        />
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

  return (
    <div className="space-y-4">
      {review ? (
        <StatusPill
          label={ta(`review.statuses.${review.status}.label`)}
          tone={reviewPillTone(review.status)}
        />
      ) : null}

      <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-6">
        <p className="text-sm text-ink-muted">{t("assessment.completedNote")}</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatTile
            label={t("assessment.problem")}
            value={ta(`questions.q1.options.${result.problem}`)}
          />
          {answers.q2 ? (
            <StatTile
              label={t("assessment.frequency")}
              value={ta(`questions.q2.options.${answers.q2}`)}
            />
          ) : null}
          {answers.q3 ? (
            <StatTile
              label={t("assessment.strength")}
              value={ta(`questions.q3.options.${answers.q3}`)}
            />
          ) : null}
        </div>
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
  const { result } = useAssessment();
  const review = getMedicalReview();

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

  return (
    <div className="space-y-4">
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
            className="glass glass-hover flex gap-4 rounded-2xl md:rounded-3xl p-5"
          >
            <SolutionMark solution={s} className="size-16 shrink-0 rounded-lg" />
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-petrol-600">
                {label}
              </p>
              <p className="mt-1 font-display text-lg text-ink">{s.name}</p>
              {/* Category, not a bare THC number — the beginner-safe framing
                  the result page settled on (audit WC-10). */}
              <p className="mt-1 text-sm text-ink-muted">
                {ts(`solutions.${s.id}.category`)}
              </p>
            </div>
          </Link>
        ))}
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

  return (
    <ul className="space-y-4">
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
    <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-8">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-petrol-600">
        {t("followUp.yourAnswer")}
      </p>
      <p className="mt-1 font-display text-lg text-ink">
        {t(`followUp.options.${entry.choice}`)}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        {t(`followUp.responses.${entry.choice}`)}
      </p>

      <div className="mt-5 space-y-3">
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
  return (
    <div className="glass-strong flex flex-col items-start rounded-2xl md:rounded-3xl p-5 sm:p-8">
      <MedallionIcon icon={LifeBuoy} className="size-14" />
      <p className="mt-4 text-ink-muted">{t("support.body")}</p>
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
              <p className="text-sm text-sage-700 dark:text-sage-300">
                {t("profile.saved")}
              </p>
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

      {/* Appearance */}
      <div className="glass rounded-2xl md:rounded-3xl p-5">
        <GroupLabel>{t("profile.appearance")}</GroupLabel>
        <div className="flex items-center justify-between gap-4 py-1.5">
          <span className="text-sm text-ink">{t("profile.language")}</span>
          <LanguageToggle />
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 py-1.5">
          <span className="text-sm text-ink">{t("profile.theme")}</span>
          <ThemeToggle />
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
      </div>

      <Button
        variant="outline"
        onClick={signOut}
        className="w-full text-danger-700 dark:text-danger-200"
      >
        <LogOut className="size-4" aria-hidden />
        {t("profile.signOut")}
      </Button>
    </div>
  );
}
