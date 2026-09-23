/**
 * Module-scoped (deliberately NOT React state) flag bridging the moment
 * between `CheckoutPage.onSubmit` and `OrderConfirmationPage` mounting.
 *
 * A signed-out submit calls `signIn(...)`, which changes `AuthContext`'s
 * `sessionKey` — and `Providers.tsx` keys `AssessmentProvider` / `CartProvider`
 * by that key, so the whole subtree remounts. A remounted `CheckoutPage`
 * gets fresh `useState`s: `placed` resets to `false` and the cart reloads
 * empty (the submit handler already cleared `wecare.cart`). Without this
 * flag, `CheckoutPage`'s own guards (empty cart / no medical review) would
 * fire on that remounted render and redirect away — even though the order
 * was already written and the router is mid-navigation to the confirmation
 * page. This flag survives the remount (it isn't component state), so the
 * guards can tell "we just submitted" apart from "this is a stale visit"
 * regardless of exactly when React lands the remount relative to the route
 * change. It is cleared once `OrderConfirmationPage` has mounted.
 */
let submitted = false;

export function markCheckoutSubmitted(): void {
  submitted = true;
}

export function hasJustSubmittedCheckout(): boolean {
  return submitted;
}

export function clearCheckoutSubmitted(): void {
  submitted = false;
}
