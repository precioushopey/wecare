/**
 * Funnel instrumentation seam.
 *
 * There is no analytics vendor wired yet — this is the single call surface the
 * app uses so that adding one (Plausible, PostHog, GA4, a custom collector …)
 * is a one-function change in `dispatch()` below, not a hunt through the code.
 *
 * Every call is gated on the visitor's consent (`analyticsAllowed()`), so
 * `track()` is a no-op until the "Accept all" choice is made in the consent
 * banner. In development it also logs to the console so the funnel is
 * observable while the vendor is still absent.
 */

import { analyticsAllowed } from "@/features/consent/consent";

export const AnalyticsEvent = {
  homeCtaClick: "home_cta_click",
  problemSelected: "problem_selected",
  assessmentStarted: "assessment_started",
  assessmentQuestionAnswered: "assessment_question_answered",
  assessmentCompleted: "assessment_completed",
  recommendationViewed: "recommendation_viewed",
  recommendationCtaClicked: "recommendation_cta_clicked",
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

const isDev =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

/** Hand the event to the analytics vendor. Intentionally empty until one is
 *  configured — see the module comment. */
function dispatch(_event: AnalyticsEventName, _props?: Props): void {
  // e.g. window.plausible?.(_event, { props: _props });
}

export function track(event: AnalyticsEventName, props?: Props): void {
  if (!analyticsAllowed()) return;
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
  try {
    dispatch(event, props);
  } catch {
    /* never let instrumentation break a flow */
  }
}
