# quick-green-style UX polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the WeCare assessment → result → checkout flow *feel* like quick-green.com's funnel — one-tap auto-advancing questions, an early postcode/delivery-area check, a short informational safety step, and tighter "what happens next" + itemised-summary polish — without adopting quick-green's commercial model.

**Architecture:** Approach B — a `phase` wrapper (`postcode → questions → exclusion`) around the existing 6-question state engine in `AssessmentEnginePage`. The two new steps are isolated components; the question core keeps its state-index engine and just gains auto-advance. `getRecommendation()` is untouched — postcode and exclusion answers are captured for the medical review only (same rule as q2/q6 under decision D1). Result/checkout reuse two new shared presentational components.

**Tech Stack:** React 18 + TypeScript (strict) + Vite 6 + Tailwind v4 + react-i18next + react-router 7. New: **vitest 2.1.9** (dev-only, pure-logic unit tests). `tw-animate-css` (already a dep) supplies `animate-in fade-in`.

**Spec:** `docs/superpowers/specs/2026-09-03-quick-green-ux-polish-design.md`

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec / `CLAUDE.md`.

- **`pnpm typecheck` must stay green** (`tsc --noEmit`, strict). **`pnpm build` must pass** (`vite build`). Neither is optional; run both before every commit that touches `.ts`/`.tsx`.
- **`getRecommendation()` in `src/features/assessment/recommendation.ts` does NOT change.** Its inputs stay q1/q3/q4/q5. `postcode`, `deliveryRegion`, and `exclusions` are never passed to it.
- **Every new or touched user-facing string ships in BOTH `de` and `en`**, with key parity. Namespaces: `assessment`, `common`, `shop`.
  - `assessment` namespace DE style: **informal *du***, the word **"Fragebogen"** (never "Assessment"), **"ärztliche Prüfung"** (never "Behandlung"/"treatment" as a promise), paired gendering **"Ärztin oder Arzt"** (not slash-form here — match the existing `de/assessment.json`), German en-dash `–` for parentheticals.
  - `common` / `shop` namespace DE style: slash-form gendering where a gendered noun is unavoidable (`Nutzer/innen`), otherwise neutral.
  - **No U+2014 em-dash (`—`) anywhere in locale JSON** — use a period, comma, or parentheses (repo cleanup rule, 2026-09-02). German en-dash `–` (U+2013) is fine.
  - Interpolate variables *inside* the string (`"… {{postcode}} …"`), never concatenate around `t()`.
- **No product / price / strain language in the postcode or exclusion steps** (problem-first hard rule).
- **Analytics** goes through `track()` from `src/lib/analytics.ts` only (consent-gated). **Never send raw health data or the raw postcode** (decision D16). The coarse `region` key (8 buckets) and boolean/count flags are allowed.
- **Respect `prefers-reduced-motion`** on every new animation — follow the inline `matchMedia("(prefers-reduced-motion: reduce)")` pattern already in `AssessmentRing.tsx` / `Reveal.tsx`.
- Feature branch is **`audit-fixes`**. Commit per task. (Confirm with the requester before the first commit — they had an active "no commits" hold when this plan was written.)
- Route paths in `src/app/paths.ts` do **not** change. `/assessment/start` renders `AssessmentEnginePage` (via the `src/pages/assessment.tsx` barrel).

---

## File Structure

**New files**

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | vitest config — `@` alias, `node` env, `src/**/*.test.ts` |
| `src/features/delivery/delivery.ts` | pure: Austrian postcode regex, `regionForPostcode()`, `isServiceableAt()` |
| `src/features/delivery/delivery.test.ts` | vitest unit tests for the above |
| `src/features/assessment/exclusions.ts` | pure: exclusion option keys, `AssessmentExclusions` type, `toggleCondition()` mutual-exclusion helper, `hasAnyFlag()` |
| `src/features/assessment/exclusions.test.ts` | vitest unit tests |
| `src/features/assessment/steps.ts` | pure: `Phase` type, `firstQuestionStep()`, `deriveStartPhase()`, `overallStepIndex()`, `TOTAL_STEPS` |
| `src/features/assessment/steps.test.ts` | vitest unit tests |
| `src/pages/assessment/QuestionStep.tsx` | the extracted question-card renderer (radio group + hints + note) |
| `src/pages/assessment/PostcodeStep.tsx` | the postcode / delivery-area step |
| `src/pages/assessment/ExclusionStep.tsx` | the informational safety step |
| `src/components/marketing/DeliveryConfirmation.tsx` | one-line "we deliver to {{postcode}} ({{region}})…" — used by postcode step, result, checkout |
| `src/components/marketing/NextSteps.tsx` | numbered-chip step list (title + one line each) — used by result, checkout, order confirmation |

**Modified files**

| Path | Change |
|---|---|
| `package.json` | add `vitest` dev dep + `test` / `test:watch` scripts |
| `src/features/assessment/AssessmentContext.tsx` | persist `postcode` / `deliveryRegion` / `exclusions`; add `setPostcode` / `setExclusions`; `reset()` clears them |
| `src/pages/assessment/AssessmentEnginePage.tsx` | `phase` orchestration, auto-advance, cross-phase progress; question rendering moves to `QuestionStep` |
| `src/features/review/review.ts` | `MedicalReview` + `submitMedicalReview` input gain `postcode?` / `exclusions?` |
| `src/pages/assessment/ResultPage.tsx` | delivery line; `<NextSteps>`; pass postcode/exclusions to `submitMedicalReview`; exclusion continuity note |
| `src/pages/shop/CheckoutPage.tsx` | pre-fill postcode; delivery line; itemised summary with a "Medical review" line; `<NextSteps>` block |
| `src/pages/shop/OrderConfirmationPage.tsx` | swap the inline numbered `<ol>` for `<NextSteps>` |
| `src/lib/analytics.ts` | add `assessmentPostcodeSubmitted`, `assessmentExclusionCompleted` event names |
| `src/i18n/locales/{de,en}/assessment.json` | `phase.*`, `postcode.*`, `regions.*`, `exclusion.*`, `result.exclusionNote` |
| `src/i18n/locales/{de,en}/common.json` | `delivery.confirmLine` |
| `src/i18n/locales/{de,en}/shop.json` | `checkout.reviewLine`, `checkout.reviewLineValue`, `checkout.nextHeading` |
| `CLAUDE.md` | document this pass in a new dated section |

---

## Task 1: vitest setup + `delivery.ts`

Adds the test runner (folded in here — the first task that needs it) and the pure postcode/region logic.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/features/delivery/delivery.ts`
- Test: `src/features/delivery/delivery.test.ts`

**Interfaces:**
- Produces:
  - `AT_POSTCODE_RE: RegExp` — matches exactly 4 digits, first digit 1–9.
  - `type RegionKey = "wien" | "niederoesterreich" | "oberoesterreich" | "salzburg" | "tirolVorarlberg" | "burgenland" | "steiermark" | "kaernten"`
  - `regionForPostcode(postcode: string): RegionKey | undefined`
  - `isServiceableAt(postcode: string): boolean`

- [ ] **Step 1: Add vitest to `package.json`**

In `devDependencies` add (keep the list alphabetically sorted as it currently is — `vitest` goes last):

```json
    "typescript": "5.7.2",
    "vite": "6.3.5",
    "vitest": "2.1.9"
```

In `scripts` add `test` and `test:watch`:

```json
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
```

- [ ] **Step 2: Install**

Run: `pnpm install`
Expected: adds `vitest` and its deps; no build-script prompt (esbuild is already in `pnpm.onlyBuiltDependencies`).

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write the failing test — `src/features/delivery/delivery.test.ts`**

```ts
import { describe, expect, it } from "vitest";

import { AT_POSTCODE_RE, isServiceableAt, regionForPostcode } from "./delivery";

describe("AT_POSTCODE_RE", () => {
  it("accepts a 4-digit code with a leading 1-9", () => {
    expect(AT_POSTCODE_RE.test("1010")).toBe(true);
    expect(AT_POSTCODE_RE.test("9500")).toBe(true);
  });
  it("rejects wrong length, leading zero, and non-digits", () => {
    expect(AT_POSTCODE_RE.test("101")).toBe(false);
    expect(AT_POSTCODE_RE.test("10100")).toBe(false);
    expect(AT_POSTCODE_RE.test("0100")).toBe(false);
    expect(AT_POSTCODE_RE.test("10a0")).toBe(false);
    expect(AT_POSTCODE_RE.test("")).toBe(false);
    expect(AT_POSTCODE_RE.test(" 1010 ")).toBe(false);
  });
});

describe("regionForPostcode", () => {
  it("maps each leading digit to its region", () => {
    expect(regionForPostcode("1010")).toBe("wien");
    expect(regionForPostcode("2000")).toBe("niederoesterreich");
    expect(regionForPostcode("3100")).toBe("niederoesterreich");
    expect(regionForPostcode("4020")).toBe("oberoesterreich");
    expect(regionForPostcode("5020")).toBe("salzburg");
    expect(regionForPostcode("6020")).toBe("tirolVorarlberg");
    expect(regionForPostcode("7000")).toBe("burgenland");
    expect(regionForPostcode("8010")).toBe("steiermark");
    expect(regionForPostcode("9500")).toBe("kaernten");
  });
  it("returns undefined for anything that is not a valid AT postcode", () => {
    expect(regionForPostcode("0100")).toBeUndefined();
    expect(regionForPostcode("123")).toBeUndefined();
    expect(regionForPostcode("12345")).toBeUndefined();
    expect(regionForPostcode("abcd")).toBeUndefined();
    expect(regionForPostcode("")).toBeUndefined();
  });
});

describe("isServiceableAt", () => {
  it("is true for any valid AT postcode (DHL is nationwide)", () => {
    expect(isServiceableAt("1010")).toBe(true);
    expect(isServiceableAt("8010")).toBe(true);
  });
  it("is false for an invalid postcode", () => {
    expect(isServiceableAt("0000")).toBe(false);
    expect(isServiceableAt("99")).toBe(false);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './delivery'` / all cases error.

- [ ] **Step 6: Implement `src/features/delivery/delivery.ts`**

```ts
/**
 * Delivery-area check for the assessment's postcode step.
 *
 * WeCare ships DHL across all of Austria (no city-level courier micro-zones),
 * so every valid Austrian postcode is serviceable — this exists for the
 * reassurance moment ("yes, we deliver to your area"), not to gate anyone.
 * `isServiceableAt` is kept as a function so a real coverage table can slot
 * in later without touching call sites. No network calls, no dependencies.
 */

/** Exactly four digits, first digit 1-9 (Austrian postcodes are 1000-9992). */
export const AT_POSTCODE_RE = /^[1-9]\d{3}$/;

export type RegionKey =
  | "wien"
  | "niederoesterreich"
  | "oberoesterreich"
  | "salzburg"
  | "tirolVorarlberg"
  | "burgenland"
  | "steiermark"
  | "kaernten";

/** Leading digit → federal state. 6xxx spans Tyrol *and* Vorarlberg, so it
 *  maps to the combined key. Region names resolve via
 *  `assessment:regions.<key>`. */
const REGION_BY_LEADING_DIGIT: Record<string, RegionKey> = {
  "1": "wien",
  "2": "niederoesterreich",
  "3": "niederoesterreich",
  "4": "oberoesterreich",
  "5": "salzburg",
  "6": "tirolVorarlberg",
  "7": "burgenland",
  "8": "steiermark",
  "9": "kaernten",
};

export function regionForPostcode(postcode: string): RegionKey | undefined {
  if (!AT_POSTCODE_RE.test(postcode)) return undefined;
  return REGION_BY_LEADING_DIGIT[postcode[0]];
}

export function isServiceableAt(postcode: string): boolean {
  return AT_POSTCODE_RE.test(postcode);
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS — all `delivery.test.ts` cases green.

- [ ] **Step 8: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/features/delivery/
git commit -m "test: add vitest; feat: Austrian postcode / delivery-region helper

Pure logic for the assessment postcode step. vitest is dev-only, pure-logic
unit tests; component behaviour still verified via typecheck/build/browser.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 2: `exclusions.ts`

Pure state shape + helpers for the informational safety step.

**Files:**
- Create: `src/features/assessment/exclusions.ts`
- Test: `src/features/assessment/exclusions.test.ts`

**Interfaces:**
- Produces:
  - `EXCLUSION_CONDITION_KEYS: readonly ["heart","liverKidney","psychosis","dependence","allergy"]`
  - `type ExclusionConditionKey = (typeof EXCLUSION_CONDITION_KEYS)[number] | "none"`
  - `interface AssessmentExclusions { pregnancy?: "yes" | "no"; recentSupply?: "yes" | "no"; conditions?: ExclusionConditionKey[] }`
  - `toggleCondition(current: ExclusionConditionKey[], key: ExclusionConditionKey): ExclusionConditionKey[]` — pure; selecting `"none"` clears all others, selecting any other clears `"none"`, re-selecting removes.
  - `hasAnyFlag(x: AssessmentExclusions | undefined): boolean` — true if `pregnancy === "yes"` or `recentSupply === "yes"` or `conditions` contains any key other than `"none"`.
  - `exclusionFlagCount(x: AssessmentExclusions | undefined): number` — count of set flags (pregnancy-yes = 1, recentSupply-yes = 1, plus each non-`none` condition).

- [ ] **Step 1: Write the failing test — `src/features/assessment/exclusions.test.ts`**

```ts
import { describe, expect, it } from "vitest";

import {
  exclusionFlagCount,
  hasAnyFlag,
  toggleCondition,
  type AssessmentExclusions,
} from "./exclusions";

describe("toggleCondition", () => {
  it("adds a condition", () => {
    expect(toggleCondition([], "heart")).toEqual(["heart"]);
  });
  it("removes a condition that is already selected", () => {
    expect(toggleCondition(["heart", "allergy"], "heart")).toEqual(["allergy"]);
  });
  it("selecting 'none' clears every other condition", () => {
    expect(toggleCondition(["heart", "allergy"], "none")).toEqual(["none"]);
  });
  it("selecting a real condition clears a prior 'none'", () => {
    expect(toggleCondition(["none"], "heart")).toEqual(["heart"]);
  });
  it("re-selecting 'none' removes it", () => {
    expect(toggleCondition(["none"], "none")).toEqual([]);
  });
});

describe("hasAnyFlag", () => {
  it("is false for undefined / empty / all-negative", () => {
    expect(hasAnyFlag(undefined)).toBe(false);
    expect(hasAnyFlag({})).toBe(false);
    expect(
      hasAnyFlag({ pregnancy: "no", recentSupply: "no", conditions: ["none"] }),
    ).toBe(false);
  });
  it("is true when any single flag is set", () => {
    expect(hasAnyFlag({ pregnancy: "yes" })).toBe(true);
    expect(hasAnyFlag({ recentSupply: "yes" })).toBe(true);
    expect(hasAnyFlag({ conditions: ["heart"] })).toBe(true);
  });
});

describe("exclusionFlagCount", () => {
  it("counts every set flag", () => {
    expect(exclusionFlagCount(undefined)).toBe(0);
    expect(
      exclusionFlagCount({
        pregnancy: "yes",
        recentSupply: "no",
        conditions: ["heart", "allergy"],
      }),
    ).toBe(3);
    expect(exclusionFlagCount({ conditions: ["none"] })).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/features/assessment/exclusions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/features/assessment/exclusions.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/features/assessment/exclusions.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/assessment/exclusions.ts src/features/assessment/exclusions.test.ts
git commit -m "feat: assessment exclusions state shape + mutual-exclusion helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 3: `steps.ts` — phase derivation

Pure helpers for the `postcode → questions → exclusion` sequence and the cross-phase progress index.

**Files:**
- Create: `src/features/assessment/steps.ts`
- Test: `src/features/assessment/steps.test.ts`

**Interfaces:**
- Consumes: `QUESTIONS`, `TOTAL_QUESTIONS`, `AssessmentAnswers` from `./questions`; `AssessmentExclusions` from `./exclusions`.
- Produces:
  - `type Phase = "postcode" | "questions" | "exclusion"`
  - `TOTAL_STEPS: number` — `1 + TOTAL_QUESTIONS + 1` (= 8)
  - `firstQuestionStep(answers: AssessmentAnswers, prefilled: boolean): number` — `0` if `prefilled`, else index of the first unanswered question, else `0`.
  - `deriveStartPhase(input: { postcode?: string; answers: AssessmentAnswers; exclusions?: AssessmentExclusions; prefilled: boolean }): { phase: Phase; step: number }`
  - `overallStepIndex(phase: Phase, step: number): number` — `0` for postcode, `1 + step` for questions, `TOTAL_STEPS - 1` for exclusion.

- [ ] **Step 1: Write the failing test — `src/features/assessment/steps.test.ts`**

```ts
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
  it("is postcode + 6 questions + exclusion", () => {
    expect(TOTAL_STEPS).toBe(8);
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
    expect(
      deriveStartPhase({ answers: {}, prefilled: false }),
    ).toEqual({ phase: "postcode", step: 0 });
  });
  it("goes to questions at the first gap once a postcode exists", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: { q1: "sleep" }, prefilled: false }),
    ).toEqual({ phase: "questions", step: 1 });
  });
  it("respects a landing-page prefill (starts at q1)", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: { q1: "sleep" }, prefilled: true }),
    ).toEqual({ phase: "questions", step: 0 });
  });
  it("goes to exclusion when all questions are answered but none are saved", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: full, prefilled: false }),
    ).toEqual({ phase: "exclusion", step: 0 });
  });
  it("falls back to questions step 0 when everything is done", () => {
    expect(
      deriveStartPhase({
        postcode: "1010",
        answers: full,
        exclusions: { conditions: ["none"] },
        prefilled: false,
      }),
    ).toEqual({ phase: "questions", step: 0 });
  });
});

describe("overallStepIndex", () => {
  it("orders postcode, questions, exclusion", () => {
    expect(overallStepIndex("postcode", 0)).toBe(0);
    expect(overallStepIndex("questions", 0)).toBe(1);
    expect(overallStepIndex("questions", 5)).toBe(6);
    expect(overallStepIndex("exclusion", 0)).toBe(TOTAL_STEPS - 1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/features/assessment/steps.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/features/assessment/steps.ts`**

```ts
import type { AssessmentExclusions } from "./exclusions";
import { isComplete, QUESTIONS, TOTAL_QUESTIONS, type AssessmentAnswers } from "./questions";

export type Phase = "postcode" | "questions" | "exclusion";

/** postcode (1) + the six questions + the exclusion step (1). */
export const TOTAL_STEPS = 1 + TOTAL_QUESTIONS + 1;

/** Where the questions phase opens. A landing-page `?problem=` prefill still
 *  shows q1 (so the user can confirm / change it); otherwise resume at the
 *  first gap. */
export function firstQuestionStep(
  answers: AssessmentAnswers,
  prefilled: boolean,
): number {
  if (prefilled) return 0;
  const i = QUESTIONS.findIndex((q) => !answers[q.id]);
  return i === -1 ? 0 : i;
}

export function deriveStartPhase(input: {
  postcode?: string;
  answers: AssessmentAnswers;
  exclusions?: AssessmentExclusions;
  prefilled: boolean;
}): { phase: Phase; step: number } {
  const { postcode, answers, exclusions, prefilled } = input;
  if (!postcode) return { phase: "postcode", step: 0 };
  if (!isComplete(answers)) {
    return { phase: "questions", step: firstQuestionStep(answers, prefilled) };
  }
  if (!exclusions) return { phase: "exclusion", step: 0 };
  return { phase: "questions", step: 0 };
}

export function overallStepIndex(phase: Phase, step: number): number {
  if (phase === "postcode") return 0;
  if (phase === "exclusion") return TOTAL_STEPS - 1;
  return 1 + step;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/features/assessment/steps.test.ts`
Expected: PASS.

- [ ] **Step 5: Full test + typecheck**

Run: `pnpm test && pnpm typecheck`
Expected: all suites pass; no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/assessment/steps.ts src/features/assessment/steps.test.ts
git commit -m "feat: assessment phase-derivation helpers (postcode / questions / exclusion)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 4: `NextSteps.tsx` shared component + dedupe

Extract the numbered-chip list that already appears (identically) on the result page and the order-confirmation page into one component. No behaviour change — visual parity is the deliverable.

**Files:**
- Create: `src/components/marketing/NextSteps.tsx`
- Modify: `src/pages/shop/OrderConfirmationPage.tsx`
- Modify: `src/pages/assessment/ResultPage.tsx` (only the trailing "What happens next" `<Reveal>` block, lines ~416–436)

**Interfaces:**
- Produces: `NextSteps({ steps }: { steps: { title: string; body: string }[] }): JSX.Element` — renders an `<ol>` of numbered `size-7` sage chips + title + one-line body, `sm:grid-cols-3` when there are 3 steps, single column otherwise.

- [ ] **Step 1: Create `src/components/marketing/NextSteps.tsx`**

```tsx
/**
 * The numbered "what happens next" step list used on the result page, the
 * checkout page, and the order-confirmation page. Presentational only — pass
 * already-translated `{ title, body }` strings.
 */
export function NextSteps({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol
      className={
        steps.length === 3
          ? "grid gap-4 sm:grid-cols-3"
          : "grid gap-4"
      }
    >
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 font-display text-sm text-petrol-700">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{s.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Use it in `OrderConfirmationPage.tsx`**

Add the import near the other `@/components` imports:

```tsx
import { NextSteps } from "@/components/marketing/NextSteps";
```

Replace the inline `<ol>…</ol>` (currently the block starting `<ol className="mx-auto mt-4 grid max-w-md gap-4 text-left">` through its closing `</ol>`) with:

```tsx
      <div className="mx-auto mt-4 max-w-md text-left">
        <NextSteps
          steps={(["received", "review", "dispatch"] as const).map((k) => ({
            title: t(`confirmation.steps.${k}.title`),
            body: t(`confirmation.steps.${k}.body`),
          }))}
        />
      </div>
```

- [ ] **Step 3: Use it in `ResultPage.tsx`**

Add the import near the other `@/components/marketing` imports:

```tsx
import { NextSteps } from "@/components/marketing/NextSteps";
```

Replace the inner `<ol className="mt-4 grid gap-4 sm:grid-cols-3">…</ol>` (inside the final `<Reveal className="mt-10 …">` block) with:

```tsx
        <div className="mt-4">
          <NextSteps
            steps={(["view", "review", "delivery"] as const).map((k) => ({
              title: t(`result.next.${k}.title`),
              body: t(`result.next.${k}.body`),
            }))}
          />
        </div>
```

- [ ] **Step 4: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: both green.

- [ ] **Step 5: Manual browser check**

Run: `pnpm dev`. Verify:
- `/shop/confirmation` (place a mock order first, or visit with a prior order) — the 3 numbered steps look exactly as before.
- `/assessment/result` (complete the assessment once) — the "What happens next" 3 steps look exactly as before, in both DE and EN.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/NextSteps.tsx src/pages/shop/OrderConfirmationPage.tsx src/pages/assessment/ResultPage.tsx
git commit -m "refactor: extract shared NextSteps numbered-step list

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 5: AssessmentContext — persist postcode + region + exclusions

**Files:**
- Modify: `src/features/assessment/AssessmentContext.tsx`

**Interfaces:**
- Consumes: `AssessmentExclusions` from `../assessment/exclusions`; `RegionKey` from `@/features/delivery/delivery`.
- Produces (added to `AssessmentContextValue`):
  - `postcode: string | null`
  - `deliveryRegion: RegionKey | null`
  - `exclusions: AssessmentExclusions | null`
  - `setPostcode(postcode: string, region: RegionKey | null): void` — also sets `completedAt` to `null`
  - `setExclusions(x: AssessmentExclusions): void`
  - `reset()` additionally clears all three.

- [ ] **Step 1: Update the stored shape + interface**

In `src/features/assessment/AssessmentContext.tsx`, add imports:

```ts
import type { AssessmentExclusions } from "./exclusions";
import type { RegionKey } from "@/features/delivery/delivery";
```

Extend `StoredState`:

```ts
interface StoredState {
  answers: AssessmentAnswers;
  completedAt: string | null;
  postcode: string | null;
  deliveryRegion: RegionKey | null;
  exclusions: AssessmentExclusions | null;
}
```

Extend `AssessmentContextValue`:

```ts
interface AssessmentContextValue {
  answers: AssessmentAnswers;
  completedAt: string | null;
  result: Recommendation | null;
  postcode: string | null;
  deliveryRegion: RegionKey | null;
  exclusions: AssessmentExclusions | null;
  setAnswer: (id: QuestionId, value: string) => void;
  setPostcode: (postcode: string, region: RegionKey | null) => void;
  setExclusions: (x: AssessmentExclusions) => void;
  prefillProblem: (problem: string) => void;
  submit: () => Recommendation | null;
  reset: () => void;
}
```

- [ ] **Step 2: Update `load()` (back-compat — old storage lacks the new keys)**

Replace the `if (parsed && typeof parsed === "object" && parsed.answers) { return { … }; }` block with:

```ts
    if (parsed && typeof parsed === "object" && parsed.answers) {
      return {
        answers: parsed.answers,
        completedAt: parsed.completedAt ?? null,
        postcode: parsed.postcode ?? null,
        deliveryRegion: parsed.deliveryRegion ?? null,
        exclusions: parsed.exclusions ?? null,
      };
    }
```

Update the `empty` constant:

```ts
  const empty: StoredState = {
    answers: {},
    completedAt: null,
    postcode: null,
    deliveryRegion: null,
    exclusions: null,
  };
```

- [ ] **Step 3: Wire the new state**

In `AssessmentProvider`, after the `completedAt` state:

```ts
  const [postcode, setPostcodeState] = useState<string | null>(initial.postcode);
  const [deliveryRegion, setDeliveryRegion] = useState<RegionKey | null>(
    initial.deliveryRegion,
  );
  const [exclusions, setExclusionsState] = useState<AssessmentExclusions | null>(
    initial.exclusions,
  );
```

Update the persistence effect:

```ts
  useEffect(() => {
    save({ answers, completedAt, postcode, deliveryRegion, exclusions });
  }, [answers, completedAt, postcode, deliveryRegion, exclusions]);
```

Add the setters (after `setAnswer`):

```ts
  const setPostcode = useCallback(
    (pc: string, region: RegionKey | null) => {
      setPostcodeState(pc);
      setDeliveryRegion(region);
      setCompletedAt(null);
    },
    [],
  );

  const setExclusions = useCallback((x: AssessmentExclusions) => {
    setExclusionsState(x);
  }, []);
```

Update `reset`:

```ts
  const reset = useCallback(() => {
    setAnswers({});
    setCompletedAt(null);
    setPostcodeState(null);
    setDeliveryRegion(null);
    setExclusionsState(null);
  }, []);
```

Add all six new values to the `value` `useMemo` object **and** its dependency array:

```ts
  const value = useMemo<AssessmentContextValue>(
    () => ({
      answers,
      completedAt,
      result,
      postcode,
      deliveryRegion,
      exclusions,
      setAnswer,
      setPostcode,
      setExclusions,
      prefillProblem,
      submit,
      reset,
    }),
    [
      answers,
      completedAt,
      result,
      postcode,
      deliveryRegion,
      exclusions,
      setAnswer,
      setPostcode,
      setExclusions,
      prefillProblem,
      submit,
      reset,
    ],
  );
```

- [ ] **Step 4: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: green. (No consumer uses the new fields yet — that's fine.)

- [ ] **Step 5: Manual storage check**

Run: `pnpm dev`, open `/assessment/start`, complete the age gate, then in devtools console:
`JSON.parse(localStorage["wecare.assessment"])` — confirm it now has `postcode: null, deliveryRegion: null, exclusions: null` alongside `answers` / `completedAt`. Reload — no crash, values persist.

- [ ] **Step 6: Commit**

```bash
git add src/features/assessment/AssessmentContext.tsx
git commit -m "feat: persist postcode / delivery region / exclusions on the assessment

Back-compatible: old wecare.assessment payloads read the new keys as null.
Not consumed yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 6: `QuestionStep` extraction + auto-advance (questions phase only)

Pull the question-card renderer out of `AssessmentEnginePage` into `QuestionStep.tsx`, then add auto-advance to the six-question flow. No new phases yet — the page still starts at q1.

**Files:**
- Create: `src/pages/assessment/QuestionStep.tsx`
- Modify: `src/pages/assessment/AssessmentEnginePage.tsx`

**Interfaces:**
- `QuestionStep` consumes: `question: Question` (from `@/features/assessment/questions`), `current: string | undefined`, `onSelect(value: string): void`.
- `QuestionStep` produces: `QuestionStep(props): JSX.Element` — the `<fieldset class="glass-strong …">` with the `<legend>`, optional note, and the radio option list. Calls `onSelect(opt)` from each radio's `onChange`.
- `AssessmentEnginePage` gains an internal `armAdvance()` / `clearAdvanceTimer()` pair and a `prefersReducedMotion()` helper.

- [ ] **Step 1: Create `src/pages/assessment/QuestionStep.tsx`**

```tsx
import { useTranslation } from "react-i18next";

import type { Question } from "@/features/assessment/questions";

/** One assessment question — the frosted card with a radio option list.
 *  Selection is reported via `onSelect`; the parent decides whether to
 *  auto-advance. */
export function QuestionStep({
  question,
  current,
  onSelect,
}: {
  question: Question;
  current: string | undefined;
  onSelect: (value: string) => void;
}) {
  const { t } = useTranslation("assessment");
  const note = t(`questions.${question.id}.note`, { defaultValue: "" });

  return (
    <fieldset className="glass-strong mt-8 rounded-2xl md:rounded-3xl p-6 sm:p-8">
      <legend className="float-left mb-1 w-full font-display text-xl md:text-2xl text-ink">
        {t(`questions.${question.id}.title`)}
      </legend>
      {note ? (
        <p className="clear-both text-sm text-ink-muted">{note}</p>
      ) : null}
      <div className="grid gap-4 clear-both mt-16">
        {question.options.map((opt) => {
          const id = `${question.id}-${opt}`;
          const hint = t(`questions.${question.id}.hints.${opt}`, {
            defaultValue: "",
          });
          return (
            <label
              key={opt}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-surface-raised p-4 transition-colors hover:border-petrol-300 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol-600"
            >
              <input
                type="radio"
                id={id}
                name={question.id}
                value={opt}
                checked={current === opt}
                onChange={() => onSelect(opt)}
                className="mt-0.5 size-4 shrink-0 accent-petrol-600"
              />
              <span className="min-w-0">
                <span className="block text-ink">
                  {t(`questions.${question.id}.options.${opt}`)}
                </span>
                {hint ? (
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {hint}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Rewrite `AssessmentEnginePage.tsx` (questions phase + auto-advance)**

Full new file content (this replaces `src/pages/assessment/AssessmentEnginePage.tsx`; the postcode/exclusion phases are added in Tasks 7–8):

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  type QuestionId,
} from "@/features/assessment/questions";
import { firstQuestionStep, overallStepIndex, TOTAL_STEPS } from "@/features/assessment/steps";
import { isConditionKey } from "@/features/conditions/conditions";
import { confirmAge, isAgeConfirmed } from "@/features/age/age";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { AgeGate } from "./AgeGate";
import { QuestionStep } from "./QuestionStep";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Single reusable, state-based assessment engine — no route changes between
 *  steps (spec §7). Auto-advances the questions on selection; keeps a
 *  secondary Next as a keyboard / changed-mind path. */
export function AssessmentEnginePage() {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();
  const { answers, setAnswer, submit, prefillProblem, reset } = useAssessment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  usePageTitle(t("start.title"), tCommon("pages.assessmentStart.description"));

  const [ageOk, setAgeOk] = useState(isAgeConfirmed);

  const problemParam = params.get("problem");
  const prefilledFromLanding = useMemo(
    () => Boolean(problemParam && isConditionKey(problemParam)),
    [problemParam],
  );

  useEffect(() => {
    if (problemParam && isConditionKey(problemParam)) {
      prefillProblem(problemParam);
    }
  }, [problemParam, prefillProblem]);

  const startedTracked = useRef(false);
  useEffect(() => {
    if (!ageOk || startedTracked.current) return;
    startedTracked.current = true;
    track(AnalyticsEvent.assessmentStarted, {
      problem: problemParam && isConditionKey(problemParam) ? problemParam : null,
      resumed: QUESTIONS.some((q) => Boolean(answers[q.id])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageOk]);

  const [step, setStep] = useState(() =>
    firstQuestionStep(answers, false),
  );

  const question = QUESTIONS[step];
  const current = answers[question.id];
  const isLast = step === TOTAL_QUESTIONS - 1;

  // --- auto-advance -------------------------------------------------------
  const advanceTimer = useRef<number | null>(null);
  function clearAdvanceTimer() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }
  function armAdvance() {
    clearAdvanceTimer();
    const delay = prefersReducedMotion() ? 120 : 350;
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
    }, delay);
  }
  useEffect(() => () => clearAdvanceTimer(), []);

  function recordAnswer(id: QuestionId, value: string) {
    setAnswer(id, value);
    track(AnalyticsEvent.assessmentQuestionAnswered, {
      question: id,
      questionIndex: step,
      auto_advanced: !isLast,
    });
    if (id === "q1") {
      track(AnalyticsEvent.problemSelected, { problem: value, source: "assessment" });
    }
    // Only the last question waits for an explicit CTA — finishing the
    // assessment should never be an accidental tap.
    if (!isLast) armAdvance();
  }

  function goBack() {
    clearAdvanceTimer();
    track(AnalyticsEvent.assessmentBackClicked, { question: question.id });
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    clearAdvanceTimer();
    if (!current) return;
    if (isLast) {
      const rec = submit();
      if (rec) {
        track(AnalyticsEvent.assessmentCompleted, { problem: rec.problem });
        navigate(paths.assessment.result);
      }
      return;
    }
    setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
  }

  if (!ageOk) {
    return (
      <AgeGate
        onConfirm={(dobIso) => {
          confirmAge(dobIso);
          setAgeOk(true);
        }}
      />
    );
  }

  const stepIndex = overallStepIndex("questions", step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <JourneyStepper current="assessment" className="mb-8" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {t("start.title")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })}
          </p>
        </div>
        <AssessmentRing
          value={stepIndex + 1}
          total={TOTAL_STEPS}
          size={72}
          label={t("start.progress", {
            current: step + 1,
            total: TOTAL_QUESTIONS,
          })}
        />
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/60"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={stepIndex + 1}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#7ea9dd,#218390)] transition-[width] duration-300"
          style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {step === 0 ? (
        <div className="mt-4 space-y-1">
          <p className="text-ink-muted">{t("start.intro")}</p>
          <p className="text-sm text-ink-muted">{t("start.reassurance")}</p>
        </div>
      ) : null}

      {step === 0 && prefilledFromLanding && current ? (
        <p className="mt-6 rounded-lg bg-sage-50 px-4 py-3 text-sm text-petrol-700">
          {t("start.prefilledNote", {
            condition: t(`questions.q1.options.${current}`),
          })}
        </p>
      ) : null}

      <div
        key={step}
        className="animate-in fade-in duration-200 motion-reduce:animate-none"
      >
        <QuestionStep
          question={question}
          current={current}
          onSelect={(value) => recordAnswer(question.id, value)}
        />
        {!current ? (
          <p className="mt-3 text-sm text-ink-muted">
            {t("start.selectPrompt")}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("start.back")}
        </Button>

        <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-sm text-ink-muted underline-offset-4 hover:underline"
          >
            {t("start.restart")}
          </button>
          <Button
            type="button"
            variant={isLast ? "cta" : "default"}
            onClick={goNext}
            disabled={!current}
            className="min-w-0 max-sm:flex-1"
          >
            <span className="truncate">
              {isLast ? t("start.submit") : t("start.next")}
            </span>
            {!isLast ? (
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

> Note: `answeredCount` is no longer imported — the ring now shows overall step position. `firstQuestionStep(answers, false)` replaces the old inline `findIndex`. The `key={step}` wrapper gives the ~200 ms crossfade via `tw-animate-css`.

- [ ] **Step 3: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: green.

- [ ] **Step 4: Manual browser checklist**

Run: `pnpm dev`, go to `/assessment/start`, pass the age gate.
- Tapping an option on q1 highlights it, then after a beat auto-advances to q2. ✅
- The secondary "Next" button is present on q1–q5; tapping it also advances; it is disabled until an option is chosen. ✅
- On q6 there is **no** auto-advance — the primary CTA reads "Show My Recommended Solution" (EN) / "Meine empfohlene Lösung anzeigen" (DE) and only submitting via that CTA navigates to `/assessment/result`. ✅
- "Back" returns to the previous question with the answer still selected; it does **not** auto-advance. Changing the answer there re-arms auto-advance. ✅
- Progress bar + ring advance in eighths (q1 shows 2/8). ✅
- With OS "reduce motion" on: advance is near-instant, no crossfade. ✅
- Keyboard: Tab to the radio group, arrow to an option, pause — it advances after the delay; or Tab to "Next" and press Enter. ✅
- `?problem=sleep` deep link (`/assessment/start?problem=sleep`): q1 shows pre-selected with the "Pre-selected: Sleep Problems" note, no auto-skip. ✅
- Repeat the option-tap check in EN (`?` language toggle in the footer). ✅

- [ ] **Step 5: Commit**

```bash
git add src/pages/assessment/QuestionStep.tsx src/pages/assessment/AssessmentEnginePage.tsx
git commit -m "feat: auto-advance the assessment questions; extract QuestionStep

One tap per question advances after a 350ms beat (120ms under reduced
motion); a secondary Next stays as the keyboard / changed-mind path; the
last question keeps an explicit submit CTA. Progress now spans 8 steps.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 7: PostcodeStep + DeliveryConfirmation + wire the postcode phase

**Files:**
- Create: `src/pages/assessment/PostcodeStep.tsx`
- Create: `src/components/marketing/DeliveryConfirmation.tsx`
- Modify: `src/pages/assessment/AssessmentEnginePage.tsx` (add `phase` state, render postcode first)
- Modify: `src/lib/analytics.ts` (add event name)
- Modify: `src/i18n/locales/{de,en}/assessment.json`
- Modify: `src/i18n/locales/{de,en}/common.json`

**Interfaces:**
- Consumes: `AT_POSTCODE_RE`, `regionForPostcode`, `type RegionKey` from `@/features/delivery/delivery`; `useAssessment().setPostcode`.
- `DeliveryConfirmation` produces: `DeliveryConfirmation({ postcode, region, className }: { postcode: string; region: RegionKey | null; className?: string }): JSX.Element` — a muted one-liner from `common:delivery.confirmLine`; when `region` is null the `{{region}}` slot falls back to `common:delivery.regionUnknown`.
- `PostcodeStep` produces: `PostcodeStep({ onComplete }: { onComplete: () => void }): JSX.Element` — validates, persists via `setPostcode`, shows `<DeliveryConfirmation>` for ~1s, then calls `onComplete()`.
- `AssessmentEnginePage` gains `phase: Phase` state driven by `deriveStartPhase`.

- [ ] **Step 1: Add the analytics event name**

In `src/lib/analytics.ts`, inside the `AnalyticsEvent` object, after `assessmentBackClicked`:

```ts
  assessmentBackClicked: "assessment_back_clicked",
  assessmentPostcodeSubmitted: "assessment_postcode_submitted",
  assessmentExclusionCompleted: "assessment_exclusion_completed",
  assessmentCompleted: "assessment_completed",
```

(Adding both now; the exclusion one is used in Task 8.)

- [ ] **Step 2: Add i18n — `en/common.json`**

Add a new top-level key (after `medicalNotice`, keep valid JSON):

```json
  "delivery": {
    "confirmLine": "We deliver to {{postcode}} ({{region}}). Usually next day once your prescription is approved.",
    "regionUnknown": "your area"
  }
```

- [ ] **Step 3: Add i18n — `de/common.json`**

```json
  "delivery": {
    "confirmLine": "Wir liefern nach {{postcode}} ({{region}}). Meist am nächsten Tag, sobald die ärztliche Freigabe vorliegt.",
    "regionUnknown": "dein Gebiet"
  }
```

- [ ] **Step 4: Add i18n — `en/assessment.json`**

Add these keys at the top level of the object (siblings of `ageGate` / `start` / `questions` / `result` / `review`):

```json
  "phase": {
    "delivery": "Delivery",
    "finalChecks": "Final checks"
  },
  "postcode": {
    "heading": "Where should we deliver?",
    "sub": "We'll check we cover your area. Takes a second.",
    "placeholder": "e.g. 1010",
    "continue": "Continue",
    "error": "Enter a 4-digit Austrian postcode."
  },
  "regions": {
    "wien": "Vienna",
    "niederoesterreich": "Lower Austria",
    "oberoesterreich": "Upper Austria",
    "salzburg": "Salzburg",
    "tirolVorarlberg": "Tyrol / Vorarlberg",
    "burgenland": "Burgenland",
    "steiermark": "Styria",
    "kaernten": "Carinthia"
  },
```

Also add inside the existing `result` object:

```json
    "exclusionNote": "Your reviewer will also go through the health checks you completed.",
```

- [ ] **Step 5: Add i18n — `de/assessment.json`** (informal du, en-dash, "ärztliche Prüfung")

```json
  "phase": {
    "delivery": "Lieferung",
    "finalChecks": "Letzte Fragen"
  },
  "postcode": {
    "heading": "Wohin sollen wir liefern?",
    "sub": "Wir prüfen kurz, ob wir dein Gebiet abdecken. Dauert nur einen Moment.",
    "placeholder": "z. B. 1010",
    "continue": "Weiter",
    "error": "Bitte gib eine 4-stellige österreichische Postleitzahl ein."
  },
  "regions": {
    "wien": "Wien",
    "niederoesterreich": "Niederösterreich",
    "oberoesterreich": "Oberösterreich",
    "salzburg": "Salzburg",
    "tirolVorarlberg": "Tirol / Vorarlberg",
    "burgenland": "Burgenland",
    "steiermark": "Steiermark",
    "kaernten": "Kärnten"
  },
```

And inside `result`:

```json
    "exclusionNote": "Deine prüfende Ärztin oder dein prüfender Arzt geht auch die Gesundheitsfragen mit dir durch, die du beantwortet hast.",
```

- [ ] **Step 6: Create `src/components/marketing/DeliveryConfirmation.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { Truck } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import type { RegionKey } from "@/features/delivery/delivery";

/** One muted line confirming the delivery area. Shown on the postcode step,
 *  the result page and the checkout page. */
export function DeliveryConfirmation({
  postcode,
  region,
  className,
}: {
  postcode: string;
  region: RegionKey | null;
  className?: string;
}) {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();

  const regionLabel = region
    ? t(`regions.${region}`)
    : tCommon("delivery.regionUnknown");

  return (
    <p
      className={cn(
        "flex items-start gap-2 text-sm text-ink-muted",
        className,
      )}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-petrol-600" aria-hidden />
      <span>
        {tCommon("delivery.confirmLine", { postcode, region: regionLabel })}
      </span>
    </p>
  );
}
```

- [ ] **Step 7: Create `src/pages/assessment/PostcodeStep.tsx`**

```tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  AT_POSTCODE_RE,
  regionForPostcode,
  type RegionKey,
} from "@/features/delivery/delivery";
import { AnalyticsEvent, track } from "@/lib/analytics";

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** First step of the assessment: confirm we deliver to the user's area.
 *  Every valid Austrian postcode is serviceable — this is reassurance, not a
 *  gate. Calls `onComplete()` once the confirmation has been shown briefly. */
export function PostcodeStep({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation("assessment");
  const { setPostcode } = useAssessment();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState<
    { postcode: string; region: RegionKey | null } | null
  >(null);

  const valid = AT_POSTCODE_RE.test(value);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (confirmed) return;
    if (!valid) {
      setError(true);
      return;
    }
    const region = regionForPostcode(value) ?? null;
    setPostcode(value, region);
    track(AnalyticsEvent.assessmentPostcodeSubmitted, {
      serviceable: true,
      region: region ?? "unknown",
    });
    setConfirmed({ postcode: value, region });
    window.setTimeout(onComplete, reducedMotion() ? 0 : 1000);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-xl md:text-2xl text-ink">
          {t("postcode.heading")}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t("postcode.sub")}</p>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={4}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          placeholder={t("postcode.placeholder")}
          aria-invalid={error || undefined}
          disabled={Boolean(confirmed)}
          className="mt-5 block w-full max-w-[12rem] rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink"
        />
        {error ? (
          <p className="mt-2 text-sm text-danger-600">{t("postcode.error")}</p>
        ) : null}

        {confirmed ? (
          <DeliveryConfirmation
            postcode={confirmed.postcode}
            region={confirmed.region}
            className="mt-4 rounded-xl bg-sage-50 p-3"
          />
        ) : null}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="default"
          disabled={!valid || Boolean(confirmed)}
        >
          {t("postcode.continue")}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 8: Wire the `phase` state into `AssessmentEnginePage.tsx`**

Add imports:

```tsx
import { deriveStartPhase, overallStepIndex, TOTAL_STEPS, type Phase } from "@/features/assessment/steps";
import { PostcodeStep } from "./PostcodeStep";
```

(remove the now-duplicated `firstQuestionStep` import line if present — keep `deriveStartPhase, overallStepIndex, TOTAL_STEPS, type Phase`; `firstQuestionStep` is no longer needed directly.)

Pull `postcode` and `exclusions` from the context hook:

```tsx
  const { answers, postcode, exclusions, setAnswer, submit, prefillProblem, reset } = useAssessment();
```

Replace the `const [step, setStep] = useState(…)` line with a combined phase+step init:

```tsx
  const [{ phase, step }, setPos] = useState<{ phase: Phase; step: number }>(() =>
    deriveStartPhase({
      postcode: postcode ?? undefined,
      answers,
      exclusions: exclusions ?? undefined,
      prefilled: prefilledFromLanding,
    }),
  );
  const setStep = (updater: number | ((s: number) => number)) =>
    setPos((p) => ({
      ...p,
      step: typeof updater === "function" ? updater(p.step) : updater,
    }));
```

> `deriveStartPhase` reads `prefilledFromLanding`, which is derived from `problemParam` synchronously — fine in the initializer. The `prefillProblem` effect still runs after and sets `q1`; on a fresh visit `deriveStartPhase` returns `{phase:"postcode",step:0}` regardless, so the effect's timing doesn't matter here.

Update the `assessmentStarted` "resumed" check (it referenced `answers` via `answeredCount` originally, now `QUESTIONS.some`) — already handled in Task 6.

Change the render so `phase === "postcode"` shows the postcode step. After the `if (!ageOk)` block and before `const stepIndex = …`, replace `const stepIndex = overallStepIndex("questions", step);` with:

```tsx
  const stepIndex = overallStepIndex(phase, step);
```

Wrap the header/progress so the eyebrow label is phase-aware. Replace the `<p className="mt-1 text-sm text-ink-muted">{t("start.progress", …)}</p>` line with:

```tsx
          <p className="mt-1 text-sm text-ink-muted">
            {phase === "questions"
              ? t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })
              : t("phase.delivery")}
          </p>
```

Then, replace the `<div key={step} className="animate-in …">` question block **and** the intro/prefill blocks with a phase switch. The cleanest edit: keep the intro/prefill blocks guarded by `phase === "questions" && step === 0`, and render the body per phase:

```tsx
      {phase === "questions" && step === 0 ? (
        <div className="mt-4 space-y-1">
          <p className="text-ink-muted">{t("start.intro")}</p>
          <p className="text-sm text-ink-muted">{t("start.reassurance")}</p>
        </div>
      ) : null}

      {phase === "questions" && step === 0 && prefilledFromLanding && current ? (
        <p className="mt-6 rounded-lg bg-sage-50 px-4 py-3 text-sm text-petrol-700">
          {t("start.prefilledNote", {
            condition: t(`questions.q1.options.${current}`),
          })}
        </p>
      ) : null}

      {phase === "postcode" ? (
        <div key="postcode" className="animate-in fade-in duration-200 motion-reduce:animate-none">
          <PostcodeStep onComplete={() => setPos({ phase: "questions", step: 0 })} />
        </div>
      ) : null}

      {phase === "questions" ? (
        <>
          <div
            key={step}
            className="animate-in fade-in duration-200 motion-reduce:animate-none"
          >
            <QuestionStep
              question={question}
              current={current}
              onSelect={(value) => recordAnswer(question.id, value)}
            />
            {!current ? (
              <p className="mt-3 text-sm text-ink-muted">
                {t("start.selectPrompt")}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {/* ... the existing Back / Start over / Next row, unchanged ... */}
          </div>
        </>
      ) : null}
```

> Keep the existing Back/Next row exactly as written in Task 6, just moved inside the `phase === "questions"` branch. `question` / `current` / `isLast` are computed from `step`; guard them so they aren't read in the postcode phase — since `QUESTIONS[step]` with `step` from `{phase:"questions",step:0}` init is always valid, and in the postcode phase the questions JSX isn't rendered, this is safe. If TypeScript complains about `question` being possibly used before the phase check, move `const question = QUESTIONS[step]` etc. to just above the `return` (they're cheap).

- [ ] **Step 9: Typecheck + build + test**

Run: `pnpm typecheck && pnpm build && pnpm test`
Expected: all green.

- [ ] **Step 10: Manual browser checklist**

`pnpm dev` → `/assessment/start`, pass the age gate:
- The **postcode step shows first**: heading "Where should we deliver?", numeric input, "Continue" disabled until 4 digits. ✅
- Typing letters is ignored; `101` keeps Continue disabled; `1010` enables it. ✅
- Submitting `1010` → the muted "We deliver to 1010 (Vienna). Usually next day…" line appears, then ~1s later it advances to q1. ✅
- Submitting an invalid value shows "Enter a 4-digit Austrian postcode." and does not advance. ✅
- Progress bar/ring: postcode = 1/8, q1 = 2/8. ✅
- Reload mid-questions → resumes at the first unanswered question (postcode already saved, not re-asked). ✅
- `localStorage["wecare.assessment"]` shows `postcode: "1010", deliveryRegion: "wien"`. ✅
- Reduced motion: confirmation shows, advance is immediate. ✅
- Repeat in DE — "Wohin sollen wir liefern?", "Wir liefern nach 1010 (Wien)…". ✅

- [ ] **Step 11: Commit**

```bash
git add src/pages/assessment/PostcodeStep.tsx src/components/marketing/DeliveryConfirmation.tsx src/pages/assessment/AssessmentEnginePage.tsx src/lib/analytics.ts src/i18n/locales/de/assessment.json src/i18n/locales/en/assessment.json src/i18n/locales/de/common.json src/i18n/locales/en/common.json
git commit -m "feat: postcode / delivery-area step at the start of the assessment

Confirms we deliver to the user's area (every valid AT postcode is
serviceable) before the medical questions. Region derived from the leading
digit; raw postcode is never sent to analytics.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 8: ExclusionStep + wire the exclusion phase

**Files:**
- Create: `src/pages/assessment/ExclusionStep.tsx`
- Modify: `src/pages/assessment/AssessmentEnginePage.tsx` (route q6 → exclusion → submit)
- Modify: `src/i18n/locales/{de,en}/assessment.json`

**Interfaces:**
- Consumes: `EXCLUSION_CONDITION_KEYS`, `toggleCondition`, `hasAnyFlag`, `exclusionFlagCount`, `type AssessmentExclusions`, `type ExclusionConditionKey` from `@/features/assessment/exclusions`; `useAssessment().setExclusions`.
- `ExclusionStep` produces: `ExclusionStep({ onComplete }: { onComplete: (x: AssessmentExclusions) => void }): JSX.Element`.

- [ ] **Step 1: i18n — `en/assessment.json`** (top-level `exclusion` object; add near `postcode`)

```json
  "exclusion": {
    "heading": "A few things your medical reviewer needs to know",
    "sub": "None of these stop you continuing. They just help the doctor.",
    "yes": "Yes",
    "no": "No",
    "pregnancy": {
      "q": "Are you pregnant, breastfeeding, or planning to become pregnant?"
    },
    "recentSupply": {
      "q": "In the last 30 days, have you received 100 g or more of cannabis on prescription?"
    },
    "conditions": {
      "q": "Do any of these apply to you?",
      "heart": "Heart condition",
      "liverKidney": "Liver or kidney condition",
      "psychosis": "History of psychosis or schizophrenia",
      "dependence": "Current or past substance dependence",
      "allergy": "Known allergy to cannabis, THC or CBD",
      "none": "None of these"
    },
    "flaggedNote": "Thanks. Your medical reviewer will go through these with you before anything is prescribed.",
    "continue": "Continue to my result"
  },
```

- [ ] **Step 2: i18n — `de/assessment.json`**

```json
  "exclusion": {
    "heading": "Ein paar Dinge, die deine ärztliche Prüfung braucht",
    "sub": "Nichts davon hindert dich am Weitermachen – es hilft nur der Ärztin oder dem Arzt.",
    "yes": "Ja",
    "no": "Nein",
    "pregnancy": {
      "q": "Bist du schwanger, stillst du oder planst du eine Schwangerschaft?"
    },
    "recentSupply": {
      "q": "Hast du in den letzten 30 Tagen 100 g Cannabis oder mehr auf Rezept erhalten?"
    },
    "conditions": {
      "q": "Trifft eines davon auf dich zu?",
      "heart": "Herzerkrankung",
      "liverKidney": "Leber- oder Nierenerkrankung",
      "psychosis": "Psychose oder Schizophrenie in der Vorgeschichte",
      "dependence": "Aktuelle oder frühere Abhängigkeit",
      "allergy": "Bekannte Allergie gegen Cannabis, THC oder CBD",
      "none": "Nichts davon"
    },
    "flaggedNote": "Danke. Deine prüfende Ärztin oder dein prüfender Arzt geht das mit dir durch, bevor etwas verschrieben wird.",
    "continue": "Weiter zu meinem Ergebnis"
  },
```

- [ ] **Step 3: Create `src/pages/assessment/ExclusionStep.tsx`**

```tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import {
  EXCLUSION_CONDITION_KEYS,
  hasAnyFlag,
  toggleCondition,
  type AssessmentExclusions,
  type ExclusionConditionKey,
} from "@/features/assessment/exclusions";

type YesNo = "yes" | "no" | undefined;

function YesNoRow({
  question,
  value,
  onChange,
  yes,
  no,
}: {
  question: string;
  value: YesNo;
  onChange: (v: "yes" | "no") => void;
  yes: string;
  no: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-medium text-ink">{question}</legend>
      <div className="mt-2 flex gap-3">
        {(["yes", "no"] as const).map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
          >
            <input
              type="radio"
              className="size-4 accent-petrol-600"
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt === "yes" ? yes : no}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** The informational "final checks" step (spec §3). Never blocks — the
 *  answers are for the reviewing doctor only. */
export function ExclusionStep({
  onComplete,
}: {
  onComplete: (x: AssessmentExclusions) => void;
}) {
  const { t } = useTranslation("assessment");
  const [pregnancy, setPregnancy] = useState<YesNo>(undefined);
  const [recentSupply, setRecentSupply] = useState<YesNo>(undefined);
  const [conditions, setConditions] = useState<ExclusionConditionKey[]>([]);

  const payload = useMemo<AssessmentExclusions>(
    () => ({
      pregnancy,
      recentSupply,
      conditions: conditions.length ? conditions : undefined,
    }),
    [pregnancy, recentSupply, conditions],
  );

  const showNote = hasAnyFlag(payload);

  return (
    <div className="mt-8">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-xl md:text-2xl text-ink">
          {t("exclusion.heading")}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t("exclusion.sub")}</p>

        <YesNoRow
          question={t("exclusion.pregnancy.q")}
          value={pregnancy}
          onChange={setPregnancy}
          yes={t("exclusion.yes")}
          no={t("exclusion.no")}
        />
        <YesNoRow
          question={t("exclusion.recentSupply.q")}
          value={recentSupply}
          onChange={setRecentSupply}
          yes={t("exclusion.yes")}
          no={t("exclusion.no")}
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink">
            {t("exclusion.conditions.q")}
          </legend>
          <div className="mt-2 grid gap-2">
            {[...EXCLUSION_CONDITION_KEYS, "none" as const].map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 text-sm text-ink has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-petrol-600"
                  checked={conditions.includes(key)}
                  onChange={() =>
                    setConditions((c) => toggleCondition(c, key))
                  }
                />
                {t(`exclusion.conditions.${key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        {showNote ? (
          <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm text-ink-muted">
            {t("exclusion.flaggedNote")}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" variant="cta" onClick={() => onComplete(payload)}>
          {t("exclusion.continue")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Route q6 → exclusion → submit in `AssessmentEnginePage.tsx`**

Add the import:

```tsx
import { ExclusionStep } from "./ExclusionStep";
```

Pull `setExclusions` from the hook:

```tsx
  const { answers, postcode, exclusions, setAnswer, setExclusions, submit, prefillProblem, reset } = useAssessment();
```

Add the analytics import usage — already imported `AnalyticsEvent`/`track`.

Change `goNext()` so that finishing q6 goes to the exclusion phase instead of submitting:

```tsx
  function goNext() {
    clearAdvanceTimer();
    if (!current) return;
    if (isLast) {
      setPos({ phase: "exclusion", step: 0 });
      return;
    }
    setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
  }
```

Add an exclusion-complete handler:

```tsx
  function finishExclusion(x: import("@/features/assessment/exclusions").AssessmentExclusions) {
    setExclusions(x);
    track(AnalyticsEvent.assessmentExclusionCompleted, {
      flagged: hasAnyFlag(x),
      flag_count: exclusionFlagCount(x),
    });
    const rec = submit();
    if (rec) {
      track(AnalyticsEvent.assessmentCompleted, { problem: rec.problem });
      navigate(paths.assessment.result);
    }
  }
```

Add the imports for `hasAnyFlag` / `exclusionFlagCount`:

```tsx
import { exclusionFlagCount, hasAnyFlag } from "@/features/assessment/exclusions";
```

Render the exclusion phase (after the `phase === "questions"` block):

```tsx
      {phase === "exclusion" ? (
        <div key="exclusion" className="animate-in fade-in duration-200 motion-reduce:animate-none">
          <p className="mt-1 text-sm text-ink-muted">{t("phase.finalChecks")}</p>
          <ExclusionStep onComplete={finishExclusion} />
          <div className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPos({ phase: "questions", step: TOTAL_QUESTIONS - 1 })}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("start.back")}
            </Button>
          </div>
        </div>
      ) : null}
```

> The eyebrow line inside the header already handles non-questions phases via the `phase === "questions" ? … : t("phase.delivery")` ternary from Task 7 — update that ternary to be phase-specific:
> ```tsx
>            {phase === "questions"
>              ? t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })
>              : phase === "postcode"
>                ? t("phase.delivery")
>                : t("phase.finalChecks")}
> ```

- [ ] **Step 5: Typecheck + build + test**

Run: `pnpm typecheck && pnpm build && pnpm test`
Expected: green.

- [ ] **Step 6: Manual browser checklist**

`pnpm dev` → complete postcode + all 6 questions:
- After tapping the q6 CTA, the **exclusion step** shows (not the result yet): heading "A few things your medical reviewer needs to know", two Yes/No rows, a 6-item checklist. ✅
- Checking "None of these" clears any ticked condition; ticking a condition unchecks "None". ✅
- Setting pregnancy = Yes (or any condition) shows the muted "Thanks. Your medical reviewer will go through these…" note. ✅
- "Continue to my result" is always enabled and navigates to `/assessment/result`. ✅
- Progress bar/ring shows 8/8 on this step. ✅
- "Back" returns to q6 with the answer intact. ✅
- `localStorage["wecare.assessment"].exclusions` is populated. ✅
- Reload while on the exclusion step (all q's answered, no exclusions saved yet) → resumes on the exclusion step. ✅
- Repeat in DE. ✅

- [ ] **Step 7: Commit**

```bash
git add src/pages/assessment/ExclusionStep.tsx src/pages/assessment/AssessmentEnginePage.tsx src/i18n/locales/de/assessment.json src/i18n/locales/en/assessment.json
git commit -m "feat: informational safety / exclusion step before the result

Pregnancy, recent-supply and pre-existing-condition checks captured for the
medical reviewer. Never blocks; makes no medical determination in code.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 9: review.ts extension + ResultPage polish

**Files:**
- Modify: `src/features/review/review.ts`
- Modify: `src/pages/assessment/ResultPage.tsx`

**Interfaces:**
- `MedicalReview` gains `postcode?: string | null` and `exclusions?: AssessmentExclusions | null`.
- `submitMedicalReview` input gains the same two optional fields; they're written straight through.
- `ResultPage` reads `postcode`, `deliveryRegion`, `exclusions` from `useAssessment()` and passes `postcode` / `exclusions` into `submitMedicalReview`.

- [ ] **Step 1: Extend `review.ts`**

Add the import:

```ts
import type { AssessmentExclusions } from "@/features/assessment/exclusions";
```

Extend the interface:

```ts
export interface MedicalReview {
  id: string;
  submittedAt: string;
  status: ReviewStatus;
  problem: ConditionKey;
  /** The assessment context handed to the reviewing doctor. */
  answers: AssessmentAnswers;
  postcode?: string | null;
  exclusions?: AssessmentExclusions | null;
}
```

In `getMedicalReview()`, add to the returned object (after `answers`):

```ts
        answers: parsed.answers ?? {},
        postcode: parsed.postcode ?? null,
        exclusions: parsed.exclusions ?? null,
```

Change `submitMedicalReview` signature + body:

```ts
export function submitMedicalReview(input: {
  problem: ConditionKey;
  answers: AssessmentAnswers;
  postcode?: string | null;
  exclusions?: AssessmentExclusions | null;
}): MedicalReview {
  const review: MedicalReview = {
    id: `WR-${Date.now().toString(36).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    status: "inReview",
    problem: input.problem,
    answers: input.answers,
    postcode: input.postcode ?? null,
    exclusions: input.exclusions ?? null,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
  } catch {
    /* ignore */
  }
  return review;
}
```

- [ ] **Step 2: ResultPage — pass the new data + render the delivery line + exclusion note**

Add imports:

```tsx
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { hasAnyFlag } from "@/features/assessment/exclusions";
```

Change the context destructure:

```tsx
  const { result, answers, postcode, deliveryRegion, exclusions } = useAssessment();
```

Update `submitForReview()`:

```tsx
  function submitForReview() {
    if (!result) return;
    submitMedicalReview({
      problem: result.problem,
      answers,
      postcode,
      exclusions,
    });
    track(AnalyticsEvent.medicalReviewSubmitted, { problem: result.problem });
    track(AnalyticsEvent.recommendationContinueClicked, {
      problem: result.problem,
      path: "submit_review",
    });
    navigate(paths.assessment.review);
  }
```

Render the delivery line inside the first `<Reveal>` (right after the `<h1>` / `intro` `<div>`, still inside the flex row's second child `<div>`):

```tsx
          <div>
            <h1>{t("result.title")}</h1>
            <p className="mt-2 text-lg text-ink-muted">{t("result.intro")}</p>
            {postcode ? (
              <DeliveryConfirmation
                postcode={postcode}
                region={deliveryRegion}
                className="mt-3"
              />
            ) : null}
          </div>
```

Add the exclusion continuity line inside the consolidated info panel (the `bg-sage-50` block with `reviewRequiredNote` / `gentleNudge` / `disclaimer`), after the `disclaimer` `<p>`:

```tsx
            <p>{t("result.disclaimer")}</p>
            {hasAnyFlag(exclusions ?? undefined) ? (
              <p>{t("result.exclusionNote")}</p>
            ) : null}
```

- [ ] **Step 3: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: green.

- [ ] **Step 4: Manual browser checklist**

- Complete the full flow (postcode `1010`, 6 questions, set pregnancy = Yes on the exclusion step) → on `/assessment/result`:
  - the muted "We deliver to 1010 (Vienna)…" line shows under the intro. ✅
  - the info panel has the extra "Your reviewer will also go through the health checks you completed." line. ✅
- Tap "Submit my assessment for medical review" → `localStorage["wecare.review"]` includes `postcode: "1010"` and `exclusions: { pregnancy: "yes", … }`. ✅
- Run the flow again with all exclusion answers negative → no exclusion note on the result page; `wecare.review.exclusions` has `{ pregnancy: "no", recentSupply: "no" }` (or `conditions: ["none"]`). ✅
- DE check. ✅

- [ ] **Step 5: Commit**

```bash
git add src/features/review/review.ts src/pages/assessment/ResultPage.tsx
git commit -m "feat: carry postcode + exclusions into the medical review; delivery line on the result page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 10: CheckoutPage polish

**Files:**
- Modify: `src/pages/shop/CheckoutPage.tsx`
- Modify: `src/i18n/locales/{de,en}/shop.json`

**Interfaces:**
- Consumes: `useAssessment()` (for `postcode` / `deliveryRegion`), `DeliveryConfirmation`, `NextSteps`.
- New shop keys: `checkout.reviewLine`, `checkout.reviewLineValue`, `checkout.nextHeading`.

- [ ] **Step 1: i18n — `en/shop.json`** (inside `checkout`)

```json
    "reviewLine": "Medical review",
    "reviewLineValue": "Fee confirmed after review",
    "nextHeading": "After you place this order",
```

- [ ] **Step 2: i18n — `de/shop.json`** (inside `checkout`)

```json
    "reviewLine": "Ärztliche Prüfung",
    "reviewLineValue": "Gebühr wird nach der Prüfung bestätigt",
    "nextHeading": "Nachdem du bestellt hast",
```

- [ ] **Step 3: Wire the checkout page**

Add imports:

```tsx
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { NextSteps } from "@/components/marketing/NextSteps";
import { useAssessment } from "@/features/assessment/AssessmentContext";
```

Inside the component, read the assessment postcode:

```tsx
  const { postcode, deliveryRegion } = useAssessment();
```

Pre-fill the shipping `postalCode` field. Change the `ADDRESS_FIELDS.map(...)` `<Input>` so the postal-code field is defaulted:

```tsx
                  <Input
                    id={f}
                    name={f}
                    required
                    defaultValue={f === "postalCode" && postcode ? postcode : undefined}
                  />
```

Under the shipping `<fieldset>` (right after its closing `</fieldset>`), add the delivery line:

```tsx
          {postcode ? (
            <DeliveryConfirmation
              postcode={postcode}
              region={deliveryRegion}
              className="-mt-4"
            />
          ) : null}
```

Restructure the order-summary `<aside>` — replace the current subtotal / delivery / total block + the `reviewFeeNote` paragraph with an itemised list that adds the "Medical review" line:

```tsx
          <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">{t("cart.subtotal")}</span>
              <span className="font-mono text-ink">
                {formatPriceEur(subtotalEur, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">{t("checkout.deliveryLabel")}</span>
              <span className="text-ink">
                {DELIVERY_FEE_EUR === 0
                  ? t("checkout.deliveryFree")
                  : formatPriceEur(DELIVERY_FEE_EUR, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">{t("checkout.reviewLine")}</span>
              <Link
                to={paths.costs}
                className="text-ink underline underline-offset-2 hover:text-ink-muted"
              >
                {t("checkout.reviewLineValue")}
              </Link>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
            <span className="font-medium text-ink">{t("cart.total")}</span>
            <span className="font-mono font-medium text-ink">
              {formatPriceEur(totalEur, language)}
            </span>
          </div>
          {!PRICES_CONFIRMED ? (
            <p className="mt-2 text-xs text-ink-muted">{t("pricesIndicative")}</p>
          ) : null}
```

> Remove the now-replaced `reviewFeeNote` paragraph block. Keep `checkout.reviewFeeNote` / `reviewFeeLink` keys in both locale files (unused-but-parity, per repo convention).

Above the "Place order" button (still inside the `<aside>`, before `<Button type="submit" …>`), add the next-steps reinforcement:

```tsx
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {t("checkout.nextHeading")}
            </p>
            <div className="mt-3">
              <NextSteps
                steps={(["received", "review", "dispatch"] as const).map((k) => ({
                  title: t(`confirmation.steps.${k}.title`),
                  body: t(`confirmation.steps.${k}.body`),
                }))}
              />
            </div>
          </div>
```

- [ ] **Step 4: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: green.

- [ ] **Step 5: Manual browser checklist**

- Complete the assessment (postcode `1010`) → add the recommended solution to cart → sign in → `/shop/checkout`:
  - the Shipping "Postal code" field is pre-filled with `1010`. ✅
  - the "We deliver to 1010 (Vienna)…" line shows under the shipping fieldset. ✅
  - the order summary shows Subtotal / Delivery (Free) / **Medical review — Fee confirmed after review** (links to `/costs`) / Total, then the "Prices shown are indicative…" note. ✅
  - the "After you place this order" 3-step block shows above "Place order". ✅
  - the two required checkboxes still gate "Place order"; placing an order still works and lands on `/shop/confirmation`. ✅
- Visit `/shop/checkout` directly without an assessment (cart has an item, signed in) → no delivery line, postcode field empty, no crash. ✅
- DE check — "Ärztliche Prüfung — Gebühr wird nach der Prüfung bestätigt", "Nachdem du bestellt hast". ✅

- [ ] **Step 6: Commit**

```bash
git add src/pages/shop/CheckoutPage.tsx src/i18n/locales/de/shop.json src/i18n/locales/en/shop.json
git commit -m "feat: checkout polish - prefilled postcode, delivery line, itemised summary, next-steps

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Task 11: Parity sweep, full verification, docs

**Files:**
- Modify: `CLAUDE.md`
- (verification only for everything else)

- [ ] **Step 1: DE/EN key parity check**

Run this one-off node script (delete after — do not commit it):

```bash
node -e '
const fs=require("fs");
for (const ns of ["assessment","common","shop"]) {
  const de=JSON.parse(fs.readFileSync(`src/i18n/locales/de/${ns}.json`));
  const en=JSON.parse(fs.readFileSync(`src/i18n/locales/en/${ns}.json`));
  const keys=o=>{const s=new Set();(function walk(x,p){for(const k in x){const q=p?p+"."+k:k;typeof x[k]==="object"&&x[k]?walk(x[k],q):s.add(q)}})(o,"");return s};
  const dk=keys(de), ek=keys(en);
  const missIn=(a,b)=>[...a].filter(k=>!b.has(k));
  const mDe=missIn(ek,dk), mEn=missIn(dk,ek);
  console.log(ns, mDe.length||mEn.length ? {onlyInEn:mDe, onlyInDe:mEn} : "OK");
}
'
```

Expected: `assessment OK`, `common OK`, `shop OK`. Fix any mismatch before continuing.

- [ ] **Step 2: Full automated verification**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: all vitest suites pass; no type errors; build succeeds.

- [ ] **Step 3: Full manual browser walk — DE then EN**

`pnpm dev`. For each language:
1. `/assessment/start` → age gate (DOB) → **postcode step** (`1010` → confirmation → auto-advance) → q1..q6 (each auto-advances on tap; Back works; q6 needs the CTA) → **exclusion step** (mutual exclusivity; flagged note) → `/assessment/result`.
2. Result page: delivery line present; "What happens next" numbered; exclusion note iff a flag was set; "Submit for medical review" → `/assessment/review`.
3. Change answers → `/assessment/start` resumes correctly (postcode kept).
4. Add recommended solution to cart → login → `/shop/checkout`: postcode pre-filled, delivery line, itemised summary with Medical-review line, next-steps block; place order → `/shop/confirmation` (numbered steps render).
5. Reduced-motion (OS setting): no crossfades, near-instant advances, everything still reachable.
6. Narrow viewport (375px): postcode input, exclusion checklist, checkout summary all usable; no horizontal scroll.

- [ ] **Step 4: Update `CLAUDE.md`**

Add a new section after "## Stakeholder checkout/flow feedback (2026-09-02, WhatsApp)" (before "## Repo cleanup (2026-09-02, per user request)"):

```markdown
## quick-green UX polish pass (2026-09-03, branch `audit-fixes`)

A stakeholder (Mischa) expected the flow to *feel* like **quick-green.com** (competitor
teardown: `docs/COMPETITOR-QUICK-GREEN.md`). Clarified as the **funnel feel / UX polish**,
not the commercial model (browse-and-pay before the doctor — that stays ruled out by the
problem-first rules, D3, D7 and Austrian law). Design + plan:
`docs/superpowers/specs/2026-09-03-quick-green-ux-polish-design.md` /
`docs/superpowers/plans/2026-09-03-quick-green-ux-polish.md`. Applied:

- **Auto-advance assessment.** Selecting an option on q1–q5 advances after ~350ms (120ms
  under reduced-motion); a secondary "Next" stays as the keyboard / changed-mind path;
  arming happens only on a user-initiated change (mount / resume / Back never auto-advance);
  **q6 keeps an explicit submit CTA**. `AssessmentEnginePage` now runs a `phase` model
  (`postcode → questions → exclusion`); the question card is extracted to `QuestionStep.tsx`.
  Progress (bar + ring) spans **8 steps**.
- **Postcode / delivery-area step** (`PostcodeStep.tsx`, first step after the age gate).
  `src/features/delivery/delivery.ts` — `AT_POSTCODE_RE`, `regionForPostcode()` (leading
  digit → one of 8 region keys), `isServiceableAt()` (every valid AT postcode is
  serviceable; DHL is nationwide, no micro-zones). Shows `<DeliveryConfirmation>` then
  auto-advances. `wecare.assessment` now persists `postcode` + `deliveryRegion`.
- **Informational safety / exclusion step** (`ExclusionStep.tsx`, after q6, before the
  result). Pregnancy / recent-supply / pre-existing-condition checks. **Never blocks, makes
  no medical determination in code** — captured for the reviewer only. `exclusions.ts`
  holds the keys + the `toggleCondition` mutual-exclusion helper. `wecare.assessment`
  persists `exclusions`; `submitMedicalReview` / `MedicalReview` carry `postcode` +
  `exclusions` through to the review record.
- **Result + checkout polish.** Shared `DeliveryConfirmation.tsx` (muted "we deliver to
  {{postcode}} ({{region}})…" from `common:delivery.confirmLine`) on the result page and
  checkout; shared `NextSteps.tsx` (numbered-chip list) dedupes the result / checkout /
  order-confirmation step lists. Checkout: postcode pre-filled from the assessment, an
  itemised summary with a **"Medical review — fee confirmed after review"** line (no euro
  figure — D5), and an "After you place this order" 3-step block.
- **Analytics** (D16-safe): `assessment_postcode_submitted { serviceable, region }` (no raw
  postcode), `assessment_exclusion_completed { flagged, flag_count }` (not which flags),
  `assessment_question_answered` gains `auto_advanced`.
- **Testing:** repo gained **vitest** (dev-only, `pnpm test`) for the pure logic
  (`delivery.ts`, `exclusions.ts`, `steps.ts`). Components still verified via
  typecheck + build + manual browser walk (no jsdom / RTL).

`getRecommendation()` is unchanged — postcode / exclusions never feed it (same rule as
q2/q6 under D1). `pnpm test` + `pnpm typecheck` + `pnpm build` green; DE/EN parity verified.
```

- [ ] **Step 5: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: record the quick-green UX polish pass in CLAUDE.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RiWtGYfFyZ6vSv282pU4kC"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §1 phase model + auto-advance | 3 (steps.ts), 6 (engine + QuestionStep), 7–8 (phases wired) |
| §1 progress across 8 steps | 3, 6 |
| §1 q6 explicit CTA (no auto-advance) | 6, 8 |
| §2 postcode step + `delivery.ts` | 1 (delivery.ts), 7 (PostcodeStep + wiring) |
| §2 `<DeliveryConfirmation>` reused at checkout/result | 7 (create), 9 (result), 10 (checkout) |
| §3 exclusion step, informational only | 2 (exclusions.ts), 8 (ExclusionStep + wiring) |
| §4 result: delivery line, NextSteps, exclusion note | 4 (NextSteps), 9 |
| §4 checkout: prefill, delivery line, itemised summary, next-steps | 10 |
| §4 order-confirmation dedupe | 4 |
| §5 context fields + persistence + reset | 5 |
| §5 review payload extension | 9 |
| §5 `getRecommendation` untouched | enforced in Global Constraints; no task edits `recommendation.ts` |
| §6 i18n keys DE+EN | 7 (postcode/regions/phase/common), 8 (exclusion), 10 (checkout); parity checked in 11 |
| §6 analytics events, minimised | 7 (event names + postcode), 8 (exclusion), 6 (`auto_advanced`) |
| §7 vitest for pure logic; components via typecheck/build/browser | 1 (setup), 1–3 (unit tests), 6–10 (browser checklists), 11 (full walk) |

No gaps.

**2. Placeholder scan** — no "TBD"/"handle errors"/"similar to Task N". Task 7 Step 8 and Task 8 Step 4 describe edits to `AssessmentEnginePage` in prose + code fragments rather than a full file rewrite (the file is rewritten in full in Task 6); each fragment shows the exact new code. Acceptable — the executor has the Task 6 full file as the base.

**3. Type consistency**
- `RegionKey` — defined in Task 1, imported in Tasks 5/7/9/10 with the same 8 members.
- `AssessmentExclusions` — defined Task 2, used Tasks 5/8/9 identically.
- `Phase` — defined Task 3, used Task 6+.
- `deriveStartPhase` / `overallStepIndex` / `firstQuestionStep` / `TOTAL_STEPS` — signatures in Task 3 match all call sites.
- `setPostcode(pc, region)` / `setExclusions(x)` — Task 5 signatures match Task 7 (`setPostcode(value, region)`) and Task 8 (`setExclusions(x)`).
- `submitMedicalReview` — Task 9 adds optional `postcode` / `exclusions`; Task 9's `ResultPage` call passes exactly those. `MedicalReview` fields consistent.
- `NextSteps({ steps })` — Task 4 signature matches Tasks 4/10 usage (`{title, body}[]`).
- `DeliveryConfirmation({ postcode, region, className })` — Task 7 signature matches Tasks 9/10.
- `AnalyticsEvent.assessmentPostcodeSubmitted` / `assessmentExclusionCompleted` — added Task 7 Step 1, used Tasks 7/8.

No inconsistencies found.
