import { PagePlaceholder } from "./PagePlaceholder";

/** Content / trust pages (spec Section 4). Built out in their own passes. */

export function HowItWorksPage() {
  return (
    <PagePlaceholder
      titleKey="pages.howItWorks.title"
      descriptionKey="pages.howItWorks.description"
    />
  );
}

export function FaqPage() {
  return (
    <PagePlaceholder
      titleKey="pages.faq.title"
      descriptionKey="pages.faq.description"
    />
  );
}

export function AboutPage() {
  return (
    <PagePlaceholder
      titleKey="pages.about.title"
      descriptionKey="pages.about.description"
    />
  );
}

export function CareersPage() {
  return (
    <PagePlaceholder
      titleKey="pages.careers.title"
      descriptionKey="pages.careers.description"
    />
  );
}

export function ProvidersPage() {
  return (
    <PagePlaceholder
      titleKey="pages.providers.title"
      descriptionKey="pages.providers.description"
    />
  );
}

export function ContactPage() {
  return (
    <PagePlaceholder
      titleKey="pages.contact.title"
      descriptionKey="pages.contact.description"
    />
  );
}

export function KnowledgeHubPage() {
  return (
    <PagePlaceholder
      titleKey="pages.knowledgeHub.title"
      descriptionKey="pages.knowledgeHub.description"
    />
  );
}

type LegalDoc =
  | "imprint"
  | "privacy"
  | "terms"
  | "cookies"
  | "productDisclaimer"
  | "shipping"
  | "refunds";

/** One component for every /legal/* document (doc section 15). */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <PagePlaceholder
      titleKey={`pages.legal.${doc}.title`}
      descriptionKey={`pages.legal.${doc}.description`}
    />
  );
}
