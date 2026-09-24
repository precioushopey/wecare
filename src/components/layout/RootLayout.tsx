import { Outlet, ScrollRestoration, useLocation, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import {
  funnelStepFor,
  hasDashboardOrigin,
  isDashboardEmbeddableFunnelRoute,
  isFunnelRoute,
  isWideFunnelRoute,
  paths,
} from "@/app/paths";
import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";
import { PageReveal } from "@/components/marketing/PageReveal";
import { useAuth } from "@/features/auth/AuthContext";
import { DashboardChrome } from "@/pages/dashboard/DashboardChrome";
import { DashboardTabBar } from "@/pages/dashboard/DashboardTabBar";
import { SiteStructuredData } from "@/seo/StructuredData";

import { ConsentBanner } from "./ConsentBanner";
import { FunnelChrome } from "./FunnelChrome";
import { ScrollToHash } from "./ScrollToHash";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** App shell: providers + gradient backdrop + header + routed page + footer. */
export function RootLayout() {
  const { t } = useTranslation();

  return (
    <Providers>
      <SiteStructuredData />
      <a
        href="#main-content"
        className="sr-only rounded-md bg-surface px-4 py-2 text-sm md:text-base font-medium text-ink shadow-[var(--shadow-float)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        {t("a11y.skipToContent")}
      </a>
      <GradientBackdrop />
      <RoutedShell />
      <ConsentBanner />
    </Providers>
  );
}

/**
 * Chooses the chrome for the current route (must be inside the Router
 * context — it reads `useLocation`).
 *
 * - `/dashboard/*` → the route's own `DashboardLayout` supplies the shell.
 * - An informational funnel page (`isDashboardEmbeddableFunnelRoute` — a
 *   product page or the review-status page) reached from the dashboard
 *   (`?origin=dashboard`, signed-in only) → `DashboardChrome embed`, so
 *   browsing another Solution's details or checking your review never ejects
 *   a dashboard user into the standalone funnel (reported bug, 2026-09-23 —
 *   the "Also available" row and similar dashboard links used to hard-land
 *   on the funnel shell with no way back to the dashboard).
 * - Any other funnel route (`isFunnelRoute`) → `FunnelChrome`, for every
 *   visitor — this is still how a fresh assessment-to-checkout pass renders,
 *   signed in or not, and how `/cart` / `/checkout` / `/order-confirmation`
 *   always render (deliberately not embeddable, see
 *   `isDashboardEmbeddableFunnelRoute`'s comment).
 * - Everything else → the marketing header + footer.
 *
 * `DashboardTabBar` and `ConsentBanner` render outside `PageReveal` (whose
 * transform would trap their `position: fixed`).
 */
function RoutedShell() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const isHome = pathname === paths.home;
  const isDashboard =
    pathname === paths.dashboard || pathname.startsWith(`${paths.dashboard}/`);
  const dashboardOrigin =
    !isDashboard &&
    isAuthenticated &&
    isDashboardEmbeddableFunnelRoute(pathname) &&
    hasDashboardOrigin(searchParams);
  const funnel = !isDashboard && !dashboardOrigin && isFunnelRoute(pathname);
  const marketingChrome = !isDashboard && !dashboardOrigin && !funnel;

  if (dashboardOrigin) {
    return (
      <>
        <PageReveal>
          <DashboardChrome embed>
            <Outlet />
          </DashboardChrome>
        </PageReveal>
        <ScrollRestoration />
        <ScrollToHash />
        <DashboardTabBar />
      </>
    );
  }

  if (funnel) {
    return (
      <>
        <PageReveal>
          <FunnelChrome
            step={funnelStepFor(pathname)}
            wide={isWideFunnelRoute(pathname)}
          >
            <Outlet />
          </FunnelChrome>
        </PageReveal>
        <ScrollRestoration />
        <ScrollToHash />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {marketingChrome && <SiteHeader />}
        <main id="main-content" className="flex-1">
          <PageReveal>
            <Outlet />
          </PageReveal>
        </main>
        {marketingChrome && <SiteFooter roundedTop={!isHome} />}
        <ScrollRestoration />
        <ScrollToHash />
      </div>
      {isDashboard && <DashboardTabBar />}
    </>
  );
}
