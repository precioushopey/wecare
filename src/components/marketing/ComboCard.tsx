import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { SOLUTION_BY_ID, type SolutionId } from "@/data/solutions";
import { matchedSolutionIds } from "@/features/assessment/recommendation";
import {
  CONDITION_BY_KEY,
  type ConditionKey,
} from "@/features/conditions/conditions";

/**
 * One problem's recommended solution pair as a "combo" — the two solutions by
 * name + category on a soft `glass-strong` surface, with the combined THC range
 * below. Deliberately **no product / strain imagery**: those are shown only
 * after the assessment (owner/compliance decision, Aug 2026 — "grass pics only
 * after the questionnaire"). Low-emphasis, no prices, no buy CTAs.
 *
 * Used in the "What you might be matched with" block on a problem landing page
 * (`showHeader={false}` — that section already has its own heading). The
 * `showHeader` path (its own eyebrow + subtitle) is kept for reuse but has no
 * current caller since the homepage carousel was removed (Aug 2026).
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

      {/* The matched pair — name + category + one-line role. No bud / product
          photos on pre-assessment surfaces. */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center gap-3",
          showHeader && "mt-4",
        )}
      >
        {ids.map((id) => {
          const s = SOLUTION_BY_ID[id];
          return (
            <div
              key={id}
              className="flex gap-3.5 rounded-2xl border border-white/50 bg-white/45 p-4 dark:border-white/20 dark:bg-white/[0.05]"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_-10px_rgba(42,167,176,0.55)] [background-image:var(--cta-gradient)]">
                <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="text-xs font-medium text-petrol-600">
                  {t(`shop:solutions.${id}.category`)}
                </span>
                <span className="mt-1.5 text-xs text-ink-muted">
                  {t(`shop:solutions.${id}.blurb`)}
                </span>
              </span>
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
