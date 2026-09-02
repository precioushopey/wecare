import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { LogOut, ShoppingBag } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { Logo } from "@/components/brand/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";

import { DASHBOARD_NAV, type DashboardNavItem } from "./nav";
import { Avatar } from "./ui";

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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-petrol-600",
    isActive
      ? "bg-white/80 text-petrol-700 shadow-[0_4px_14px_-8px_rgba(13,68,75,0.3)]"
      : "text-ink-muted hover:bg-white/50 hover:text-ink",
  );

/**
 * Signed-in area shell. The dashboard is self-contained — `RootLayout` renders
 * no marketing header or footer here.
 *
 * - **Desktop (`lg+`)**: a persistent frosted sidebar anchored to the left edge
 *   (logo · the seven areas · user block + sign-out + language), with the page
 *   content scrolling beside it.
 * - **Mobile (`< lg`)**: the sidebar is hidden; a sticky frosted app-bar carries
 *   the greeting / section title, and `DashboardTabBar` (rendered from
 *   `RootLayout` so its `position: fixed` escapes `PageReveal`'s transform)
 *   floats the five primary areas at the bottom.
 */
export function DashboardLayout() {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation();
  const { isAuthenticated, user, signOut } = useAuth();
  const { lineCount } = useCart();
  const location = useLocation();
  usePageTitle(t("title"));

  if (!isAuthenticated) {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname }} />
    );
  }

  const displayName =
    user?.name?.split(" ")[0] || user?.name || user?.email?.split("@")[0] || "";
  const isHome = trimSlash(location.pathname) === paths.dashboard;
  const activeKey =
    DASHBOARD_NAV.find((n) => matches(location.pathname, n))?.key ?? "home";
  const headerTitle = isHome
    ? t(`greeting.${greetingKey()}`, { name: displayName })
    : t(`nav.${activeKey}`);

  return (
    <div className="lg:p-4">
      {/* One floating panel holds the whole signed-in area (sidebar + content),
          the way the supplied dashboard references frame it. Not `overflow-
          hidden` — that would break the sticky sidebar. */}
      <div className="lg:flex lg:rounded-[1.75rem] lg:border lg:border-white/50 lg:bg-white/35 lg:shadow-[var(--shadow-float)]">
        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside className="hidden lg:flex lg:w-[248px] lg:shrink-0 lg:flex-col lg:border-r lg:border-white/40">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-6 p-4">
          <NavLink
            to={paths.dashboard}
            aria-label={t("title")}
            className="rounded-lg px-2 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
          >
            <Logo className="h-4" />
          </NavLink>

          <nav
            aria-label={t("tabsAria")}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <ul className="flex flex-col gap-1">
              {DASHBOARD_NAV.map((item) => (
                <li key={item.key}>
                  <NavLink to={item.to} end={item.end} className={navLinkClass}>
                    <item.icon
                      className="size-[1.15rem] shrink-0"
                      strokeWidth={1.75}
                    />
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 border-t border-white/50 pt-4">
            <NavLink
              to={paths.dashboardProfile}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 outline-none transition-colors hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-petrol-600"
            >
              <Avatar name={displayName} className="size-9" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-ink-muted">
                  {user?.email}
                </span>
              </span>
            </NavLink>
            <div className="flex items-center justify-between gap-2 px-1">
              <LanguageToggle />
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-danger-700 outline-none transition-colors hover:bg-danger-50 focus-visible:ring-2 focus-visible:ring-petrol-600"
              >
                <LogOut className="size-4" aria-hidden />
                {t("profile.signOut")}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:max-w-5xl lg:px-10 lg:pb-16 xl:max-w-6xl">
          {/* Mobile app-bar — sticky, frosted, full-bleed (hidden from `lg`). */}
          <header className="-mx-4 sticky top-0 z-30 border-b border-white/40 bg-white/70 px-4 pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center gap-3.5">
              <NavLink
                to={paths.dashboardProfile}
                aria-label={t("nav.profile")}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
              >
                <Avatar name={displayName} className="size-11" />
              </NavLink>
              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petrol-600">
                  {t("title")}
                </p>
                <h1 className="truncate text-xl leading-tight">{headerTitle}</h1>
              </div>
            </div>
            {isHome ? (
              <p className="mt-1.5 text-sm text-ink-muted">
                {t("greeting.subtitle")}
              </p>
            ) : null}
          </header>

          {/* Desktop page header (hidden below `lg`). */}
          <div className="hidden items-start justify-between gap-4 pt-8 lg:flex">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petrol-600">
                {t("title")}
              </p>
              <h1 className="mt-1 truncate text-2xl leading-tight lg:text-3xl">
                {headerTitle}
              </h1>
              {isHome ? (
                <p className="mt-2 text-sm text-ink-muted">
                  {t("greeting.subtitle")}
                </p>
              ) : null}
            </div>
            {lineCount > 0 ? (
              <NavLink
                to={paths.cart}
                aria-label={`${tCommon("footer.links.shop")} (${lineCount})`}
                className="glass glass-hover relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-petrol-600"
              >
                <ShoppingBag className="size-5" aria-hidden />
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-cta px-1 text-center font-mono text-[10px] leading-4 text-cta-foreground">
                  {lineCount}
                </span>
              </NavLink>
            ) : null}
          </div>

          <div className="mt-7 lg:mt-8">
            <Outlet />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
