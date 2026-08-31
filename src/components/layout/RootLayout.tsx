import { Outlet, ScrollRestoration, useLocation } from "react-router";

import { paths } from "@/app/paths";
import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";
import { PageReveal } from "@/components/marketing/PageReveal";

import { ScrollToHash } from "./ScrollToHash";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** App shell: providers + gradient backdrop + header + routed page + footer. */
export function RootLayout() {
  // The homepage's final-CTA band sits flush above the footer (owner
  // request, Aug 2026 — same background, no gap) and supplies its own
  // rounded top edge, so the footer's own rounding is squared off there.
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;

  return (
    <Providers>
      <GradientBackdrop />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageReveal>
            <Outlet />
          </PageReveal>
        </main>
        <SiteFooter roundedTop={!isHome} />
        <ScrollRestoration />
        <ScrollToHash />
      </div>
    </Providers>
  );
}
