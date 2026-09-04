import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";

const STEPS = ["cart", "details", "review"] as const;
export type CheckoutStep = (typeof STEPS)[number] | "complete";

/**
 * Small, quiet progress indicator for the purchase flow: Cart → Details →
 * Review. One step per real stage, no hidden or collapsed steps (Baymard
 * checkout-flow guidance). It orients, it does not dominate — non-clickable,
 * mobile-friendly. `complete` (the confirmation page) lights every step and
 * shows a trailing "Complete"; nothing reads as "confirmed" before the order
 * actually is (PO decision, Sept 2026).
 */
export function CheckoutSteps({
  current,
  className,
}: {
  current: CheckoutStep;
  className?: string;
}) {
  const { t } = useTranslation("shop");
  const done = current === "complete";
  const idx = done ? STEPS.length : STEPS.indexOf(current as (typeof STEPS)[number]);

  return (
    <nav
      aria-label={t("checkoutSteps.label")}
      className={cn("glass rounded-full px-4 py-2.5", className)}
    >
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const isDone = done || i < idx;
          const isActive = !done && i === idx;
          return (
            <li key={s} className="flex items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isDone && "bg-sage-500 text-white",
                  isActive && "bg-primary text-primary-foreground",
                  !isDone && !isActive && "bg-white/60 text-ink-muted",
                )}
              >
                {isDone ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "ml-1.5 whitespace-nowrap text-xs font-medium",
                  isActive || isDone ? "text-petrol-700" : "text-ink-muted",
                )}
              >
                {t(`checkoutSteps.${s}`)}
              </span>
            </li>
          );
        })}
        {done ? (
          <li className="flex items-center">
            <span className="ml-1 whitespace-nowrap text-xs font-semibold text-petrol-700">
              · {t("checkoutSteps.complete")}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
