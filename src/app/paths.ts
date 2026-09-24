/**
 * Appends the query marker a dashboard link uses to say an otherwise-funnel-
 * only page is safe to view without leaving the dashboard shell (`RootLayout`
 * 's `dashboardOrigin` branch, `hasDashboardOrigin` below — see
 * `shopProductFromDashboard`'s comment for the bug this fixes). Safe to call
 * on a path that already carries its own query string (e.g. `/shop?problem=
 * sleep`).
 */
function withDashboardOrigin(path: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}origin=dashboard`;
}

/** Reads the marker `withDashboardOrigin` sets, from a `URLSearchParams`
 *  (`RootLayout` and any embeddable page check the same key this way). */
export function hasDashboardOrigin(searchParams: URLSearchParams): boolean {
  return searchParams.get("origin") === "dashboard";
}

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
    /** The review-status page linked from inside `/dashboard/*` — see
     *  `shopProductFromDashboard`'s comment; same mechanism, same bug. */
    reviewFromDashboard: withDashboardOrigin("/assessment/review"),
  },

  /** Recommended Solution redirect — resolves to the recommended product page. */
  solution: "/solution",

  /** Commerce (spec Section 11). Deliberately NOT in primary nav.
   *  Cart / checkout / confirmation are top-level funnel routes rendered inside
   *  `FunnelChrome` for every visitor (funnel re-sequence, 2026-09-08 —
   *  supersedes the Sept-2026 "live under `/dashboard`" decision). Old
   *  `/shop/*` and `/dashboard/*` URLs redirect in via `LEGACY_REDIRECTS`. */
  shop: "/shop",
  shopProduct: (id: string) => `/shop/${id}`,
  /** A product page linked from inside `/dashboard/*` — the `?origin=
   *  dashboard` marker tells `RootLayout` (`RoutedShell`'s `dashboardOrigin`
   *  branch) to keep the signed-in dashboard chrome instead of dropping the
   *  visitor into the standalone funnel shell they'd otherwise have no way
   *  back from (reported bug, 2026-09-23). Only safe for pages that are
   *  purely informational (view a Solution, check a review status) — never
   *  for `/cart` / `/checkout` / `/order-confirmation`, which stay
   *  funnel-only on purpose (funnel re-sequence, 2026-09-08). */
  shopProductFromDashboard: (id: string) => withDashboardOrigin(`/shop/${id}`),
  /** The shop catalog (optionally filtered to a problem), as linked by a
   *  dashboard-embedded product page's "View more solutions" and, from
   *  there, the catalog's own "View all solutions" (same bug/mechanism as
   *  `shopProductFromDashboard` — 2026-09-23). */
  shopFromDashboard: (problem?: string) =>
    withDashboardOrigin(problem ? `/shop?problem=${problem}` : "/shop"),
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: "/order-confirmation",

  dashboard: "/dashboard",
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
 * slug rename, the even-older `/conditions/*` paths, and the cart / checkout /
 * confirmation moves (`/shop/*` and `/dashboard/*` → top-level funnel routes).
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/shop/cart": paths.cart,
  "/shop/checkout": paths.checkout,
  "/shop/confirmation": paths.orderConfirmation,
  "/dashboard/cart": paths.cart,
  "/dashboard/checkout": paths.checkout,
  "/dashboard/order-confirmation": paths.orderConfirmation,
  // "My Assessment" + "My Recommendation" dashboard pages merged into the
  // Overview (2026-09-09) — old URLs land there now.
  "/dashboard/assessment": paths.dashboard,
  "/dashboard/recommendation": paths.dashboard,
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
 * The standalone purchase funnel. These routes render inside `FunnelChrome`
 * (logo + a 4-step progress bar, no marketing nav, no dashboard shell) for
 * **every** visitor — signed in or not. The signed-in journey no longer runs
 * inside the dashboard shell (funnel re-sequence, 2026-09-08 — supersedes the
 * Sept-2026 "journey stays in the dashboard shell" decision). `/dashboard/*`
 * is handled by its own route, not this list.
 */
const FUNNEL_EXACT = new Set<string>([
  paths.assessment.start,
  paths.assessment.result,
  paths.assessment.medicalReview,
  paths.assessment.review,
  paths.solution,
  paths.cart,
  paths.checkout,
  paths.orderConfirmation,
]);

function trimTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isFunnelRoute(pathname: string): boolean {
  const p = trimTrailingSlash(pathname);
  return FUNNEL_EXACT.has(p) || p.startsWith(`${paths.shop}/`);
}

/**
 * The subset of funnel routes that are purely informational — the shop
 * catalog, viewing a Solution, checking a review status — and so safe to
 * render inside `DashboardChrome embed` instead of `FunnelChrome` when a
 * signed-in visitor reaches them from the dashboard (`?origin=dashboard`,
 * see `hasDashboardOrigin`). Note `/shop` (bare) isn't itself a funnel route
 * (`isFunnelRoute` below) — it already renders with marketing chrome for
 * every other visitor; this only matters when the origin marker is present.
 * Deliberately excludes `/cart` / `/checkout` / `/order-confirmation` and the
 * assessment-taking routes (`start` / `result` / `medicalReview`) — those
 * stay funnel-only (or marketing-chromed) on purpose, either because they're
 * a linear commerce step (funnel re-sequence, 2026-09-08) or because they're
 * actively running a fresh guided flow.
 */
export function isDashboardEmbeddableFunnelRoute(pathname: string): boolean {
  const p = trimTrailingSlash(pathname);
  return (
    p === paths.assessment.review ||
    p === paths.shop ||
    p.startsWith(`${paths.shop}/`)
  );
}

export function funnelStepFor(
  pathname: string,
): "questions" | "match" | "details" | "done" {
  const p = trimTrailingSlash(pathname);
  if (p === paths.assessment.start) return "questions";
  if (p === paths.checkout || p === paths.cart) return "details";
  if (p === paths.orderConfirmation) return "done";
  return "match"; // result, product, /shop/:id, /solution, medical-review, review
}

/**
 * Funnel routes that get a wider column than the funnel default (`max-w-3xl`).
 * The checkout is a two-column form + summary, so it was cramped at 768px
 * (owner request, 2026-09-24). The funnel chrome widens with it on this route
 * only, so the logo and progress bar stay aligned with the content.
 */
export function isWideFunnelRoute(pathname: string): boolean {
  return trimTrailingSlash(pathname) === paths.checkout;
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
