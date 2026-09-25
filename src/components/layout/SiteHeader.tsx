import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { Menu, PackageSearch, ShoppingBag } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import { PRIMARY_NAV, paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";

import { LanguageToggle } from "./LanguageToggle";

const navLink =
  "whitespace-nowrap text-sm md:text-base font-medium text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-petrol-700";

function Wordmark() {
  const { t } = useTranslation();
  return (
    <Link to={paths.home} aria-label={t("brand.name")}>
      <Logo className="h-5" />
    </Link>
  );
}

function CartLink() {
  const { t } = useTranslation();
  const { lineCount } = useCart();
  if (lineCount === 0) return null;
  return (
    <Link
      to={paths.cart}
      aria-label={`${t("footer.links.shop")} (${lineCount})`}
      className="relative inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
    >
      <ShoppingBag className="size-5" aria-hidden />
      <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-cta px-1 text-center font-mono text-sm md:text-base leading-4 text-cta-foreground">
        {lineCount}
      </span>
    </Link>
  );
}

/**
 * One icon for the signed-out state, linking straight to `/login`. That is the
 * SMS "track your order" sign-in now (2026-09-25): there is no separate sign-up
 * (an account is created by ordering) and `/signup` redirects to `/login`, so
 * the earlier "Log in" / "Create account" split is gone. The icon is a package
 * with a magnifier, not a person, and the link is named to match (owner
 * request: "since it's for tracking").
 */
function AccountAuthMenu() {
  const { t } = useTranslation();
  return (
    <Link
      to={paths.login}
      aria-label={t("nav.trackOrder")}
      title={t("nav.trackOrder")}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
    >
      <PackageSearch className="size-5" aria-hidden />
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 px-4 shadow-[0_1px_0_0_rgba(255,255,255,0.6),0_10px_30px_-24px_rgba(13,68,75,0.35)] backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-6">
          <Wordmark />
          <nav
            aria-label={t("nav.primary")}
            className="hidden min-w-0 overflow-x-auto [scrollbar-width:thin] lg:block"
          >
            <ul className="flex w-max items-end gap-6">
              {PRIMARY_NAV.map((item) => (
                <li key={item.key}>
                  <NavLink to={item.to} className={navLink}>
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <CartLink />
          {isAuthenticated ? (
            <NavLink to={paths.dashboard} className={navLink}>
              {t("nav.myArea")}
            </NavLink>
          ) : (
            <AccountAuthMenu />
          )}
          <LanguageToggle />
          <Button asChild variant="cta">
            <Link to={paths.assessment.start}>{t("nav.startAssessment")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartLink />
          <LanguageToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" aria-label={t("nav.openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-4/5 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <Logo className="h-5" />
                </SheetTitle>
              </SheetHeader>

              <nav aria-label={t("nav.primary")} className="px-4">
                <ul className="flex flex-col gap-1">
                  {PRIMARY_NAV.map((item) => (
                    <li key={item.key}>
                      <SheetClose asChild>
                        <NavLink
                          to={item.to}
                          className="block rounded-md px-3 py-2 text-sm md:text-base font-medium text-ink transition-colors hover:bg-sage-100 aria-[current=page]:bg-sage-100 aria-[current=page]:text-petrol-700"
                        >
                          {t(`nav.${item.key}`)}
                        </NavLink>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <Link to={paths.dashboard}>
                        {t("nav.myArea")}
                      </Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <Link to={paths.login}>
                        <PackageSearch className="size-4" aria-hidden />
                        {t("nav.trackOrder")}
                      </Link>
                    </Button>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Button asChild variant="cta">
                    <Link to={paths.assessment.start}>
                      {t("nav.startAssessment")}
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
