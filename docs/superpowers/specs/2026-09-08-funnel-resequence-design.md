# Design — funnel re-sequence: questions → product → billing → done

**Date:** 2026-09-08
**Branch:** `audit-fixes` (feature work continues here per repo convention)
**Status:** implemented on `audit-fixes` per docs/superpowers/plans/2026-09-08-funnel-resequence.md; working-tree only, not committed pending owner review
**Supersedes/extends:** `docs/BUSINESS-FLOW.md` (the brainstorm brief for this same stakeholder thread), `docs/superpowers/specs/2026-09-03-quick-green-ux-polish-design.md` (the prior, lighter pass)

---

## Background

A stakeholder (Mischa) ran a QA round on the live preview and delivered blunt feedback (WhatsApp, 2026‑09‑07/08). The core verdict: **the funnel does not convert and cannot be completed.**

His words, condensed:

> "step1: first round of questions — step2: choose not really a product/gram — step3: doctor's questionnaire — step4: sign‑up process — step5: overview page and status check. Ending here with no final result. I can't finish even an order. This flow will not work at all."
>
> "The only way it converts: **1. fastest way to pass the questions → 2. choose product and payment → 3. billing page → 4. thank‑you page.**"
>
> - all questions, **including doctor‑related, before the product** (as every competitor does)
> - billing page: deliver the account password by **SMS or WhatsApp** — doubles as identity/KYC verification and removes the "pick a password" step
> - the dashboard overview page **"is not needed in the order flow"**
> - cookie/consent needs a real "refuse tracking" control **— but that can wait until the end of the project**
> - "before you code, send a new flow to confirm — there are many changes"

### Why the flow dead‑ends today (verified in code)

`Age+DOB → Postcode → 6 questions → Result → Product page → [Continue to medical review] → 2 safety questions → Review‑status page → ⨯`

Two stacked gates make an order impossible:

1. `ProductPage` hides the gram selector and "Add to cart" until `getMedicalReview()?.status === "approved"`. The mock review is created at `"inReview"` and **never transitions**, so approval never arrives.
2. Even past that, `COMMERCE_ENABLED = false` (no real pharmacy prices) makes `CheckoutPage` render a "not available yet" panel.

So the journey terminates at `/assessment/review` with no possible order. Mischa's QA verdict is factually correct.

Additional current‑state facts relevant to his points:

- The doctor/safety questions (`MedicalReviewFormPage` → `ExclusionStep`) run **after** the product page — the reverse of what he (and competitors) want.
- Sign‑up appears late: the review‑status page sends signed‑out users to `/signup`, and checkout is auth‑gated by `DashboardLayout`.
- Cart / checkout / confirmation are `/dashboard/*` children and render inside `DashboardChrome` — the dashboard shell Mischa flagged as "not needed in the order flow."

### The tension this design must hold

This is the **same stakeholder thread** that produced `docs/BUSINESS-FLOW.md`. The Product Owner ratified the **opposite** of Mischa's asks on 2026‑09‑04:

- **D‑A** — payment stays *after* medical approval; commercial checkout **disabled entirely** (`COMMERCE_ENABLED`) until real prices exist. "Hard production blocker."
- **D7** — invoice / bank transfer only, no PSP.
- **B1/B2** — safety questions deliberately placed *after* the product page.
- **Sept‑2026** — "the signed‑in journey stays inside the dashboard shell."

Medical cannabis is prescription‑only in Austria; the doctor review cannot be removed and nothing ships before a prescription exists. quick‑green (the competitor Mischa benchmarks) keeps the identical doctor gate — they make it feel fast, pay upfront with a full refund if declined, and frame the doctor step as *fulfilment*, not a barrier.

**This design therefore has two layers**, per the agreed "Path A":

1. **Target flow** — the pay‑at‑checkout journey Mischa asked for, presented as the recommended end state, with an explicit list of the PO reversals, counsel questions, and procurement it depends on. Not built until those clear.
2. **Interim flow (this spec's build)** — re‑sequence the existing funnel now, within every current legal/PO guardrail, so the dead‑end is gone and the flow is completable this week. No payment, no shown total, no backend. "Approach 1 — re‑sequence now, add real commerce later."

---

## Part A — The target flow (for Mischa + PO confirmation; not built here)

```
Home / problem page
  │
  ├─ [one‑off, "before we start", not counted]  Age + DOB   →   Postcode / delivery area
  │
  ▼
QUESTIONS  — one continuous auto‑advancing pass
  ├─ Part 1: the assessment (concern · frequency · severity · tried · prior use · format)   → recommendation computed
  └─ Part 2: the doctor's questionnaire (medical history · current meds · contraindications ·
             pregnancy/breastfeeding · prior cannabis therapy · the safety yes/no + conditions)
  ▼
YOUR MATCH + CHOOSE AMOUNT   — recommended Solution, the "why", the alternative as one switch,
                               gram selector (5/10/15/30), price
  ▼
BILLING  — single screen
  ├─ order summary: line items · subtotal · delivery · review fee · total
  ├─ identity: first name · last name · DOB (reused from the age gate) · email
  ├─ delivery address (postcode prefilled)
  ├─ phone → "we'll send your access code by SMS or WhatsApp" → OTP input
  │        (verifies the number = light KYC, AND is the account credential — no password chosen)
  ├─ payment method (card / Klarna / SEPA / invoice — whatever PSP + PO allow)
  ├─ required: Terms + Privacy · the "not intended to diagnose…" disclaimer
  │            · "Full refund if a prescription is not issued" — stated above the pay button
  └─ [ Place order & pay ]
  ▼
THANK‑YOU  — "Order placed ✓  #…  paid €…"
             status list: Received → Doctor review → Prescription (if appropriate) → Dispatch & delivery
             "We'll message you at each step (SMS / WhatsApp / email)."
             "Full refund if a prescription is not issued."
             secondary: "Go to My area"  (optional — not required to finish)
  │
  ▼  [async, outside the funnel]
Doctor verifies  ─┬─ approved      → pharmacy dispatches → tracking
                  └─ not approved  → automatic full refund + support contact
```

### Returning‑customer fast path (target, Phase 2)

First question, before the assessment: **"Have you had a WeCare prescription before?"**

- **New** → the full flow above.
- **Returning + recognised (signed in, or phone recognised) + a prior approved review for the same problem** → skip the assessment; a short re‑confirm ("still {problem}? still {Solution}? anything changed since last time?") → choose amount → billing. Still creates a fresh lightweight review — **"repeat request, a doctor re‑confirms"** — never auto‑dispenses.
- Required wording (PO decision set 3): never "Choose your strain" → **"Select your preferred dispensing option"**, always paired with **"final dispensing remains subject to medical approval and pharmacy availability."**

### What the target flow depends on

| Owner | What's needed | Blocks |
|---|---|---|
| **PO** | Reverse **D‑A** (payment after approval → pay at checkout). Reverse **D7** (invoice/transfer only → card/Klarna). Flip `COMMERCE_ENABLED` — needs real prices (**D6**). Reverse **B1/B2** (safety questions after product → before). Reverse **Sept‑2026** "journey stays in the dashboard shell". Approve replacing `/signup` with phone‑OTP account creation. Set the review fee (**D5**) if it appears in the summary. | the whole target |
| **Austrian counsel** | Is taking **payment for a prescription‑medicine request + product reservation before the prescription exists** permissible, with a full‑refund‑if‑declined policy shown pre‑payment? Is **phone + OTP** sufficient identity/KYC for this category, or is more required? The advertising‑copy review already queued (`docs/CLAIM-LANGUAGE-REVIEW.md`). Age‑gate sufficiency (#13). | payment timing; account model; launch |
| **Medical partner** | The **content of the doctor's questionnaire** (Part 2 above — which fields, mandatory vs optional, compliance/liability review). The review **SLA**, and whether a near‑instant "verify, don't re‑assess" model is possible (**D4 / D‑B**). Controller/processor data structure. | Part 2; the review UX; SLA copy |
| **Procurement** | A **PSP** (Stripe or Klarna — Klarna is one integration covering card + invoice + instalments for DACH). An **SMS provider** + a **WhatsApp Business API** sender for the OTP. (Plus the standing PostHog EU / GlitchTip / Usercentrics items.) | payment; OTP |
| **Backend** | None exists. Real accounts (phone + OTP), the doctor‑review workflow with status transitions + notifications, orders, payments + refunds, pharmacy integration. `BUSINESS-FLOW.md` estimate: ~3–5 weeks MVP once partner API specs exist. | everything above becoming real |

---

## Part B — The interim flow (this spec's build)

Re‑sequence the existing funnel into one linear path, standalone (out of the dashboard), ending at a real thank‑you page. The endpoint is a submitted **request**, not a paid **order**: you choose grams, enter your details, submit — and land on "Your request is in; a doctor reviews it next; you'll confirm payment once a prescription is issued."

```
Home / problem page
  │
  ├─ [one‑off]  Age + DOB   →   Postcode          (unchanged; framed "before we start", not counted)
  │
  ▼
QUESTIONS  — one continuous pass:  the 6 assessment questions  +  the 2 safety yes/no  +  the conditions checklist
             (all in AssessmentEnginePage; recommendation still computed from q1/q3/q4/q5;
              the medical‑review record is created at the end of this pass)
  ▼
YOUR MATCH  (/assessment/result)  — recommended Solution, the "why", the alternative as a switch,
                                    "a doctor is now reviewing your request"
  ▼
CHOOSE YOUR AMOUNT  (/shop/:id, funnel chrome)  — gram selector always visible; price labelled "indicative,
                                                  confirmed after your medical review";  [ Continue ]
  ▼
REVIEW & CONFIRM YOUR REQUEST  (/checkout)  — summary with NO payable total; first/last name · DOB · email
                                              (+ email/password inline if signed out); delivery address;
                                              Terms + Privacy + disclaimer;  [ Submit my request ]
  ▼
YOUR REQUEST IS IN  (/order-confirmation)  — reference #; status list; "we'll email you at each step";
                                             primary: "Track my request" → /dashboard
  │
  ▼
DASHBOARD  — post‑request tracking only; never a step in the path
```

### Section 1 — Routes and funnel shell

| File | Change |
|---|---|
| `src/app/paths.ts` | `cart` → `/cart`, `checkout` → `/checkout`, `orderConfirmation` → `/order-confirmation` (top‑level). Add the old `/dashboard/{cart,checkout,order-confirmation}` → new paths in `LEGACY_REDIRECTS`. Add an `isFunnelRoute(pathname)` helper (`/assessment/start`, `/assessment/result`, `/shop/:id`, `/checkout`, `/order-confirmation`). Remove those from `isAppShellRoute`. |
| `src/app/router.tsx` | Move `CartPage` / `CheckoutPage` / `OrderConfirmationPage` out of the `DashboardLayout` children to top‑level routes under `RootLayout`. Add the three legacy redirects. |
| `src/components/layout/RootLayout.tsx` (`RoutedShell`) | For `isFunnelRoute(pathname)`, render a new `<FunnelChrome>` instead of `SiteHeader`/`SiteFooter` **or** `DashboardChrome` — for everyone, signed in or not. |
| `src/components/layout/FunnelChrome.tsx` | **new** — centered `max-w-3xl`; `<Logo>` linking home; a progress indicator (**Questions → Your match → Your details → Done**); nothing else. No marketing nav, no dashboard sidebar, no bottom tab bar. |

**Progress steps.** Four labelled steps: **Questions · Your match · Your details · Done**. The "Choose your amount" screen (Section 4) sits *within* the "Your match" step — it is the same beat (your matched Solution, at the amount you want), not a fifth step. If sub‑decision 1 merges "Your match" and "Choose your amount" into one screen, the mapping is unchanged; only the screen count drops.
| `src/pages/dashboard/DashboardLayout.tsx` | Drop the `commerceTitle` lookup + the `reason: "checkout"` forward for the removed children. |

- **The cart page stops being a mandatory stop.** `ProductPage`'s CTA goes straight to `/checkout` with the chosen grams (still calls `add()` so `/cart` works if visited via the header chip). The progress bar does not list "Cart".
- `CheckoutSteps` (`src/components/marketing/CheckoutSteps.tsx`) re‑labelled to the four funnel steps and reused as the `FunnelChrome` progress indicator (or `FunnelChrome` renders it directly).

### Section 2 — The question pass (merge the safety questions)

| File | Change |
|---|---|
| `src/features/assessment/questions.ts` | Keep `QUESTIONS` (the 6) untouched — they still feed `getRecommendation` and the personalisation notes. |
| `src/features/assessment/steps.ts` | `Phase = "postcode" \| "questions" \| "safety"`. Add the safety sub‑steps (pregnancy, recentSupply, conditions) to the derived step model + `deriveStartPhase` (resume into `"safety"` when the 6 are done but `exclusions` is unsaved). Update `TOTAL_STEPS` / helpers. |
| `src/pages/assessment/AssessmentEnginePage.tsx` | After q6, render the safety steps in the same engine: pregnancy + recentSupply as required Yes/No (auto‑advance, same 350 ms / 120 ms rule), then the conditions checklist as one screen with an explicit **"See my recommendation"** CTA. Progress ring + eyebrow count the full set ("Question N of 8"). On the final action: compute the recommendation **and** call `submitMedicalReview({ problem, answers, postcode, exclusions })` here, then `navigate(paths.assessment.result)`. |
| `src/pages/assessment/ExclusionStep.tsx` | Reused as the conditions‑checklist screen inside the engine (it already takes `hideHeading`). The pregnancy/recentSupply Yes/No may render via `QuestionStep` or a small inline variant — implementer's call. |
| `src/pages/assessment/MedicalReviewFormPage.tsx` | **Removed from the flow.** Route `/assessment/medical-review` redirects to `/assessment/review` if a review exists, else `/assessment/start`. (Keep the file or delete — implementer's call; the route entry stays as a redirect.) |
| `src/features/assessment/AssessmentContext.tsx` | `submit()` (or a new `completeAssessment()`) also triggers the review creation, or the page orchestrates both. Keep `getRecommendation` inputs unchanged. |

- Safety answers stay **informational only** — no "Yes = rejected" logic, exactly as today (B2).
- The interim merges only the **existing** safety questions. A fuller doctor's questionnaire (medications, history, mental health, allergies, prior cannabis therapy) is a **medical‑partner deliverable** — noted in Part A, not invented here.
- Copy: "six short questions" / "Question N of 6" → "a few short questions" / "Question N of 8" (DE + EN).

### Section 3 — "Your match" (`/assessment/result`)

| File | Change |
|---|---|
| `src/pages/assessment/ResultPage.tsx` | Content mostly unchanged (answer summary, `PrimaryRecommendationCard`, `AlternativeSolutionLink`, gentle nudge, disclaimer). **Primary CTA → "Choose your amount"** → `paths.shopProduct(primary.id)` (drop the "submit for medical review" lead — it happened upstream now). Add a muted "A doctor is now reviewing your request" line + a link to `/assessment/review`. Keep "Change my answers". Reword `result.next.*` to: your match → your details → doctor review → prescription if appropriate → delivery. |

Open sub‑decision (flagged, my lean noted): keep "Your match" and "Choose your amount" as **two screens** for the interim (less change), or **merge** into one screen (closer to Mischa's 4‑step list). **Lean: two screens now, merge as a target refinement.**

### Section 4 — "Choose your amount" (`/shop/:id`, funnel chrome)

| File | Change |
|---|---|
| `src/pages/shop/ProductPage.tsx` | **Remove the `reviewApproved` gate** on the gram selector + CTA — they are always shown post‑questions. Remove the "Continue to medical review" / "orderable once approved" / `!COMMERCE_ENABLED` branches (review already happened; no payable total shown anyway). Price keeps its existing `!PRICES_CONFIRMED` "indicative, confirmed after your medical review" label. **CTA → "Continue"** → `paths.checkout` with `{ solutionId, grams }` (still `add()` to cart context). Strains / COA accordion unchanged. |

### Section 5 — "Review & confirm your request" (`/checkout`)

| File | Change |
|---|---|
| `src/pages/shop/CheckoutPage.tsx` | Remove the `!COMMERCE_ENABLED` "unavailable" panel and the `review approved` redirect — always reachable post‑product. **Summary: no payable total** — line item(s) (Solution + grams) and one line: "Price and any review fee are confirmed after your medical review." No subtotal/delivery/total math. **Your details:** first name, last name, DOB (prefilled from the age gate, editable), email. If signed out → email + password inline here creates the account (no `/signup` bounce — `BUSINESS-FLOW.md` D‑D option 1). **Delivery address** unchanged (postcode prefilled, country locked AT); optional phone, hint "for delivery updates, and to send your access code later." **Confirmations:** Terms + Privacy, the "not intended to diagnose…" disclaimer — both still required. **CTA → "Submit my request"** → `addOrder({ …, status: "inReview", paymentMethod: "pending", total: null })`, `clear()`, → `/order-confirmation`. |
| `src/features/auth/AuthContext.tsx` | If the interim account is created here for signed‑out users: a `signUp(email, password, name)` path (still MOCK — value ignored), or reuse `signIn(email, name)`. WC‑13 first‑login "don't clear" behaviour preserved. |

### Section 6 — "Your request is in" (`/order-confirmation`)

| File | Change |
|---|---|
| `src/pages/shop/OrderConfirmationPage.tsx` | Positive, real endpoint. "Your request is in ✓ — reference #{id}". Status list: **Received → Doctor review → Prescription if appropriate → Payment & delivery** (reuse `NextSteps`). "We'll email you at each step." + "You'll confirm payment once a prescription is issued." + "A prescription isn't guaranteed." Primary CTA **"Track my request"** → `/dashboard`. Secondary: "Back to home". |

### Section 7 — Dashboard's role

| File | Change |
|---|---|
| `src/app/router.tsx` | `cart` / `checkout` / `order-confirmation` no longer `/dashboard` children (Section 1). |
| `src/pages/dashboard/*` | Content unchanged — request/order status + tracking, my assessment, my recommendation, follow‑up, support, profile. It is reached from the thank‑you page and the "My area" header link. **Never a step in the funnel.** |
| `src/app/paths.ts` `isAppShellRoute` | The funnel routes are removed from it (Section 1) — a signed‑in user in the funnel gets `FunnelChrome`, not the embedded dashboard shell. `/dashboard/*` is unaffected. |

### Section 8 — Data model & persistence (all local, no backend)

- **Medical review** created at the end of the question pass (Section 2), not from `MedicalReviewFormPage`. `submitMedicalReview` payload unchanged (`problem`, `answers`, `postcode`, `exclusions`). Mock still starts at `"inReview"`.
- **`Order`** (`src/features/orders/orders.ts`):
  - `paymentMethod` gains `"pending"` (extend `PaymentMethodId` or accept a nullable on `Order`).
  - Tolerate **no total** — `totalEur?: number | null`. The dashboard Orders table + `OrderConfirmationPage` show "Confirmed after review" instead of `€0.00` when it's null.
  - `status: "inReview"` unchanged for prescription items.
- **No change** to `COMMERCE_ENABLED` or `PRICES_CONFIRMED`. Prices stay labelled indicative and are **never summed into a displayed total** in the interim.
- `AssessmentContext.reset()` / WC‑13 per‑session wipe already cover `postcode` + `exclusions`.

### Section 9 — i18n (DE + EN, key parity across all 9 namespaces)

- `assessment` — the merged safety questions inside the engine (`phase.safety` label, pregnancy/recentSupply Q + Yes/No, reuse `exclusion.*`); `start.progress` total 6 → 8; "a few short questions" wording; `result` primary CTA + "a doctor is now reviewing your request" + reordered `result.next.*`.
- `shop` — `ProductPage` CTA "Continue"; `checkout` → "Review & confirm your request", total‑less summary line, "Submit my request", inline sign‑up labels; `confirmation` → "Your request is in" + the new status list.
- `common` — `journey.*` / funnel step labels (Questions · Your match · Your details · Done).
- DE rules: **"Fragebogen"**, slash‑form gendering (`Nutzer/innen`, `Kund/innen`), "ärztliche Prüfung", no treatment/cure promise, German en‑dash `–` for parentheticals. EN keeps "assessment".

### Section 10 — Analytics (`src/lib/analytics.ts`; consent‑gated; D16 minimisation)

- `medical_review_submitted` now fires at the end of the question pass.
- `assessment_exclusion_completed` fires inline in the pass (`{ flagged, flag_count }` — not which flags).
- `assessment_question_answered` keeps `{ auto_advanced }`; extend the index range to the merged set.
- Add `request_submitted { reference }` for the new endpoint (no PII).
- `checkout_started` fires when the "Review & confirm" screen renders (drop the `COMMERCE_ENABLED` / approved gate — that screen is now the real endpoint).
- No raw answer values, no raw postcode — unchanged rules.

### Section 11 — Testing

Repo TDD workflow; `pnpm typecheck` + `pnpm build` + `pnpm test` (vitest) green; DE/EN parity re‑verified.

- **`steps.ts`** (pure) — the `"safety"` phase in `deriveStartPhase` for each partial‑state shape; merged step count; `assessmentComplete` now also needs `exclusions`.
- **Engine phase flow** (component / manual) — postcode → q1…q6 → pregnancy → recentSupply → conditions → (recommendation + review created) → `/assessment/result`; resume derivation picks the right phase from each partial state; `?problem=` still pre‑selects q1 without auto‑skipping.
- **`orders.ts`** — an order with `totalEur: null` / `paymentMethod: "pending"` round‑trips; the Orders table renders "Confirmed after review".
- **`recommendation.ts`** — existing tests pass unchanged (contract intact — still q1/q3/q4/q5).
- **Routing** — `/dashboard/{cart,checkout,order-confirmation}` redirect to the new top‑level paths; funnel routes render `FunnelChrome` for both anonymous and signed‑in users.
- Manual browser walk of the whole re‑sequenced funnel (the thing Mischa re‑tests), DE and EN — repo has no jsdom/RTL by convention.

---

## Guardrails respected (`BUSINESS-FLOW.md` §9)

- **Doctor review still mandatory, still before any dispatch** — it is submitted earlier (end of the question pass) and shown as the pending next step on the thank‑you page. Not removed, not bypassed.
- **No dispatch before a prescription exists.**
- **No fake payment UI, no fabricated total, no fake COA** — the interim has *no* payment surface and shows *no* summed total; prices keep their "indicative" label.
- **No pre‑assessment product / strain catalogue** — the product screen appears only after the full question pass; strain photos stay in the post‑questions accordion; the Solution is shown as its medallion, not a bud photo.
- **No 6th Solution.**

## PO sign‑offs required for the interim

Smaller than the target's, but real — the interim still moves things the PO fixed:

1. **B1/B2** — safety questions move from *after the product* into the *pre‑product* question pass. Still required, still informational‑only.
2. **Sept‑2026 "signed‑in journey stays in the dashboard shell"** — reversed: the funnel is standalone `FunnelChrome` for everyone; cart / checkout / confirmation leave `/dashboard`.
3. **D3 result‑page framing** — the result screen's primary CTA leads to the product ("Choose your amount"), not to "submit for medical review" (already submitted upstream). Continues the B1 direction; name it explicitly.
4. **Copy** — "request" not "order" as the interim endpoint; "a few short questions" replaces "six".

Deferred to the target (documented in Part A, **not** touched by the interim): D‑A, D7, D6 / `COMMERCE_ENABLED`, replacing `/signup` with phone‑OTP, plus the counsel / medical‑partner / procurement items.

---

## Risks / tradeoffs

- **"Request" vs "order".** The interim endpoint is honest but not the paid order Mischa ultimately wants. Mitigation: the thank‑you page is a genuine, positive terminal state ("your request is in", stepwise), and Part A shows the paid version is one PSP + one PO decision away. Confirm the wording is acceptable with Mischa.
- **Two setup screens still precede q1** (age+DOB, then postcode). Unchanged from today; auto‑advance keeps the merged question pass feeling short. Framed as "before we start", not counted.
- **The merged pass is ~8–9 screens** vs today's 6 + a separate page. Net taps are similar (the safety page's questions just move inline); the single uninterrupted flow is the point.
- **Standalone `FunnelChrome` is new routing surface.** Blast radius: `RootLayout`/`RoutedShell` shell selection, `router.tsx` route nesting, `paths.ts`. Contained; no component internals change beyond CTAs + copy.
- **`Order.totalEur` becoming nullable** touches the Orders table + confirmation rendering. Small, typed.
- **Reversing four PO decisions on stakeholder QA feedback** — this spec is the artifact for that conversation. Nothing ships until the PO signs the four interim items and Mischa confirms the flow.

## Open sub‑decisions for the reviewer

1. **Two screens or one** for "Your match" + "Choose your amount" (Section 3). Lean: two for the interim.
2. **Funnel path naming** — `/checkout` + `/order-confirmation` top‑level (proposed), or `/assessment/checkout` etc. to keep one namespace.
3. **Interim signed‑out account creation** — email + password inline at the confirm screen (proposed), or keep the `/login` bounce, or prototype the SMS/WA OTP screen now as a clearly‑labelled preview.
