/**
 * 18+ self-declaration gate shown before the assessment (owner decision D14).
 * A lightweight device-level confirmation — NOT identity verification. The
 * regulated age/identity check happens later in the medical / pharmacy
 * workflow. Date of birth is collected at account creation (to build once a
 * real registration form exists). Legal sufficiency: LEGAL REVIEW REQUIRED.
 *
 * Stored separately from the session so it is not cleared on sign-out.
 */

const STORAGE_KEY = "wecare.ageConfirmed";

export function isAgeConfirmed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function confirmAge(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
