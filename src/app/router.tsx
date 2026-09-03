import { createBrowserRouter, Navigate } from "react-router";

import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  AssessmentStartPage,
  MedicalReviewFormPage,
  ResultPage,
  ReviewStatusPage,
} from "@/pages/assessment";
import {
  ChronicPainPage,
  GeneralWellnessPage,
  MigrainePage,
  SleepPage,
  StressAnxietyPage,
} from "@/pages/conditions";
import { ContactPage } from "@/pages/content";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { LegalPage } from "@/pages/legal/LegalPage";
import { CostsPage } from "@/pages/CostsPage";
import { FaqPage } from "@/pages/FaqPage";
import { LabTestsPage } from "@/pages/LabTestsPage";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import {
  DashboardAssessmentPage,
  DashboardFollowUpPage,
  DashboardHomePage,
  DashboardOrdersPage,
  DashboardProfilePage,
  DashboardRecommendationPage,
  DashboardSupportPage,
} from "@/pages/dashboard/pages";
import { CartPage } from "@/pages/shop/CartPage";
import { CheckoutPage } from "@/pages/shop/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/shop/OrderConfirmationPage";
import { ProductPage } from "@/pages/shop/ProductPage";
import { ShopIndexPage } from "@/pages/shop/ShopIndexPage";
import { SolutionRedirect } from "@/pages/shop/SolutionRedirect";

import { LEGACY_REDIRECTS, paths } from "./paths";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: paths.conditions.sleep, element: <SleepPage /> },
      { path: paths.conditions.pain, element: <ChronicPainPage /> },
      { path: paths.conditions.stressAnxiety, element: <StressAnxietyPage /> },
      { path: paths.conditions.migraine, element: <MigrainePage /> },
      { path: paths.conditions.generalWellness, element: <GeneralWellnessPage /> },

      // Old English slugs → new German slugs (SEO-FOUNDATION.md §C). SPA-level
      // redirect today; upgrade to host-level 301s before indexing (§G3).
      ...Object.entries(LEGACY_REDIRECTS).map(([from, to]) => ({
        path: from,
        element: <Navigate to={to} replace />,
      })),

      // Standalone "So funktioniert WeCare" page (PO decision A2). The
      // homepage still has its own "How it works" section (`#how-it-works`).
      { path: paths.howItWorks, element: <HowItWorksPage /> },
      { path: "/how-it-works", element: <Navigate to={paths.howItWorks} replace /> },
      { path: paths.faq, element: <FaqPage /> },
      { path: paths.costs, element: <CostsPage /> },

      { path: paths.assessment.start, element: <AssessmentStartPage /> },
      { path: paths.assessment.result, element: <ResultPage /> },
      { path: paths.assessment.medicalReview, element: <MedicalReviewFormPage /> },
      { path: paths.assessment.review, element: <ReviewStatusPage /> },

      { path: paths.solution, element: <SolutionRedirect /> },

      { path: paths.shop, element: <ShopIndexPage /> },
      { path: "/shop/:productId", element: <ProductPage /> },

      {
        path: paths.dashboard,
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: "assessment", element: <DashboardAssessmentPage /> },
          { path: "recommendation", element: <DashboardRecommendationPage /> },
          { path: "orders", element: <DashboardOrdersPage /> },
          { path: "follow-up", element: <DashboardFollowUpPage /> },
          { path: "support", element: <DashboardSupportPage /> },
          { path: "profile", element: <DashboardProfilePage /> },
          // Purchase flow — kept inside the app shell (no marketing chrome,
          // no funnel stepper). Old `/shop/*` URLs redirect here.
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order-confirmation", element: <OrderConfirmationPage /> },
        ],
      },

      { path: paths.login, element: <LoginPage mode="signIn" /> },
      { path: paths.signup, element: <LoginPage mode="signUp" /> },

      { path: paths.contact, element: <ContactPage /> },

      { path: paths.legal.imprint, element: <LegalPage doc="imprint" /> },
      { path: paths.legal.privacy, element: <LegalPage doc="privacy" /> },
      { path: paths.legal.terms, element: <LegalPage doc="terms" /> },
      { path: paths.legal.cookies, element: <LegalPage doc="cookies" /> },
      { path: paths.legal.shipping, element: <LegalPage doc="shipping" /> },
      { path: paths.legal.refunds, element: <LegalPage doc="refunds" /> },
      { path: paths.labTests, element: <LabTestsPage /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
