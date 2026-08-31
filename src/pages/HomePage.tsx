import { usePageTitle } from "@/app/usePageTitle";
import {
  ChooseProblemSection,
  ComparisonSection,
  DeliveryBannerSection,
  FaqSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  SolutionsPreviewSection,
  TrustSection,
} from "./home/sections";

/** Homepage (spec Section 5). Problem-first throughout; medical layer appears
 *  only inside "How WeCare Works", framed as conditional. */
export function HomePage() {
  usePageTitle();

  return (
    <>
      <HeroSection />
      <ChooseProblemSection />
      <SolutionsPreviewSection />
      <TrustSection />
      {/* Process explainer sits just before the final CTA; "How It Works" is
          still absent from the primary nav (see PRIMARY_NAV in app/paths.ts),
          and /how-it-works redirects to this section's #how-it-works anchor. */}
      <HowItWorksSection />
      {/* "So customers see WeCare's reach" (owner request, Aug 2026) — a
          delivery-coverage section with an Austria map + city pins, right
          after How It Works. */}
      <DeliveryBannerSection />
      {/* Guided-vs-catalog comparison, then the curated FAQ — a "why WeCare"
          beat leading into the last objections before the big ask. */}
      <ComparisonSection />
      <FaqSection />
      {/* Final CTA moved to the very end (owner decision, Aug 2026) — the
          close, right before the footer, after every other section has made
          its case. */}
      <FinalCtaSection />
    </>
  );
}
