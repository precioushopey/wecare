/**
 * Single source of truth for route paths.
 *
 * The four problem-landing slugs were renamed English → German for the
 * Austrian SEO foundation (docs/SEO-FOUNDATION.md §C / T-09), 2026-09-03.
 * `LEGACY_REDIRECTS` (below) keeps every old slug working; upgrade those to
 * real host-level 301s before indexing (§G3). The funnel / shop / dashboard /
 * auth paths stay English on purpose — they are noindex and internal, so a
 * rename would be pure risk with no SEO upside.
 */
export const paths = {
  home: "/",

  conditions: {
    sleep: "/schlafprobleme",
    pain: "/schmerzen",
    stressAnxiety: "/stress-angst",
    migraine: "/migraene-kopfdruck",
    /** Fallback-only entry point — never in primary nav, noindex. */
    generalWellness: "/allgemeines-wohlbefinden",
  },

  /** Redirects to the homepage `#how-it-works` section (owner decision — it is
   *  a section, not a standalone page). A real `/so-funktioniert-wecare` page
   *  is Phase-1 content work (SEO-FOUNDATION.md §C). */
  howItWorks: "/so-funktioniert-wecare",
  faq: "/haeufige-fragen",
  /** Qualitative "what to expect / what it costs" page. */
  costs: "/kosten",

  assessment: {
    start: "/assessment/start",
    result: "/assessment/result",
    /** Safety questions + review submission — reached from the Solution page's
     *  "Continue to medical review" CTA (PO decision B1/B2). */
    medicalReview: "/assessment/medical-review",
    /** Medical-review status page (owner decision D3). */
    review: "/assessment/review",
  },

  /** Recommended Solution redirect — resolves to the recommended product page. */
  solution: "/solution",

  /** Commerce (spec Section 11). Deliberately NOT in primary nav.
   *  Cart / checkout / confirmation live UNDER `/dashboard` so the signed-in
   *  purchase flow never leaves the app shell (owner request, Sept 2026 — a
   *  non-empty cart only ever belongs to a signed-in, medically-approved
   *  user). Old `/shop/*` URLs redirect in via `LEGACY_REDIRECTS`. */
  shop: "/shop",
  shopProduct: (id: string) => `/shop/${id}`,
  cart: "/dashboard/cart",
  checkout: "/dashboard/checkout",
  orderConfirmation: "/dashboard/order-confirmation",

  dashboard: "/dashboard",
  dashboardAssessment: "/dashboard/assessment",
  dashboardRecommendation: "/dashboard/recommendation",
  dashboardOrders: "/dashboard/orders",
  dashboardFollowUp: "/dashboard/follow-up",
  dashboardSupport: "/dashboard/support",
  dashboardProfile: "/dashboard/profile",

  login: "/login",
  signup: "/signup",

  contact: "/kontakt",

  legal: {
    imprint: "/impressum",
    privacy: "/datenschutz",
    terms: "/agb",
    cookies: "/cookie-richtlinie",
    shipping: "/versand",
    refunds: "/rueckerstattung",
  },

  /** Lab tests / certificates of analysis (doc section 15). */
  labTests: "/labortests",
} as const;

/**
 * Old path → current path. Wired as SPA redirects in `router.tsx` and (target
 * state) as host-level 301s (SEO-FOUNDATION.md §G3). Covers the English→German
 * slug rename, the even-older `/conditions/*` paths, and the `/shop/*` →
 * `/dashboard/*` move of cart / checkout / confirmation.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/shop/cart": paths.cart,
  "/shop/checkout": paths.checkout,
  "/shop/confirmation": paths.orderConfirmation,
  "/sleep-problems": paths.conditions.sleep,
  "/pain-body-discomfort": paths.conditions.pain,
  "/stress-anxiety": paths.conditions.stressAnxiety,
  "/migraine-head-tension": paths.conditions.migraine,
  "/general-wellness": paths.conditions.generalWellness,
  "/conditions/sleep-problems": paths.conditions.sleep,
  "/conditions/chronic-pain": paths.conditions.pain,
  "/conditions/stress-anxiety": paths.conditions.stressAnxiety,
  "/conditions/migraine": paths.conditions.migraine,
  "/conditions/general-wellness": paths.conditions.generalWellness,
  "/faq": paths.faq,
  "/costs": paths.costs,
  "/contact": paths.contact,
  "/lab-tests": paths.labTests,
  "/legal/imprint": paths.legal.imprint,
  "/legal/privacy": paths.legal.privacy,
  "/legal/terms": paths.legal.terms,
  "/legal/cookie-policy": paths.legal.cookies,
  "/legal/shipping-policy": paths.legal.shipping,
  "/legal/refund-policy": paths.legal.refunds,
};

/**
 * Funnel / shop routes that, for a **signed-in** user, render inside the
 * dashboard shell (`DashboardChrome embed`) instead of the marketing
 * header/footer — so the guided journey never leaves the app once you're
 * logged in. Anonymous visitors still get the marketing chrome on these.
 * `/dashboard/*` is handled by its own route, not this list.
 */
export function isAppShellRoute(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (p === paths.shop || p.startsWith(`${paths.shop}/`)) return true;
  return (
    p === paths.solution ||
    p === paths.assessment.start ||
    p === paths.assessment.result ||
    p === paths.assessment.medicalReview ||
    p === paths.assessment.review
  );
}

/**
 * Primary top-nav items, in order. No shop / product-catalog language.
 * "How It Works" and "FAQ" are intentionally NOT in the primary nav — the
 * How-It-Works explainer lives on the homepage as a section after the final
 * CTA (and `/how-it-works` redirects there); the FAQ has a real page but is
 * linked only from the footer. Do not re-add either to this list.
 */
export const PRIMARY_NAV = [
  { key: "sleep", to: paths.conditions.sleep },
  { key: "pain", to: paths.conditions.pain },
  { key: "stressAnxiety", to: paths.conditions.stressAnxiety },
  { key: "migraine", to: paths.conditions.migraine },
] as const;
