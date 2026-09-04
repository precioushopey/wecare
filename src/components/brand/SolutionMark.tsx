import { cn } from "@/app/components/ui/utils";
import type { Solution } from "@/data/solutions";
import { CONDITION_BY_KEY } from "@/features/conditions/conditions";

/**
 * A Solution's own visual identity — its primary problem's icon. Deliberately
 * NOT a strain photo: `solutionImage()` used to render one dispensed strain's
 * bud photo as if it *were* the Solution, which both overstated a single
 * strain (a Solution can have several, or none yet sourced) and put
 * product/strain imagery ahead of the assessment on the shop grid, cart and
 * dashboard. Owner decision #4, Sept 2026 — see docs/STRAIN-SOLUTION-MAPPING.md.
 * Real strain photos still appear, post-assessment, per dispensing option on
 * the Solution page's accordion.
 *
 * `variant`:
 * - `medallion` (default) — a crisp near-white tile: hairline petrol ring, a
 *   soft teal-tinted lift shadow, and a confident petrol glyph. Reads clearly
 *   on the translucent glass cards where a pale wash used to disappear.
 * - `badge` — a small round blue→teal gradient chip with a white glyph and a
 *   luminous rim; reads on both light surfaces and dark gradient cards.
 */
export function SolutionMark({
  solution,
  className,
  iconClassName,
  variant = "medallion",
}: {
  solution: Solution;
  className?: string;
  iconClassName?: string;
  variant?: "medallion" | "badge";
}) {
  const Icon = CONDITION_BY_KEY[solution.conditionKeys[0]].icon;

  if (variant === "badge") {
    // Built from the brand teal ramp (`petrol-*`) so it sits in the same hue
    // family as the `--brand-band-gradient` card it's used on — a lighter,
    // lifted sibling, not a foreign bright-cyan chip.
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-petrol-400 via-petrol-500 to-petrol-700 text-white ring-1 ring-white/30 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)]",
          className,
        )}
      >
        {/* soft top sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.35)_0%,transparent_50%)]"
        />
        <Icon
          className={cn("relative size-1/2", iconClassName)}
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl bg-gradient-to-b from-white to-sage-50/70 text-petrol-700 ring-1 ring-petrol-200/70 shadow-[0_10px_24px_-12px_rgba(33,131,144,0.45)]",
        className,
      )}
    >
      <Icon
        className={cn("size-1/2", iconClassName)}
        strokeWidth={1.75}
        aria-hidden
      />
    </span>
  );
}
