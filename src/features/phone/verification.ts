import { PHONE_VERIFICATION_LIVE } from "@/config";

/**
 * Phone-number verification seam (changes-matrix, 2026-09-24).
 *
 * Checkout verifies a mobile number by SMS instead of asking for a password.
 * Like `payments.ts`, this module is the one place a real provider plugs in:
 * implement the two `if (PHONE_VERIFICATION_LIVE)` branches (send a code / check
 * a code, server-side and EU-hosted), then flip the flag in `src/config.ts`.
 *
 * Until then it is a **preview**: `sendVerificationCode` sends nothing and
 * `checkVerificationCode` accepts any 6 digits. The UI must not claim an SMS
 * was sent while `PHONE_VERIFICATION_LIVE` is false (see `PhoneVerification`).
 * The live branches deliberately fail closed, so flipping the flag before a
 * provider exists blocks checkout instead of accepting every code.
 *
 * Phone numbers are personal data: never log them and never send them to
 * analytics (D16).
 */

export const CODE_LENGTH = 6;

/**
 * Normalise what the customer typed to E.164 (`+436641234567`), or `null` if it
 * can't be a phone number. A leading `0` is read as an Austrian national number
 * (`0664 1234567` → `+436641234567`); `00…` is read as an international prefix.
 * Format only — it doesn't know whether the number is a mobile or exists; the
 * provider decides that.
 */
export function normalizePhone(input: string): string | null {
  let s = input.trim().replace(/[\s\-().\/]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  else if (s.startsWith("0")) s = `+43${s.slice(1)}`;
  return /^\+[1-9]\d{7,14}$/.test(s) ? s : null;
}

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "rateLimited" | "unavailable" };

export type CheckResult =
  | { ok: true }
  | { ok: false; reason: "wrongCode" | "unavailable" };

/** Ask the provider to text a one-time code to `phone` (E.164). */
export async function sendVerificationCode(_phone: string): Promise<SendResult> {
  if (!PHONE_VERIFICATION_LIVE) return { ok: true }; // preview: nothing is sent
  // TODO(provider): send the code; map throttling to "rateLimited".
  return { ok: false, reason: "unavailable" };
}

/** Check the code the customer typed for `phone` (E.164). */
export async function checkVerificationCode(
  _phone: string,
  code: string,
): Promise<CheckResult> {
  if (!PHONE_VERIFICATION_LIVE) {
    // Preview: any 6 digits pass. There is nothing real to verify against.
    return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code)
      ? { ok: true }
      : { ok: false, reason: "wrongCode" };
  }
  // TODO(provider): check the code; a wrong/expired one is "wrongCode".
  return { ok: false, reason: "unavailable" };
}
