import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { ComboCard } from "@/components/marketing/ComboCard";
import { type ConditionKey } from "@/features/conditions/conditions";

/**
 * The Solutions-section carousel: one slide per problem, each a `ComboCard`
 * (the recommended solution pair by name + category — no product imagery
 * pre-assessment). Low-emphasis, no prices, no buy CTAs.
 *
 * Dependency-free: a scroll-snap track (native swipe) + prev/next + dots.
 */

const PROBLEMS: readonly ConditionKey[] = [
  "sleep",
  "pain",
  "stressAnxiety",
  "migraine",
];

export function ComboCarousel({ className }: { className?: string }) {
  const { t } = useTranslation("home");
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(PROBLEMS.length - 1, next));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (track.clientWidth > 0) {
          setIndex(Math.round(track.scrollLeft / track.clientWidth));
        }
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-3xl [scrollbar-width:none] lg:min-h-0 lg:flex-1 [&::-webkit-scrollbar]:hidden"
      >
        {PROBLEMS.map((problem) => (
          <div
            key={problem}
            className="flex w-full shrink-0 snap-center flex-col"
          >
            <ComboCard problem={problem} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden>
          {PROBLEMS.map((p, i) => (
            <button
              key={p}
              type="button"
              tabIndex={-1}
              aria-label={t(`solutionsPreview.combo.problems.${p}`)}
              onClick={() => go(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-petrol-600" : "w-1.5 bg-petrol-300/60",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label={t("solutionsPreview.combo.prev")}
            className="glass flex size-9 items-center justify-center rounded-full text-petrol-700 transition disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === PROBLEMS.length - 1}
            aria-label={t("solutionsPreview.combo.next")}
            className="glass flex size-9 items-center justify-center rounded-full text-petrol-700 transition disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
