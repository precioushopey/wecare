import type { ReactNode } from "react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { cn } from "@/app/components/ui/utils";

/**
 * The "photo card with a gradient text overlay" tile — the homepage's
 * problem cards (`ChooseProblemSection`) and how-it-works steps
 * (`HowItWorksSection`) repeated this exact structure (including the
 * composited-clip trick for the hover zoom) with only the badge/CTA content
 * differing. `badge` takes the pre-styled icon or step-number circle so this
 * stays a visual shell, not a component that knows about icons vs. numbers.
 * Caller decides whether to wrap it in a `<Link>` or a plain `<li>`.
 */
export function PhotoTile({
  image,
  badge,
  title,
  description,
  corner,
  className,
}: {
  /** Resolved by `siteImage()`, which can return `undefined` for a missing
   *  key — `ImageWithFallback` degrades to its placeholder in that case. */
  image: string | undefined;
  badge: ReactNode;
  title: string;
  description: string;
  /** Optional mark pinned to the card's top-right corner, over the photo
   *  (the problem cards' white arrow). Purely visual: the caller wraps the
   *  whole tile in the `<Link>`, so this is not a second click target. */
  corner?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl md:rounded-3xl glass glass-hover",
        className,
      )}
    >
      {/* Own clip layer: `overflow-hidden` + `rounded` on the card alone
          doesn't reliably clip a transformed child (the hover zoom) at the
          rounded corners in Chrome, so the photo leaks a hairline past the
          radius. translateZ(0) bakes the rounded clip into a composited
          layer. */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] [transform:translateZ(0)]">
        <ImageWithFallback
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {/* The text panel's own background is the fade: opaque white at the
          bottom edge → fully transparent at the top, so the photo reads
          through the whole text area, strongest behind the title. */}
      {corner ? <div className="absolute right-4 top-4 z-10">{corner}</div> : null}
      <div className="relative flex flex-col bg-gradient-to-t from-white from-30% via-white/90 via-50% to-transparent px-5 pb-5 pt-28">
        <div className="mb-2 flex items-center gap-3">
          {badge}
          <h3 className="text-lg md:text-xl leading-tight text-petrol-700">{title}</h3>
        </div>
        <p className="mt-2 text-sm md:text-base text-ink-muted">{description}</p>
      </div>
    </div>
  );
}
