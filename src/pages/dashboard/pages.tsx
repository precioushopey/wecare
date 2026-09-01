import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { SOLUTION_BY_ID, solutionImage } from "@/data/solutions";
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
import { getMedicalReview } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatDate, formatPriceEur } from "@/lib/format";

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ text, ctaLabel, to }: { text: string; ctaLabel: string; to: string }) {
  return (
    <div className="glass rounded-3xl p-6">
      <p className="text-ink-muted">{text}</p>
      <Button asChild variant="cta" className="mt-4">
        <Link to={to}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}

/* ── Dashboard home / overview ───────────────────────────────────────────── */

export function DashboardHomePage() {
  const { t } = useTranslation("dashboard");
  const { t: ta } = useTranslation("assessment");
  const { result } = useAssessment();
  const [followUp] = useState(() => getFollowUp());
  const orders = getOrders();
  const latestOrder = orders[0];
  const review = getMedicalReview();

  if (!result) {
    return (
      <Panel title={t("home.title")}>
        <EmptyState
          text={t("home.empty")}
          ctaLabel={t("home.emptyCta")}
          to={paths.assessment.start}
        />
      </Panel>
    );
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];

  return (
    <Panel title={t("home.title")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {t("home.problemLabel")}
          </p>
          <p className="mt-1 text-lg text-ink">
            {ta(`questions.q1.options.${result.problem}`)}
          </p>
        </div>

        <Link
          to={paths.dashboardRecommendation}
          className="glass glass-hover flex items-center gap-4 rounded-3xl p-5"
        >
          <div className="image-glow size-14 shrink-0 rounded-lg">
            <ImageWithFallback
              src={solutionImage(primary)}
              alt=""
              className="size-full object-contain p-1"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              {t("home.recommendationLabel")}
            </p>
            <p className="mt-1 font-display text-lg text-ink">{primary.name}</p>
            <p className="mt-0.5 text-sm text-petrol-700">
              {t("home.viewRecommendation")}
            </p>
          </div>
        </Link>

        <Link
          to={
            latestOrder
              ? paths.dashboardOrders
              : review
                ? paths.assessment.review
                : paths.dashboardRecommendation
          }
          className="glass glass-hover rounded-3xl p-5"
        >
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {latestOrder
              ? t("home.orderStatusLabel")
              : t("home.reviewLabel")}
          </p>
          <p className="mt-1 text-lg text-ink">
            {latestOrder
              ? t(`orders.statuses.${latestOrder.status}`)
              : review
                ? ta(`review.statuses.${review.status}.label`)
                : t("recommendation.notSubmitted")}
          </p>
          <p className="mt-0.5 text-sm text-petrol-700">
            {latestOrder ? t("home.viewOrders") : t("home.viewReview")}
          </p>
        </Link>

        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {t("home.followUpLabel")}
          </p>
          <p className="mt-1 text-sm text-ink">
            {followUp ? t("home.followUpDone") : t("home.followUpReminder")}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to={paths.dashboardFollowUp}>{t("home.followUpCta")}</Link>
          </Button>
        </div>
      </div>

      <Button asChild variant="cta" className="mt-5">
        <Link to={paths.dashboardSupport}>{t("home.supportCta")}</Link>
      </Button>
    </Panel>
  );
}

/* ── My assessment ───────────────────────────────────────────────────────── */

export function DashboardAssessmentPage() {
  const { t } = useTranslation("dashboard");
  const { t: ta } = useTranslation("assessment");
  const { answers, completedAt, result } = useAssessment();

  if (!completedAt || !result) {
    return (
      <Panel title={t("assessment.title")}>
        <EmptyState
          text={t("assessment.empty")}
          ctaLabel={t("assessment.emptyCta")}
          to={paths.assessment.start}
        />
      </Panel>
    );
  }

  return (
    <Panel title={t("assessment.title")}>
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-ink-muted">{t("assessment.completedNote")}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">
              {t("assessment.problem")}
            </dt>
            <dd className="mt-1 text-ink">
              {ta(`questions.q1.options.${result.problem}`)}
            </dd>
          </div>
          {answers.q2 ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t("assessment.frequency")}
              </dt>
              <dd className="mt-1 text-ink">
                {ta(`questions.q2.options.${answers.q2}`)}
              </dd>
            </div>
          ) : null}
          {answers.q3 ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t("assessment.strength")}
              </dt>
              <dd className="mt-1 text-ink">
                {ta(`questions.q3.options.${answers.q3}`)}
              </dd>
            </div>
          ) : null}
        </dl>
        <Button asChild variant="outline" className="mt-5">
          <Link to={paths.assessment.start}>{t("assessment.retake")}</Link>
        </Button>
      </div>
    </Panel>
  );
}

/* ── My recommendation ───────────────────────────────────────────────────── */

export function DashboardRecommendationPage() {
  const { t } = useTranslation("dashboard");
  const { t: ts } = useTranslation("shop");
  const { t: ta } = useTranslation("assessment");
  const { result } = useAssessment();
  const review = getMedicalReview();

  if (!result) {
    return (
      <Panel title={t("recommendation.title")}>
        <EmptyState
          text={t("recommendation.empty")}
          ctaLabel={t("recommendation.emptyCta")}
          to={paths.assessment.start}
        />
      </Panel>
    );
  }

  const primary = SOLUTION_BY_ID[result.primarySolutionId];
  const secondary = SOLUTION_BY_ID[result.secondarySolutionId];

  return (
    <Panel title={t("recommendation.title")}>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: t("recommendation.primary"), s: primary },
          { label: t("recommendation.secondary"), s: secondary },
        ].map(({ label, s }) => (
          <Link
            key={s.id}
            to={paths.shopProduct(s.id)}
            className="glass glass-hover flex gap-4 rounded-3xl p-5"
          >
            <div className="image-glow size-16 shrink-0 rounded-lg">
              <ImageWithFallback
                src={solutionImage(s)}
                alt=""
                className="size-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
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
      <div className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {t("recommendation.reviewLabel")}
        </p>
        <p className="mt-1">
          {review
            ? ta(`review.statuses.${review.status}.label`)
            : t("recommendation.notSubmitted")}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {review ? (
          <Button asChild variant="cta">
            <Link to={paths.assessment.review}>
              {ta("result.viewReviewCta")}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="cta">
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
    </Panel>
  );
}

/* ── My orders ───────────────────────────────────────────────────────────── */

const STATUS_TONE: Record<OrderStatus, string> = {
  processing: "bg-petrol-50 text-petrol-700 dark:bg-petrol-900/60 dark:text-petrol-100",
  inReview: "bg-petrol-100 text-petrol-800 dark:bg-petrol-900/60 dark:text-petrol-100",
  shipped: "bg-sage-100 text-sage-800 dark:bg-sage-800/40 dark:text-sage-200",
  delivered: "bg-sage-200 text-sage-900 dark:bg-sage-700/45 dark:text-sage-200",
};

export function DashboardOrdersPage() {
  const { t } = useTranslation("dashboard");
  const { language } = useLanguage();
  const orders = getOrders();

  if (orders.length === 0) {
    return (
      <Panel title={t("orders.title")}>
        <EmptyState
          text={t("orders.empty")}
          ctaLabel={t("orders.emptyCta")}
          to={paths.shop}
        />
      </Panel>
    );
  }

  return (
    <Panel title={t("orders.title")}>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="glass rounded-3xl p-5"
          >
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[order.status]}`}
              >
                {t(`orders.statuses.${order.status}`)}
              </span>
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
    </Panel>
  );
}

/* ── Follow-up ───────────────────────────────────────────────────────────── */

export function DashboardFollowUpPage() {
  const { t } = useTranslation("dashboard");
  const { result } = useAssessment();
  const [entry, setEntry] = useState<FollowUpEntry | null>(() => getFollowUp());

  if (!result) {
    return (
      <Panel title={t("followUp.title")}>
        <div className="glass rounded-3xl p-6">
          <p className="text-ink-muted">{t("followUp.empty")}</p>
          <Button asChild variant="cta" className="mt-4">
            <Link to={paths.assessment.start}>{t("followUp.emptyCta")}</Link>
          </Button>
        </div>
      </Panel>
    );
  }

  if (!entry) {
    return (
      <Panel title={t("followUp.title")}>
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <p className="font-display text-xl text-ink">{t("followUp.prompt")}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {t("followUp.promptHint")}
          </p>
          <div className="mt-5 grid gap-3">
            {FOLLOW_UP_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  setEntry(setFollowUp(choice));
                  track(AnalyticsEvent.followupSubmitted, { answer: choice });
                }}
                className="rounded-xl border-2 border-border bg-surface-raised p-4 text-left text-ink transition-colors hover:border-petrol-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
              >
                {t(`followUp.options.${choice}`)}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">{t("followUp.windowNote")}</p>
        </div>
      </Panel>
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

  const actions: { key: string; to: string }[] = [
    { key: "reorder", to: paths.shopProduct(result.primarySolutionId) },
    { key: "trySecondary", to: paths.shopProduct(secondary.id) },
    { key: "retake", to: paths.assessment.start },
    { key: "contact", to: paths.dashboardSupport },
  ];

  return (
    <Panel title={t("followUp.title")}>
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {t("followUp.yourAnswer")}
        </p>
        <p className="mt-1 font-display text-lg text-ink">
          {t(`followUp.options.${entry.choice}`)}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          {t(`followUp.responses.${entry.choice}`)}
        </p>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {actions.map((a) => (
            <li key={a.key}>
              <Link
                to={a.to}
                className="block rounded-xl glass glass-hover p-3 text-sm font-medium text-ink"
              >
                {t(`followUp.actions.${a.key}`)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild variant="cta">
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
    </Panel>
  );
}

/* ── Support ─────────────────────────────────────────────────────────────── */

export function DashboardSupportPage() {
  const { t } = useTranslation("dashboard");
  return (
    <Panel title={t("support.title")}>
      <div className="glass rounded-3xl p-6">
        <p className="text-ink-muted">{t("support.body")}</p>
        <Button asChild variant="cta" className="mt-4">
          <Link to={paths.contact}>{t("support.contactCta")}</Link>
        </Button>
      </div>
    </Panel>
  );
}

/* ── Profile ─────────────────────────────────────────────────────────────── */

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
    <Panel title={t("profile.title")}>
      <div className="space-y-4 glass rounded-3xl p-6">
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
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="cta">
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
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t("profile.name")}
              </p>
              <p className="mt-1 text-ink">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t("profile.email")}
              </p>
              <p className="mt-1 text-ink">{user?.email}</p>
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
            <Button variant="outline" size="sm" onClick={startEdit}>
              {t("profile.edit")}
            </Button>
          </>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {t("profile.language")}
          </p>
          <div className="mt-2">
            <LanguageToggle />
          </div>
        </div>
        <Button variant="outline" onClick={signOut}>
          {t("profile.signOut")}
        </Button>
      </div>
    </Panel>
  );
}
