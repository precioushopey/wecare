import { PagePlaceholder } from "./PagePlaceholder";

/**
 * Content / trust pages (spec Section 4). Built out in their own passes.
 * "How It Works" now redirects to the homepage `#how-it-works` section, and
 * the FAQ has a real page (`src/pages/FaqPage.tsx`) — neither is here.
 * About / Careers / For providers were removed (owner decision, Aug 2026) —
 * pure marketing filler with no real content and no other page linking to
 * them. Contact stays: it's still a live link target from the FAQ page and
 * the Dashboard Support page.
 */

export function ContactPage() {
  return (
    <PagePlaceholder
      titleKey="pages.contact.title"
      descriptionKey="pages.contact.description"
    />
  );
}

// The 7 /legal/* documents have real content — see src/pages/legal/LegalPage.tsx.
