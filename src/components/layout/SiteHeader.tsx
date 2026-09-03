import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { Menu, ShoppingBag } from "lucide-react";

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
  "whitespace-nowrap text-sm font-medium text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-petrol-700";

function Wordmark() {
  const { t } = useTranslation();
  return (
    <Link to={paths.home} aria-label={t("brand.name")}>
      <Logo className="h-3.5" />
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
      <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-cta px-1 text-center font-mono text-[10px] leading-4 text-cta-foreground">
        {lineCount}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  // Signed in → "My area" (→ dashboard); signed out → separate "Log in" and
  // "Sign up" links (`/login` and `/signup`).
  const accountLinks = isAuthenticated
    ? [{ to: paths.dashboard, label: t("nav.myArea") }]
    : [
        { to: paths.login, label: t("nav.login") },
        { to: paths.signup, label: t("nav.signup") },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 px-4 shadow-[0_1px_0_0_rgba(255,255,255,0.6),0_10px_30px_-24px_rgba(13,68,75,0.35)] backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5">
          <Wordmark />
          <nav
            aria-label={t("nav.primary")}
            className="hidden min-w-0 overflow-x-auto [scrollbar-width:thin] lg:block"
          >
            <ul className="flex w-max items-center gap-5">
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
          {accountLinks.map((a) => (
            <NavLink key={a.to} to={a.to} className={navLink}>
              {a.label}
            </NavLink>
          ))}
          <Button asChild variant="cta" size="sm">
            <Link to={paths.assessment.start}>{t("nav.startAssessment")}</Link>
          </Button>
          <LanguageToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartLink />
          <LanguageToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("nav.openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-4/5 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav aria-label={t("nav.primary")} className="px-4">
                <ul className="flex flex-col gap-1">
                  {PRIMARY_NAV.map((item) => (
                    <li key={item.key}>
                      <SheetClose asChild>
                        <NavLink
                          to={item.to}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-sage-100 aria-[current=page]:bg-sage-100 aria-[current=page]:text-petrol-700"
                        >
                          {t(`nav.${item.key}`)}
                        </NavLink>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                {accountLinks.map((a) => (
                  <SheetClose key={a.to} asChild>
                    <Button asChild variant="outline" size="sm">
                      <Link to={a.to}>{a.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild variant="cta" size="sm">
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
