# Design — quick-green-style UX polish for the assessment & checkout flow

**Date:** 2026-09-03
**Branch:** `audit-fixes` (feature work continues here per repo convention)
**Status:** design approved in chat; spec pending user review; not yet committed (owner asked to hold commits/pushes)

## Background

A stakeholder (Mischa) tested the live WeCare preview and expected it to *feel* like
**quick-green.com** (the DE medical-cannabis telehealth competitor teardown is in
`docs/COMPETITOR-QUICK-GREEN.md`). Clarified with the requester: Mischa was reacting to
quick-green's **funnel feel / UX polish**, not its commercial model (browse-products-and-prices
before the doctor, pay-at-checkout, strain marketplace). The commercial model is explicitly out —
it collides with WeCare's problem-first hard rules, PO decisions D3 (submit → medical review →
order only if approved) and D7 (invoice/bank-transfer only, pay after approval), and Austrian
prescription-medicine law.

This design borrows only the **safe UX layer**:

1. Auto-advance assessment (one tap per question).
2. An early **postcode / delivery-area** step ("it checked where I live").
3. A **safety / exclusion** step before the result — **informational only**, never blocks.
4. **Result + checkout polish** — delivery reassurance, clearer "what happens next", itemised
   order summary.

Chosen implementation approach (of three considered): **B — phase wrapper around the existing
question core.** Keep the working 6-question state engine and the `recommendation.ts` contract
untouched; add the two new steps as isolated sibling components; a `phase` state orchestrates
them. Rejected: A (one unified typed-step array — cleanest long-term but too much blast radius
for this round) and C (a route per step — violates spec §7 "no route changes between questions"
and breaks `PageReveal`).

## Non-goals / out of scope this round

- Homepage changes (it is problem-first by mandate and already has a delivery banner + Austria map).
- Live-chat widget (needs a vendor + a real support team).
- A real reviews / Trustpilot widget (WeCare deliberately carries no testimonials; nothing to fake).
- A real medical-review **fee figure** (D5 owner-blocked; `/costs` carries no euro figures — BR-045).
- OTP / passwordless auth (auth is mock; no backend).
- Any change to `getRecommendation` logic, the payment methods, or the checkout auth gate.

---

## Section 1 — Assessment engine: phase model + auto-advance

### Files

| File | Change |
|---|---|
| `src/pages/assessment/AssessmentEnginePage.tsx` | phase orchestration, auto-advance wiring, cross-phase progress; question rendering moves out |
| `src/pages/assessment/QuestionStep.tsx` | **new** — the extracted question-card renderer (radio group + hints + note) |
| `src/pages/assessment/PostcodeStep.tsx` | **new** — see §2 |
| `src/pages/assessment/ExclusionStep.tsx` | **new** — see §3 |
| `src/features/assessment/AssessmentContext.tsx` | new persisted fields (see §5) |
| `src/features/assessment/questions.ts` | add `STEP_COUNT` / phase helpers, or a sibling `steps.ts` |

### Phase model

`AssessmentEnginePage` holds `phase: "postcode" | "questions" | "exclusion"`.

- The **age gate** (`AgeGate`, collects DOB — D14) stays the first gate, unchanged: the page
  early-returns `<AgeGate>` until `ageOk`.
- After age, the phase/step on mount is derived from saved state (extends the current
  "resume at first unanswered question" rule):
  - no `postcode` saved → `phase = "postcode"`
  - `postcode` saved, some q's unanswered → `phase = "questions"`, `step` = first unanswered
  - all q's answered, no `exclusions` saved → `phase = "exclusion"`
  - all answered + exclusions saved → assessment is effectively complete; `submit()` path
    (existing behaviour — normally the user is on the result page by then)
- `?problem=` deep-link: still calls `prefillProblem()` → sets `q1`. The user still sees the
  `postcode` phase first (unless already saved), then lands on `q1` with the answer pre-selected
  and the existing "we've noted {condition}" note. It does **not** auto-skip q1 (see auto-advance
  rule below — advance only fires on a user change).
- Flow end: after the `exclusion` phase's Continue → `submit()` → `navigate(paths.assessment.result)`
  (unchanged call; `assessmentCompleted` analytics unchanged).

### Auto-advance

- On a **question step**, when the user changes the selected option, arm a timer; after
  **350 ms** advance to the next step. `prefers-reduced-motion` → **120 ms** (still auto, no
  lingering highlight/slide).
- The timer **arms only in response to a user-initiated change on the current step.** Never on
  mount, resume, or Back-arrival. This covers the pre-filled-q1 case and all Back-navigation:
  the answer shows selected, nothing moves until the user actually changes something.
- A further change within the window **clears and restarts** the timer — you always land on
  your final choice.
- A **secondary `Next` button stays visible on every question step** (keyboard / AT / changed-mind
  safety net). It is visually secondary; the auto-advance is what creates the snappiness.
- **q6 (last question) does NOT auto-advance.** Selecting an option on q6 enables an explicit
  **primary** CTA ("See my recommendation"); the user must tap it to `submit()`. Finishing the
  assessment should never be an accidental tap, and this gives a clear "end of assessment" moment.
- **Back** (top-left, ghost + arrow) always visible except on the first step (postcode); **Start
  over** link always visible (resets everything incl. postcode + exclusions).
- Between-step transition: ~200 ms crossfade keyed on a combined step index; reduced-motion →
  instant. Local to the engine (not `PageReveal`, which is for route changes).

### Progress

- Total steps = **1 (postcode) + 6 (questions) + 1 (exclusion) = 8**. A `stepIndex` 0..7 is
  derived from `phase` + question `step`.
- Linear bar width = `(stepIndex + 1) / 8`. `AssessmentRing` `value` = `stepIndex + 1`,
  `total` = 8 (was `answeredCount` / 6).
- Eyebrow shows a **per-phase label**, not "Step 4 of 8":
  - postcode → `assessment:phase.delivery` ("Delivery")
  - questions → existing `assessment:start.progress` ("Question {{current}} of {{total}}", total 6)
  - exclusion → `assessment:phase.finalChecks` ("Final checks")

---

## Section 2 — Postcode / delivery-area step

### Files

| File | Change |
|---|---|
| `src/pages/assessment/PostcodeStep.tsx` | **new** |
| `src/features/delivery/delivery.ts` | **new** — `AT_POSTCODE_RE`, `regionForPostcode()`, `isServiceableAt()` |
| `src/pages/shop/CheckoutPage.tsx` | pre-fill `postalCode`, render `DeliveryConfirmation` (see §4) |
| `src/components/marketing/DeliveryConfirmation.tsx` | **new** — shared one-liner |

### UI

- Eyebrow `assessment:phase.delivery`; heading `assessment:postcode.heading` ("Where should we
  deliver?"); sub `assessment:postcode.sub` ("We'll check we cover your area — takes a second.").
- One text input, `inputMode="numeric"`, `maxLength={4}`, placeholder from
  `assessment:postcode.placeholder` ("e.g. 1010"). Enter submits.
- Primary button `assessment:postcode.continue` ("Continue"), disabled until the value matches
  `^\d{4}$`.
- `Back` hidden/disabled (first step).

### Delivery logic — `src/features/delivery/delivery.ts`

- `AT_POSTCODE_RE = /^\d{4}$/`.
- `regionForPostcode(pc: string): RegionKey | undefined` — leading digit → region key, from a
  static table:
  `1→wien, 2→niederoesterreichOst, 3→niederoesterreichWest, 4→oberoesterreich, 5→salzburg,
  6→tirolVorarlberg, 7→burgenland, 8→steiermark, 9→kaernten`. Non-`\d{4}` or leading `0` →
  `undefined`.
- `isServiceableAt(pc: string): boolean` — currently `AT_POSTCODE_RE.test(pc)` (every valid AT
  postcode is serviceable; WeCare is DHL-nationwide, no Berlin-style micro-zones). Kept as a
  function so a real coverage table can slot in later.
- No network call, no external dependency.

### Behaviour

- Valid submit → show the `<DeliveryConfirmation>` line (§4; `common:delivery.confirmLine`,
  "We deliver to {{postcode}} ({{region}}) — typically next day once your prescription is
  approved."), dwell ~1 s (reduced-motion: ~0), then auto-advance to `phase = "questions"`, q1.
- Bad format → inline error `assessment:postcode.error` ("Enter a 4-digit Austrian postcode."),
  no advance.
- Persist `postcode` + `deliveryRegion` (the region key) to `wecare.assessment`.

---

## Section 3 — Safety / exclusion step (informational only)

### Files

| File | Change |
|---|---|
| `src/pages/assessment/ExclusionStep.tsx` | **new** |
| `src/features/assessment/exclusions.ts` | **new** — option keys shared by storage / i18n / review payload |

### UI — one screen, everything visible

- Eyebrow `assessment:phase.finalChecks`; heading `assessment:exclusion.heading`
  ("A few things your medical reviewer needs to know"); sub `assessment:exclusion.sub`
  ("None of these stop you continuing — they just help the doctor.").
- **Pregnancy** — `assessment:exclusion.pregnancy.q` ("Are you pregnant, breastfeeding, or
  planning to become pregnant?") → Yes / No.
- **Recent supply** — `assessment:exclusion.recentSupply.q` ("In the last 30 days, have you
  received 100 g or more of cannabis on prescription?") → Yes / No.
- **Conditions** — `assessment:exclusion.conditions.q` ("Do any of these apply to you?") →
  multi-select checklist, keys in `exclusions.ts`:
  `heart` · `liverKidney` · `psychosis` · `dependence` · `allergy` · `none`.
  Selecting `none` clears the rest; selecting any other clears `none`.
- Primary button `assessment:exclusion.continue` ("Continue to my result") — **always enabled**.
- If `pregnancy === "yes"` **or** `recentSupply === "yes"` **or** `conditions` has any non-`none`
  entry → show `assessment:exclusion.flaggedNote` in a **muted / sage** style (NOT a warning
  colour): "Thanks — your medical reviewer will go through these with you before anything is
  prescribed." No suitability judgement, no "this may not be for you".
- No auto-advance (multi-select needs an explicit Continue).

### Behaviour

- On Continue → persist `exclusions` (see §5), `submit()`, navigate to result.
- `recommendation.ts` does **not** read any of this.

---

## Section 4 — Result page + checkout polish

### Files

| File | Change |
|---|---|
| `src/pages/assessment/ResultPage.tsx` | delivery line; restyle `result.next.*` as numbered steps; optional exclusion continuity line |
| `src/pages/shop/CheckoutPage.tsx` | pre-fill postcode; delivery line; restructure order summary; "what's next" block |
| `src/components/marketing/DeliveryConfirmation.tsx` | **new** — `<DeliveryConfirmation postcode region />` muted one-liner |
| `src/components/marketing/NextSteps.tsx` | **new** — numbered-chip step list (title + one line each) |
| `src/pages/shop/OrderConfirmationPage.tsx` | swap its inline numbered list for `<NextSteps>` (dedupe) |

### Result page

- **Delivery line** in the payoff area, only when `postcode` is saved: `<DeliveryConfirmation>` →
  "We deliver to 1010 (Wien) — typically next day once your prescription is approved." Muted,
  near the recommendation, not competing with it.
- **"What happens next"** — existing `assessment:result.next.*` copy (submit → review → order &
  delivery, per D3) rendered via `<NextSteps>` (numbered chips), same rhythm as the confirmation
  page. Content unchanged.
- CTAs unchanged (submit-for-review primary + "view recommended solution" outline —
  D3 + stakeholder Sept 2026).
- If any exclusion flag set: one muted line `assessment:result.exclusionNote` ("Your reviewer
  will also go through the health checks you completed.").

### Checkout

- **Pre-fill `postalCode`** from `wecare.assessment.postcode`; render `<DeliveryConfirmation>`
  under the shipping fieldset (same string as the result page).
- **Order summary** restructured into an itemised block:
  line items (solution · grams · price) → Subtotal → Delivery (Free / €0) →
  **Medical review** — value column reads `shop:checkout.reviewLineValue` ("Fee confirmed after
  review") linking `/costs`, **no number** (D5 / BR-045) → **Total** (products only).
  `shop:pricesIndicative` note stays. This promotes today's footnote to a real summary line so
  the structure mirrors quick-green's itemisation without inventing a figure.
- **"What happens after you place this order"** — compact `<NextSteps>` (received → medical
  review → dispatch on approval) near the Place-order button, reusing `shop:confirmation.steps.*`.
- Unchanged: auth gate, `PAYMENT_METHODS` (invoice / bankTransfer — D7), the two required
  checkboxes, `addOrder`.

---

## Section 5 — Data model & persistence

`AssessmentContext` / `wecare.assessment` gains three optional fields:

```ts
postcode?: string;         // "1010"
deliveryRegion?: string;   // "wien"  — RegionKey; label via i18n assessment:regions.<key>
exclusions?: {
  pregnancy?: "yes" | "no";
  recentSupply?: "yes" | "no";
  conditions?: string[];   // subset of exclusions.ts keys, or ["none"]
};
```

- **No migration.** Old persisted state lacks these → in-progress assessment reopens at the
  postcode phase; an already-completed old assessment stays complete, result page omits the
  delivery line (guarded on `postcode` presence).
- `getRecommendation(answers)` signature + logic **unchanged** — reads q1–q6 only. New fields sit
  alongside in context, never passed in (same treatment as q2/q6 under D1).
- `src/features/review/review.ts` — the review record already stores the assessment answers
  "handed to the doctor" (D3). Extend its payload with `postcode` + `exclusions`. `ReviewStatusPage`
  rendering unchanged.
- `AssessmentContext.reset()` clears the new fields. WC-13 per-session wipe of `wecare.assessment`
  already covers them.

---

## Section 6 — i18n & analytics

### i18n (DE + EN, key parity enforced across all namespaces)

New keys:
- `assessment:phase.delivery`, `assessment:phase.finalChecks`
- `assessment:postcode.{heading,sub,placeholder,continue,error}`
- `assessment:regions.{wien,niederoesterreichOst,niederoesterreichWest,oberoesterreich,salzburg,
  tirolVorarlberg,burgenland,steiermark,kaernten}`
- `assessment:exclusion.{heading,sub,continue,flaggedNote,yes,no}`,
  `assessment:exclusion.pregnancy.q`, `assessment:exclusion.recentSupply.q`,
  `assessment:exclusion.conditions.{q,heart,liverKidney,psychosis,dependence,allergy,none}`
- `assessment:result.exclusionNote`
- shared delivery line: `common:delivery.confirmLine` — used by `<DeliveryConfirmation>` on the
  postcode step, the result page, and checkout; interpolates `{{postcode}}`, `{{region}}`
- `shop:checkout.reviewLine`, `shop:checkout.reviewLineValue`

DE: **"Fragebogen"** convention, slash-form gendering (`Nutzer/innen`, `Kund/innen`), Austria
word rules — "ärztliche Prüfung", never a treatment/cure promise; German en-dash `–` for
parentheticals.

### Analytics — `src/lib/analytics.ts` (consent-gated; D16 minimisation)

- `assessment_postcode_submitted` → `{ serviceable: true, region: "<RegionKey>" }` —
  **no raw postcode.** (Region is a coarse 9-way bucket; drop it too if the owner prefers
  `{ serviceable }` only.)
- `assessment_exclusion_completed` → `{ flagged: boolean, flag_count: number }` —
  **not which flags.**
- Existing `assessment_question_answered` (id + index only) gains `{ auto_advanced: true }` for
  funnel timing. No other new events.

---

## Section 7 — Testing

Follows the repo's TDD workflow; `pnpm typecheck` + `pnpm build` must stay green; DE/EN parity
re-verified.

- **`delivery.ts`** (pure) — `regionForPostcode` per leading digit 1–9; `0xxx` / 3-digit /
  5-digit / non-numeric / empty → `undefined`; `AT_POSTCODE_RE`; `isServiceableAt`.
- **Auto-advance** (component) — user change → advance callback after the delay; second change
  within window resets the timer; mount / resume / Back-arrival do **not** advance;
  `prefers-reduced-motion` uses the short delay.
- **PostcodeStep** — valid submit → `onComplete(postcode, region)`; invalid → error rendered,
  no `onComplete`.
- **ExclusionStep** — `none` ↔ specific-option mutual exclusivity both directions; Continue always
  enabled; flagged input → `flaggedNote` shown; `onComplete` payload shape.
- **Engine phase flow** — postcode → q1…q6 → exclusion → submit → `paths.assessment.result`;
  resume derivation picks the right phase from each partial-state shape; `?problem=` pre-selects
  q1 and does not auto-skip.
- **`recommendation.ts`** — existing tests pass unchanged (contract intact).
- Manual browser walk of the whole flow (the thing Mischa will re-test), DE and EN.

---

## Risks / tradeoffs

- **Auto-advance vs. review-by-Back:** arriving at an earlier step via Back and then changing an
  option re-advances. Mitigated by "arm only on user change" + the 350 ms beat + one-tap Back +
  the persistent secondary Next. Accepted.
- **Two setup screens before q1** (age+DOB, then postcode). quick-green front-loads far more;
  auto-advance makes the 6 questions feel shorter. Net perceived-effort ≈ neutral.
- **Region from leading digit** is approximate (some border postcodes); it is cosmetic reassurance
  only, never used for logic. Acceptable.
- **`exclusions` are self-reported and unused by logic** — purely a reviewer aid. This is the
  point (owner chose "informational only"); legal sufficiency of the age gate / exclusions is a
  standing counsel item, unchanged by this work.
