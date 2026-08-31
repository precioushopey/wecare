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
  /** Arc-sweep duration in ms (default 700). Larger reads as an intro flourish. */
  drawDurationMs?: number;
  /** Beat before the arc-sweep starts, in ms (default 0). */
  drawDelayMs?: number;
  /**
   * Render a trailing three-dot ellipsis continuing along the ring's empty
   * path from the end of the drawn arc — reads as "progress + still going".
   * Coloured with the gradient's end stop. Only shown while the arc is partial.
   */
  trail?: boolean;
  /**
   * Small frosted readout pill (e.g. "6/10") pinned at the arc's start point,
   * framing the ring as quiz progress. Decorative — hidden from assistive tech.
   */
  startLabel?: string;
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
  drawDurationMs = 700,
  drawDelayMs = 0,
  trail = false,
  startLabel,
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
  /** false only while the intro sweep is in flight — gates the trail + label
   *  so they don't sit alone before the arc has caught up. */
  const [drawnIn, setDrawnIn] = useState(!shouldAnimate);
  useEffect(() => {
    if (!shouldAnimate) {
      setDrawnPct(displayTarget);
      setDrawnIn(true);
      return;
    }
    setDrawnIn(false);
    const start = window.setTimeout(() => {
      requestAnimationFrame(() => setDrawnPct(displayTarget));
    }, drawDelayMs);
    const done = window.setTimeout(
      () => setDrawnIn(true),
      drawDelayMs + drawDurationMs,
    );
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
    };
  }, [displayTarget, shouldAnimate, drawDelayMs, drawDurationMs]);

  const dashOffset = circumference * (1 - drawnPct);

  const isDecoration = variant === "decoration";
  const shownValue = Math.round(displayTarget * total);
  const resolvedLabel = label ?? `${shownValue} / ${total}`;
  const showCount = variant !== "decoration" && children == null;

  const gradientId = useId();
  const [fromStop, toStop] = TONE_STOPS[tone];

  const arcStyle: CSSProperties = {
    transition: shouldAnimate
      ? `stroke-dashoffset ${drawDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${drawDelayMs}ms`
      : undefined,
    filter: isDecoration
      ? undefined
      : "drop-shadow(0 0 7px rgba(42, 167, 176, 0.45))",
  };

  /** Fade + slight rise for the trail dots and start label so they arrive
   *  with the finished arc rather than before it. */
  const introRevealStyle: CSSProperties = {
    opacity: drawnIn ? 1 : 0,
    transform: drawnIn ? "none" : "translateY(4px)",
    transition: shouldAnimate
      ? "opacity 320ms ease-out, transform 320ms ease-out"
      : undefined,
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

        {trail && drawnPct > 0.001 && drawnPct < 0.999 && (
          <g style={introRevealStyle}>
            {[0, 1, 2].map((i) => {
              const stepFrac = (stroke * 1.4) / circumference;
              const tf = drawnPct + stepFrac * (1.25 + i);
              if (tf >= 1) return null;
              const angle = tf * 2 * Math.PI;
              return (
                <circle
                  key={i}
                  cx={size / 2 + radius * Math.sin(angle)}
                  cy={size / 2 - radius * Math.cos(angle)}
                  r={(stroke / 2) * (1 - i * 0.08)}
                  fill={toStop}
                  opacity={0.9 - i * 0.15}
                />
              );
            })}
          </g>
        )}
      </svg>

      {startLabel != null && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: `${((size / 2 + radius * Math.sin(-0.05 * 2 * Math.PI)) / size) * 100}%`,
            top: `${((size / 2 - radius * Math.cos(-0.05 * 2 * Math.PI)) / size) * 100}%`,
            transform: `translate(-50%, calc(-50% + ${drawnIn ? "0px" : "5px"}))`,
            opacity: drawnIn ? 1 : 0,
            transition: shouldAnimate
              ? "opacity 320ms ease-out, transform 320ms ease-out"
              : undefined,
            display: "inline-flex",
            alignItems: "center",
            fontFamily: "var(--wc-font-accent)",
            fontSize: Math.max(11, size * 0.045),
            lineHeight: 1,
            color: toStop,
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.7)",
            borderRadius: 999,
            padding: `${Math.max(3, size * 0.012)}px ${Math.max(8, size * 0.028)}px`,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 20px -10px rgba(13, 68, 75, 0.4)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {startLabel}
        </span>
      )}

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
