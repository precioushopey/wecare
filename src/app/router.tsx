import { createBrowserRouter, Navigate } from "react-router";

import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  AssessmentStartPage,
  MedicalReviewPage,
  ResultPage,
} from "@/pages/assessment";
import {
  ChronicPainPage,
  GeneralWellnessPage,
  MigrainePage,
  SleepPage,
  StressAnxietyPage,
} from "@/pages/conditions";
import {
  AboutPage,
  CareersPage,
  ContactPage,
  KnowledgeHubPage,
  LegalPage,
  ProvidersPage,
} from "@/pages/content";
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
import { FoundationPreviewPage } from "@/pages/dev/FoundationPreviewPage";
import { CartPage } from "@/pages/shop/CartPage";
import { CheckoutPage } from "@/pages/shop/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/shop/OrderConfirmationPage";
import { ProductPage } from "@/pages/shop/ProductPage";
import { ShopIndexPage } from "@/pages/shop/ShopIndexPage";
import { SolutionRedirect } from "@/pages/shop/SolutionRedirect";

import { paths } from "./paths";

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

      // Redirects from the earlier /conditions/* slugs.
      {
        path: "/conditions/sleep-problems",
        element: <Navigate to={paths.conditions.sleep} replace />,
      },
      {
        path: "/conditions/chronic-pain",
        element: <Navigate to={paths.conditions.pain} replace />,
      },
      {
        path: "/conditions/stress-anxiety",
        element: <Navigate to={paths.conditions.stressAnxiety} replace />,
      },
      {
        path: "/conditions/migraine",
        element: <Navigate to={paths.conditions.migraine} replace />,
      },
      {
        path: "/conditions/general-wellness",
        element: <Navigate to={paths.conditions.generalWellness} replace />,
      },

      // "How It Works" is a homepage section now — redirect to its anchor.
      {
        path: paths.howItWorks,
        element: <Navigate to="/#how-it-works" replace />,
      },
      { path: paths.faq, element: <FaqPage /> },
      { path: paths.costs, element: <CostsPage /> },

      { path: paths.assessment.start, element: <AssessmentStartPage /> },
      { path: paths.assessment.result, element: <ResultPage /> },
      { path: paths.assessment.medicalReview, element: <MedicalReviewPage /> },

      { path: paths.solution, element: <SolutionRedirect /> },

      { path: paths.shop, element: <ShopIndexPage /> },
      { path: paths.cart, element: <CartPage /> },
      { path: paths.checkout, element: <CheckoutPage /> },
      { path: paths.orderConfirmation, element: <OrderConfirmationPage /> },
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
        ],
      },

      { path: paths.login, element: <LoginPage /> },

      { path: paths.about, element: <AboutPage /> },
      { path: paths.careers, element: <CareersPage /> },
      { path: paths.providers, element: <ProvidersPage /> },
      { path: paths.contact, element: <ContactPage /> },
      { path: paths.knowledgeHub, element: <KnowledgeHubPage /> },

      { path: paths.legal.imprint, element: <LegalPage doc="imprint" /> },
      { path: paths.legal.privacy, element: <LegalPage doc="privacy" /> },
      { path: paths.legal.terms, element: <LegalPage doc="terms" /> },
      { path: paths.legal.cookies, element: <LegalPage doc="cookies" /> },
      {
        path: paths.legal.productDisclaimer,
        element: <LegalPage doc="productDisclaimer" />,
      },
      { path: paths.legal.shipping, element: <LegalPage doc="shipping" /> },
      { path: paths.legal.refunds, element: <LegalPage doc="refunds" /> },
      { path: paths.labTests, element: <LabTestsPage /> },

      { path: paths.devTokens, element: <FoundationPreviewPage /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
