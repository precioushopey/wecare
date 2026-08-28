import { Activity, Brain, Moon, Wind, type LucideIcon } from "lucide-react";

import { paths } from "@/app/paths";

export type ConditionKey = "sleep" | "pain" | "stressAnxiety" | "migraine";

/** Q1 answer value that pre-fills the assessment when launched from a landing page. */
export type AssessmentProblem = ConditionKey;

export interface ConditionMeta {
  key: ConditionKey;
  /** landing page route */
  path: string;
  icon: LucideIcon;
  assessmentProblem: AssessmentProblem;
}

export const CONDITIONS: readonly ConditionMeta[] = [
  {
    key: "sleep",
    path: paths.conditions.sleep,
    icon: Moon,
    assessmentProblem: "sleep",
  },
  {
    key: "pain",
    path: paths.conditions.pain,
    icon: Activity,
    assessmentProblem: "pain",
  },
  {
    key: "stressAnxiety",
    path: paths.conditions.stressAnxiety,
    icon: Wind,
    assessmentProblem: "stressAnxiety",
  },
  {
    key: "migraine",
    path: paths.conditions.migraine,
    icon: Brain,
    assessmentProblem: "migraine",
  },
] as const;

export const CONDITION_BY_KEY: Record<ConditionKey, ConditionMeta> =
  Object.fromEntries(CONDITIONS.map((c) => [c.key, c])) as Record<
    ConditionKey,
    ConditionMeta
  >;

export function isConditionKey(value: unknown): value is ConditionKey {
  return (
    value === "sleep" ||
    value === "pain" ||
    value === "stressAnxiety" ||
    value === "migraine"
  );
}
