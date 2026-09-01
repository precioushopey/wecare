import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { IMG, siteImage } from "@/data/siteImages";
import { useAuth } from "@/features/auth/AuthContext";

export function LoginPage() {
  const { t } = useTranslation("dashboard");
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle(t("auth.signInTitle"));

  const [email, setEmail] = useState("");
  const state = location.state as { from?: string; reason?: string } | null;
  const from = state?.from ?? paths.dashboard;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    signIn(email);
    navigate(from, { replace: true });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
      {/* Welcome image — lg and up only; on smaller screens the form stands
          alone (centred, as before). */}
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-4xl shadow-[var(--shadow-float)]">
          <ImageWithFallback
            src={siteImage(IMG.login)}
            alt=""
            width={1000}
            height={1080}
            className="h-full max-h-[34rem] w-full object-cover object-center dark:brightness-90 dark:contrast-[1.03]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a2c42]/40 to-transparent"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md lg:mx-0">
        <h1>{t("auth.signInTitle")}</h1>
        <p className="mt-3 text-ink-muted">{t("auth.signInIntro")}</p>

        {state?.reason === "checkout" ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700 dark:bg-petrol-900/50">
            {t("auth.checkoutNote")}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" variant="cta" size="lg" className="w-full">
            {t("auth.signIn")}
          </Button>
        </form>

        <p className="mt-4 text-xs text-ink-muted">{t("auth.demoNote")}</p>
      </div>
    </div>
  );
}
