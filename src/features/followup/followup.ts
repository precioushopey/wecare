/**
 * Step 6 of the core flow (guideline 3): a light experience check-in, NOT a
 * medical form. "How was your experience with your recommended solution?"
 * The answer is kept locally and drives a tailored next step.
 */

const STORAGE_KEY = "wecare.followup";

export const FOLLOW_UP_CHOICES = [
  "good",
  "stronger",
  "lighter",
  "format",
  "support",
] as const;

export type FollowUpChoice = (typeof FOLLOW_UP_CHOICES)[number];

export interface FollowUpEntry {
  choice: FollowUpChoice;
  at: string;
}

export function isFollowUpChoice(value: unknown): value is FollowUpChoice {
  return (
    typeof value === "string" &&
    (FOLLOW_UP_CHOICES as readonly string[]).includes(value)
  );
}

export function getFollowUp(): FollowUpEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FollowUpEntry>;
    if (parsed && isFollowUpChoice(parsed.choice)) {
      return { choice: parsed.choice, at: parsed.at ?? new Date().toISOString() };
    }
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

export function setFollowUp(choice: FollowUpChoice): FollowUpEntry {
  const entry: FollowUpEntry = { choice, at: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
  return entry;
}

export function clearFollowUp(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
