import { usePageTitle } from "@/app/usePageTitle";
import {
  ChooseProblemSection,
  ComparisonSection,
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
      <FinalCtaSection />
      {/* Guided-vs-catalog comparison sits after the final CTA (owner
          decision) — a reinforcing "why WeCare" beat between the CTA and the
          FAQ, not a gate in front of it. */}
      <ComparisonSection />
      <FaqSection />
    </>
  );
}
