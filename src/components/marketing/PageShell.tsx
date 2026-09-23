import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

/**
 * The shared narrow-content wrapper used by every standalone content /
 * guided-journey page (`mx-auto max-w-3xl px-4 py-14 sm:px-6`) — CLAUDE.md's
 * "one content width for the whole experience" rule, extracted so it's one
 * component instead of the same className string copy-pasted per page.
 * `maxWidth`/`className` cover the couple of pages that deliberately differ
 * (Contact's narrower `max-w-2xl`, 404's taller `py-24`).
 */
export function PageShell({
  children,
  maxWidth = "max-w-3xl",
  className,
}: {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto px-4 py-14 sm:px-6", maxWidth, className)}>
      {children}
    </div>
  );
}
