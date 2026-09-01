import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { paths } from "@/app/paths";
import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";
import { PageReveal } from "@/components/marketing/PageReveal";
import { DashboardTabBar } from "@/pages/dashboard/DashboardTabBar";

import { ConsentBanner } from "./ConsentBanner";
import { ScrollToHash } from "./ScrollToHash";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** App shell: providers + gradient backdrop + header + routed page + footer. */
export function RootLayout() {
  const { t } = useTranslation();
  // The homepage's final-CTA band sits flush above the footer (owner
  // request, Aug 2026 — same background, no gap) and supplies its own
  // rounded top edge, so the footer's own rounding is squared off there.
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;
  // The signed-in area is a mobile-first "app" surface (owner request,
  // Sept 2026): no marketing footer at all, and on mobile the site header
  // gives way to the dashboard's own app-bar + bottom tab bar. The site
  // header stays on desktop so the brand nav / "start assessment" remain
  // one click away.
  const isDashboard =
    pathname === paths.dashboard || pathname.startsWith(`${paths.dashboard}/`);

  return (
    <Providers>
      <a
        href="#main-content"
        className="sr-only rounded-md bg-surface px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-float)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        {t("a11y.skipToContent")}
      </a>
      <GradientBackdrop />
      <div className="flex min-h-screen flex-col">
        <SiteHeader hideOnMobile={isDashboard} />
        <main id="main-content" className="flex-1">
          <PageReveal>
            <Outlet />
          </PageReveal>
        </main>
        {!isDashboard && <SiteFooter roundedTop={!isHome} />}
        <ScrollRestoration />
        <ScrollToHash />
      </div>
      {/* Fixed chrome lives outside the scroll column and outside PageReveal
          (whose transform would trap `position: fixed`). */}
      {isDashboard && <DashboardTabBar />}
      <ConsentBanner />
    </Providers>
  );
}
