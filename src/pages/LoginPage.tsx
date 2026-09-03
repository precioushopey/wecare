import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
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
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const state = location.state as { from?: string; reason?: string } | null;
  const from = state?.from ?? paths.dashboard;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    // Any email signs in (mock auth) — but if a password was entered, its
    // confirmation must match (stakeholder feedback, Sept 2026).
    if (password !== passwordConfirm) {
      setMismatch(true);
      return;
    }
    signIn(email);
    navigate(from, { replace: true });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
      {/* Welcome image — a portrait cut-out held in a soft glow (`lg` and up
          only; on smaller screens the form stands alone, centred). */}
      <div className="hidden lg:flex lg:justify-center">
        <div className="image-glow relative">
          <ImageWithFallback
            src={siteImage(IMG.login)}
            alt=""
            width={713}
            height={972}
            className="image-fade-b block h-auto max-h-[34rem] w-auto max-w-full object-contain drop-shadow-[0_40px_64px_-32px_rgba(13,68,75,0.45)]"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md lg:mx-0">
        <h1>{t("auth.signInTitle")}</h1>
        <p className="mt-3 text-ink-muted">{t("auth.signInIntro")}</p>

        {state?.reason === "checkout" ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
            {t("auth.checkoutNote")}
          </p>
        ) : state?.from ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
            {t("auth.requiredNote")}
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
              autoFocus
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMismatch(false);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirm">{t("auth.passwordConfirm")}</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setMismatch(false);
              }}
              aria-invalid={mismatch || undefined}
            />
            {mismatch ? (
              <p className="text-sm text-danger-600">
                {t("auth.passwordMismatch")}
              </p>
            ) : null}
          </div>
          <Button type="submit" variant="cta" size="lg" className="w-full">
            {t("auth.signIn")}
          </Button>
        </form>

        {/* First-timers don't "sign up" — the assessment is the way in. */}
        <p className="mt-6 border-t border-border pt-5 text-sm text-ink-muted">
          {t("auth.newHere")}{" "}
          <Link
            to={paths.assessment.start}
            className="font-medium text-petrol-700 underline-offset-4 hover:underline"
          >
            {t("auth.newHereCta")}
          </Link>
        </p>
      </div>
    </div>
  );
}
