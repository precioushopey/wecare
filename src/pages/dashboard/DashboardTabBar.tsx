import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";

import { DASHBOARD_TABS } from "./nav";

/**
 * Mobile bottom tab bar for the signed-in area — a floating frosted pill.
 * Rendered from `RootLayout` (not `DashboardLayout`) so its `position: fixed`
 * resolves against the viewport rather than `PageReveal`'s transformed box.
 * Hidden from `lg` up, where the left rail takes over.
 */
export function DashboardTabBar() {
  const { t } = useTranslation("dashboard");

  return (
    <nav
      aria-label={t("tabsAria")}
      className="fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden"
    >
      <ul className="glass-strong mx-auto mb-[calc(0.5rem+env(safe-area-inset-bottom))] flex max-w-md items-stretch gap-0.5 rounded-full p-1.5 shadow-[var(--shadow-float)]">
        {DASHBOARD_TABS.map((item) => (
          <li key={item.key} className="min-w-0 flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-full px-1 text-center transition-colors",
                  isActive
                    ? "bg-white/80 text-petrol-700 shadow-[0_4px_14px_-8px_rgba(13,68,75,0.35)]"
                    : "text-ink-muted hover:text-ink",
                )
              }
            >
              <item.icon className="size-5 shrink-0" strokeWidth={1.75} />
              <span className="w-full truncate text-[0.6rem] font-medium leading-none tracking-tight">
                {t(`tabs.${item.key}`)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
