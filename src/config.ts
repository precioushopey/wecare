/**
 * Provisional, obviously-placeholder configuration. Swap every value here for
 * the real registered details before launch (see also the /legal/* documents
 * and DESIGN-SPECIFICATION.md open questions).
 */

/** Support inbox surfaced on the Contact and Support pages. */
export const SUPPORT_EMAIL = "support@wecare360.de";

/**
 * Canonical origin — used for the sitemap and share metadata at launch.
 * Reads `VITE_SITE_ORIGIN` (see `.env.example`); the placeholder keeps the
 * site noindex. Single source of truth: `src/seo/config.ts`.
 */
export { siteOrigin as getSiteOrigin } from "@/seo/config";

/**
 * Owner decision D6 — the per-gram prices in `src/data/solutions.ts` are
 * placeholders and must come from the real dispensing pharmacy. While this is
 * `false`, every price in the UI is labelled "indicative, confirmed after your
 * medical review" so nothing fake is presented as final. Flip to `true` only
 * once real, pharmacy-sourced prices are in place.
 */
export const PRICES_CONFIRMED = false;

/**
 * PO decision (Sept 2026) — commercial checkout (a customer-facing order total,
 * "Place order", any payment request) must not run on placeholder prices. While
 * this is false the cart shows "Final price will be shown before you confirm
 * your order." instead of a total, the checkout shows a "not available yet"
 * state, and the Solution page hides its order controls. It opens automatically
 * once real, pharmacy-sourced prices are in place.
 */
export const COMMERCE_ENABLED = PRICES_CONFIRMED;

/**
 * Owner decision D11 — the COA values, batch numbers and test dates in
 * `getProductCoa` / `solutionExampleCoa` are deterministic placeholders, not
 * real lab data. While this is `false` the product page shows a plain "you'll
 * get a real batch certificate with your delivery" note instead of a fake
 * certificate, and drops the "Lab tested" badge. Flip to `true` only once the
 * pharmacy/lab supplies real COAs.
 */
export const COA_CONFIRMED = false;

/**
 * Changes-matrix (2026-09-24) — checkout verifies the customer's phone number
 * by SMS instead of asking for a password. **No SMS provider is wired yet.**
 * While this is `false` the verification step is an honest preview: nothing is
 * sent, any 6 digits are accepted, and the UI says so (`checkout.phone.previewNote`)
 * rather than claiming a code was sent. Flip to `true` only together with a real
 * provider in `src/features/phone/verification.ts`; until that adapter exists the
 * live branch fails closed ("unavailable"), so flipping early blocks checkout
 * instead of silently accepting every code.
 */
export const PHONE_VERIFICATION_LIVE = false;

/**
 * Checkout order summary (Mischa, 2026-09-24): "Shipping cost of DHL … Doctor's
 * fee — I need to ask how much it will be … Total amount". Neither number is
 * known yet, so both are `null`: the summary shows "To be confirmed" for the
 * line and for the total instead of a made-up figure. Set a number (EUR, VAT as
 * quoted by the pharmacy / doctor) and the line and the total appear; the total
 * only shows once BOTH are set. Prices per gram are still the placeholders in
 * `src/data/solutions.ts` (see `PRICES_CONFIRMED`), so the summary also carries
 * the "indicative" note until that flips.
 */
export const SHIPPING_FEE_EUR: number | null = null;
export const REVIEW_FEE_EUR: number | null = null;
