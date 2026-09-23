import {
  CalendarCheck,
  LayoutGrid,
  LifeBuoy,
  type LucideIcon,
  Package,
  UserRound,
} from "lucide-react";

import { paths } from "@/app/paths";

export interface DashboardNavItem {
  key: string;
  to: string;
  end: boolean;
  icon: LucideIcon;
  /** Shown in the desktop rail + mobile bottom tab bar (Overview · Orders ·
   *  Profile — Follow-up + Support are reached from Overview cards / Profile). */
  primary: boolean;
}

/** Single source of truth for the signed-in area's navigation — the desktop
 *  rail (`DashboardLayout`) and the mobile bottom tab bar (`DashboardTabBar`,
 *  rendered from `RootLayout` so it escapes `PageReveal`'s transform). */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { key: "home", to: paths.dashboard, end: true, icon: LayoutGrid, primary: true },
  { key: "orders", to: paths.dashboardOrders, end: false, icon: Package, primary: true },
  { key: "followUp", to: paths.dashboardFollowUp, end: false, icon: CalendarCheck, primary: false },
  { key: "support", to: paths.dashboardSupport, end: false, icon: LifeBuoy, primary: false },
  { key: "profile", to: paths.dashboardProfile, end: false, icon: UserRound, primary: true },
];

export const DASHBOARD_TABS = DASHBOARD_NAV.filter((n) => n.primary);
