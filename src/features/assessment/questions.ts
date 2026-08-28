export const QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export interface Question {
  id: QuestionId;
  /** option keys — labels resolve from i18n `assessment:questions.<id>.options.<key>` */
  options: readonly string[];
}

/** Six questions, verbatim order from spec Section 7. */
export const QUESTIONS: readonly Question[] = [
  { id: "q1", options: ["sleep", "pain", "stressAnxiety", "migraine"] },
  { id: "q2", options: ["sometimes", "weekly", "almostDaily", "daily"] },
  { id: "q3", options: ["mild", "moderate", "strong", "veryStrong"] },
  { id: "q4", options: ["no", "basic", "cbd", "prescription", "notSure"] },
  { id: "q5", options: ["new", "oil", "flowers", "vape", "other"] },
  { id: "q6", options: ["oil", "flower", "vape", "guidance"] },
] as const;

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type AssessmentAnswers = Partial<Record<QuestionId, string>>;

export function isComplete(answers: AssessmentAnswers): boolean {
  return QUESTIONS.every((q) => Boolean(answers[q.id]));
}

export function answeredCount(answers: AssessmentAnswers): number {
  return QUESTIONS.filter((q) => Boolean(answers[q.id])).length;
}
