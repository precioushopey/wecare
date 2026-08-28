import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { useAuth } from "@/features/auth/AuthContext";

const NAV = [
  { key: "home", to: paths.dashboard, end: true },
  { key: "assessment", to: paths.dashboardAssessment, end: false },
  { key: "recommendation", to: paths.dashboardRecommendation, end: false },
  { key: "orders", to: paths.dashboardOrders, end: false },
  { key: "followUp", to: paths.dashboardFollowUp, end: false },
  { key: "support", to: paths.dashboardSupport, end: false },
  { key: "profile", to: paths.dashboardProfile, end: false },
] as const;

function greetingKey(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
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

  const firstName = user?.name.split(" ")[0] ?? user?.name ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="space-y-1">
        <h1>{t(`greeting.${greetingKey()}`, { name: firstName })}</h1>
        <p className="text-ink-muted">{t("greeting.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside>
          <nav className="glass sticky top-24 rounded-3xl p-2">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white/70 text-petrol-700 shadow-[0_4px_14px_-8px_rgba(13,68,75,0.3)]"
                          : "text-ink-muted hover:bg-white/40 hover:text-ink",
                      )
                    }
                  >
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
