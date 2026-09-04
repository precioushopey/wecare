/**
 * SEO configuration seam. All values come from build-time `VITE_*` env vars
 * (see `.env.example`) with safe, obviously-provisional fallbacks.
 *
 * The whole public site stays **noindex** until `VITE_SEO_INDEXABLE=true` is
 * set in production AND Product Owner + Austrian legal launch approval exists
 * (see docs/SEO-FOUNDATION.md §4). Do not flip this without that approval.
 */

const PLACEHOLDER_ORIGIN = "https://wecare.example";

/** Real production origin, e.g. `https://wecare.at`. Placeholder until D20. */
export function siteOrigin(): string {
  const v = import.meta.env?.VITE_SITE_ORIGIN;
  return typeof v === "string" && v.length > 0 ? v.replace(/\/$/, "") : PLACEHOLDER_ORIGIN;
}

/** True only when the site has been cleared for indexing. Default: false. */
export function seoIndexable(): boolean {
  return import.meta.env?.VITE_SEO_INDEXABLE === "true" && !isPlaceholderOrigin();
}

export function isPlaceholderOrigin(): boolean {
  return siteOrigin() === PLACEHOLDER_ORIGIN;
}

/** Registered legal name for `Organization` schema. Empty → the block is
 *  omitted (never index placeholder company data — SEO-FOUNDATION.md §H). */
export function orgLegalName(): string {
  const v = import.meta.env?.VITE_ORG_LEGAL_NAME;
  return typeof v === "string" ? v.trim() : "";
}

/** Public brand name — always safe to emit. */
export const BRAND_NAME = "WeCare";

/** Default share image (1200×630 branded banner, `public/banner.jpg`). Only
 *  emitted once `seoIndexable()` — see `usePageTitle.ts`. */
export const OG_IMAGE_PATH = "/banner.jpg";

/** Absolute URL for a path, canonical form: no query, no hash, no trailing
 *  slash except the root. */
export function absoluteUrl(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0];
  const trimmed = clean !== "/" ? clean.replace(/\/$/, "") : "/";
  return `${siteOrigin()}${trimmed}`;
}

/** `content` value for `<meta name="robots">`:
 *  - not indexable at all (env off / placeholder origin) → noindex, nofollow
 *  - indexable site, page opted out → noindex, follow
 *  - indexable site, public page → index, follow */
export function robotsContent(pageNoindex: boolean): string {
  if (!seoIndexable()) return "noindex, nofollow";
  return pageNoindex ? "noindex, follow" : "index, follow";
}
