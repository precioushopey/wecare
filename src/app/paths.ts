/**
 * Single source of truth for route paths.
 *
 * The four problem-landing slugs are fixed by the "Problem Landing Pages"
 * guideline. Do not rename them without checking that doc.
 */
export const paths = {
  home: "/",

  conditions: {
    sleep: "/sleep-problems",
    pain: "/pain-body-discomfort",
    stressAnxiety: "/stress-anxiety",
    migraine: "/migraine-head-tension",
    /** Fallback-only entry point — never in primary nav. */
    generalWellness: "/general-wellness",
  },

  howItWorks: "/how-it-works",
  faq: "/faq",
  /** Qualitative "what to expect / what it costs" page. */
  costs: "/costs",

  assessment: {
    start: "/assessment/start",
    result: "/assessment/result",
  },

  /** Recommended Solution redirect — resolves to the recommended product page. */
  solution: "/solution",

  /** Commerce (spec Section 11). Deliberately NOT in primary nav. */
  shop: "/shop",
  shopProduct: (id: string) => `/shop/${id}`,
  cart: "/shop/cart",
  checkout: "/shop/checkout",
  orderConfirmation: "/shop/confirmation",

  dashboard: "/dashboard",
  dashboardAssessment: "/dashboard/assessment",
  dashboardRecommendation: "/dashboard/recommendation",
  dashboardOrders: "/dashboard/orders",
  dashboardFollowUp: "/dashboard/follow-up",
  dashboardSupport: "/dashboard/support",
  dashboardProfile: "/dashboard/profile",

  login: "/login",

  contact: "/contact",

  legal: {
    imprint: "/legal/imprint",
    privacy: "/legal/privacy",
    terms: "/legal/terms",
    cookies: "/legal/cookie-policy",
    shipping: "/legal/shipping-policy",
    refunds: "/legal/refund-policy",
  },

  /** Lab tests / certificates of analysis (doc section 15). */
  labTests: "/lab-tests",
} as const;

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
