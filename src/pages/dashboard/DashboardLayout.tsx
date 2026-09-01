import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { useAuth } from "@/features/auth/AuthContext";

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

export function DashboardLayout() {
  const { t } = useTranslation("dashboard");
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  usePageTitle(t("title"));

  if (!isAuthenticated) {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname }} />
    );
  }

  const displayName =
    user?.name?.split(" ")[0] ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "";
  const isHome = trimSlash(location.pathname) === paths.dashboard;
  const activeKey =
    DASHBOARD_NAV.find((n) => matches(location.pathname, n))?.key ?? "home";
  const headerTitle = isHome
    ? t(`greeting.${greetingKey()}`, { name: displayName })
    : t(`nav.${activeKey}`);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:pb-16">
      {/* App-bar. Sticky, frosted and full-bleed on mobile (it replaces the
          hidden site header); a plain greeting block from `lg` up. */}
      <header
        className={cn(
          "-mx-4 sticky top-0 z-30 border-b border-white/40 bg-white/70 px-4 pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150",
          "sm:-mx-6 sm:px-6",
          "dark:border-white/15 dark:bg-petrol-950/70",
          "lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-12 lg:backdrop-blur-none",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3.5">
          <NavLink
            to={paths.dashboardProfile}
            aria-label={t("nav.profile")}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
          >
            <Avatar name={displayName} className="size-11 lg:size-12" />
          </NavLink>
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petrol-600">
              {t("title")}
            </p>
            <h1 className="truncate text-xl leading-tight lg:text-3xl">
              {headerTitle}
            </h1>
          </div>
        </div>
        {isHome ? (
          <p className="mx-auto mt-1.5 max-w-6xl text-sm text-ink-muted lg:mt-2">
            {t("greeting.subtitle")}
          </p>
        ) : null}
      </header>

      <div className="mt-7 lg:mt-10 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        {/* Desktop rail — all seven areas. */}
        <aside className="hidden lg:block">
          <nav
            aria-label={t("tabsAria")}
            className="glass sticky top-24 rounded-2xl md:rounded-3xl p-2"
          >
            <ul className="flex flex-col gap-1">
              {DASHBOARD_NAV.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white/70 text-petrol-700 shadow-[0_4px_14px_-8px_rgba(13,68,75,0.3)] dark:bg-white/10"
                          : "text-ink-muted hover:bg-white/40 hover:text-ink dark:hover:bg-white/[0.06]",
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
