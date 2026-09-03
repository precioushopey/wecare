import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { isAppShellRoute, paths } from "@/app/paths";
import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";
import { PageReveal } from "@/components/marketing/PageReveal";
import { useAuth } from "@/features/auth/AuthContext";
import { DashboardChrome } from "@/pages/dashboard/DashboardChrome";
import { DashboardTabBar } from "@/pages/dashboard/DashboardTabBar";
import { SiteStructuredData } from "@/seo/StructuredData";

import { ConsentBanner } from "./ConsentBanner";
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
        className="sr-only rounded-md bg-surface px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-float)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
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
 * Chooses the chrome for the current route. Must live inside `<Providers>` so
 * it can read auth state.
 *
 * - `/dashboard/*` → no marketing header/footer; the route's own
 *   `DashboardLayout` supplies the shell.
 * - A funnel / shop route (`isAppShellRoute`) **while signed in** → wrapped in
 *   `DashboardChrome embed`, so the guided journey stays inside the app shell.
 * - Everything else → the marketing header + footer.
 *
 * `DashboardTabBar` and `ConsentBanner` are rendered outside `PageReveal`
 * (whose transform would trap their `position: fixed`).
 */
function RoutedShell() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const isHome = pathname === paths.home;
  const isDashboard =
    pathname === paths.dashboard || pathname.startsWith(`${paths.dashboard}/`);
  const appShell = !isDashboard && isAuthenticated && isAppShellRoute(pathname);
  const marketingChrome = !isDashboard && !appShell;

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {marketingChrome && <SiteHeader />}
        <main id="main-content" className="flex-1">
          <PageReveal>
            {appShell ? (
              <DashboardChrome embed>
                <Outlet />
              </DashboardChrome>
            ) : (
              <Outlet />
            )}
          </PageReveal>
        </main>
        {marketingChrome && <SiteFooter roundedTop={!isHome} />}
        <ScrollRestoration />
        <ScrollToHash />
      </div>
      {(isDashboard || appShell) && <DashboardTabBar />}
    </>
  );
}
