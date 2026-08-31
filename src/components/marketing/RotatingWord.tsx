import { useEffect, useState } from "react";

import { cn } from "@/app/components/ui/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Cycles through `words`, one visible at a time, with a quiet crossfade + rise
 * between them (~400ms) every `intervalMs`. The words are stacked in one grid
 * cell so the box is sized to the widest/tallest and nothing around it shifts.
 *
 * `aria-hidden` — the animation is decorative; pair it with a static `sr-only`
 * label in the heading. Under reduced motion it renders `fallback` (defaults to
 * the words joined with ", ") and never cycles.
 */
export function RotatingWord({
  words,
  fallback,
  className,
  intervalMs = 2800,
  startDelayMs = 1000,
}: {
  words: string[];
  fallback?: string;
  className?: string;
  intervalMs?: number;
  startDelayMs?: number;
}) {
  const [reduced] = useState(prefersReducedMotion);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(
        () => setI((n) => (n + 1) % words.length),
        intervalMs,
      );
    }, startDelayMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [reduced, words.length, intervalMs, startDelayMs]);

  if (reduced || words.length === 0) {
    return (
      <span aria-hidden className={cn("grid", className)}>
        {fallback ?? words.join(", ")}
      </span>
    );
  }

  return (
    <span aria-hidden className={cn("grid", className)}>
      {words.map((word, idx) => (
        <span
          key={word}
          className={cn(
            "col-start-1 row-start-1 transition-[opacity,transform] duration-[400ms] ease-out",
            idx === i
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0",
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
