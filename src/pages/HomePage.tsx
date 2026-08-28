import { usePageTitle } from "@/app/usePageTitle";
import {
  ChooseProblemSection,
  ComparisonSection,
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
      <ComparisonSection />
      <FinalCtaSection />
      {/* Explainer moved below the final CTA; "How It Works" is no longer in
          the primary nav (see PRIMARY_NAV in app/paths.ts). */}
      <HowItWorksSection />
    </>
  );
}
