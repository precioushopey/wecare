import { type SolutionId } from "@/data/solutions";
import type { ConditionKey } from "@/features/conditions/conditions";

import type { AssessmentAnswers } from "./questions";

export interface Recommendation {
  problem: ConditionKey;
  /** always the fixed primary for the problem (the lighter, default solution) */
  primarySolutionId: SolutionId;
  /** always the fixed secondary for the problem (the stronger solution) */
  secondarySolutionId: SolutionId;
  /** frame the secondary as a step-up ("Advanced option"): strong/very-strong
   *  severity, or the user has used cannabis/CBD before */
  secondaryIsAdvanced: boolean;
  /** show the "start gentle" nudge (new to cannabis, or mild/moderate) */
  gentleFirst: boolean;
  /** medical cannabis always needs a prescription → always true */
  requiresMedicalReview: boolean;
  /** i18n key: assessment:result.explanations.<problem> */
  explanationKey: string;
}

const STRONG = new Set(["strong", "veryStrong"]);

/**
 * Fixed primary / secondary solution per problem — the "Recommendation Logic"
 * guideline. The primary never changes; `escalates` marks the problems whose
 * secondary can be re-framed as the "Advanced option".
 */
const PAIR: Record<
  ConditionKey,
  { primary: SolutionId; secondary: SolutionId; escalates: boolean }
> = {
  sleep: { primary: "night-now", secondary: "calm-night", escalates: true },
  pain: { primary: "deep-ease", secondary: "synergy-ultra", escalates: true },
  stressAnxiety: {
    primary: "synergy-forte",
    secondary: "synergy-ultra",
    escalates: true,
  },
  migraine: {
    primary: "synergy-forte",
    secondary: "deep-ease",
    escalates: false,
  },
};

/** The lighter (primary) / stronger (secondary) solution for a problem. Used by
 *  the follow-up check-in when someone asks for "something stronger / lighter". */
export function pairCounterpart(
  problem: ConditionKey,
  want: "lighter" | "stronger",
): SolutionId {
  return want === "lighter" ? PAIR[problem].primary : PAIR[problem].secondary;
}

/** The two solutions a problem can be matched with, [primary, secondary].
 *  Shown (low-emphasis) on the problem landing pages. */
export function matchedSolutionIds(problem: ConditionKey): SolutionId[] {
  return [PAIR[problem].primary, PAIR[problem].secondary];
}

function toConditionKey(q1: string | undefined): ConditionKey {
  return q1 === "pain" || q1 === "stressAnxiety" || q1 === "migraine"
    ? q1
    : "sleep";
}

export function getRecommendation(answers: AssessmentAnswers): Recommendation {
  const problem = toConditionKey(answers.q1);
  const pair = PAIR[problem];
  const strength = answers.q3 ?? "";

  const newToCannabis = !answers.q5 || answers.q5 === "new";
  const experienced =
    answers.q4 === "prescription" ||
    ["oil", "flowers", "vape", "other"].includes(answers.q5 ?? "");

  // The primary recommendation is fixed per problem — a new user is never led
  // with the stronger option ("Short Assessment Flow" guideline). Strength or
  // prior experience only re-frames the secondary as the advanced step-up.
  const secondaryIsAdvanced =
    pair.escalates && (STRONG.has(strength) || experienced);
  const gentleFirst =
    newToCannabis || strength === "mild" || strength === "moderate";

  return {
    problem,
    primarySolutionId: pair.primary,
    secondarySolutionId: pair.secondary,
    secondaryIsAdvanced,
    gentleFirst,
    requiresMedicalReview: true,
    explanationKey: `result.explanations.${problem}`,
  };
}
