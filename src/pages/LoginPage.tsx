import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { IMG, siteImage } from "@/data/siteImages";
import { useAuth } from "@/features/auth/AuthContext";
import { PhoneVerification } from "@/pages/shop/PhoneVerification";

/**
 * "Track your order" — the sign-in screen (owner request, 2026-09-25).
 *
 * Checkout creates the customer's account from an SMS-verified mobile number
 * with no password (changes-matrix, 2026-09-24), so this screen signs in the same
 * way: the mobile number ordered with, a 6-digit code, then straight on to My
 * orders (or wherever the visitor was headed: `state.from`). No email, no
 * password, no Google / Apple, and no separate "create account" screen: an
 * account is created by ordering, and `/signup` redirects here.
 *
 * The code step is the checkout's own `PhoneVerification` block and its seam
 * (`features/phone/verification.ts`), so it shares that block's preview mode: no
 * SMS is sent until a provider is wired (`PHONE_VERIFICATION_LIVE`), and it says
 * so. MOCK auth: with no server there is no account lookup, so a phone sign-in
 * starts an empty session — real order tracking (phone -> account -> orders)
 * needs the backend.
 */
export function LoginPage() {
  const { t } = useTranslation("dashboard");
  const { isAuthenticated, signInWithPhone } = useAuth();
  const location = useLocation();

  usePageTitle(t("auth.signInTitle"), undefined, { noindex: true });

  const state = location.state as { from?: string } | null;
  const from = state?.from ?? paths.dashboardOrders;

  // Signing in flips `isAuthenticated`, and this redirect does the navigation.
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
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

        {state?.from ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm md:text-base text-petrol-700">
            {t("auth.requiredNote")}
          </p>
        ) : null}

        <div className="mt-6">
          <PhoneVerification
            verifiedPhone={null}
            onVerified={signInWithPhone}
            onReset={() => {}}
            heading={t("auth.phoneLegend")}
            headingHidden
            intro={null}
            trackEvents={false}
          />
        </div>

        <p className="mt-6 border-t border-border pt-5 text-sm md:text-base text-ink-muted">
          {t("auth.newHere")}{" "}
          <Link
            to={paths.assessment.start}
            className="font-medium text-petrol-700 underline-offset-4 hover:underline"
          >
            {t("auth.startAssessment")}
          </Link>
        </p>
      </div>
    </div>
  );
}
