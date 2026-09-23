/**
 * "Has this browser ever signed in?" — a device-level flag (not session-
 * scoped), set on the first successful sign-in and never cleared on sign-out.
 * Used only to pick the default auth screen: a browser that's been used before
 * opens on "Log in", a fresh one opens on "Create account" (Mischa, 2026-09-09).
 *
 * MOCK — this is a client-only convenience, not identification. A real backend
 * decides "returning customer" from the account / phone number, not localStorage.
 */
const KEY = "wecare.returning";

export function markReturningVisitor(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* ignore (private mode, storage disabled) */
  }
}

export function isReturningVisitor(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
