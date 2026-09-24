/**
 * Payment abstraction seam.
 *
 * MVP is invoice / bank transfer, settled offline AFTER medical approval
 * (owner decision D7 + PO decision, Sept 2026). **No PSP is integrated and no
 * live card / SEPA / Klarna flow exists.** This module exists so those can be
 * added later — register the method in `PAYMENT_METHODS`, flip `enabled`, and
 * implement its branch in `requestPayment()` — without rewriting checkout.
 */

export type PaymentMethodId =
  | "invoice"
  | "bankTransfer"
  | "card"
  | "applePay"
  | "crypto"
  | "sepa"
  | "klarna";

export interface PaymentMethodDef {
  id: PaymentMethodId;
  /** Whether checkout can take it today. Only the offline methods are on. */
  enabled: boolean;
  /** Whether checkout lists it. A listed-but-not-enabled method is shown
   *  greyed out with an "available soon" tag (see `CHECKOUT_PAYMENT_METHODS`). */
  listed: boolean;
}

/** Every method the model knows about. */
export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "invoice", enabled: true, listed: false },
  { id: "bankTransfer", enabled: true, listed: true },
  // Mischa (2026-09-24) lists card, Apple Pay and crypto at checkout. They are
  // shown but stay off until a payment provider's API is wired (he has asked
  // Ilay whether the provider's API has arrived) — flip `enabled` per method.
  { id: "card", enabled: false, listed: true },
  { id: "applePay", enabled: false, listed: true },
  { id: "crypto", enabled: false, listed: true },
  { id: "sepa", enabled: false, listed: false },
  { id: "klarna", enabled: false, listed: false },
];

export const ENABLED_PAYMENT_METHODS: PaymentMethodDef[] =
  PAYMENT_METHODS.filter((m) => m.enabled);

/** What the checkout's "Choose payment method" section renders, in order:
 *  wire transfer, credit card, Apple Pay, crypto. */
export const CHECKOUT_PAYMENT_METHODS: PaymentMethodDef[] =
  PAYMENT_METHODS.filter((m) => m.listed);

export interface PaymentRequest {
  method: PaymentMethodId;
  amountEur: number;
  orderId: string;
}

export interface PaymentResult {
  ok: boolean;
  /** Set when a real PSP is wired and returns a redirect/next-action URL. */
  redirectUrl?: string;
}

/**
 * Placeholder for a future PSP call. Today every enabled method is settled
 * offline, so this is a no-op that just resolves. A real integration branches
 * on `req.method` here (Stripe / Klarna / SEPA / …) and returns a
 * `redirectUrl` where the provider flow requires one.
 */
export async function requestPayment(
  _req: PaymentRequest,
): Promise<PaymentResult> {
  return { ok: true };
}
