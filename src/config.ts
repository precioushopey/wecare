/**
 * Provisional, obviously-placeholder configuration. Swap every value here for
 * the real registered details before launch (see also the /legal/* documents
 * and DESIGN-SPECIFICATION.md open questions).
 */

/** Support inbox surfaced on the Contact and Support pages. */
export const SUPPORT_EMAIL = "support@wecare.example";

/** Canonical origin — used for the sitemap and share metadata at launch. */
export const SITE_ORIGIN = "https://wecare.example";

/**
 * Owner decision D6 — the per-gram prices in `src/data/solutions.ts` are
 * placeholders and must come from the real dispensing pharmacy. While this is
 * `false`, every price in the UI is labelled "indicative, confirmed after your
 * medical review" so nothing fake is presented as final. Flip to `true` only
 * once real, pharmacy-sourced prices are in place.
 */
export const PRICES_CONFIRMED = false;
