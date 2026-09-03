import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut, ShoppingBag } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";

import { DASHBOARD_TABS } from "./nav";
import { Avatar } from "./ui";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-petrol-600",
    isActive
      ? "bg-white/80 text-petrol-700 shadow-[0_4px_14px_-8px_rgba(13,68,75,0.3)]"
      : "text-ink-muted hover:bg-white/50 hover:text-ink",
  );

function CartChip({ count, label }: { count: number; label: string }) {
  return (
    <NavLink
      to={paths.cart}
      aria-label={`${label} (${count})`}
      className="glass glass-hover relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-petrol-600"
    >
      <ShoppingBag className="size-5" aria-hidden />
      <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-cta px-1 text-center font-mono text-[10px] leading-4 text-cta-foreground">
        {count}
      </span>
    </NavLink>
  );
}

/**
 * Account control on the desktop header's right side (owner request,
 * Sept 2026 — moved out of the sidebar's pinned footer). Shows the avatar
 * (plus name/email from `xl`) and drops a small menu holding the language
 * toggle + sign out. Desktop only — on mobile those live on the Profile tab.
 * Hand-rolled rather than pulling in `@radix-ui/react-dropdown-menu` for a
 * two-item menu; closes on outside pointer-down and Escape.
 */
function AccountMenu({
  name,
  email,
  className,
}: {
  name: string;
  email?: string;
  className?: string;
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-white/50 bg-white/40 py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-petrol-600"
      >
        <Avatar name={name} src={user?.avatarUrl} className="size-8" />
        <span className="hidden max-w-[11rem] flex-col text-left leading-tight xl:flex">
          <span className="truncate text-sm font-medium text-ink">{name}</span>
          {email ? (
            <span className="truncate text-xs text-ink-muted">{email}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="glass-strong absolute right-0 top-[calc(100%+0.5rem)] z-40 w-64 rounded-2xl border border-white/60 p-3 shadow-[var(--shadow-float)]"
        >
          {email ? (
            <p className="truncate px-1 pb-2 text-xs text-ink-muted xl:hidden">
              {email}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-medium text-ink-muted">
              {tCommon("language.label")}
            </span>
            <LanguageToggle />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-danger-700 outline-none transition-colors hover:bg-danger-50 focus-visible:ring-2 focus-visible:ring-petrol-600"
          >
            <LogOut className="size-4" aria-hidden />
            {t("profile.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The signed-in area's visual shell — a persistent frosted sidebar (desktop)
 * around a centred content column. Used two ways:
 *
 * - **`DashboardLayout`** (the `/dashboard/*` routes) passes `headerTitle` /
 *   `isHome` and gets the full chrome: the mobile app-bar + desktop header row
 *   with the section title and cart chip.
 * - **`RootLayout`** wraps the funnel / shop pages a *signed-in* user reaches
 *   (`/shop`, `/shop/:id`, `/assessment/*`) in `<DashboardChrome embed>` so
 *   they render inside the same shell instead of the marketing header/footer.
 *   Embed mode drops the header row (those pages own their headings) and keeps
 *   only a right-aligned cart chip when the cart has items.
 *
 * The floating bottom tab bar (`DashboardTabBar`) and `ConsentBanner` are
 * rendered from `RootLayout`, outside `PageReveal`'s transform, so their
 * `position: fixed` resolves against the viewport.
 */
export function DashboardChrome({
  children,
  headerTitle,
  isHome = false,
  embed = false,
  hideCartChip = false,
}: {
  children: ReactNode;
  headerTitle?: string;
  isHome?: boolean;
  embed?: boolean;
  /** Hide the header cart chip (e.g. on the cart / checkout pages themselves). */
  hideCartChip?: boolean;
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation();
  const { user } = useAuth();
  const { lineCount } = useCart();

  const displayName =
    user?.name?.split(" ")[0] || user?.name || user?.email?.split("@")[0] || "";
  const shopLabel = tCommon("footer.links.shop");

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

            {/* Account (avatar + name/email) and the language / sign-out menu
                moved to the content header's right side (owner request,
                Sept 2026) — the sidebar is now just the logo + section nav. */}
            <nav
              aria-label={t("tabsAria")}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <ul className="flex flex-col gap-1">
                {DASHBOARD_TABS.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={navLinkClass}
                    >
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
          </div>
        </aside>

        {/* ── Main column ─────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              // One content width for the whole signed-in area — every page's
              // top-level cards line up at the same edges (owner request,
              // Sept 2026). Below the `2xl` breakpoint the content fills the
              // column; from `2xl` up it caps at the `2xl` width (96rem) and
              // centres. Embed-wrapped funnel pages bring their own inner
              // max-width, so they keep the older narrower cap.
              "mx-auto w-full pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-16",
              embed
                ? "lg:max-w-5xl xl:max-w-6xl"
                : "px-4 sm:px-6 lg:px-8 2xl:max-w-[96rem]",
            )}
          >
            {embed ? (
              <div
                className={cn(
                  "items-center justify-end gap-3 px-4 pt-4 sm:px-6 lg:px-0 lg:pt-6",
                  lineCount > 0 ? "flex" : "hidden lg:flex",
                )}
              >
                {lineCount > 0 ? (
                  <CartChip count={lineCount} label={shopLabel} />
                ) : null}
                <AccountMenu
                  name={displayName}
                  email={user?.email}
                  className="hidden lg:block"
                />
              </div>
            ) : (
              <>
                {/* Mobile app-bar — sticky, frosted, full-bleed (hidden from `lg`). */}
                <header className="-mx-4 sticky top-0 z-30 border-b border-white/40 bg-white/70 px-4 pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6 lg:hidden">
                  <div className="flex items-center gap-3.5">
                    <NavLink
                      to={paths.dashboardProfile}
                      aria-label={t("nav.profile")}
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
                    >
                      <Avatar
                        name={displayName}
                        src={user?.avatarUrl}
                        className="size-11"
                      />
                    </NavLink>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petrol-600">
                        {t("title")}
                      </p>
                      <h1 className="truncate text-xl leading-tight">
                        {headerTitle}
                      </h1>
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
                  <div className="flex shrink-0 items-center gap-3">
                    {lineCount > 0 && !hideCartChip ? (
                      <CartChip count={lineCount} label={shopLabel} />
                    ) : null}
                    <AccountMenu name={displayName} email={user?.email} />
                  </div>
                </div>
              </>
            )}

            <div className={embed ? "mt-2" : "mt-7 lg:mt-8"}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
