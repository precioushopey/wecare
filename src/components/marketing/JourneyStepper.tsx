import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";

const STEPS = [
  "problem",
  "assessment",
  "solution",
  "product",
  "followUp",
] as const;
export type JourneyStep = (typeof STEPS)[number];

/**
 * Slim "you are here" indicator for the guided path:
 * Concern → Assessment → Recommendation → Product → Follow-up.
 * Signals a healthcare journey rather than a shop.
 */
export function JourneyStepper({
  current,
  className,
}: {
  current: JourneyStep;
  className?: string;
}) {
  const { t } = useTranslation("common");
  const idx = STEPS.indexOf(current);

  return (
    <nav
      aria-label={t("journey.label")}
      className={cn("glass rounded-full px-4 py-2.5", className)}
    >
      <p className="text-sm sm:hidden">
        <span className="font-medium text-petrol-700">
          {t("journey.stepOf", { current: idx + 1, total: STEPS.length })}
        </span>{" "}
        <span className="text-ink-muted">· {t(`journey.steps.${current}`)}</span>
      </p>

      <ol className="hidden items-center justify-between sm:flex">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={s} className="flex items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-sage-500 text-white",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-white/60 text-ink-muted",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "ml-1.5 whitespace-nowrap text-xs font-medium",
                  active ? "text-petrol-700" : "text-ink-muted",
                )}
              >
                {t(`journey.steps.${s}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
