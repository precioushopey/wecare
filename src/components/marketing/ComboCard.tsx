import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { cn } from "@/app/components/ui/utils";
import { FloatingChip } from "@/components/marketing/FloatingChip";
import { SOLUTION_BY_ID, solutionImage, type SolutionId } from "@/data/solutions";
import { matchedSolutionIds } from "@/features/assessment/recommendation";
import {
  CONDITION_BY_KEY,
  type ConditionKey,
} from "@/features/conditions/conditions";

/**
 * One problem's recommended solution pair as a "combo" — the two product
 * photos floating on a soft `glass-strong` surface, each wearing a frosted
 * name chip, with the combined THC range below. Low-emphasis, no prices, no
 * buy CTAs.
 *
 * Used per slide inside `ComboCarousel` (homepage, `showHeader`) and standalone
 * in the "What you might be matched with" block on a problem landing page
 * (`showHeader={false}` — that section already has its own heading).
 */

export function comboThcRange(ids: SolutionId[]): string {
  const nums = ids
    .flatMap((id) => SOLUTION_BY_ID[id].thcRange.match(/\d+/g) ?? [])
    .map(Number);
  if (nums.length === 0) return "";
  return `${Math.min(...nums)}–${Math.max(...nums)} %`;
}

export function ComboCard({
  problem,
  showHeader = true,
  className,
}: {
  problem: ConditionKey;
  showHeader?: boolean;
  className?: string;
}) {
  const { t } = useTranslation(["home", "shop"]);
  const ids = matchedSolutionIds(problem);
  const Icon = CONDITION_BY_KEY[problem].icon;

  return (
    <div
      className={cn(
        "glass-strong flex flex-1 flex-col rounded-3xl p-5 sm:p-6",
        className,
      )}
    >
      {showHeader ? (
        <>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            {t(`solutionsPreview.combo.problems.${problem}`)}
          </p>
          <p className="mt-1.5 text-sm text-ink-muted">
            {t("solutionsPreview.combo.subtitle")}
          </p>
        </>
      ) : null}

      {/* The combo — the two matched solutions' photos side by side. Each
          carries a frosted name chip pinned to a corner of its own photo
          (primary top-left, secondary bottom-right) so the label stays with
          the photo without sitting over the bud. */}
      <div
        className={cn(
          "image-glow relative flex flex-1 items-center justify-center gap-1 px-1 py-2",
          showHeader && "mt-4",
        )}
      >
        {ids.map((id, i) => {
          const s = SOLUTION_BY_ID[id];
          const primary = i === 0;
          return (
            <div
              key={id}
              className={cn(
                "relative flex max-w-[46%] shrink-0 justify-center",
                primary ? "-mr-3 z-10" : "-ml-3 z-0",
              )}
            >
              <ImageWithFallback
                src={solutionImage(s)}
                alt=""
                loading="lazy"
                decoding="async"
                className={cn(
                  "h-40 w-auto max-w-full object-contain drop-shadow-[0_26px_40px_-18px_rgba(13,68,75,0.55)] sm:h-52 lg:h-60",
                  primary ? "rotate-[-7deg]" : "rotate-[7deg]",
                )}
              />
              <FloatingChip
                icon={<Sparkles className="size-3.5 sm:size-4" />}
                className={cn(
                  "absolute z-20 max-w-[94%] gap-1.5 px-2.5 py-1 text-[11px] sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-[13px]",
                  primary
                    ? "left-0 top-0 -translate-x-1 -translate-y-1 sm:-translate-x-2 sm:-translate-y-2"
                    : "bottom-0 right-0 translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2",
                )}
              >
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold text-ink">{s.name}</span>
                  <span className="font-semibold text-ink">
                    {t(`shop:solutions.${id}.category`)}
                  </span>
                </span>
              </FloatingChip>
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          "font-mono text-xs text-ink-muted",
          showHeader ? "mt-6" : "mt-4",
        )}
      >
        {t("solutionsPreview.combo.thc", { range: comboThcRange(ids) })}
      </p>
    </div>
  );
}
