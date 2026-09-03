import { Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { useAuth } from "@/features/auth/AuthContext";

import { DashboardChrome } from "./DashboardChrome";
import { DASHBOARD_NAV, type DashboardNavItem } from "./nav";

function greetingKey(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

/** Trailing slash tolerant so `/dashboard/` behaves like `/dashboard`. */
function trimSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function matches(pathname: string, item: DashboardNavItem): boolean {
  const p = trimSlash(pathname);
  return item.end ? p === item.to : p === item.to || p.startsWith(`${item.to}/`);
}

/**
 * Route element for `/dashboard/*`: the auth guard + the section title, wrapped
 * in the shared `DashboardChrome` shell. The visual shell (sidebar, header row,
 * content column) lives in `DashboardChrome` so `RootLayout` can reuse it for
 * the funnel / shop pages a signed-in user reaches.
 */
export function DashboardLayout() {
  const { t } = useTranslation("dashboard");
  const { t: tShop } = useTranslation("shop");
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const here = trimSlash(location.pathname);
  const isHome = here === paths.dashboard;
  // The purchase-flow pages live under `/dashboard` but aren't nav items —
  // give them a header title of their own rather than the greeting fallback.
  const commerceTitle: string | undefined = {
    [paths.cart]: tShop("cart.title"),
    [paths.checkout]: tShop("checkout.title"),
    [paths.orderConfirmation]: tShop("confirmation.title"),
  }[here];

  usePageTitle(commerceTitle ?? t("title"), undefined, { noindex: true });

  if (!isAuthenticated) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{
          from: location.pathname,
          reason: here === paths.checkout ? "checkout" : undefined,
        }}
      />
    );
  }

  const displayName =
    user?.name?.split(" ")[0] || user?.name || user?.email?.split("@")[0] || "";
  const activeKey =
    DASHBOARD_NAV.find((n) => matches(location.pathname, n))?.key ?? "home";
  const headerTitle =
    commerceTitle ??
    (isHome
      ? t(`greeting.${greetingKey()}`, { name: displayName })
      : t(`nav.${activeKey}`));

  return (
    <DashboardChrome
      headerTitle={headerTitle}
      isHome={isHome}
      hideCartChip={Boolean(commerceTitle)}
    >
      <Outlet />
    </DashboardChrome>
  );
}
