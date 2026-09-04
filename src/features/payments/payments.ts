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
  | "sepa"
  | "klarna";

export interface PaymentMethodDef {
  id: PaymentMethodId;
  /** Whether checkout offers it today. Only the offline methods are on. */
  enabled: boolean;
}

/** Every method the model knows about. `enabled` gates what checkout renders. */
export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "invoice", enabled: true },
  { id: "bankTransfer", enabled: true },
  // Added when a PSP is selected and integrated (PO decision, Sept 2026):
  { id: "card", enabled: false },
  { id: "sepa", enabled: false },
  { id: "klarna", enabled: false },
];

export const ENABLED_PAYMENT_METHODS: PaymentMethodDef[] =
  PAYMENT_METHODS.filter((m) => m.enabled);

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
