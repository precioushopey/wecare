import type { ReactNode } from "react";
import { Link } from "react-router";
import { Check, ChevronRight, type LucideIcon } from "lucide-react";

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
          ? "bg-petrol-50 text-petrol-700"
          : "bg-sage-100 text-sage-800",
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

/* ── Titled glass panel ────────────────────────────────────────────────── */

/**
 * A card with an uppercase eyebrow title and an optional "see all" link in the
 * corner — the building block the Overview and detail pages compose their
 * widgets from.
 */
export function SectionCard({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: { label: string; to: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "glass flex flex-col rounded-2xl md:rounded-3xl p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {title}
        </p>
        {action ? (
          <Link
            to={action.to}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-petrol-700 underline-offset-4 hover:underline"
          >
            {action.label}
            <ChevronRight className="size-3.5" aria-hidden strokeWidth={2} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ── Medical-journey stepper ───────────────────────────────────────────── */

function StepDot({
  done,
  active,
  index,
}: {
  done: boolean;
  active: boolean;
  index: number;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        done
          ? "bg-petrol-600 text-white"
          : active
            ? "bg-white text-petrol-700 ring-2 ring-petrol-600"
            : "bg-white/60 text-ink-muted",
      )}
    >
      {done ? <Check className="size-4" aria-hidden /> : index + 1}
    </span>
  );
}

/**
 * The four-stage patient journey — Assessment → Medical review → Prescription
 * → Order & delivery — with the current stage lit. State is derived by the
 * caller from real records (assessment completion · `review.status` · latest
 * order), never fabricated.
 */
export function DashboardJourney({
  steps,
  current,
  complete = false,
  bare = false,
  className,
}: {
  steps: string[];
  /** index of the active step */
  current: number;
  /** whole journey finished */
  complete?: boolean;
  /** render just the stepper, no glass card wrapper (for nesting) */
  bare?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label={steps.join(" · ")}
      className={cn(!bare && "glass rounded-2xl md:rounded-3xl p-5", className)}
    >
      {/* Mobile — a compact vertical list. */}
      <ol className="space-y-3 sm:hidden">
        {steps.map((label, i) => {
          const done = complete || i < current;
          const active = !complete && i === current;
          return (
            <li key={label} className="flex items-center gap-3">
              <StepDot done={done} active={active} index={i} />
              <span
                className={cn(
                  "text-sm font-medium",
                  active || done ? "text-ink" : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop — a horizontal track with connectors. */}
      <ol className="hidden sm:flex sm:items-start">
        {steps.map((label, i) => {
          const done = complete || i < current;
          const active = !complete && i === current;
          return (
            <li key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === 0
                      ? "bg-transparent"
                      : done || active
                        ? "bg-petrol-500"
                        : "bg-white/70",
                  )}
                />
                <StepDot done={done} active={active} index={i} />
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === steps.length - 1
                      ? "bg-transparent"
                      : done
                        ? "bg-petrol-500"
                        : "bg-white/70",
                  )}
                />
              </div>
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "mt-2 text-center text-xs font-medium",
                  active
                    ? "text-petrol-700"
                    : done
                      ? "text-ink"
                      : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
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
  petrol: "bg-petrol-50 text-petrol-700",
  sage: "bg-sage-100 text-sage-800",
  neutral: "bg-surface-raised text-ink-muted border border-border",
  danger: "bg-danger-50 text-danger-700",
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
