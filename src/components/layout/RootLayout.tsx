import { Outlet, ScrollRestoration } from "react-router";

import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";
import { PageReveal } from "@/components/marketing/PageReveal";

import { ScrollToHash } from "./ScrollToHash";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** App shell: providers + gradient backdrop + header + routed page + footer. */
export function RootLayout() {
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
        <SiteFooter />
        <ScrollRestoration />
        <ScrollToHash />
      </div>
    </Providers>
  );
}
