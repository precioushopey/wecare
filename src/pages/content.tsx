import { PagePlaceholder } from "./PagePlaceholder";

/**
 * Content / trust pages (spec Section 4). Built out in their own passes.
 * "How It Works" now redirects to the homepage `#how-it-works` section, and
 * the FAQ has a real page (`src/pages/FaqPage.tsx`) — neither is here.
 */

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
