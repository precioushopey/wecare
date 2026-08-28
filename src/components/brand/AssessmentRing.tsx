import { useEffect, useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * The Assessment Ring — WeCare's one recurring visual device (spec Section 3).
 *
 * Use it for: assessment progress (filling arc), a quiet partial ring as hero
 * decoration on problem landing pages, the Result page reveal, and dashboard
 * "day X of your plan" indicators.
 *
 * Never a spinner. Never purely decorative outside the sanctioned cases.
 * The arc fill is the one place motion is allowed to be expressive; it still
 * respects `prefers-reduced-motion`.
 */

type RingTone = "brand" | "mint" | "deep";
type RingVariant = "progress" | "decoration" | "complete";

/** [from, to] gradient stops per tone — a soft blue-to-azure sweep. */
const TONE_STOPS: Record<RingTone, [string, string]> = {
  brand: ["#7ea9dd", "#218390"],
  mint: ["#aed7c1", "#5aa080"],
  deep: ["#318f9b", "#0d444b"],
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface AssessmentRingProps {
  /** Completed steps (numerator). */
  value?: number;
  /** Total steps. Defaults to 6 — the assessment has six questions. */
  total?: number;
  /** Diameter in pixels. */
  size?: number;
  /** Arc/track stroke width in pixels. Derived from `size` when omitted. */
  strokeWidth?: number;
  /**
   * `progress` — filling arc with a count in the centre.
   * `decoration` — static partial ring, no count, hidden from assistive tech.
   * `complete` — full ring, resolved state.
   */
  variant?: RingVariant;
  /** Arc colour. `sage` (default) for progress; `petrol` for medical context. */
  tone?: RingTone;
  /** Accessible label. Falls back to "{value} / {total}". */
  label?: string;
  /** Animate the arc on mount / value change. Ignored under reduced-motion. */
  animate?: boolean;
  /** Custom centre content. Overrides the default count. */
  children?: ReactNode;
  className?: string;
}

export function AssessmentRing({
  value = 0,
  total = 6,
  size = 120,
  strokeWidth,
  variant = "progress",
  tone = "brand",
  label,
  animate = true,
  children,
  className,
}: AssessmentRingProps) {
  const stroke = strokeWidth ?? Math.max(4, Math.round(size * 0.075));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedValue = Math.min(Math.max(value, 0), total);
  const targetPct =
    variant === "complete"
      ? 1
      : total > 0
        ? clampedValue / total
        : 0;
  const displayTarget =
    variant === "decoration" && value === 0 ? 0.4 : targetPct;

  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const shouldAnimate = animate && !reduced;

  const [drawnPct, setDrawnPct] = useState(shouldAnimate ? 0 : displayTarget);
  useEffect(() => {
    if (!shouldAnimate) {
      setDrawnPct(displayTarget);
      return;
    }
    const frame = requestAnimationFrame(() => setDrawnPct(displayTarget));
    return () => cancelAnimationFrame(frame);
  }, [displayTarget, shouldAnimate]);

  const dashOffset = circumference * (1 - drawnPct);

  const isDecoration = variant === "decoration";
  const shownValue = Math.round(displayTarget * total);
  const resolvedLabel = label ?? `${shownValue} / ${total}`;
  const showCount = variant !== "decoration" && children == null;

  const gradientId = useId();
  const [fromStop, toStop] = TONE_STOPS[tone];

  const arcStyle: CSSProperties = {
    transition: shouldAnimate
      ? "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)"
      : undefined,
    filter: isDecoration
      ? undefined
      : "drop-shadow(0 0 7px rgba(42, 167, 176, 0.45))",
  };

  return (
    <div
      className={className}
      style={{ position: "relative", width: size, height: size, lineHeight: 0 }}
      role={isDecoration ? "presentation" : "img"}
      aria-hidden={isDecoration || undefined}
      aria-label={isDecoration ? undefined : resolvedLabel}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={fromStop} />
            <stop offset="100%" stopColor={toStop} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-progress-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={arcStyle}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {(children != null || showCount) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children ?? (
            <span
              style={{
                fontFamily: "var(--wc-font-accent)",
                fontSize: size * 0.3,
                color: "var(--color-ink)",
                lineHeight: 1,
              }}
            >
              {shownValue}
              <span
                style={{
                  fontFamily: "var(--wc-font-body)",
                  fontSize: size * 0.13,
                  color: "var(--color-ink-muted)",
                }}
              >
                {" / "}
                {total}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AssessmentRing;
