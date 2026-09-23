# Funnel Re-sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-sequence the WeCare funnel into one standalone linear path — questions (assessment + safety merged) → your match → choose amount → confirm request → real thank-you page — so a user can complete the flow, with the dashboard removed from the path.

**Architecture:** "Approach 1 — re-sequence now, add real commerce later." No payment, no shown total, no backend. The medical-review record is created at the end of the merged question pass; the endpoint is a submitted *request* (`Order` with `totalEur: null`, `status: "inReview"`). The funnel routes render a new minimal `FunnelChrome` (logo + 4-step bar) instead of the marketing header/footer or the embedded dashboard shell.

**Tech Stack:** React 18 + React Router (`react-router` v7 data router) + Vite 6 + TypeScript (strict) + Tailwind v4 + react-i18next. Tests: vitest (`pnpm test`), pure-logic only — `environment: "node"`, `include: src/**/*.test.ts`. No jsdom / RTL; components verified via `pnpm typecheck` + `pnpm build` + a manual browser walk.

**Spec:** `docs/superpowers/specs/2026-09-08-funnel-resequence-design.md` (Part B — the interim build. Part A, the pay-at-checkout target flow, is **not** built here.)

## Global Constraints

- **Branch:** `audit-fixes` (feature work continues here — repo convention).
- **Green gates, every task:** `pnpm typecheck` **and** `pnpm build` **and** `pnpm test` must pass. `pnpm build` does not type-check — run `pnpm typecheck` separately.
- **DE + EN key parity** across all 9 i18n namespaces. Every new/changed string ships in **both** `src/i18n/locales/en/<ns>.json` **and** `src/i18n/locales/de/<ns>.json`. DE rules: use **"Fragebogen"** (never "Assessment"); slash-form gendering (`Nutzer/innen`, `Kund/innen`, `Ärztin oder Arzt`), never the gender-colon; German en-dash `–` for parentheticals; Austria word rules — "ärztliche Prüfung", "rezeptpflichtig", **never** "behandelt/heilt" or any treat/cure claim. Interpolate variables inside strings, never concatenate around `t()`.
- **Do NOT change** `getRecommendation()` (`src/features/assessment/recommendation.ts`) — still reads q1/q3/q4/q5 only.
- **Do NOT change** `COMMERCE_ENABLED` or `PRICES_CONFIRMED` in `src/config.ts` (both stay `false`). No payment surface anywhere in the interim. No summed/displayed order total. Prices keep their existing "indicative, confirmed after your medical review" label.
- **Guardrails (BUSINESS-FLOW.md §9):** the doctor review stays mandatory and stays before any dispatch; no dispatch before a prescription; no fabricated payment UI / total / COA; no pre-assessment strain catalogue or strain imagery before the questions.
- **Analytics (`src/lib/analytics.ts`), D16 minimisation:** never send raw assessment answer values, raw postcode, name, email, or DOB. Coarse categories only (`problem`, solution id, booleans, counts).
- **Commits:** each task ends with a commit step. Per the repo's standing "no commits/pushes unless asked" rule, the executor may batch or hold commits — but keep each task's changes self-contained so a commit boundary is always available. End commit messages with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HpCj6angLNzA9SbjH8n1dh
  ```

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/features/assessment/steps.ts` | phase model — gains a `"safety"` phase (one step) after `"questions"` | 1 |
| `src/features/assessment/steps.test.ts` | tests for the phase model | 1 |
| `src/features/orders/orders.ts` | mock order store — `totalEur` becomes `number \| null` for request orders | 2 |
| `src/features/orders/orders.test.ts` | **new** — round-trip test for a null-total request order | 2 |
| `src/app/paths.ts` | route constants; `isFunnelRoute()` + `funnelStepFor()` replace `isAppShellRoute()`; cart/checkout/confirmation move to top-level; legacy redirects | 3 |
| `src/app/router.tsx` | cart/checkout/confirmation become top-level routes; `/dashboard/{cart,checkout,order-confirmation}` redirect out; `/assessment/medical-review` stays (redirect component) | 3 |
| `src/components/layout/FunnelChrome.tsx` | **new** — the standalone funnel shell: logo + 4-step progress bar + centered content column | 4 |
| `src/components/layout/RootLayout.tsx` | `RoutedShell` picks `FunnelChrome` for funnel routes (all users) | 4 |
| `src/pages/assessment/AssessmentEnginePage.tsx` | merges the safety step into the pass; creates the medical review at the end; drops `<JourneyStepper>` | 5 |
| `src/pages/assessment/MedicalReviewFormPage.tsx` | gutted to a redirect (review exists → status page, else → assessment start) | 5 |
| `src/pages/assessment/ResultPage.tsx` | primary CTA → product ("Choose your amount"); "a doctor is reviewing" line; reworded next-steps; drops `<JourneyStepper>` | 6 |
| `src/pages/shop/ProductPage.tsx` | removes the review/commerce gate; gram selector always shown; CTA "Continue" → `/checkout`; drops `<JourneyStepper>` | 7 |
| `src/pages/shop/CheckoutPage.tsx` | total-less "Review & confirm your request"; inline account fields when signed out; "Submit my request" → request order; drops `<CheckoutSteps>` | 8 |
| `src/pages/shop/OrderConfirmationPage.tsx` | "Your request is in"; null-total handling; drops `<CheckoutSteps>` | 9 |
| `src/pages/shop/CartPage.tsx` | drops `<CheckoutSteps>`; empty-cta + continue point at `/assessment/result` | 9 |
| `src/pages/dashboard/DashboardLayout.tsx` | drops the `commerceTitle` lookup + the `reason: "checkout"` branch | 10 |
| `src/pages/dashboard/pages.tsx` | Orders table tolerates `totalEur: null` (desktop + mobile) | 10 |
| `src/lib/analytics.ts` | add `requestSubmitted: "request_submitted"` | 8 |
| `src/i18n/locales/{en,de}/assessment.json` | `phase.finalChecks*`, reworded `start.submit`/`start.intro`, `exclusion.continue`, `result.*` CTA + notes + next-steps | 5, 6, 11 |
| `src/i18n/locales/{en,de}/shop.json` | `solution.addToCart`→"Continue", `checkout.*` (title, priceAfterReview, submit, account fields), `confirmation.*` (request framing, priceAfterReview) | 7, 8, 9 |
| `src/i18n/locales/{en,de}/common.json` | `funnel.*` (label + 4 step names) | 4 |
| `CLAUDE.md` | a "funnel re-sequence" note under the decision log | 11 |

Every glob/i18n resolver degrades to a placeholder on a missing key, so a parity gap won't crash — but it fails the parity gate. Add keys in both locales inside the task that introduces them.

---

## Task 1: `steps.ts` — add the `"safety"` phase

**Files:**
- Modify: `src/features/assessment/steps.ts`
- Test: `src/features/assessment/steps.test.ts`

**Interfaces:**
- Produces:
  - `type Phase = "postcode" | "questions" | "safety"`
  - `TOTAL_STEPS: number` — now `1 + TOTAL_QUESTIONS + 1` (= 8)
  - `deriveStartPhase(input: { postcode?: string; answers: AssessmentAnswers; exclusions?: unknown; prefilled: boolean }): { phase: Phase; step: number }` — returns `{ phase: "safety", step: 0 }` when a postcode exists, all six questions are answered, and `exclusions` is null/undefined; otherwise unchanged behaviour
  - `overallStepIndex(phase: Phase, step: number): number` — `"safety"` → `1 + TOTAL_QUESTIONS`
  - `firstQuestionStep` — unchanged
  - `assessmentComplete` — **unchanged** (still `postcode + 6 questions`; do not add an exclusions requirement — it has no callers and changing it is out of scope)

- [ ] **Step 1: Update the failing tests**

In `src/features/assessment/steps.test.ts` replace the `TOTAL_STEPS` and `deriveStartPhase` blocks and extend `overallStepIndex`:

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
  it("is postcode + 6 questions + 1 safety step", () => {
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
  it("goes to safety when all six are answered but exclusions are not", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: full, prefilled: false }),
    ).toEqual({ phase: "safety", step: 0 });
  });
  it("stays in safety even with a landing-page prefill once the six are done", () => {
    expect(
      deriveStartPhase({ postcode: "1010", answers: full, prefilled: true }),
    ).toEqual({ phase: "safety", step: 0 });
  });
  it("stays in questions when exclusions already exist (nothing left to resume into)", () => {
    expect(
      deriveStartPhase({
        postcode: "1010",
        answers: full,
        exclusions: { pregnancy: "no", recentSupply: "no" },
        prefilled: false,
      }),
    ).toEqual({ phase: "questions", step: 0 });
  });
});

describe("overallStepIndex", () => {
  it("orders postcode, questions, then safety", () => {
    expect(overallStepIndex("postcode", 0)).toBe(0);
    expect(overallStepIndex("questions", 0)).toBe(1);
    expect(overallStepIndex("questions", 5)).toBe(6);
    expect(overallStepIndex("safety", 0)).toBe(7);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test -- steps`
Expected: FAIL — `TOTAL_STEPS` is 7 not 8; `deriveStartPhase` returns `{ phase: "questions", step: 0 }` where the new tests expect `"safety"`; `overallStepIndex("safety", 0)` is `NaN`/wrong.

- [ ] **Step 3: Implement the `"safety"` phase in `steps.ts`**

Replace the body of `src/features/assessment/steps.ts` with:

```ts
import {
  isComplete,
  QUESTIONS,
  TOTAL_QUESTIONS,
  type AssessmentAnswers,
} from "./questions";

/**
 * The guided pass: postcode + the six questions + one "final checks" safety
 * step. The safety / exclusion questions were briefly a separate
 * `/assessment/medical-review` page (PO decision B2, 2026-09-03); the funnel
 * re-sequence (2026-09-08) folds them back into this pass, before the product,
 * and the medical-review record is created when the pass finishes.
 */
export type Phase = "postcode" | "questions" | "safety";

/** postcode (1) + the six questions + the safety step (1). */
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
  /** Present once the safety step has been completed for this assessment. */
  exclusions?: unknown;
  prefilled: boolean;
}): { phase: Phase; step: number } {
  const { postcode, answers, exclusions, prefilled } = input;
  if (!postcode) return { phase: "postcode", step: 0 };
  // All six done but the safety step not yet → resume straight into it.
  if (isComplete(answers) && (exclusions === undefined || exclusions === null)) {
    return { phase: "safety", step: 0 };
  }
  return { phase: "questions", step: firstQuestionStep(answers, prefilled) };
}

export function overallStepIndex(phase: Phase, step: number): number {
  if (phase === "postcode") return 0;
  if (phase === "safety") return 1 + TOTAL_QUESTIONS;
  return 1 + step;
}

/** True once postcode + all six questions are done. (Unchanged — the safety
 *  step is tracked separately, via the `exclusions` record.) */
export function assessmentComplete(
  postcode: string | undefined,
  answers: AssessmentAnswers,
): boolean {
  return Boolean(postcode) && isComplete(answers);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test -- steps`
Expected: PASS (all cases in the `steps` file).

- [ ] **Step 5: Full green check**

Run: `pnpm test` then `pnpm typecheck`
Expected: PASS both. (`pnpm build` not needed — no component touched.)

- [ ] **Step 6: Commit**

```bash
git add src/features/assessment/steps.ts src/features/assessment/steps.test.ts
git commit -m "assessment: add a 'safety' phase to the step model for the merged question pass"
```

---

## Task 2: `orders.ts` — allow a null-total request order

**Files:**
- Modify: `src/features/orders/orders.ts`
- Test: `src/features/orders/orders.test.ts` (create)

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `Order.totalEur: number | null`
  - `addOrder(input: { lines: OrderLine[]; totalEur: number | null; status: OrderStatus; shipTo?: ShippingAddress; paymentMethod?: PaymentMethodId }): Order`
  - `getOrders(): Order[]` — unchanged signature; `totalEur` may be `null`

- [ ] **Step 1: Write the failing test**

Create `src/features/orders/orders.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addOrder, getOrders } from "./orders";

// jsdom is not configured; stub the two storages addOrder/getOrders touch.
function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => (m.has(k) ? (m.get(k) as string) : null),
    key: (i) => Array.from(m.keys())[i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("addOrder — request order (no confirmed price)", () => {
  it("round-trips a null total and inReview status", () => {
    const created = addOrder({
      lines: [{ productId: "night-now", quantity: 10 }],
      totalEur: null,
      status: "inReview",
      shipTo: {
        firstName: "Alex",
        lastName: "Muster",
        street: "Teststrasse 1",
        postalCode: "1010",
        city: "Wien",
        country: "Austria",
      },
    });
    expect(created.totalEur).toBeNull();
    expect(created.status).toBe("inReview");
    expect(created.paymentMethod).toBeUndefined();

    const [stored] = getOrders();
    expect(stored.id).toBe(created.id);
    expect(stored.totalEur).toBeNull();
    expect(stored.shipTo?.city).toBe("Wien");
  });

  it("still accepts a numeric total (unchanged path)", () => {
    const created = addOrder({
      lines: [{ productId: "calm-night", quantity: 5 }],
      totalEur: 39.5,
      status: "processing",
    });
    expect(created.totalEur).toBe(39.5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- orders`
Expected: FAIL — `addOrder`'s `input.totalEur` is typed `number`, so `totalEur: null` is a type error the test file surfaces at compile; at runtime the value passes through but the type gate (`pnpm typecheck`) is red.

- [ ] **Step 3: Make `totalEur` nullable**

In `src/features/orders/orders.ts`:

Change the `Order` interface field:
```ts
export interface Order {
  id: string;
  placedAt: string;
  lines: OrderLine[];
  /** `null` for a submitted *request* whose price is confirmed after the
   *  medical review (funnel re-sequence, 2026-09-08). */
  totalEur: number | null;
  status: OrderStatus;
  /** Rehydrated from sessionStorage on read; never stored in localStorage. */
  shipTo?: ShippingAddress;
  paymentMethod?: PaymentMethodId;
}
```

Change the `addOrder` signature:
```ts
export function addOrder(input: {
  lines: OrderLine[];
  totalEur: number | null;
  status: OrderStatus;
  shipTo?: ShippingAddress;
  paymentMethod?: PaymentMethodId;
}): Order {
```

The rest of `addOrder` / `readStoredOrders` / `getOrders` need no change — `totalEur` is written and read as-is.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- orders`
Expected: PASS.

- [ ] **Step 5: Type + build check**

Run: `pnpm typecheck`
Expected: FAIL — `formatPriceEur(order.totalEur, …)` in `OrderConfirmationPage.tsx` and `pages.tsx` now gets `number | null`. **That is expected**; Tasks 9 and 10 fix those call sites. To keep this task independently green, add the guard now in all three spots:

- `src/pages/shop/OrderConfirmationPage.tsx` line ~74 — wrap:
  ```tsx
  <dd className="font-mono font-medium text-ink">
    {order.totalEur == null
      ? t("confirmation.priceAfterReview")
      : formatPriceEur(order.totalEur, language)}
  </dd>
  ```
  and the per-line price (line ~63):
  ```tsx
  <span className="shrink-0 font-mono text-ink">
    {order.totalEur == null
      ? ""
      : formatPriceEur(s.priceEur * l.quantity, language)}
  </span>
  ```
- `src/pages/dashboard/pages.tsx` lines ~996 and ~1041 — wrap each:
  ```tsx
  {order.totalEur == null
    ? t("orders.totalPending")
    : formatPriceEur(order.totalEur, language)}
  ```

Add the two i18n keys (both locales):
- `shop.confirmation.priceAfterReview` — EN `"Confirmed after review"` / DE `"Nach der Prüfung bestätigt"`
- `dashboard.orders.totalPending` — EN `"Confirmed after review"` / DE `"Nach der Prüfung bestätigt"`

Run `pnpm typecheck` again → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/orders/orders.ts src/features/orders/orders.test.ts src/pages/shop/OrderConfirmationPage.tsx src/pages/dashboard/pages.tsx src/i18n/locales/en/shop.json src/i18n/locales/de/shop.json src/i18n/locales/en/dashboard.json src/i18n/locales/de/dashboard.json
git commit -m "orders: allow a null total for a submitted request; guard price rendering"
```

---

## Task 3: Routing — funnel routes to top level, `isFunnelRoute` / `funnelStepFor`

**Files:**
- Modify: `src/app/paths.ts`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Produces:
  - `paths.cart = "/cart"`, `paths.checkout = "/checkout"`, `paths.orderConfirmation = "/order-confirmation"`
  - `isFunnelRoute(pathname: string): boolean`
  - `funnelStepFor(pathname: string): "questions" | "match" | "details" | "done"`
  - `isAppShellRoute` — **removed**
- Consumes (Task 4): `isFunnelRoute`, `funnelStepFor` in `RootLayout`.

- [ ] **Step 1: Update `paths.ts`**

In `src/app/paths.ts`:

1. Change the three commerce paths:
```ts
  shop: "/shop",
  shopProduct: (id: string) => `/shop/${id}`,
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: "/order-confirmation",
```

2. In `LEGACY_REDIRECTS`, replace the `/shop/*` commerce entries and add the `/dashboard/*` ones:
```ts
  "/shop/cart": paths.cart,
  "/shop/checkout": paths.checkout,
  "/shop/confirmation": paths.orderConfirmation,
  "/dashboard/cart": paths.cart,
  "/dashboard/checkout": paths.checkout,
  "/dashboard/order-confirmation": paths.orderConfirmation,
```
(keep every other existing entry unchanged).

3. Replace `isAppShellRoute` entirely with:
```ts
/**
 * The standalone purchase funnel. These routes render inside `FunnelChrome`
 * (logo + a 4-step progress bar, no marketing nav, no dashboard shell) for
 * **every** visitor — signed in or not. The signed-in journey no longer runs
 * inside the dashboard shell (funnel re-sequence, 2026-09-08 — supersedes the
 * Sept-2026 "journey stays in the dashboard shell" decision). `/dashboard/*`
 * is handled by its own route, not this list.
 */
const FUNNEL_EXACT = new Set<string>([
  paths.assessment.start,
  paths.assessment.result,
  paths.assessment.medicalReview,
  paths.assessment.review,
  paths.solution,
  paths.shop,
  paths.cart,
  paths.checkout,
  paths.orderConfirmation,
]);

function trimTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isFunnelRoute(pathname: string): boolean {
  const p = trimTrailingSlash(pathname);
  return FUNNEL_EXACT.has(p) || p.startsWith(`${paths.shop}/`);
}

export function funnelStepFor(
  pathname: string,
): "questions" | "match" | "details" | "done" {
  const p = trimTrailingSlash(pathname);
  if (p === paths.assessment.start) return "questions";
  if (p === paths.checkout || p === paths.cart) return "details";
  if (p === paths.orderConfirmation) return "done";
  return "match"; // result, product, /shop, /solution, medical-review, review
}
```

- [ ] **Step 2: Update `router.tsx`**

In `src/app/router.tsx`:

1. Move `CartPage` / `CheckoutPage` / `OrderConfirmationPage` **out** of the `DashboardLayout` `children` array and add them as siblings under `RootLayout` (anywhere among the top-level `children`, e.g. right after the `paths.solution` route):
```tsx
      { path: paths.cart, element: <CartPage /> },
      { path: paths.checkout, element: <CheckoutPage /> },
      { path: paths.orderConfirmation, element: <OrderConfirmationPage /> },
```
Delete these three lines from the `DashboardLayout` `children`:
```tsx
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order-confirmation", element: <OrderConfirmationPage /> },
```
Keep the imports (paths changed, components didn't).

2. The `...Object.entries(LEGACY_REDIRECTS).map(...)` block already turns the new `/dashboard/{cart,checkout,order-confirmation}` and `/shop/{cart,checkout,confirmation}` keys into `<Navigate replace>` routes — no extra code needed.

3. `/assessment/medical-review` route stays as-is (`<MedicalReviewFormPage />`) — Task 5 turns that component into a redirect.

- [ ] **Step 3: Verify no other consumer of `isAppShellRoute`**

Run: `git grep -n "isAppShellRoute"`
Expected: only the (now-deleted) definition. If `RootLayout.tsx` still imports it, that's fixed in Task 4 — for now `pnpm typecheck` will flag it; that's acceptable *only if Task 4 is done in the same session before committing*. To keep Task 3 independently green, also do the `RootLayout` import swap now (it's small) OR sequence Task 4 immediately after without an intermediate commit. Recommended: fold the `RootLayout` edit into Task 4 and commit Tasks 3+4 together. Adjust the Task 3 commit step accordingly (below) — commit only `paths.ts` + `router.tsx` if `RootLayout` still references the old name, and expect `pnpm typecheck` to be red until Task 4.

- [ ] **Step 4: Checks**

Run: `pnpm build` (route tree compiles), `pnpm test` (unaffected, PASS). `pnpm typecheck` will be **red** until Task 4 swaps the `RootLayout` import — proceed straight to Task 4.

- [ ] **Step 5: Commit (with Task 4)**

Hold the commit until Task 4 is done, then:
```bash
git add src/app/paths.ts src/app/router.tsx src/components/layout/RootLayout.tsx src/components/layout/FunnelChrome.tsx src/i18n/locales/en/common.json src/i18n/locales/de/common.json
git commit -m "funnel: standalone routes + FunnelChrome shell; cart/checkout leave /dashboard"
```

---

## Task 4: `FunnelChrome` + wire it into `RoutedShell`

**Files:**
- Create: `src/components/layout/FunnelChrome.tsx`
- Modify: `src/components/layout/RootLayout.tsx`
- Modify: `src/i18n/locales/en/common.json`, `src/i18n/locales/de/common.json`

**Interfaces:**
- Consumes: `isFunnelRoute`, `funnelStepFor` (Task 3).
- Produces: `<FunnelChrome step="questions" | "match" | "details" | "done">{children}</FunnelChrome>`.

- [ ] **Step 1: Add the i18n keys (both locales)**

In `src/i18n/locales/en/common.json`, add a top-level `funnel` object:
```json
  "funnel": {
    "label": "Progress",
    "steps": {
      "questions": "Questions",
      "match": "Your match",
      "details": "Your details",
      "done": "Done"
    },
    "home": "Back to home"
  }
```
In `src/i18n/locales/de/common.json`, the same shape:
```json
  "funnel": {
    "label": "Fortschritt",
    "steps": {
      "questions": "Fragen",
      "match": "Deine Empfehlung",
      "details": "Deine Daten",
      "done": "Fertig"
    },
    "home": "Zur Startseite"
  }
```
(Place it alphabetically-ish among the existing top-level keys; exact position doesn't matter, parity does.)

- [ ] **Step 2: Create `FunnelChrome.tsx`**

```tsx
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";

export type FunnelStep = "questions" | "match" | "details" | "done";

const STEPS = ["questions", "match", "details"] as const;

/**
 * The standalone purchase-funnel shell (funnel re-sequence, 2026-09-08).
 * Logo + a quiet 4-step progress bar + a centered content column. No marketing
 * nav, no dashboard sidebar, no bottom tab bar — for every visitor. Replaces
 * the marketing header/footer and the embedded dashboard shell on the funnel
 * routes (`isFunnelRoute` in src/app/paths.ts).
 */
export function FunnelChrome({
  step,
  children,
}: {
  step: FunnelStep;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const done = step === "done";
  const activeIdx = done
    ? STEPS.length
    : STEPS.indexOf(step as (typeof STEPS)[number]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          to={paths.home}
          aria-label={t("funnel.home")}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-petrol-600"
        >
          <Logo className="h-5" />
        </Link>
      </header>

      <nav
        aria-label={t("funnel.label")}
        className="mx-auto w-full max-w-3xl px-4 sm:px-6"
      >
        <ol className="glass flex items-center justify-between gap-1 rounded-full px-4 py-2.5">
          {STEPS.map((s, i) => {
            const isDone = done || i < activeIdx;
            const isActive = !done && i === activeIdx;
            return (
              <li key={s} className="flex items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isDone && "bg-sage-500 text-white",
                    isActive && "bg-primary text-primary-foreground",
                    !isDone && !isActive && "bg-white/60 text-ink-muted",
                  )}
                >
                  {isDone ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                <span
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "ml-1.5 whitespace-nowrap text-xs font-medium",
                    isActive || isDone ? "text-petrol-700" : "text-ink-muted",
                  )}
                >
                  {t(`funnel.steps.${s}`)}
                </span>
              </li>
            );
          })}
          {done ? (
            <li className="flex items-center">
              <span className="ml-1 whitespace-nowrap text-xs font-semibold text-petrol-700">
                · {t("funnel.steps.done")}
              </span>
            </li>
          ) : null}
        </ol>
      </nav>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

Note: `FunnelChrome` renders its own `<main id="main-content">`, so `RoutedShell` must **not** double-wrap it in the outer `<main>` (see Step 3).

- [ ] **Step 3: Wire `RoutedShell`**

In `src/components/layout/RootLayout.tsx`:

1. Swap the import:
```tsx
import { funnelStepFor, isFunnelRoute, paths } from "@/app/paths";
```
Remove `isAppShellRoute` and the `DashboardChrome` import if it becomes unused (it does — see below). Keep `DashboardTabBar`.

2. Replace the `RoutedShell` function with:
```tsx
/**
 * Chooses the chrome for the current route (must be inside `<Providers>` to
 * read auth).
 *
 * - `/dashboard/*` → the route's own `DashboardLayout` supplies the shell.
 * - A funnel route (`isFunnelRoute`) → `FunnelChrome`, for every visitor.
 * - Everything else → the marketing header + footer.
 *
 * `DashboardTabBar` and `ConsentBanner` render outside `PageReveal` (whose
 * transform would trap their `position: fixed`).
 */
function RoutedShell() {
  const { pathname } = useLocation();

  const isHome = pathname === paths.home;
  const isDashboard =
    pathname === paths.dashboard || pathname.startsWith(`${paths.dashboard}/`);
  const funnel = !isDashboard && isFunnelRoute(pathname);
  const marketingChrome = !isDashboard && !funnel;

  if (funnel) {
    return (
      <>
        <PageReveal>
          <FunnelChrome step={funnelStepFor(pathname)}>
            <Outlet />
          </FunnelChrome>
        </PageReveal>
        <ScrollRestoration />
        <ScrollToHash />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {marketingChrome && <SiteHeader />}
        <main id="main-content" className="flex-1">
          <PageReveal>
            <Outlet />
          </PageReveal>
        </main>
        {marketingChrome && <SiteFooter roundedTop={!isHome} />}
        <ScrollRestoration />
        <ScrollToHash />
      </div>
      {isDashboard && <DashboardTabBar />}
    </>
  );
}
```
Add the import: `import { FunnelChrome } from "./FunnelChrome";`
Remove the now-unused `DashboardChrome` import and the `useAuth` import if nothing else in the file uses them (check — `RoutedShell` no longer reads `isAuthenticated`).

Note: `DashboardChrome`'s `embed` mode is now unreferenced. Leave the file as-is (it's still used by `DashboardLayout` in non-embed mode); do not delete it.

- [ ] **Step 4: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 5: Manual browser walk**

`pnpm dev`, then:
- Visit `/assessment/start` **signed out** → FunnelChrome (logo + "Questions / Your match / Your details" bar), no marketing header/footer, no dashboard sidebar.
- Visit `/checkout` directly → FunnelChrome with the "Your details" step active (page content will be wrong until Task 8, that's fine — you're checking the shell).
- Visit `/` → marketing header/footer intact.
- Sign in (any email at `/login`), visit `/assessment/result` → still FunnelChrome (not the dashboard shell).
- Visit `/dashboard` → dashboard shell + bottom tab bar intact.

- [ ] **Step 6: Commit (Tasks 3 + 4 together)**

```bash
git add src/app/paths.ts src/app/router.tsx src/components/layout/RootLayout.tsx src/components/layout/FunnelChrome.tsx src/i18n/locales/en/common.json src/i18n/locales/de/common.json
git commit -m "funnel: standalone FunnelChrome shell; cart/checkout/confirmation leave /dashboard"
```

---

## Task 5: Merge the safety step into the question pass; create the review at the end

**Files:**
- Modify: `src/pages/assessment/AssessmentEnginePage.tsx`
- Modify: `src/pages/assessment/MedicalReviewFormPage.tsx`
- Modify: `src/i18n/locales/en/assessment.json`, `src/i18n/locales/de/assessment.json`

**Interfaces:**
- Consumes: `deriveStartPhase` / `Phase` (Task 1) with the `"safety"` variant; `submitMedicalReview` from `@/features/review/review`; `ExclusionStep` (unchanged component); `hasAnyFlag` / `exclusionFlagCount` from `@/features/assessment/exclusions`.
- Produces: after the safety step completes, a `wecare.review` record exists (`status: "inReview"`) and the user is on `/assessment/result`.

- [ ] **Step 1: i18n — reword the two keys and add "final checks" (both locales)**

`src/i18n/locales/en/assessment.json`:
- `start.intro` → `"A few short questions about how you feel (about 60 to 90 seconds). This is not a medical form, no documents needed, and you can change any answer before you finish."`
- `start.submit` → `"Continue"`
- `phase.finalChecks` → `"Final checks"` (add under `phase`)
- `phase.finalChecksNote` → `"A few safety questions for the doctor reviewing your request."`
- `exclusion.continue` → `"See my recommendation"`
- `exclusion.back` → `"Back to the last question"` (add — used by the new Back affordance)

`src/i18n/locales/de/assessment.json`:
- `start.intro` → `"Ein paar kurze Fragen dazu, wie es dir geht – etwa 60 bis 90 Sekunden. Das ist kein medizinisches Formular, du brauchst keine Unterlagen und kannst jede Antwort vor dem Abschluss ändern."`
- `start.submit` → `"Weiter"`
- `phase.finalChecks` → `"Letzte Fragen"`
- `phase.finalChecksNote` → `"Ein paar Sicherheitsfragen für die Ärztin oder den Arzt, die deine Anfrage prüfen."`
- `exclusion.continue` → `"Meine Empfehlung ansehen"`
- `exclusion.back` → `"Zurück zur letzten Frage"`

- [ ] **Step 2: Rewrite `AssessmentEnginePage.tsx`**

Key changes (keep everything else — age gate, postcode phase, auto-advance, analytics for questions):

1. Imports — add:
```tsx
import { hasAnyFlag, exclusionFlagCount } from "@/features/assessment/exclusions";
import type { AssessmentExclusions } from "@/features/assessment/exclusions";
import { submitMedicalReview } from "@/features/review/review";
import { ExclusionStep } from "./ExclusionStep";
```
Remove the `<JourneyStepper>` import and its usage (FunnelChrome now carries the progress bar).

2. `useAssessment()` destructure — add `setExclusions`, `exclusions`:
```tsx
const {
  answers, postcode, exclusions, setAnswer, setExclusions,
  submit, prefillProblem, reset,
} = useAssessment();
```

3. `deriveStartPhase` call — pass `exclusions`:
```tsx
const [{ phase, step }, setPos] = useState<{ phase: Phase; step: number }>(() =>
  deriveStartPhase({
    postcode: postcode ?? undefined,
    answers,
    exclusions: exclusions ?? undefined,
    prefilled: prefilledFromLanding,
  }),
);
```

4. Replace the `isLast` branch of `goNext()` — instead of submitting, advance to the safety phase:
```tsx
function goNext() {
  clearAdvanceTimer();
  if (!current) return;
  if (isLast) {
    setPos({ phase: "safety", step: 0 });
    return;
  }
  setStep((s) => Math.min(TOTAL_QUESTIONS - 1, s + 1));
}
```

5. Add the safety-completion handler:
```tsx
function handleSafetyComplete(x: AssessmentExclusions) {
  clearAdvanceTimer();
  setExclusions(x);
  const rec = submit();
  if (!rec) return;
  submitMedicalReview({
    problem: rec.problem,
    answers,
    postcode,
    exclusions: x,
  });
  track(AnalyticsEvent.assessmentExclusionCompleted, {
    flagged: hasAnyFlag(x),
    flag_count: exclusionFlagCount(x),
  });
  track(AnalyticsEvent.medicalReviewSubmitted, { problem: rec.problem });
  track(AnalyticsEvent.assessmentCompleted, { problem: rec.problem });
  navigate(paths.assessment.result);
}

function backToLastQuestion() {
  setPos({ phase: "questions", step: TOTAL_QUESTIONS - 1 });
}
```

6. `startOver()` — unchanged (`setPos({ phase: "postcode", step: 0 })`).

7. Progress / eyebrow — the eyebrow + ring block currently keys on `phase === "questions"`. Extend it: when `phase === "safety"`, show the "Final checks" eyebrow and a full ring.
```tsx
<div>
  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
    {phase === "questions"
      ? t("start.title")
      : phase === "safety"
        ? t("phase.finalChecks")
        : t("phase.leadIn")}
  </p>
  <p className="mt-1 text-sm text-ink-muted">
    {phase === "questions"
      ? t("start.progress", { current: step + 1, total: TOTAL_QUESTIONS })
      : phase === "safety"
        ? t("phase.finalChecksNote")
        : t("phase.leadInNote")}
  </p>
</div>
{phase === "questions" ? (
  <AssessmentRing
    value={step + 1}
    total={TOTAL_QUESTIONS}
    size={72}
    label={tCommon("journey.stepOf", { current: step + 1, total: TOTAL_QUESTIONS })}
  />
) : phase === "safety" ? (
  <AssessmentRing
    value={TOTAL_QUESTIONS}
    total={TOTAL_QUESTIONS}
    size={72}
    label={t("phase.finalChecks")}
  />
) : null}
```

8. Render the safety phase — add after the `phase === "questions"` block:
```tsx
{phase === "safety" ? (
  <div key="safety" className={FADE}>
    <ExclusionStep hideHeading onComplete={handleSafetyComplete} />
    <button
      type="button"
      onClick={backToLastQuestion}
      className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {t("exclusion.back")}
    </button>
  </div>
) : null}
```

9. Remove the `<JourneyStepper current="assessment" className="mb-8" />` line.

- [ ] **Step 3: Gut `MedicalReviewFormPage.tsx` to a redirect**

Replace the whole file with:
```tsx
import { Navigate } from "react-router";

import { paths } from "@/app/paths";
import { getMedicalReview } from "@/features/review/review";

/**
 * `/assessment/medical-review` is no longer a form — the safety questions moved
 * into the assessment pass and the review is created there (funnel re-sequence,
 * 2026-09-08). This route now just forwards: to the status page if a review
 * exists, else back to the start of the assessment.
 */
export function MedicalReviewFormPage() {
  return (
    <Navigate
      to={getMedicalReview() ? paths.assessment.review : paths.assessment.start}
      replace
    />
  );
}
```
The `@/pages/assessment` barrel export and the `router.tsx` import stay valid (same name). The `assessment:medicalReview.*` keys are now unused — leave them (parity holds); a later cleanup can remove them.

- [ ] **Step 4: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 5: Manual browser walk**

`pnpm dev`, clear `localStorage` for the site (DevTools → Application → Local storage → clear), then:
- `/assessment/start` → age gate → DOB + 18+ → postcode `1010` → auto-advance through q1–q5 → q6 shows a "Continue" button → click → the "Final checks" screen (eyebrow "Final checks", full ring, the `ExclusionStep` card).
- Answer both Yes/No, click "See my recommendation" → lands on `/assessment/result`.
- DevTools → Application → Local storage → `wecare.review` exists with `"status":"inReview"`; `wecare.assessment` has `exclusions`.
- Reload `/assessment/start` mid-pass (after q6, before safety) → resumes on the "Final checks" screen.
- On the "Final checks" screen, "Back to the last question" → returns to q6 with the answer still selected.
- Repeat the walk with the language toggled to DE — the "Fragebogen" wording and "Letzte Fragen" eyebrow render.

- [ ] **Step 6: Commit**

```bash
git add src/pages/assessment/AssessmentEnginePage.tsx src/pages/assessment/MedicalReviewFormPage.tsx src/i18n/locales/en/assessment.json src/i18n/locales/de/assessment.json
git commit -m "assessment: fold the safety questions into the pass; create the review at the end"
```

---

## Task 6: Result page — CTA to the product, reworded next-steps

**Files:**
- Modify: `src/pages/assessment/ResultPage.tsx`
- Modify: `src/i18n/locales/en/assessment.json`, `src/i18n/locales/de/assessment.json`

**Interfaces:**
- Consumes: nothing new. `existingReview` (`getMedicalReview()`) will now essentially always be set (created in Task 5) — keep the guard anyway.
- Produces: the Result page's primary CTA points at `paths.shopProduct(primary.id)` with the label "Choose your amount".

- [ ] **Step 1: i18n (both locales)**

`en/assessment.json` under `result`:
- `chooseAmountCta` → `"Choose your amount"`
- `reviewingNote` → `"A doctor is now reviewing your request."`
- `reviewingLink` → `"See review status"`
- `next.view.title` → `"Choose your amount"`
- `next.view.body` → `"Pick how much you'd like of your matched solution."`
- `next.review.body` → `"A doctor is reviewing your answers now. A prescription is issued only if it is medically appropriate."`
- `next.delivery.title` → `"Prescription & delivery"`
- `next.delivery.body` → `"If approved, you confirm payment and a licensed pharmacy ships it discreetly to your door."`

`de/assessment.json` under `result`:
- `chooseAmountCta` → `"Menge wählen"`
- `reviewingNote` → `"Eine Ärztin oder ein Arzt prüft gerade deine Anfrage."`
- `reviewingLink` → `"Prüfstatus ansehen"`
- `next.view.title` → `"Menge wählen"`
- `next.view.body` → `"Wähle, wie viel du von deiner ausgewählten Lösung möchtest."`
- `next.review.body` → `"Eine Ärztin oder ein Arzt prüft gerade deine Antworten. Ein Rezept wird nur ausgestellt, wenn es medizinisch sinnvoll ist."`
- `next.delivery.title` → `"Rezept & Lieferung"`
- `next.delivery.body` → `"Nach der Freigabe bestätigst du die Zahlung und eine zugelassene Apotheke liefert diskret zu dir."`

Keep `result.viewSolution` / `result.viewReviewCta` / `result.submitReviewCta` keys in place (parity; unused after this task — a later cleanup removes them).

- [ ] **Step 2: Edit `ResultPage.tsx`**

1. Remove the `<JourneyStepper current="solution" className="mb-8" />` line and its import.

2. Replace the `primaryCta` definition (the `existingReview ? … : …` ternary) with a single product link:
```tsx
const primaryCta = (
  <Link
    to={paths.shopProduct(primary.id)}
    onClick={() =>
      track(AnalyticsEvent.recommendationPrimarySelected, {
        solution: primary.id,
      })
    }
    className={ctaClass}
  >
    {t("result.chooseAmountCta")}
    <ArrowRight className="size-4" aria-hidden />
  </Link>
);
```

3. Under the intro paragraph (right after the `<DeliveryConfirmation>` block inside the first `<Reveal>`), add the reviewing-status line:
```tsx
{existingReview ? (
  <p className="mt-3 text-sm text-ink-muted">
    {t("result.reviewingNote")}{" "}
    <Link
      to={paths.assessment.review}
      className="underline underline-offset-2 hover:text-ink"
    >
      {t("result.reviewingLink")}
    </Link>
  </p>
) : null}
```

4. The `<NextSteps>` block already maps `["view", "review", "delivery"]` — no code change, the reworded strings flow through.

- [ ] **Step 3: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 4: Manual browser walk**

Continue from Task 5's walk (or redo the pass): on `/assessment/result` —
- the "A doctor is now reviewing your request. See review status" line shows under the intro;
- the primary card button reads "Choose your amount" and goes to `/shop/<primary solution id>`;
- "What happens next" reads: Choose your amount → Medical review (doctor reviewing now) → Prescription & delivery;
- "Change my answers" still returns to `/assessment/start`.
- DE: "Menge wählen", "Prüfstatus ansehen".

- [ ] **Step 5: Commit**

```bash
git add src/pages/assessment/ResultPage.tsx src/i18n/locales/en/assessment.json src/i18n/locales/de/assessment.json
git commit -m "result: primary CTA opens the product; reword the next-steps for the new order"
```

---

## Task 7: Product page — remove the review/commerce gate; CTA → checkout

**Files:**
- Modify: `src/pages/shop/ProductPage.tsx`
- Modify: `src/i18n/locales/en/shop.json`, `src/i18n/locales/de/shop.json`

**Interfaces:**
- Consumes: `paths.checkout` (Task 3).
- Produces: the product page always shows the gram selector + a single "Continue" CTA that adds to the cart and navigates to `/checkout`.

- [ ] **Step 1: i18n (both locales)**

`en/shop.json` under `solution`:
- `addToCart` → `"Continue"`

`de/shop.json` under `solution`:
- `addToCart` → `"Weiter"`

Keep `solution.continueToReview` / `afterApprovalNote` / `orderingDisabledNote` / `backToRecommendation` (parity; unused after this task).

- [ ] **Step 2: Edit `ProductPage.tsx`**

1. Remove imports: `COMMERCE_ENABLED` (from `@/config` — keep `COA_CONFIRMED`, `PRICES_CONFIRMED`), `getMedicalReview`, `JourneyStepper`.
2. Remove `const reviewApproved = getMedicalReview()?.status === "approved";`.
3. Remove the `<JourneyStepper current="product" className="mb-8" />` line.
4. Change `onAdd` to navigate to checkout:
```tsx
const onAdd = () => {
  add(solution.id, grams);
  track(AnalyticsEvent.addToCart, {
    solution: solution.id,
    grams,
    value: solution.priceEur * grams,
  });
  navigate(paths.checkout);
};
```
5. In the hero, replace the whole three-way conditional
   (`reviewApproved && !COMMERCE_ENABLED ? … : reviewApproved ? ( <fieldset>… <button onAdd> ) : ( <Link to={medicalReview}> … )`)
   with just the gram selector + CTA (the old middle branch), unconditionally:
```tsx
<>
  <fieldset className="mt-5">
    <legend className="text-sm font-medium text-white">
      {t("solution.amountLabel")}{" "}
      <InfoHint className="ml-0.5 [&_button:hover]:text-white [&_button]:text-white/60">
        {t("solution.amountHint")}
      </InfoHint>
    </legend>
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {GRAM_OPTIONS.map(({ value: o, badge }) => (
        <button
          key={o}
          type="button"
          onClick={() => setGrams(o)}
          aria-pressed={grams === o}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
            grams === o
              ? "border-white bg-white text-petrol-800"
              : "border-white/25 text-white/75 hover:border-white/50 hover:text-white",
          )}
        >
          {badge ? (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-petrol-700">
              {t(`solution.amountBadges.${badge}`)}
            </span>
          ) : null}
          {t("solution.grams", { count: o })}
        </button>
      ))}
    </div>
  </fieldset>

  <button type="button" onClick={onAdd} className={cn(HERO_CTA_CLASS, "mt-5")}>
    {t("solution.addToCart")}
    <ArrowRight className="size-4" aria-hidden />
  </button>
</>
```
6. Leave the price line's `!PRICES_CONFIRMED` `<InfoHint>` (the "indicative" label) exactly as it is.

- [ ] **Step 3: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 4: Manual browser walk**

From `/assessment/result` click "Choose your amount" → the product page:
- the gram selector (5/10/15/30) is visible with no "continue to medical review" gate;
- the price shows with the "indicative" info hint;
- "Continue" adds to the cart and navigates to `/checkout` (the page there is still the old checkout until Task 8 — check the URL + that the cart chip / `wecare.cart` has the line).
- DE: the CTA reads "Weiter".

- [ ] **Step 5: Commit**

```bash
git add src/pages/shop/ProductPage.tsx src/i18n/locales/en/shop.json src/i18n/locales/de/shop.json
git commit -m "product: always show the gram selector; Continue goes straight to checkout"
```

---

## Task 8: Checkout — "Review & confirm your request"

**Files:**
- Modify: `src/pages/shop/CheckoutPage.tsx`
- Modify: `src/lib/analytics.ts`
- Modify: `src/i18n/locales/en/shop.json`, `src/i18n/locales/de/shop.json`

**Interfaces:**
- Consumes: `addOrder({ …, totalEur: null })` (Task 2); `paths.checkout` as a top-level route (Task 3); `FunnelChrome` provides the progress bar (Task 4).
- Produces: `AnalyticsEvent.requestSubmitted = "request_submitted"`. On submit, a request `Order` (`totalEur: null`, `status: "inReview"`, no `paymentMethod`) and a redirect to `/order-confirmation`.

- [ ] **Step 1: analytics — add the event**

In `src/lib/analytics.ts` `AnalyticsEvent`, add after `orderPlaced`:
```ts
  requestSubmitted: "request_submitted",
```

- [ ] **Step 2: i18n (both locales)**

`en/shop.json` under `checkout`:
- `title` → `"Review & confirm your request"`
- `placeOrder` → `"Submit my request"`
- `priceAfterReview` → `"Price and any medical-review fee are confirmed after your review, before any payment. Nothing is charged now."`
- `accountHeading` → `"Create your account"`
- `accountIntro` → `"You'll use this to track your request and confirm your order later."`
- `fields.email` → `"Email"` (add if not present)
- `fields.password` → `"Password"`
- `fields.passwordConfirm` → `"Confirm password"`
- `errors.email` → `"Enter your email address."`
- `errors.password` → `"Use at least 8 characters."`
- `errors.passwordConfirm` → `"The passwords don't match."`

`de/shop.json` under `checkout`:
- `title` → `"Anfrage prüfen & bestätigen"`
- `placeOrder` → `"Anfrage absenden"`
- `priceAfterReview` → `"Der Preis und eine mögliche Gebühr für die ärztliche Prüfung werden nach der Prüfung bestätigt, vor jeder Zahlung. Jetzt wird nichts berechnet."`
- `accountHeading` → `"Konto erstellen"`
- `accountIntro` → `"Damit verfolgst du deine Anfrage und bestätigst deine Bestellung später."`
- `fields.email` → `"E-Mail"`
- `fields.password` → `"Passwort"`
- `fields.passwordConfirm` → `"Passwort bestätigen"`
- `errors.email` → `"Bitte gib deine E-Mail-Adresse ein."`
- `errors.password` → `"Mindestens 8 Zeichen."`
- `errors.passwordConfirm` → `"Die Passwörter stimmen nicht überein."`

Keep `checkout.paymentHeading` / `paymentMethods.*` / `paymentNote` / `checkoutUnavailable.*` / `deliveryLabel` / `reviewLine*` keys (parity; unused after this task).

- [ ] **Step 3: Edit `CheckoutPage.tsx`**

This is a substantial edit. Work through it in order:

1. **Imports** — remove: `COMMERCE_ENABLED`, `PRICES_CONFIRMED` (no total shown), `CheckoutSteps`, `ENABLED_PAYMENT_METHODS`, `type PaymentMethodId`, `getMedicalReview`, `formatPriceEur`, `SOLUTION_BY_ID` stays (line items), `SolutionMark` stays. Add nothing.
   Keep: `useAssessment` (postcode prefill), `useAuth`, `useCart`, `AT_POSTCODE_RE`, `addOrder`, `DeliveryConfirmation`, `NextSteps`, `Trans`.

2. **Remove** the `DELIVERY_FEE_EUR` const, the `payment` state, and the `useEffect` guard that gates `checkout_started` on `COMMERCE_ENABLED` / review approval — replace that effect with an unconditional one:
```tsx
const checkoutTracked = useRef(false);
useEffect(() => {
  if (checkoutTracked.current || items.length === 0) return;
  checkoutTracked.current = true;
  track(AnalyticsEvent.checkoutStarted, { itemCount: items.length });
}, [items.length]);
```

3. **Account fields** — add state + validation for a signed-out user:
```tsx
const [account, setAccount] = useState({ email: "", password: "", passwordConfirm: "" });
const [accountErrors, setAccountErrors] = useState<Partial<Record<"email" | "password" | "passwordConfirm", string>>>({});

function validateAccount(): boolean {
  if (isAuthenticated) return true;
  const e: typeof accountErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) e.email = "email";
  if (account.password.length < 8) e.password = "password";
  if (account.password !== account.passwordConfirm) e.passwordConfirm = "passwordConfirm";
  setAccountErrors(e);
  return Object.keys(e).length === 0;
}
```

4. **Empty-cart guard** — change the redirect target:
```tsx
if (items.length === 0 && !placed) {
  return <Navigate to={paths.assessment.result} replace />;
}
```

5. **Delete** the `!placed && getMedicalReview()?.status !== "approved"` redirect block and the `!COMMERCE_ENABLED && !placed` "unavailable panel" block entirely.

6. **`onSubmit`** — validate address (keep the existing `ADDRESS_FIELDS` loop) **and** the account fields; build a request order:
```tsx
function onSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (submitting) return;

  const nextErrors: Partial<Record<FieldName, string>> = {};
  for (const f of ADDRESS_FIELDS) {
    const err = validateField(f.name, values[f.name]);
    if (err) nextErrors[f.name] = err;
  }
  const accountOk = validateAccount();
  if (Object.keys(nextErrors).length > 0 || !termsOk || !disclaimerOk || !accountOk) {
    setErrors(nextErrors);
    setTouched(Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, true])));
    const first = ADDRESS_FIELDS.find((f) => nextErrors[f.name]);
    if (first) document.getElementById(first.name)?.focus();
    return;
  }

  setSubmitting(true);
  setPlaced(true);
  const v = (k: FieldName) => values[k].trim();

  if (!isAuthenticated) {
    signIn(account.email.trim(), `${v("firstName")} ${v("lastName")}`.trim());
  }

  const order = addOrder({
    lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    totalEur: null,
    status: hasPrescriptionItem ? "inReview" : "processing",
    shipTo: {
      firstName: v("firstName"),
      lastName: v("lastName"),
      street: v("street"),
      postalCode: v("postalCode"),
      city: v("city"),
      country: t("checkout.countryValue"),
      ...(v("phone") ? { phone: v("phone") } : {}),
    },
  });
  clear();
  track(AnalyticsEvent.requestSubmitted, { reference: order.id });
  navigate(paths.orderConfirmation, { state: { orderId: order.id }, replace: true });
}
```
Add `signIn` to the `useAuth()` destructure: `const { isAuthenticated, user, signIn } = useAuth();`

7. **JSX** —
   - Remove `<CheckoutSteps current="review" className="mb-6" />` (both occurrences — the panel one is gone with its block; the form one).
   - Wrap the outer container: keep `<div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">` (add the padding that `FunnelChrome` doesn't supply — it only gives a `max-w-3xl` header/nav, the page owns its content padding). Check: `FunnelChrome`'s `<main>` has no padding, so each funnel page must set its own `mx-auto max-w-3xl px-4 py-10 sm:px-6` wrapper. Ensure `CheckoutPage`'s root `<div>` does.
   - **Customer section:** when `isAuthenticated`, keep the "Signed in as {email}" panel. When **not**, render the account fields instead:
```tsx
{isAuthenticated ? (
  <fieldset className="space-y-3">
    <legend className="text-lg font-medium text-ink">{t("checkout.customerHeading")}</legend>
    <p className="rounded-xl border border-border bg-surface-raised p-3 text-sm text-ink-muted">
      {t("checkout.signedInAs")} <span className="font-medium text-ink">{user?.email}</span>
    </p>
  </fieldset>
) : (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-ink">{t("checkout.accountHeading")}</legend>
    <p className="text-sm text-ink-muted">{t("checkout.accountIntro")}</p>
    {(["email", "password", "passwordConfirm"] as const).map((k) => (
      <div key={k} className="space-y-1.5">
        <Label htmlFor={`acct-${k}`}>{t(`checkout.fields.${k}`)}</Label>
        <Input
          id={`acct-${k}`}
          type={k === "email" ? "email" : "password"}
          autoComplete={k === "email" ? "email" : "new-password"}
          value={account[k]}
          onChange={(e) => setAccount((a) => ({ ...a, [k]: e.target.value }))}
          aria-invalid={Boolean(accountErrors[k]) || undefined}
          aria-describedby={accountErrors[k] ? `acct-${k}-error` : undefined}
          required
        />
        {accountErrors[k] ? (
          <p id={`acct-${k}-error`} role="alert" className="text-sm text-danger-600">
            {t(`checkout.errors.${accountErrors[k]}`)}
          </p>
        ) : null}
      </div>
    ))}
  </fieldset>
)}
```
   - **Remove** the entire payment-method `<fieldset>` (`checkout.paymentHeading` + the `ENABLED_PAYMENT_METHODS.map` radios + `checkout.paymentNote`).
   - **Keep** the shipping-address fieldset and the Terms + disclaimer fieldset unchanged.
   - **Summary aside:** replace the price block (`subtotal` / `deliveryLabel` / `reviewLine` / `total` / `pricesIndicative`) with the line items + the after-review note:
```tsx
<aside className="h-fit rounded-2xl md:rounded-3xl glass-strong p-6">
  <h2 className="text-base">{t("checkout.summaryHeading")}</h2>
  <ul className="mt-4 space-y-3 text-sm">
    {items.map((i) => {
      const s = SOLUTION_BY_ID[i.productId];
      return (
        <li key={i.productId} className="flex items-center gap-3">
          <SolutionMark solution={s} className="size-9 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 text-ink-muted">
            {s.name} · {t("cart.grams", { count: i.quantity })}
          </span>
        </li>
      );
    })}
  </ul>
  <p className="mt-4 rounded-xl bg-sage-50 p-3 text-xs text-petrol-700">
    {t("checkout.priceAfterReview")}
  </p>

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

  <Button type="submit" variant="cta" size="lg" className="mt-5 w-full" disabled={!canSubmit}>
    {t("checkout.placeOrder")}
  </Button>
</aside>
```
   - `canSubmit` stays `termsOk && disclaimerOk && !submitting`.
   - Remove the "Back to cart" ghost button (or point it at `paths.assessment.result` — keep it, retarget: `<Link to={paths.assessment.result}>`; the `checkout.backToCart` key can stay, or add `checkout.back` = "Back"). Keep it simple: retarget the existing link to `paths.assessment.result` and leave the label key.

- [ ] **Step 4: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 5: Manual browser walk**

Two passes:
- **Signed out:** clear storage, run the whole funnel (start → … → result → Choose your amount → Continue) → `/checkout` in FunnelChrome ("Your details" step): the "Create your account" fields show; the summary shows the line item + "Price … confirmed after your review", **no total, no payment method**. Fill address + account + tick both boxes → "Submit my request" → lands on `/order-confirmation` (old copy until Task 9), `wecare.orders` has one order with `"totalEur":null,"status":"inReview"`, `wecare.auth` now set.
- **Signed in:** sign in first, run the funnel → `/checkout` shows "Signed in as …" instead of the account fields; submit works the same.
- Validation: submit with a bad email / short password / mismatch → inline errors, no navigation.
- DE: "Anfrage prüfen & bestätigen", "Anfrage absenden".

- [ ] **Step 6: Commit**

```bash
git add src/pages/shop/CheckoutPage.tsx src/lib/analytics.ts src/i18n/locales/en/shop.json src/i18n/locales/de/shop.json
git commit -m "checkout: total-less 'review & confirm your request' with inline account; submit a request order"
```

---

## Task 9: Order confirmation + cart — "your request is in"

**Files:**
- Modify: `src/pages/shop/OrderConfirmationPage.tsx`
- Modify: `src/pages/shop/CartPage.tsx`
- Modify: `src/i18n/locales/en/shop.json`, `src/i18n/locales/de/shop.json`

**Interfaces:**
- Consumes: `order.totalEur` may be `null` (Task 2 already added the guard in `OrderConfirmationPage`; this task reworks the surrounding copy). `FunnelChrome` provides the bar (Task 4).

- [ ] **Step 1: i18n (both locales)**

`en/shop.json` under `confirmation`:
- `title` → `"Your request is in"`
- `body` → `"Your request is in. A doctor reviews it next, and we'll email you at each step."`
- `orderLabel` → `"Reference: {{id}}"`
- `steps.received.title` → `"Request received"`
- `steps.received.body` → `"We've got your answers and your delivery details."`
- `steps.review.title` → `"Doctor review"`
- `steps.review.body` → `"A licensed doctor reviews your request. A prescription is issued only if it is appropriate."`
- `steps.dispatch.title` → `"Prescription & delivery"`
- `steps.dispatch.body` → `"If approved, you confirm payment and a licensed pharmacy ships discreetly to your door."`
- `timingNote` → `"You'll see delivery timing once a prescription is issued and the pharmacy has prepared your order."`
- `toOrders` → `"Track my request"`
- `toHome` → `"Back to home"`
- `priceAfterReview` — already added in Task 2 (`"Confirmed after review"`).

`de/shop.json` under `confirmation`:
- `title` → `"Deine Anfrage ist eingegangen"`
- `body` → `"Deine Anfrage ist eingegangen. Als Nächstes prüft sie eine Ärztin oder ein Arzt, und wir informieren dich per E-Mail bei jedem Schritt."`
- `orderLabel` → `"Referenz: {{id}}"`
- `steps.received.title` → `"Anfrage eingegangen"`
- `steps.received.body` → `"Deine Antworten und Lieferdaten sind bei uns."`
- `steps.review.title` → `"Ärztliche Prüfung"`
- `steps.review.body` → `"Eine lizenzierte Ärztin oder ein lizenzierter Arzt prüft deine Anfrage. Ein Rezept wird nur ausgestellt, wenn es sinnvoll ist."`
- `steps.dispatch.title` → `"Rezept & Lieferung"`
- `steps.dispatch.body` → `"Nach der Freigabe bestätigst du die Zahlung und eine zugelassene Apotheke liefert diskret zu dir."`
- `timingNote` → `"Den Liefertermin siehst du, sobald ein Rezept ausgestellt und deine Bestellung von der Apotheke vorbereitet wurde."`
- `toOrders` → `"Anfrage verfolgen"`
- `toHome` → `"Zur Startseite"`

- [ ] **Step 2: Edit `OrderConfirmationPage.tsx`**

1. Remove `<CheckoutSteps current="complete" className="mb-8" />` and its import.
2. Wrap the root in the funnel content padding: `<div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6">`.
3. The `order.totalEur == null` guards from Task 2 stay. Additionally: only render the "Total" `<dl>` row when `order.totalEur != null` (a request order has no total to show — the reference + status list carry it):
```tsx
{order.totalEur != null ? (
  <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
    <div className="flex justify-between">
      <dt className="text-ink-muted">{t("confirmation.totalLabel")}</dt>
      <dd className="font-mono font-medium text-ink">
        {formatPriceEur(order.totalEur, language)}
      </dd>
    </div>
    {order.paymentMethod ? (
      <div className="flex justify-between">
        <dt className="text-ink-muted">{t("confirmation.paymentLabel")}</dt>
        <dd className="text-ink">{t(`checkout.paymentMethods.${order.paymentMethod}`)}</dd>
      </div>
    ) : null}
  </dl>
) : null}
```
   And the per-line price span: when `order.totalEur == null`, render nothing (already handled in Task 2 with `? "" :`). Leave that.
4. Primary CTA — retarget to the dashboard root and use the new label:
```tsx
<Button asChild variant="cta" className="w-full sm:w-auto">
  <Link to={paths.dashboard}>{t("confirmation.toOrders")}</Link>
</Button>
<Button asChild variant="outline" className="w-full sm:w-auto">
  <Link to={paths.home}>{t("confirmation.toHome")}</Link>
</Button>
```
   (`paths.dashboardOrders` import can go if now unused; `paths.home` added.)

- [ ] **Step 3: Edit `CartPage.tsx`**

The cart is an optional detour now (product → checkout is the main path), reachable via the header cart chip.
1. Remove both `<CheckoutSteps …>` usages and the import (`FunnelChrome` shows the bar; `/cart` maps to the "details" step).
2. Root wrapper: `<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">`.
3. Empty-cart CTA and "continue" button — point at `/assessment/result` instead of `paths.dashboardRecommendation`:
```tsx
<Link to={paths.assessment.result}>{t("cart.emptyCta")}</Link>
...
<Link to={paths.assessment.result}>{t("cart.continueShopping")}</Link>
```
4. Keep the `COMMERCE_ENABLED` branches as-is — `COMMERCE_ENABLED` is still `false`, so the cart shows `cart.finalPriceNote` and **no** checkout button. The user reaches checkout from the product page, not here. (This is intentional for the interim; when `COMMERCE_ENABLED` flips, the cart's own checkout button returns.)

- [ ] **Step 4: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 5: Manual browser walk**

- Finish the funnel through "Submit my request" → `/order-confirmation` in FunnelChrome with the "Done" step lit: "Your request is in", "Reference: WC-…", the 3-step list (Request received → Doctor review → Prescription & delivery), **no total row**, "Track my request" → `/dashboard`, "Back to home" → `/`.
- Open `/cart` via the header cart chip (add something first) → no `CheckoutSteps`, "final price shown before you confirm" note, no checkout button, "View your recommendation" → `/assessment/result`.
- DE strings render.

- [ ] **Step 6: Commit**

```bash
git add src/pages/shop/OrderConfirmationPage.tsx src/pages/shop/CartPage.tsx src/i18n/locales/en/shop.json src/i18n/locales/de/shop.json
git commit -m "confirmation: 'your request is in' endpoint; cart becomes an optional detour"
```

---

## Task 10: Dashboard — drop the commerce-title lookup; tolerate null totals

**Files:**
- Modify: `src/pages/dashboard/DashboardLayout.tsx`
- Modify: `src/pages/dashboard/pages.tsx` (Orders table — the Task 2 guards should already be in; confirm)

**Interfaces:**
- Consumes: `paths.cart` / `paths.checkout` / `paths.orderConfirmation` are top-level now (Task 3) — no longer `/dashboard/*`, so the `commerceTitle` map keys never match `here`.

- [ ] **Step 1: Edit `DashboardLayout.tsx`**

Remove the commerce-title machinery:
1. Delete the `const { t: tShop } = useTranslation("shop");` line.
2. Delete the `const commerceTitle: string | undefined = { … }[here];` block.
3. `usePageTitle(t("title"), undefined, { noindex: true });` (drop `commerceTitle ??`).
4. In the `!isAuthenticated` redirect `state`, drop the checkout branch:
```tsx
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: location.pathname }}
      />
    );
```
5. `headerTitle`:
```tsx
  const headerTitle = isHome
    ? t(`greeting.${greetingKey()}`, { name: displayName })
    : t(`nav.${activeKey}`);
```
6. `<DashboardChrome headerTitle={headerTitle} isHome={isHome}>` — drop `hideCartChip={Boolean(commerceTitle)}` (defaults to `false`).
7. Remove the now-unused `here` const if nothing else references it (it's still used by `isHome`/`activeKey` via `trimSlash(location.pathname)` — keep `isHome`; recompute inline if needed).

- [ ] **Step 2: Confirm the Orders-table guards (from Task 2)**

In `src/pages/dashboard/pages.tsx`, verify both `formatPriceEur(order.totalEur, language)` sites (desktop table ~line 996, mobile card ~line 1041) read:
```tsx
{order.totalEur == null
  ? t("orders.totalPending")
  : formatPriceEur(order.totalEur, language)}
```
and `dashboard.orders.totalPending` exists in both locales (added in Task 2). If Task 2's guard wasn't applied here, apply it now.

- [ ] **Step 3: Checks**

Run: `pnpm typecheck` → PASS. `pnpm build` → PASS. `pnpm test` → PASS.

- [ ] **Step 4: Manual browser walk**

- Sign in, submit a request through the funnel, then go to `/dashboard/orders`:
  - the desktop table and the mobile card both show the order with **"Confirmed after review"** in the Total column (not `€0.00`, not `NaN`);
  - the status pill reads the `inReview` label.
- `/dashboard` overview renders without error (it reads `getOrders()[0]`).
- `/dashboard/checkout` in the URL bar → redirects to `/checkout` (via `LEGACY_REDIRECTS`).
- DE: "Nach der Prüfung bestätigt".

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/DashboardLayout.tsx src/pages/dashboard/pages.tsx
git commit -m "dashboard: drop the moved-out commerce routes from the layout; show pending totals"
```

---

## Task 11: i18n parity sweep + docs + final green

**Files:**
- Verify: all `src/i18n/locales/{en,de}/*.json`
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/specs/2026-09-08-funnel-resequence-design.md` (status line)

- [ ] **Step 1: Parity check script**

Run this one-off from the repo root:
```bash
node -e '
const fs=require("fs");
const ns=fs.readdirSync("src/i18n/locales/en").filter(f=>f.endsWith(".json"));
const flat=(o,p="")=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==="object"&&!Array.isArray(v)?flat(v,p+k+"."):[p+k]);
let bad=0;
for(const f of ns){
  const en=new Set(flat(JSON.parse(fs.readFileSync("src/i18n/locales/en/"+f))));
  const de=new Set(flat(JSON.parse(fs.readFileSync("src/i18n/locales/de/"+f))));
  const only=(a,b)=>[...a].filter(x=>!b.has(x));
  const eo=only(en,de), do_=only(de,en);
  if(eo.length||do_.length){bad++;console.log("["+f+"] EN-only:",eo,"DE-only:",do_);}
}
console.log(bad?"PARITY FAIL":"parity ok");
'
```
Expected: `parity ok`. Fix any listed key by adding it to the missing locale (with a real translation, not a copy of the English).

- [ ] **Step 2: Grep for stale references**

```bash
git grep -n "JourneyStepper" src/pages/assessment src/pages/shop   # expect: none in the funnel pages
git grep -n "isAppShellRoute"                                       # expect: none
git grep -n "CheckoutSteps"                                         # expect: only the component file itself (now unused — leave it) 
git grep -n "paths.dashboardRecommendation" src/pages/shop          # expect: none (retargeted to /assessment/result)
```
`CheckoutSteps.tsx` is now unreferenced — leave the file (a follow-up cleanup can remove it); note it in the commit message.

- [ ] **Step 3: Update `CLAUDE.md`**

Add a section near the other 2026-09 decision logs:
```markdown
## Funnel re-sequence — questions → product → billing → done (2026-09-08, branch `audit-fixes`)

Stakeholder (Mischa) QA verdict: the funnel dead-ended (product page gated on an approved review that never arrives in the mock; `COMMERCE_ENABLED` off) and the order of steps (product before the doctor questions, signup late, dashboard mid-flow) "will not convert". Design + plan: `docs/superpowers/specs/2026-09-08-funnel-resequence-design.md` / `docs/superpowers/plans/2026-09-08-funnel-resequence.md`.

**Interim (this change) — Approach 1, re-sequence within current guardrails:**
- One continuous question pass: the 6 assessment questions + the safety/exclusion questions (`ExclusionStep` as a "Final checks" step, `steps.ts` gains a `"safety"` phase). The `wecare.review` record is created when the pass finishes, not from a separate page. `/assessment/medical-review` is now a redirect.
- Standalone funnel shell `FunnelChrome` (logo + 4-step bar: Questions · Your match · Your details · Done) replaces the marketing header/footer AND the embedded dashboard shell on `/assessment/*`, `/shop`, `/shop/:id`, `/cart`, `/checkout`, `/order-confirmation` — for every visitor. `isAppShellRoute` → `isFunnelRoute` / `funnelStepFor`. Cart/checkout/confirmation moved out of `/dashboard/*` to top-level `/cart` `/checkout` `/order-confirmation` (old paths redirect).
- Result page primary CTA → the product ("Choose your amount"); product page always shows the gram selector (no approval gate) and "Continue" → `/checkout`.
- Checkout is "Review & confirm your request": no payable total (`checkout.priceAfterReview`), no payment method, inline account fields when signed out, "Submit my request" → `addOrder({ totalEur: null, status: "inReview" })` → `/order-confirmation` ("Your request is in"). `Order.totalEur` is now `number | null`.
- **No change** to `COMMERCE_ENABLED` / `PRICES_CONFIRMED` / `getRecommendation`. No payment surface. Doctor review still mandatory, still before dispatch — submitted earlier, shown as the pending next step.

**PO sign-offs this needs (reverses ratified decisions):** B1/B2 (safety questions move before the product), the Sept-2026 "journey stays in the dashboard shell", D3's result-CTA framing. **Target flow (pay at checkout, SMS/WhatsApp OTP, returning-customer fast path) is Part A of the design doc — not built; blocked on PO + counsel + a PSP + an SMS/WA provider + a backend.**

`CheckoutSteps.tsx` is now unused (kept pending cleanup). `assessment:medicalReview.*`, `shop:solution.{continueToReview,afterApprovalNote,orderingDisabledNote,backToRecommendation}`, `shop:checkout.{paymentHeading,paymentMethods,paymentNote}`, `assessment:result.{viewSolution,viewReviewCta,submitReviewCta}` are unused (kept for parity; remove in a later cleanup).

`pnpm typecheck` + `pnpm build` + `pnpm test` green; DE/EN parity verified.
```

- [ ] **Step 4: Update the design-doc status line**

In `docs/superpowers/specs/2026-09-08-funnel-resequence-design.md`, change the `**Status:**` line to:
`**Status:** implemented on \`audit-fixes\` per docs/superpowers/plans/2026-09-08-funnel-resequence.md; not committed/pushed pending owner review`
(or, if commits were made, drop the "not committed" clause).

- [ ] **Step 5: Final full green + full manual walk**

```bash
pnpm typecheck && pnpm build && pnpm test
```
Expected: all PASS.

Then `pnpm dev` and walk the **entire** flow once in EN and once in DE, signed out then signed in:
`/` → a problem page → Start → age+DOB → postcode → q1–q6 → Final checks → Result ("A doctor is now reviewing…") → Choose your amount → gram selector → Continue → Review & confirm your request (account fields when signed out; no total; no payment) → Submit my request → "Your request is in" → Track my request → `/dashboard` → `/dashboard/orders` shows the request with "Confirmed after review". No marketing header/footer or dashboard sidebar appears anywhere in the funnel; the 4-step bar advances Questions → Your match → Your details → Done.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-09-08-funnel-resequence-design.md src/i18n/locales
git commit -m "docs: record the funnel re-sequence; i18n parity verified"
```

---

## Self-Review

**Spec coverage:**
- Part B §1 (routes/shell) → Tasks 3, 4. ✅
- Part B §2 (question pass merge, review at end, `/assessment/medical-review` redirect) → Tasks 1, 5. ✅
- Part B §3 ("Your match" CTA + next-steps) → Task 6. ✅ (Sub-decision 1: two screens kept — Result then Product. ✅)
- Part B §4 (product gram selector always shown, CTA → checkout) → Task 7. ✅
- Part B §5 ("Review & confirm your request", inline account, "Submit my request", request order) → Task 8. ✅ (Sub-decision 3: inline email+password chosen per the spec's lean. ✅)
- Part B §6 ("Your request is in") → Task 9. ✅
- Part B §7 (dashboard out of the path) → Tasks 3, 10. ✅
- Part B §8 (review at end; `Order.totalEur` nullable; no `COMMERCE_ENABLED`/`PRICES_CONFIRMED` change) → Tasks 1, 2, 5, 8. ✅
- Part B §9 (i18n, "a few short questions", DE rules) → threaded through Tasks 4–9 + Task 11 sweep. ✅
- Part B §10 (analytics: `medical_review_submitted` at pass end, `assessment_exclusion_completed` inline, `request_submitted`, `checkout_started` on render) → Tasks 5, 8. ✅
- Part B §11 (tests: `steps.ts`, `orders.ts`, `recommendation.ts` untouched, manual walk) → Tasks 1, 2, + each task's walk. ✅
- Sub-decision 2 (funnel path naming): resolved to top-level `/checkout` + `/order-confirmation` (Task 3). ✅
- Guardrails (no payment UI, no total, no COMMERCE_ENABLED change, doctor review kept) — enforced in Global Constraints and Tasks 7–9. ✅

**Placeholder scan:** no "TBD"/"handle edge cases"/"similar to Task N" — every code step has the literal code. New i18n keys carry both EN and DE literal values. ✅

**Type consistency:**
- `Phase` gains `"safety"` (Task 1) — consumed in Task 5. ✅
- `Order.totalEur: number | null` + `addOrder({ totalEur: number | null })` (Task 2) — consumed in Tasks 8 (`totalEur: null`), 9, 10 (guards). ✅
- `isFunnelRoute` / `funnelStepFor` (Task 3) — consumed in Task 4. `funnelStepFor` return union `"questions" | "match" | "details" | "done"` matches `FunnelChrome`'s `FunnelStep`. ✅
- `AnalyticsEvent.requestSubmitted` (Task 8) — used only in Task 8. ✅
- `deriveStartPhase` gains an optional `exclusions` param (Task 1) — Task 5 passes `exclusions ?? undefined`. ✅

**Scope:** one subsystem (the funnel), one plan. No decomposition needed.
