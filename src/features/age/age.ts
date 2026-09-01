/**
 * 18+ gate shown before the assessment (owner decision D14, revised by PO
 * decision set 4, Sept 2026: a bare self-attestation checkbox alone was
 * ruled not enough — "add DOB capture"). Still a lightweight, **device-level**
 * check — NOT identity verification, and NOT the real backend-side minimum-
 * age validation a genuine account-creation flow would need (there is no
 * real registration here — auth is mock, see `AuthContext`). The regulated
 * age/identity check happens later in the medical / pharmacy workflow.
 * Legal sufficiency of this whole approach is still LEGAL REVIEW REQUIRED —
 * see docs/STRAIN-SOLUTION-MAPPING.md / CLAUDE.md's PO decision set 4 note.
 *
 * Stored separately from the session so it is not cleared on sign-out.
 * Storage holds the entered date of birth (ISO `YYYY-MM-DD`), not a boolean —
 * a legacy `"true"` value (the pre-DOB self-attestation) is treated as unset
 * so a returning visitor is asked once for a real date of birth.
 */

const STORAGE_KEY = "wecare.ageConfirmed";

function readStoredValue(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The stored date of birth, or `null` if none is stored yet (including the
 *  pre-DOB legacy `"true"` value). */
export function getStoredDob(): string | null {
  const v = readStoredValue();
  return v && v !== "true" ? v : null;
}

/** Whole years between an ISO `YYYY-MM-DD` date of birth and today.
 *  Returns -1 for an unparseable value. */
export function calculateAge(dobIso: string): number {
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAgeConfirmed(): boolean {
  const dob = getStoredDob();
  return dob !== null && calculateAge(dob) >= 18;
}

export function confirmAge(dobIso: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, dobIso);
  } catch {
    /* ignore */
  }
}
