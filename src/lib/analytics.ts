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
 *
 * PostHog EU decision (Sept 2026): consent-gated init stays as `track()`
 * already no-ops until `analyticsAllowed()`; session replay must start OFF,
 * and if it's ever enabled, mask all form fields. `device_class` in
 * `baseProps()` below is the "device type / viewport class" signal — a
 * width bucket, not real device/UA sniffing. `traffic_source` (first-touch,
 * same session as the UTM capture) is the desktop-vs-mobile /
 * acquisition-source dimension the recommendation-page events below are
 * meant to be sliced by.
 */

import { analyticsAllowed } from "@/features/consent/consent";

export const AnalyticsEvent = {
  homepageCtaClicked: "homepage_cta_clicked",
  problemSelected: "problem_selected",
  problemPageCtaClicked: "problem_page_cta_clicked",
  assessmentStarted: "assessment_started",
  assessmentQuestionAnswered: "assessment_question_answered",
  assessmentBackClicked: "assessment_back_clicked",
  assessmentPostcodeSubmitted: "assessment_postcode_submitted",
  assessmentExclusionCompleted: "assessment_exclusion_completed",
  assessmentCompleted: "assessment_completed",
  recommendationViewed: "recommendation_viewed",
  /** Owner decision, Sept 2026 — the Result page's own funnel, named so
   *  desktop-vs-mobile continue rate can be compared directly in PostHog
   *  (the recommendation page is flagged as the main conversion-risk page). */
  recommendationPrimarySelected: "recommendation_primary_selected",
  recommendationAlternativeSelected: "recommendation_alternative_selected",
  recommendationLearnMoreOpened: "recommendation_learn_more_opened",
  recommendationChangeAnswers: "recommendation_change_answers",
  recommendationContinueClicked: "recommendation_continue_clicked",
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

/** Coarse acquisition bucket — a UTM source if present, else "referral" for a
 *  cross-site referrer, else "direct". Deliberately not more granular than
 *  that (no referrer URL, no query string) — see the data-minimisation rule
 *  above. */
function classifyTrafficSource(utmSource: string | undefined): string {
  if (utmSource) return utmSource;
  try {
    if (document.referrer) {
      const refHost = new URL(document.referrer).hostname;
      if (refHost && refHost !== window.location.hostname) return "referral";
    }
  } catch {
    /* ignore */
  }
  return "direct";
}

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
    found.traffic_source = classifyTrafficSource(found.utm_source);
    window.sessionStorage.setItem(UTM_STORE, JSON.stringify(found));
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
