import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

/**
 * Small frosted pill that floats over hero / CTA imagery to surface one
 * concrete proof point ("about 60–90 seconds", "1–2 matched solutions").
 * `dark` tone sits on the deep-gradient surfaces (final CTA, footer band).
 */
export function FloatingChip({
  children,
  icon,
  tone = "light",
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium backdrop-blur-md",
        "shadow-[0_12px_32px_-14px_rgba(13,68,75,0.4)]",
        tone === "light"
          ? "bg-white/70 text-ink ring-1 ring-white/70"
          : "bg-white/10 text-white ring-1 ring-white/25",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "shrink-0",
            tone === "light" ? "text-petrol-600" : "text-sage-200",
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
