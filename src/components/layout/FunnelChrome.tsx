import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Check, ShoppingBag } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/features/cart/CartContext";
import { useConsent } from "@/features/consent/useConsent";

export type FunnelStep = "questions" | "match" | "details" | "done";

const STEPS = ["questions", "match", "details"] as const;

/** Funnel column widths. `WIDE` is used by routes for which
 *  `isWideFunnelRoute` is true (the checkout); its page passes the same class
 *  to `PageShell` so header, progress bar and content line up. */
export const FUNNEL_MAX_W = "max-w-3xl";
export const FUNNEL_MAX_W_WIDE = "max-w-4xl";

/**
 * The thin progress line under the funnel header (owner request, 2026-09-24,
 * modelled on quick-green's onboarding). A step page reports how far through
 * its flow the visitor is (0–1) with `useFunnelProgress`; the line shows while
 * a value is set and disappears when the page unmounts. Pages that don't call
 * it (product, cart, checkout…) get no line.
 */
const FunnelProgressContext = createContext<(value: number | null) => void>(
  () => {},
);

export function useFunnelProgress(value: number | null): void {
  const setProgress = useContext(FunnelProgressContext);
  useEffect(() => {
    setProgress(value);
    return () => setProgress(null);
  }, [setProgress, value]);
}

/** Minimal legal footer for every funnel page (owner request, 2026-09-24):
 *  imprint, privacy, terms, contact, cookie settings + copyright. Deliberately
 *  no rating, payment logos or chat widget. Reuses the site footer's labels. */
function FunnelFooter({
  maxW,
  hideOnMobile,
}: {
  maxW: string;
  /** Hidden below `sm` — on the assessment steps a phone shows the sticky
   *  action bar as the last thing on the page, so the scroll ends there. */
  hideOnMobile: boolean;
}) {
  const { t } = useTranslation();
  const { reopen: reopenConsent } = useConsent();
  const link =
    "text-sm md:text-base text-ink-muted underline-offset-4 hover:text-ink hover:underline";
  return (
    <footer
      className={cn(
        "mt-10 border-t border-petrol-900/10",
        hideOnMobile && "hidden sm:block",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 pb-8 pt-6 text-center sm:px-6",
          maxW,
        )}
      >
        <nav aria-label={t("funnel.legalNav")}>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li>
              <Link to={paths.legal.imprint} className={link}>
                {t("footer.links.imprint")}
              </Link>
            </li>
            <li>
              <Link to={paths.legal.privacy} className={link}>
                {t("footer.links.privacy")}
              </Link>
            </li>
            <li>
              <Link to={paths.legal.terms} className={link}>
                {t("footer.links.terms")}
              </Link>
            </li>
            <li>
              <Link to={paths.contact} className={link}>
                {t("footer.links.contact")}
              </Link>
            </li>
            <li>
              <button type="button" onClick={reopenConsent} className={link}>
                {t("footer.links.cookieSettings")}
              </button>
            </li>
          </ul>
        </nav>
        <p className="mt-3 text-sm md:text-base text-ink-muted">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}

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
  wide = false,
  children,
}: {
  step: FunnelStep;
  /** Widen the logo row + progress bar to `FUNNEL_MAX_W_WIDE`. */
  wide?: boolean;
  children: ReactNode;
}) {
  const maxW = wide ? FUNNEL_MAX_W_WIDE : FUNNEL_MAX_W;
  const [progress, setProgress] = useState<number | null>(null);
  const pct = progress === null ? 0 : Math.round(progress * 100);
  const { t } = useTranslation();
  const done = step === "done";
  const activeIdx = done
    ? STEPS.length
    : STEPS.indexOf(step as (typeof STEPS)[number]);

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          "mx-auto flex w-full items-center justify-between px-4 py-5 sm:px-6",
          maxW,
        )}
      >
        <Link
          to={paths.home}
          aria-label={t("funnel.home")}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
        >
          <Logo className="h-5" />
        </Link>
        <CartLink />
      </header>

      {progress !== null ? (
        <div
          role="progressbar"
          aria-label={t("funnel.progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mb-4 h-[3px] w-full bg-petrol-600/15"
        >
          <div
            className="h-full rounded-r-full bg-petrol-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}

      <nav
        aria-label={t("funnel.label")}
        className={cn("mx-auto w-full px-4 sm:px-6", maxW)}
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

      <FunnelProgressContext.Provider value={setProgress}>
        {/* On the assessment steps a phone's <main> is a flex column, so the
            step's page can fill the screen height and pin its action bar to the
            very bottom even when the question is short (owner request,
            2026-09-24). From `sm` up it stays a normal block. */}
        <main
          id="main-content"
          className={cn(
            "flex-1",
            step === "questions" && "flex flex-col sm:block",
          )}
        >
          {children}
        </main>
      </FunnelProgressContext.Provider>

      <FunnelFooter maxW={maxW} hideOnMobile={step === "questions"} />
    </div>
  );
}
