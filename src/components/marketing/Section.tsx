import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";
import { Reveal } from "./Reveal";

type SectionTone = "surface" | "raised" | "brand" | "mint";

const TONE: Record<SectionTone, string> = {
  // transparent — the page gradient shows through
  surface: "text-ink",
  // faint frosted band lifting off the gradient
  raised:
    "text-ink bg-white/45 backdrop-blur-md border-y border-white/50 dark:bg-white/[0.04] dark:border-white/10",
  // deep blue-teal gradient band, rounded like a full-width card
  brand:
    "text-white [background-image:var(--brand-band-gradient)] overflow-hidden rounded-2xl md:rounded-4xl mx-4 sm:mx-6 xl:mx-12",
  // barely-there mint wash
  mint: "text-ink bg-sage-100/35 dark:bg-petrol-900/30",
};

export function Section({
  children,
  className,
  tone = "surface",
  id,
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  id?: string;
  /**
   * Fade + rise the section's content in as it scrolls into view (the default).
   * Set `false` on pages that choreograph their own children with `Reveal` so
   * the two don't stack into a doubled motion.
   */
  reveal?: boolean;
}) {
  const inner = <div className="mx-auto max-w-6xl">{children}</div>;
  return (
    <section
      id={id}
      className={cn("px-4 py-16 sm:px-6 sm:py-24", TONE[tone], className)}
    >
      {reveal ? <Reveal>{inner}</Reveal> : inner}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "mx-auto max-w-2xl text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            invert ? "text-sage-300" : "text-petrol-600",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn(invert && "text-white")}>{title}</h2>
      {intro ? (
        <p className={cn("text-lg", invert ? "text-white/80" : "text-ink-muted")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
