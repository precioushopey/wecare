/**
 * "Have you already received a prescription through WeCare?" — the first step of
 * the assessment (owner request, 2026-09-24, modelled on quick-green's onboarding
 * opener). "Yes" sends the visitor to the log-in page; "No" continues the
 * assessment and is remembered per device so the question isn't asked again.
 *
 * MOCK, client-only convenience — same mechanics as `age.ts` / `legalGate.ts`. A
 * real backend would decide "existing customer" from the account, not from a
 * localStorage flag. Signed-in visitors never see the step.
 */

const STORAGE_KEY = "wecare.newCustomer";

export function isNewCustomerConfirmed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function confirmNewCustomer(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
