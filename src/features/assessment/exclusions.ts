/**
 * The assessment's informational "final checks" step (spec §3). These answers
 * are captured for the medical reviewer only — they are NOT read by
 * `getRecommendation()` and never block the flow (owner: "informational only").
 */

export const EXCLUSION_CONDITION_KEYS = [
  "heart",
  "liverKidney",
  "psychosis",
  "dependence",
  "allergy",
] as const;

export type ExclusionConditionKey =
  | (typeof EXCLUSION_CONDITION_KEYS)[number]
  | "none";

export interface AssessmentExclusions {
  pregnancy?: "yes" | "no";
  recentSupply?: "yes" | "no";
  conditions?: ExclusionConditionKey[];
}

/** Pure toggle: "none" and the real conditions are mutually exclusive; a
 *  second tap on an already-selected key removes it. */
export function toggleCondition(
  current: ExclusionConditionKey[],
  key: ExclusionConditionKey,
): ExclusionConditionKey[] {
  const has = current.includes(key);
  if (key === "none") {
    return has ? [] : ["none"];
  }
  const withoutNone = current.filter((k) => k !== "none" && k !== key);
  return has ? withoutNone : [...withoutNone, key];
}

export function hasAnyFlag(x: AssessmentExclusions | undefined): boolean {
  if (!x) return false;
  if (x.pregnancy === "yes" || x.recentSupply === "yes") return true;
  return (x.conditions ?? []).some((k) => k !== "none");
}

export function exclusionFlagCount(
  x: AssessmentExclusions | undefined,
): number {
  if (!x) return 0;
  let n = 0;
  if (x.pregnancy === "yes") n += 1;
  if (x.recentSupply === "yes") n += 1;
  n += (x.conditions ?? []).filter((k) => k !== "none").length;
  return n;
}
