import { Outlet, ScrollRestoration } from "react-router";

import { Providers } from "@/app/Providers";
import { GradientBackdrop } from "@/components/marketing/GradientBackdrop";

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
          <Outlet />
        </main>
        <SiteFooter />
        <ScrollRestoration />
      </div>
    </Providers>
  );
}
