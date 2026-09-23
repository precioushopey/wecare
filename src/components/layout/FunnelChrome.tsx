import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Check, ShoppingBag } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/features/cart/CartContext";

export type FunnelStep = "questions" | "match" | "details" | "done";

const STEPS = ["questions", "match", "details"] as const;

/** The funnel's only persistent way back to the cart — mirrors `SiteHeader`'s
 *  `CartLink` (marketing chrome, shown to anonymous/outside-funnel visitors),
 *  which this funnel shell otherwise has no equivalent of. Hidden on `/cart`
 *  itself (no point linking to the page you're already on) and when empty. */
function CartLink() {
  const { t } = useTranslation();
  const { lineCount } = useCart();
  const { pathname } = useLocation();
  if (lineCount === 0 || pathname === paths.cart) return null;
  return (
    <Link
      to={paths.cart}
      aria-label={`${t("funnel.cart")} (${lineCount})`}
      className="relative inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
    >
      <ShoppingBag className="size-5" aria-hidden />
      <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-cta px-1 text-center font-mono text-sm md:text-base leading-4 text-cta-foreground">
        {lineCount}
      </span>
    </Link>
  );
}

/**
 * The standalone purchase-funnel shell (funnel re-sequence, 2026-09-08).
 * Logo + a quiet 4-step progress bar + a centered content column. No marketing
 * nav, no dashboard sidebar, no bottom tab bar — for every visitor. Replaces
 * the marketing header/footer and the embedded dashboard shell on the funnel
 * routes (`isFunnelRoute` in src/app/paths.ts).
 */
export function FunnelChrome({
  step,
  children,
}: {
  step: FunnelStep;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const done = step === "done";
  const activeIdx = done
    ? STEPS.length
    : STEPS.indexOf(step as (typeof STEPS)[number]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          to={paths.home}
          aria-label={t("funnel.home")}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
        >
          <Logo className="h-5" />
        </Link>
        <CartLink />
      </header>

      <nav
        aria-label={t("funnel.label")}
        className="mx-auto w-full max-w-3xl px-4 sm:px-6"
      >
        <ol className="glass flex items-center justify-between gap-1 rounded-full px-4 py-2.5">
          {STEPS.map((s, i) => {
            const isDone = done || i < activeIdx;
            const isActive = !done && i === activeIdx;
            return (
              <li key={s} className="flex items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-sm md:text-base font-semibold",
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
                    "ml-1.5 whitespace-nowrap text-sm md:text-base font-medium",
                    isActive || isDone ? "text-petrol-700" : "text-ink-muted",
                  )}
                >
                  {t(`funnel.steps.${s}`)}
                </span>
              </li>
            );
          })}
          {done ? (
            <li className="flex items-center">
              <span className="ml-1 whitespace-nowrap text-sm md:text-base font-semibold text-petrol-700">
                · {t("funnel.steps.done")}
              </span>
            </li>
          ) : null}
        </ol>
      </nav>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
