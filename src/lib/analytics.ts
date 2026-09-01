/**
 * Funnel instrumentation seam.
 *
 * Target: PostHog EU (owner decision D17). No vendor is wired yet — this is
 * the single call surface so that connecting one is a change to `dispatch()`
 * and a script tag, not a hunt through the code. Every call is gated on the
 * visitor's consent (`analyticsAllowed()`), so `track()` is a no-op until the
 * "Accept all" choice is made. In development it logs to the console.
 *
 * DATA-MINIMISATION RULE (owner decision D16 — keep strictly):
 *   Never send raw health information. Coarse categories are fine
 *   (`problem: "sleep"`, product/solution SKU ids, order value); the specific
 *   free-text-style assessment answers (severity, frequency, prior use,
 *   format choice) must NOT leave the browser. `assessment_question_answered`
 *   carries the question id + index only, for drop-off analysis.
 *   Also to scrub before this reaches a vendor: name, email, DOB, uploaded
 *   documents, medication names, any diagnosis.
 */

import { analyticsAllowed } from "@/features/consent/consent";

export const AnalyticsEvent = {
  homepageCtaClicked: "homepage_cta_clicked",
  problemSelected: "problem_selected",
  problemPageCtaClicked: "problem_page_cta_clicked",
  assessmentStarted: "assessment_started",
  assessmentQuestionAnswered: "assessment_question_answered",
  assessmentBackClicked: "assessment_back_clicked",
  assessmentCompleted: "assessment_completed",
  recommendationViewed: "recommendation_viewed",
  recommendationCtaClicked: "recommendation_cta_clicked",
  medicalReviewStarted: "medical_review_started",
  medicalReviewSubmitted: "medical_review_submitted",
  medicalReviewOutcome: "medical_review_outcome",
  productViewed: "product_viewed",
  addToCart: "add_to_cart",
  checkoutStarted: "checkout_started",
  orderPlaced: "order_placed",
  login: "login",
  logout: "logout",
  followupSubmitted: "followup_submitted",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

type Props = Record<string, string | number | boolean | null | undefined>;

/** Bump when the funnel shape changes, so cohorts stay comparable. */
const FUNNEL_VERSION = "2026-09-01";

const isDev =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
const UTM_STORE = "wecare.utm";

/** Capture acquisition params once per session (first landing wins). */
function captureUtmOnce(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(UTM_STORE)) return;
    const q = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = q.get(k);
      if (v) found[k] = v.slice(0, 120);
    }
    if (Object.keys(found).length) {
      window.sessionStorage.setItem(UTM_STORE, JSON.stringify(found));
    }
  } catch {
    /* ignore */
  }
}
captureUtmOnce();

function deviceClass(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

function baseProps(): Props {
  const p: Props = {
    funnel_version: FUNNEL_VERSION,
    device_class: deviceClass(),
  };
  try {
    p.language = document.documentElement.lang || "de";
    const utm = window.sessionStorage.getItem(UTM_STORE);
    if (utm) Object.assign(p, JSON.parse(utm));
  } catch {
    /* ignore */
  }
  return p;
}

/** Hand the event to the analytics vendor. Empty until PostHog EU is wired:
 *  e.g. `window.posthog?.capture(event, props)` — with session recording set
 *  to mask all inputs on the assessment / checkout routes. */
function dispatch(_event: AnalyticsEventName, _props: Props): void {
  // window.posthog?.capture(_event, _props);
}

export function track(event: AnalyticsEventName, props?: Props): void {
  if (!analyticsAllowed()) return;
  const merged = { ...baseProps(), ...props };
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, merged);
  }
  try {
    dispatch(event, merged);
  } catch {
    /* never let instrumentation break a flow */
  }
}
