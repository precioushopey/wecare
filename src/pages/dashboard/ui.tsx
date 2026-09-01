import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import type { OrderStatus } from "@/features/orders/orders";
import type { ReviewStatus } from "@/features/review/review";

/**
 * Shared building blocks for the signed-in area. The dashboard is a
 * mobile-first "app" surface (owner request, Sept 2026): card-first,
 * generous tap targets, icon medallions, status pills — the marketing
 * `Reveal` motion is deliberately not used here (see CLAUDE.md).
 */

/* ── Identity monogram ──────────────────────────────────────────────────── */

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "·";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-white [background-image:var(--cta-gradient)] shadow-[var(--shadow-glow)]",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* ── Icon medallion (matches the homepage section cards) ────────────────── */

export function MedallionIcon({
  icon: Icon,
  tone = "petrol",
  className,
}: {
  icon: LucideIcon;
  tone?: "petrol" | "sage";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
        tone === "petrol"
          ? "bg-petrol-50 text-petrol-700 dark:bg-petrol-900/50 dark:text-petrol-100"
          : "bg-sage-100 text-sage-800 dark:bg-sage-800/40 dark:text-sage-200",
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

/* ── Tappable navigation row ────────────────────────────────────────────── */

export function RowLink({
  icon,
  title,
  subtitle,
  to,
  tone = "petrol",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  to: string;
  tone?: "petrol" | "sage";
}) {
  return (
    <Link
      to={to}
      className="glass glass-hover flex items-center gap-4 rounded-2xl md:rounded-3xl p-4"
    >
      <MedallionIcon icon={icon} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-sm text-ink-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-ink-muted"
        aria-hidden
        strokeWidth={1.75}
      />
    </Link>
  );
}

/* ── Labelled value tile ───────────────────────────────────────────────── */

export function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  // Inset tile — reads fine on its own and nested inside a glass card.
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface-raised/60 px-3.5 py-3",
        className,
      )}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

/* ── Status pill ───────────────────────────────────────────────────────── */

type PillTone = "petrol" | "sage" | "neutral" | "danger";

const PILL_TONE: Record<PillTone, string> = {
  petrol:
    "bg-petrol-50 text-petrol-700 dark:bg-petrol-900/60 dark:text-petrol-100",
  sage: "bg-sage-100 text-sage-800 dark:bg-sage-800/40 dark:text-sage-200",
  neutral: "bg-surface-raised text-ink-muted border border-border",
  danger:
    "bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-200",
};

const ORDER_TONE: Record<OrderStatus, PillTone> = {
  processing: "petrol",
  inReview: "petrol",
  shipped: "sage",
  delivered: "sage",
};

// No amber in the brand palette — "attention needed" states read as neutral,
// only a genuine "not approved" outcome uses the functional danger red.
const REVIEW_TONE: Record<ReviewStatus, PillTone> = {
  submitted: "petrol",
  inReview: "petrol",
  infoRequired: "neutral",
  consultation: "neutral",
  approved: "sage",
  notApproved: "danger",
};

export function orderPillTone(status: OrderStatus): PillTone {
  return ORDER_TONE[status];
}
export function reviewPillTone(status: ReviewStatus): PillTone {
  return REVIEW_TONE[status];
}

export function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: PillTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        PILL_TONE[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  text,
  ctaLabel,
  to,
}: {
  icon: LucideIcon;
  text: string;
  ctaLabel: string;
  to: string;
}) {
  return (
    <div className="glass-strong flex flex-col items-center rounded-2xl md:rounded-3xl p-8 text-center">
      <MedallionIcon icon={icon} className="size-14" />
      <p className="mt-4 max-w-xs text-ink-muted">{text}</p>
      <Link
        to={to}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-cta-foreground [background-image:var(--cta-gradient)] shadow-[0_10px_28px_-10px_rgba(42,167,176,0.55)] transition-all hover:brightness-105"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
