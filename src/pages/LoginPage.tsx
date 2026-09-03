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

type Mode = "signIn" | "signUp";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.25-1.84-3.2-2.09-3.9-2.12-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.27-.48 8.1 1.35 10.76.9 1.3 1.97 2.76 3.38 2.7 1.35-.05 1.87-.87 3.5-.87 1.63 0 2.1.87 3.53.85 1.46-.03 2.38-1.32 3.27-2.63 1.03-1.5 1.46-2.96 1.48-3.03-.03-.02-2.84-1.09-2.87-4.32ZM13.9 4.7c.74-.9 1.24-2.15 1.1-3.4-1.07.05-2.36.72-3.12 1.62-.68.79-1.28 2.06-1.12 3.27 1.19.1 2.4-.6 3.14-1.49Z" />
    </svg>
  );
}

/**
 * Auth screen. `/login` renders `mode="signIn"`, `/signup` renders
 * `mode="signUp"` — no on-page toggle; the header carries the two links.
 * Mock auth (any email; `signIn` ignores the password) — sign-up also
 * carries a display name onto the account.
 */
export function LoginPage({ mode = "signIn" }: { mode?: Mode }) {
  const { t } = useTranslation("dashboard");
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSignUp = mode === "signUp";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);

  usePageTitle(
    isSignUp ? t("auth.signUpTitle") : t("auth.signInTitle"),
    undefined,
    { noindex: true },
  );

  const state = location.state as { from?: string; reason?: string } | null;
  const from = state?.from ?? paths.dashboard;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    // Mock auth — any email is accepted. On sign-up the password confirmation
    // must match; the name is carried onto the account.
    if (isSignUp && password !== passwordConfirm) {
      setMismatch(true);
      return;
    }
    signIn(email, isSignUp ? name : undefined);
    navigate(from, { replace: true });
  }

  function continueWith(provider: "google" | "apple") {
    // No OAuth backend yet, so this runs through the same mock sign-in as the
    // email form. A real integration replaces this handler with the provider's
    // flow (Google Identity / Sign in with Apple) and the rest stays the same.
    signIn(
      provider === "google" ? "you@gmail.com" : "you@icloud.com",
      isSignUp ? name.trim() || undefined : undefined,
    );
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
        <h1>{isSignUp ? t("auth.signUpTitle") : t("auth.signInTitle")}</h1>
        <p className="mt-3 text-ink-muted">
          {isSignUp ? t("auth.signUpIntro") : t("auth.signInIntro")}
        </p>

        {state?.reason === "checkout" ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
            {t("auth.checkoutNote")}
          </p>
        ) : state?.from ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
            {t("auth.requiredNote")}
          </p>
        ) : null}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => continueWith("google")}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-[var(--shadow-soft)] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600 focus-visible:ring-offset-2"
          >
            <GoogleIcon className="size-5 shrink-0" />
            {t("auth.continueWithGoogle")}
          </button>
          <button
            type="button"
            onClick={() => continueWith("apple")}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600 focus-visible:ring-offset-2"
          >
            <AppleIcon className="size-5 shrink-0" />
            {t("auth.continueWithApple")}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
          <span className="h-px flex-1 bg-border" />
          {t("auth.orDivider")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isSignUp ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus={!isSignUp}
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
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMismatch(false);
              }}
            />
          </div>
          {isSignUp ? (
            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm">
                {t("auth.passwordConfirm")}
              </Label>
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
          ) : null}
          <Button type="submit" variant="cta" size="lg" className="w-full">
            {isSignUp ? t("auth.createAccount") : t("auth.signIn")}
          </Button>
        </form>

        {/* The assessment is still the main way in for first-timers. */}
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
