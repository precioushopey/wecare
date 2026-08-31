import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";

import { cn } from "@/app/components/ui/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Route-transition motion: on every navigation the routed page fades in from
 * ~12px below (~450ms ease-out). Keyed off `pathname` only — a same-page hash
 * navigation (e.g. `/#how-it-works`) does not replay it; `Section` / `Reveal`
 * handle "scrolling to there". No-ops (renders shown) under reduced motion.
 */
export function PageReveal({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  // Remount on every path change so the enter animation starts from scratch
  // with no transition back down from the shown state.
  return <PageRevealFrame key={pathname}>{children}</PageRevealFrame>;
}

function PageRevealFrame({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(prefersReducedMotion);

  useEffect(() => {
    if (shown) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [shown]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-[450ms] ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {children}
    </div>
  );
}
