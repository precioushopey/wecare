/**
 * Legal-consent gate shown once (per device) before the assessment, after the
 * age gate (PO request, 2026-09-14 WhatsApp thread — modeled on a quick-green.de
 * "please read and confirm your legal rights" screen). Distinct from
 * `src/features/age/age.ts` (18+ / DOB) and `src/features/consent/consent.ts`
 * (cookie / analytics consent) — this is acknowledgment of the Terms of
 * Service and Privacy Policy specifically, which still ship as undated drafts
 * (see `legal:draftNotEffective`), so this gate makes no claim that those
 * documents are final.
 *
 * Device-level, not versioned: stored as a bare flag, same mechanics as
 * `age.ts`. Re-asking on a document update is a real future need but isn't
 * built here — would need a version/date stamp per document.
 */

const STORAGE_KEY = "wecare.legalConsent";

export function isLegalGateAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function acceptLegalGate(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
