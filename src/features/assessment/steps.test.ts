import { describe, expect, it } from "vitest";

import type { AssessmentAnswers } from "./questions";
import {
  deriveStartPhase,
  firstQuestionStep,
  overallStepIndex,
  TOTAL_STEPS,
} from "./steps";

const full: AssessmentAnswers = {
  q1: "sleep",
  q2: "weekly",
  q3: "moderate",
  q4: "no",
  q5: "new",
  q6: "oil",
};

describe("TOTAL_STEPS", () => {
  it("is postcode + 6 questions (no exclusion phase)", () => {
    expect(TOTAL_STEPS).toBe(7);
  });
});

describe("firstQuestionStep", () => {
  it("is 0 when the assessment was prefilled from a landing page", () => {
    expect(firstQuestionStep({ q1: "sleep" }, true)).toBe(0);
  });
  it("is the first unanswered index otherwise", () => {
    expect(firstQuestionStep({ q1: "sleep" }, false)).toBe(1);
    expect(firstQuestionStep({}, false)).toBe(0);
  });
  it("is 0 when every question is answered", () => {
    expect(firstQuestionStep(full, false)).toBe(0);
  });
});

describe("deriveStartPhase", () => {
  it("starts at postcode when none is saved", () => {
    expect(deriveStartPhase({ answers: {}, prefilled: false })).toEqual({
      phase: "postcode",
      step: 0,
    });
  });
  it("goes to questions at the first gap once a postcode exists", () => {
    expect(
      deriveStartPhase({
        postcode: "1010",
        answers: { q1: "sleep" },
        prefilled: false,
      }),
    ).toEqual({ phase: "questions", step: 1 });
  });
  it("respects a landing-page prefill (starts at q1)", () => {
    expect(
      deriveStartPhase({
        postcode: "1010",
        answers: { q1: "sleep" },
        prefilled: true,
      }),
    ).toEqual({ phase: "questions", step: 0 });
  });
  it("stays in questions (step 0) when everything is answered", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: full, prefilled: false }),
    ).toEqual({ phase: "questions", step: 0 });
  });
});

describe("overallStepIndex", () => {
  it("orders postcode then questions", () => {
    expect(overallStepIndex("postcode", 0)).toBe(0);
    expect(overallStepIndex("questions", 0)).toBe(1);
    expect(overallStepIndex("questions", 5)).toBe(6);
  });
});
