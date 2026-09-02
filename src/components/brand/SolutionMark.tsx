import { cn } from "@/app/components/ui/utils";
import type { Solution } from "@/data/solutions";
import { CONDITION_BY_KEY } from "@/features/conditions/conditions";

/**
 * A Solution's own visual identity — its primary problem's icon in a soft
 * medallion. Deliberately NOT a strain photo: `solutionImage()` used to
 * render one dispensed strain's bud photo as if it *were* the Solution,
 * which both overstated a single strain (a Solution can have several, or
 * none yet sourced) and put product/strain imagery ahead of the assessment
 * on the shop grid, cart and dashboard. Owner decision #4, Sept 2026 — see
 * docs/STRAIN-SOLUTION-MAPPING.md. Real strain photos still appear, post-
 * assessment, per dispensing option on the Solution page's accordion.
 */
export function SolutionMark({
  solution,
  className,
  iconClassName,
}: {
  solution: Solution;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = CONDITION_BY_KEY[solution.conditionKeys[0]].icon;
  return (
    <span
      className={cn(
        "image-glow flex items-center justify-center rounded-2xl bg-gradient-to-br from-sage-100 to-petrol-50 text-petrol-700 ring-1 ring-white/60",
        className,
      )}
    >
      <Icon
        className={cn("size-2/5", iconClassName)}
        strokeWidth={1.5}
        aria-hidden
      />
    </span>
  );
}
