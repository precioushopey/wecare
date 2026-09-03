import { absoluteUrl, BRAND_NAME, orgLegalName, siteOrigin } from "./config";

/** Renders a JSON-LD block. Google reads `application/ld+json` from anywhere
 *  in the document, so an in-tree `<script>` is fine (no head portal needed).
 *  `<` is escaped so a stray `</script>` inside translated text can't break
 *  out of the tag. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Site-wide `WebSite` + (when a real legal name is configured) `Organization`.
 * Mount once, in the app shell. Conservative on purpose — no `MedicalClinic`,
 * `Physician`, `Review` or `AggregateRating` (docs/SEO-FOUNDATION.md §22).
 * The `Organization` block is **omitted entirely** until `VITE_ORG_LEGAL_NAME`
 * is set, so placeholder company data is never emitted.
 */
export function SiteStructuredData() {
  const origin = siteOrigin();
  const legalName = orgLegalName();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND_NAME,
          url: `${origin}/`,
          inLanguage: "de-AT",
        }}
      />
      {legalName ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: BRAND_NAME,
            legalName,
            url: `${origin}/`,
            logo: `${origin}/apple-touch-icon.png`,
          }}
        />
      ) : null}
    </>
  );
}

/** `BreadcrumbList` for a page. Pass the visible trail as `[label, path]`
 *  pairs, most general first (Home is added for you). */
export function BreadcrumbJsonLd({
  trail,
}: {
  trail: { name: string; path: string }[];
}) {
  const items = [{ name: BRAND_NAME, path: "/" }, ...trail];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

/** `FAQPage` — only for pages with a genuine visible Q&A block. `text` is an
 *  indexed claim: review it with the visible copy (SEO-FOUNDATION.md §H). */
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((qa) => ({
          "@type": "Question",
          name: qa.question,
          acceptedAnswer: { "@type": "Answer", text: qa.answer },
        })),
      }}
    />
  );
}
