import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

import { cn } from "@/app/components/ui/utils";

/**
 * A small info icon that reveals a short hint on hover / keyboard focus — for
 * tucking non-essential helper copy (pricing caveats, quantity notes) out of
 * the main reading flow without losing it. CSS-only reveal, no tooltip lib;
 * the hint is a `role="tooltip"` linked to the trigger with `aria-describedby`
 * so assistive tech still announces it.
 */
export function InfoHint({
  children,
  label,
  align = "left",
  className,
}: {
  children: ReactNode;
  /** Accessible name for the icon button. Defaults to "More information". */
  label?: string;
  /** Which edge the bubble is anchored to (so it doesn't run off-screen). */
  align?: "left" | "right";
  className?: string;
}) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <span
      className={cn(
        "group relative inline-flex align-middle leading-none",
        className,
      )}
    >
      <button
        type="button"
        aria-label={label ?? t("a11y.moreInfo")}
        aria-describedby={id}
        className="inline-flex size-4 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-petrol-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600 focus-visible:ring-offset-1"
      >
        <Info className="size-4" aria-hidden />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-20 mt-2 w-56 rounded-xl bg-petrol-900 px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
