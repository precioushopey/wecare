import { Link } from "react-router";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

/**
 * The glass "heading + body + one CTA button" card, side by side from `sm` —
 * the FAQ page's contact prompt, the Product page's "not sure?" footer, and
 * the shop grid's guide banner all repeated this verbatim. Motion (`Reveal`)
 * stays the caller's choice, same as before — this component doesn't wrap
 * itself in one, since some callers (shop pages) deliberately stay static.
 */
export function PromptCard({
  title,
  body,
  ctaLabel,
  ctaTo,
  onCtaClick,
  tone = "glass",
  size = "base",
  className,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaTo: string;
  /** e.g. an analytics call — fires alongside the navigation. */
  onCtaClick?: () => void;
  /** `glass-strong` for a more prominent banner (e.g. above the fold). */
  tone?: "glass" | "glass-strong";
  /** `lg` bumps the title and CTA up a size for a more prominent banner. */
  size?: "base" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        tone,
        "flex flex-col gap-4 rounded-2xl md:rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className={size === "lg" ? "max-w-xl" : undefined}>
        <p
          className={cn(
            "font-display text-ink",
            size === "lg" ? "text-lg md:text-xl" : "text-base md:text-lg",
          )}
        >
          {title}
        </p>
        <p className="mt-1 text-sm md:text-base text-ink-muted">{body}</p>
      </div>
      <Button
        asChild
        variant="cta"
        className="w-full sm:w-auto sm:shrink-0"
      >
        <Link to={ctaTo} onClick={onCtaClick}>
          {ctaLabel}
        </Link>
      </Button>
    </div>
  );
}
