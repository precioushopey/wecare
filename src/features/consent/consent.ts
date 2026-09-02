/**
 * Lightweight cookie / storage consent. A prototype stand-in for a real
 * consent-management platform (see DESIGN-SPECIFICATION.md open questions):
 * it records a single choice and gates non-essential measurement (analytics)
 * behind it. Essential storage — language, cart, assessment progress, auth
 * session — always runs because the site cannot function without it.
 *
 * Backed by a module-level `useSyncExternalStore` store, mirroring the
 * `useLanguage` shape. No provider needed.
 */

export type ConsentChoice = "unset" | "essential" | "all";

const STORAGE_KEY = "wecare.consent";

export function isConsentChoice(value: unknown): value is ConsentChoice {
  return value === "unset" || value === "essential" || value === "all";
}

function readStored(): ConsentChoice {
  if (typeof window === "undefined") return "unset";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isConsentChoice(raw) ? raw : "unset";
  } catch {
    return "unset";
  }
}

let choice: ConsentChoice = readStored();
let forcedOpen = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export interface ConsentState {
  choice: ConsentChoice;
  /** true while the banner should be shown (no choice yet, or reopened) */
  needsChoice: boolean;
  /** non-essential measurement is permitted */
  analyticsAllowed: boolean;
}

let snapshot: ConsentState = computeSnapshot();

function computeSnapshot(): ConsentState {
  return {
    choice,
    needsChoice: choice === "unset" || forcedOpen,
    analyticsAllowed: choice === "all",
  };
}

export function getConsentSnapshot(): ConsentState {
  return snapshot;
}

export function getServerConsentSnapshot(): ConsentState {
  return { choice: "unset", needsChoice: false, analyticsAllowed: false };
}

/** Read the current value outside React (e.g. the analytics helper). */
export function analyticsAllowed(): boolean {
  return choice === "all";
}

export function setConsent(next: Exclude<ConsentChoice, "unset">): void {
  choice = next;
  forcedOpen = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  snapshot = computeSnapshot();
  emit();
}

/** Re-open the banner so the visitor can change a prior choice. */
export function reopenConsent(): void {
  forcedOpen = true;
  snapshot = computeSnapshot();
  emit();
}
