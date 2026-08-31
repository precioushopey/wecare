import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
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
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
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
          />
        </div>
        <Button type="submit" variant="cta" size="lg" className="w-full">
          {t("auth.signIn")}
        </Button>
      </form>

      <p className="mt-4 text-xs text-ink-muted">{t("auth.demoNote")}</p>
    </div>
  );
}
