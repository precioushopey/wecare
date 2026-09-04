# WeCare — Business Flow (brainstorm brief)

**For:** the flow/conversion brainstorm (Sept 2026), prompted by the stakeholder walkthrough of the live preview.
**Prepared by:** dev, 2026-09-02.
**Status of the product:** front-end prototype. **No backend.** Auth, the medical review, payment, order fulfilment, prices and lab data are all mock or placeholder — state lives in the browser only. Nothing here is a live commercial system yet.
**Companion docs:** `docs/DESIGN-SPECIFICATION.md` (full requirements), `docs/BACKEND-ARCHITECTURE.md` (what a real backend needs), `docs/STRAIN-SOLUTION-MAPPING.md` (products), `CLAUDE.md` (running decision log).

---

## 1. Read this first: the medical-review step is not a design choice

Medical cannabis is **prescription-only** in Austria (and Germany). It cannot be sold or dispatched to a person without a prescription that a licensed doctor has issued **for that person**. That is a legal constraint, not a UX preference.

- **quick-green.com — the competitor the stakeholder named — has the identical gate.** Their flow is: fill a medical questionnaire → *"Ein Arzt prüft deine Anfrage"* (a doctor reviews your request) → pharmacy delivers *if a prescription is issued*. They do **not** skip the doctor. What they do is make that step **fast, upfront-priced, and positively framed**, so it reads as a service, not a barrier.
- So the brainstorm question is **not** "keep or drop the doctor step". It is: **"how do we make the gated flow feel like quick-green's?"**

**What can change** (this is the agenda): the framing and wording, the number of steps, how the wait is communicated and how long it actually is, whether the customer *completes and pays for* the order at checkout or only *requests* it, and which payment methods are offered.

**What cannot change** (guardrails — §8): removing the doctor review, dispatching before a prescription exists, fake payment/price/lab UI, or a pre-assessment strain catalogue.

---

## 2. The current end-to-end flow, step by step

> Each step: **what the customer sees** · **what happens behind it** · **real or mock** · **friction**.

### Step 0 — Entry
- **Sees:** homepage or a problem page (Sleep / Pain & Body Comfort / Stress & Anxiety / Migraine). Primary action everywhere: **"Start assessment"**. No shop, no products, no prices — problem-first by design.
- **Behind:** clicking a problem CTA deep-links the assessment to that problem.
- **Real.**
- **Friction:** none flagged.

### Step 1 — Age gate (once per device)
- **Sees:** "First, a quick confirmation" — an *"I am 18 or older"* checkbox **and** a date-of-birth field. Blocks if the DOB is under 18.
- **Behind:** stored in the browser (`wecare.ageConfirmed`), not tied to an account. Self-reported — **not** identity verification.
- **Mock-ish:** the check is real but client-side only; a real registration backend must re-capture and validate DOB.
- **Friction:** none flagged. (Legal sufficiency of a self-reported gate is an open counsel question — §8.)

### Step 2 — Assessment (6 questions, ~60–90 s)
- **Sees:** one question at a time, a progress ring + bar, "~60–90 s · not a medical form". Resumable if you leave. Questions: problem · frequency · severity · what you've tried · prior cannabis/CBD use · preferred format.
- **Behind:** answers saved in the browser (`wecare.assessment`). A pure function maps them to a recommendation — **deterministic**, same answers always give the same result.
- **Real** (the logic; there's no doctor behind it).
- **Friction:** none flagged.

### Step 3 — Result page
- **Sees:** "Your recommended solution is ready." → a summary of the answers, then **one recommended Solution** (name, category, a plain-language "why", with THC range / indicative price / oil profile tucked behind a "details" toggle) and **one alternative Solution** as a quieter link. A conditional "start gentle" nudge for new users. The exact non-guarantee disclaimer. A "what happens next" 3-step block.
- **Two buttons on the recommended card** (as of 2026-09-02, after the stakeholder feedback):
  1. **"Submit my assessment for medical review"** (lead button) → Step 4.
  2. **"View recommended solution"** → the product page (Step 5).
  *(Before the fix, #2 was a small text link, which is why the recommended product looked un-buyable while the alternative looked shoppable.)*
- **Behind:** the recommendation is computed live from the stored answers.
- **Real** (the recommendation), **mock** (there is no doctor on the other end of "submit for review").
- **Friction the stakeholder flagged:** "is this on purpose that I can't put product to cart here?" — partly fixed (the button is now prominent); the deeper question of whether the review step should lead at all is **decision D-F** (§6).

### Step 4 — Submit for medical review → Review status page
- **Sees:** after submitting, a status page: a status label (one of *submitted / in review / info needed / approved / not approved / consultation needed*), a short body, "we'll email you when it changes", "a prescription is not guaranteed", a 4-step explainer, and links to the dashboard / (if approved) the solution / (if a problem) support.
- **Behind:** a mock record in the browser (`wecare.review`), created at status **"in review"**. **No doctor, no queue, no email, no timer.** It never actually changes status.
- **Mock — entirely.**
- **Friction the stakeholder flagged:**
  - *"why appears here Status check"* — because the intended model (owner decision **D3**) is **review before purchase**. But see the note below.
  - *"when will the doctor approve it? less than 1 min or 24 h?"* — the page commits to no timeframe because there is no real SLA yet (**decision D-B**, blocked on the medical partner).
  - *"this is kind of order conversion killer … I want the deal done after I added all my details"* — this is the core of **decisions D-A / D-B / D-D**.

> **Important current-state fact:** in the code today, the review and the order are **two parallel mock tracks that do not gate each other**. You can add to cart and complete checkout **without** having submitted or been approved for a review — the order is just stamped "in review". The "review before purchase" model (D3) is currently **framing and copy, not enforced logic**. A real backend would enforce whatever the brainstorm decides.

### Step 5 — Product page → cart
- **Sees:** the Solution (icon medallion, not a strain photo), why / who it suits / how it's used / ingredients, the oil "starting format" profile (marked provisional), an **"Available dispensing options"** accordion (the real strains it can be dispensed as, with THC %), a "you'll get a real batch certificate" note (no fake lab grid), a gram selector (5/10/15/30), and **one button: "Add to cart"** — which adds and jumps straight to the cart.
- **Behind:** cart stored in the browser (`wecare.cart`), keyed by Solution, quantity in grams.
- **Real** (the UI), **placeholder** (prices, genetics, COA — all labelled as such).
- **Friction:** the stakeholder's *"you can choose a different product and it offers grams to cart"* — that was the *alternative* Solution's product page. Now both the recommended and the alternative reach the same buyable product page.

### Step 6 — Cart → Checkout
- **Sees (cart):** line items, ±5 g steppers, subtotal, **"Shipping: Free"**, total, an "indicative prices" note, a "prescription-only" notice, "Checkout".
- **Sees (checkout — must be signed in):**
  - If not signed in → bounced to **`/login`** (email + password + **confirm password**), then back to checkout.
  - Customer section: **"Signed in as {email}"** (read-only — no longer re-asks for the email, fixed 2026-09-02).
  - Shipping address (country locked to Austria).
  - **Payment method: "Pay by invoice" or "Bank transfer"** only. Copy: *"no card details are collected here — you pay by invoice or bank transfer once a doctor has approved your prescription."*
  - Two required checkboxes: accept Terms + Privacy; "not intended to diagnose, treat, cure or prevent disease".
  - "Place order" is disabled until both are ticked. **Delivery fee €0.**
- **Behind:** "Place order" writes a mock order (`wecare.orders`, status "in review") and clears the cart. **No payment is taken. No address validation. Nothing is sent anywhere.**
- **Mock** (payment, order), **real** (the form + gating).
- **Friction the stakeholder flagged:**
  - *"on billing page it asks again to put my email"* — **fixed.**
  - *"new customer has to give email and pw, you need to confirm PW field"* — **fixed** (confirm-password added).
  - *"remove the add email/pw page and redirect directly to billing … one less step"* — **decision D-D**.
  - *"once you have creditcard option, then conversion will be also better"* — **decision D-C** (conflicts with owner decision D7; needs a payment provider).

### Step 7 — Order confirmation
- **Sees (as of 2026-09-02):** "Thank you for your order." + *"Your order is in. Here's what happens next — you'll get an email at each step."* + a **3-step status list**: *1. Order received · 2. Medical review · 3. Pharmacy dispatch*. Order number. Links to "My orders" / home.
- **Before the fix:** *"It ships from the pharmacy once medical approval is in place."* — the stakeholder read this as *"a negative sentence — it's an IF order."* Now it's forward-looking and stepwise, with no fabricated time promise.
- **Mock.**

### Step 8 — Dashboard ("My area", signed-in)
- **Sees:** a 4-stage journey stepper (Assessment → Medical review → Prescription → Order & delivery), the recommendation, the six answers, a delivery card (coverage map + policy copy + an order tracker), orders, follow-up, support, an editable profile. Desktop = a real sidebar app; mobile = app-bar + bottom tabs.
- **Behind:** all read from the browser mocks. The delivery tracker states outright that real courier tracking isn't connected. **No fabricated van position / GPS / ETA.**
- **Mock** (the data), **real** (the UI).

### Step 9 — Follow-up check-in (14–21 days later)
- **Sees:** "How was your experience?" → Good / stronger / lighter / another format / need support → a tailored response + actions ("update my recommendation" routes to the stronger/lighter Solution, or support).
- **Mock** (stored locally, no reminder email).

---

## 3. Real vs. mock — the whole picture

| Area | Today | For a real launch |
|---|---|---|
| **Assessment + recommendation** | Real, deterministic logic in the browser | Keep; move answers server-side (health data, GDPR) |
| **Medical review** | Mock record, no doctor, no email, status never changes | Real doctor queue, status transitions, an email on every change, a committed turnaround time |
| **Auth** | Any email signs in; password ignored | Real accounts, verified email, DOB captured & validated at registration |
| **Payment** | None — "Place order" just records a mock order | A payment provider; decide *when* payment happens (§6, D-A) and *which* methods (D-C) |
| **Prices** | Placeholder €/g, labelled "indicative" everywhere | Real prices from the pharmacy, per dispensing option; the review fee decided and placed (D-E) |
| **Shipping** | Free (€0), no carrier, no tracking | Real carrier terms, a real fee decision, live tracking |
| **Orders** | Browser record; "shipped"/"delivered" never happen | Real order + fulfilment + shipment states |
| **Lab certificates (COA)** | Synthesised numbers, hidden behind a flag → shows a plain "you'll get a real certificate" line | Real batch certificates from the pharmacy/lab |
| **Consent / analytics / error tracking** | A consent banner + an analytics *seam* (nothing sent) | A real consent platform (Usercentrics), PostHog EU, GlitchTip — all EU-region, company-owned |

---

## 4. What the stakeholder flagged → status

| # | Feedback | Status |
|---|---|---|
| 1 | Recommended Solution had no "add to cart" — only the alternative did | **Fixed** — the recommended card now has a prominent "View recommended solution" button |
| 2 | Billing page re-asks for the email | **Fixed** — shows "Signed in as {email}" |
| 3 | Thank-you page is a negative "IF order" sentence | **Fixed** — positive copy + a 3-step "where your order is" status |
| 4 | New-customer signup needs a confirm-password field | **Fixed** — added, with a match check |
| 5 | "I want the deal done after I add my details" / review before purchase feels wrong | **Decision D-A / D-D** (§6) |
| 6 | Unclear/absent approval wait time | **Decision D-B** — blocked on the medical partner (§8) |
| 7 | Add a credit-card option | **Decision D-C** — reverses owner decision D7; needs a payment provider (§8) |
| 8 | Competitors deliver same-day / in hours | Context for D-A/D-B; WeCare already has an Austria delivery-coverage section |
| 9 | Show the treatment/review fee upfront (quick-green shows "ab 14,99 €") | **Decision D-E** — blocked on the PO setting a real fee (§8) |
| 10 | "Is the website WordPress?" | No — React 18 + Vite + TypeScript + Tailwind. The `*.figma.site` URL is a static preview deploy. |

---

## 5. Benchmark: quick-green.com (Germany)

| Axis | quick-green | WeCare today |
|---|---|---|
| **Headline framing** | "Medizinal Cannabis in Minuten geliefert" — speed is the promise | "Find the right support for [Sleep/Pain/…]" — problem-first, no speed claim |
| **Doctor step** | Yes — "Ein Arzt prüft deine Anfrage" | Yes — "Submit for medical review" (mock) |
| **Steps to order** | Questionnaire → choose product → checkout (pay) → doctor reviews → pharmacy ships | Assessment → result → (submit review) → product → cart → checkout (no pay) → mock order |
| **Payment** | Klarna (invoice / instalments / card), Sofortüberweisung, Visa / Mastercard / Amex — shown on the homepage | "Invoice" or "Bank transfer" only, **after** approval; no card |
| **When you pay** | At checkout, upfront | Never (mock); intended model is "after approval" |
| **Fee visibility** | "Behandlung: ab 14,99 €, Medikamente ab 4,99 € zzgl. Versand" on the homepage | Review fee hidden; `/costs` has no numbers; product prices labelled "indicative" |
| **Shipping** | €6.99; 60–90 min in 8 cities, 1–3 days elsewhere, weekday cutoffs stated | Free (€0); an Austria coverage section exists; no times committed |
| **Delivery tracking** | Live tracking link by SMS + email | A dashboard tracker that says "not connected yet" |
| **Consent** | Cookiebot by Usercentrics, with a cannabis-specific Art. 9(2)(a) GDPR notice | Custom per-category banner (Essential / Analytics); **not** a real platform |
| **Packaging** | "Neutrale Verpackung" promise | Mentioned in the Shipping legal draft |
| **Returning customer** | First question: "Have you had a prescription before?" — fast path | Not built (flagged as a Phase-2 "preferred dispensing option" step) |
| **Nav** | "So funktioniert's" + "FAQ" in the primary nav | Deliberately removed from primary nav (owner decision) |

**Takeaway:** quick-green keeps every legal step WeCare has. The difference is entirely **presentation + payment timing + method + fee transparency + delivery-speed promise**. All of that is in scope for the brainstorm.

---

## 6. Decisions for the brainstorm

> **Resolution status — PO ratification, 2026-09-04** (`CLAUDE.md` §"UX polish + PO commerce/legal ratification"). The brainstorm questions below are kept for context; the PO's answers:
>
> - **D-A** — Payment stays **after** medical approval (invoice / bank transfer, D7 unchanged). Going further: **commercial checkout is disabled entirely** (`COMMERCE_ENABLED` in `src/config.ts`) until real pharmacy prices exist — no "Place order" on placeholder totals. HARD PRODUCTION BLOCKER.
> - **D-B** — Still blocked on the medical partner. No timeframe is shown; stage-based language only (`shop:confirmation.timingNote`).
> - **D-C** — **HOLD.** No PSP integration yet. A payment abstraction seam exists (`src/features/payments/payments.ts`) so card / SEPA / Klarna can be added later without rewriting checkout.
> - **D-D** — **No guest checkout.** The regulated journey needs a persistent authenticated identity. Future friction reduction = passwordless magic link / OTP, not a guest path.
> - **D-E** — Still blocked on the PO setting a real review fee (D5). `/kosten` carries no euro figure.
> - **D-F** — Resolved earlier by PO decision set 5 / B1: Result → Solution → Medical Review.
>
> Also ratified: separate First/Last name at checkout (not "Full name"); optional delivery phone; shipping address stored in `sessionStorage` only (never `localStorage`), pending a server-side record; "View order status" not "Track your order"; no invented delivery date.

> Each: the question, the options, the trade-off, and who has to sign off.

### D-A — Does the customer *complete and pay for* the order at checkout, or only *request* it?
- **Option 1 (current intent):** the transaction completes only after the doctor approves. Checkout collects details; payment happens later (invoice/transfer). Conservative; matches a strict "payment for a prescription medicine only after the Rx exists" reading.
- **Option 2 (quick-green model):** the customer pays at checkout. The order is "done" from their side; **fulfilment** is what waits on approval. If not approved → automatic refund. This is what removes the "IF order" feeling the stakeholder described.
- **Trade-off:** Option 2 needs (a) a payment provider, (b) a clear "we refund in full if a prescription isn't issued" policy, shown before payment, (c) counsel confirmation that taking payment for a *treatment request + product reservation* pre-Rx is fine in Austria.
- **Sign-off:** PO (reverses part of the "payment after approval" decision) + counsel + a payment provider.
- **Dev view:** Option 2's *framing* ("your order is placed; the doctor's review is the next step, not a gate you're stuck behind") is the single biggest conversion lever and is mostly copy + payment timing. Recommend pursuing it.

### D-B — How fast is the review, and how do we say so?
- The page currently commits to **no** timeframe ("we'll email you"). quick-green implies same-day; delivery in cities is 60–90 min.
- **Options:** (a) name a concrete window ("usually within X hours / by the next working day") once the medical partner commits to an SLA; (b) push for **near-instant**: the questionnaire result pre-fills the doctor's decision and they counter-sign in minutes, not hours — a "verify, don't re-assess" model.
- **Sign-off:** the medical partner (this is a capability + liability question for them, not an engineering one). Owner decision D4 already parks the SLA as partner-blocked.
- **Dev view:** the UI can display any SLA the partner gives us, and can show a live "typical time right now" if they expose it. We can't invent the number.

### D-C — Add card / Klarna payment?
- Current: invoice + bank transfer only (owner decision D7). quick-green uses **Klarna** (which itself bundles invoice, instalments and card), Sofortüberweisung, and direct card.
- **Option:** integrate **one** provider — Klarna or Stripe — that covers card + the existing methods.
- **Trade-off:** reverses D7; requires procurement + integration (not a mock — a fake card form is off the table). Klarna is a common single integration for the DACH market.
- **Sign-off:** PO (reverse D7) + procurement.

### D-D — Reduce steps: guest checkout, or a lighter sign-in?
- Current: you must sign in (separate `/login` page) before checkout. That underpins the "My area" dashboard (order history, review status, follow-up).
- **Options:** (1) keep it, but make it **inline at checkout** (email + set password in the checkout form, no page bounce) — one less navigation; (2) full **guest checkout** (email only; offer an account after the order).
- **Trade-off:** guest checkout is fewer fields but a real medical/pharmacy flow almost certainly needs a real account anyway (identity, prescription delivery, repeat orders, the follow-up). Option 1 keeps the account model while cutting the friction the stakeholder felt.
- **Sign-off:** PO / product.
- **Dev view:** Option 1 (inline) is low-risk and addresses "one less step" without losing the dashboard. Recommend.

### D-E — Show the review fee upfront?
- quick-green: "Behandlung: ab 14,99 €" on the homepage. WeCare: hidden; `/costs` deliberately carries no euro figures (owner decision).
- **Blocked:** the PO has to set the real fee first (owner decision D5). Then decide where it appears — homepage, result page, checkout summary.
- **Sign-off:** PO.

### D-F — Result page: which CTA leads — "submit for review" or "view solution"?
- Both are buttons now (fixed 2026-09-02). Owner decision D3 had "submit for review" as the sole lead and the solution link demoted.
- **Decision:** confirm the current two-button layout, or re-order (e.g. "view solution" leads, review is a step from the product/checkout flow — which pairs naturally with D-A Option 2).
- **Sign-off:** PO.

---

## 7. A possible target flow (for discussion, not a decision)

If D-A Option 2 + D-C + D-D Option 1 are chosen, the flow becomes:

```
Problem → Assessment (6 Q) → Result: "Here's your match"
   → Add to cart → Checkout (email + password inline, address, pay by card/Klarna/invoice)
   → "Order placed ✓ — a doctor reviews it next, usually within [SLA]. Full refund if not approved."
   → [async] doctor verifies → approved → pharmacy dispatches → live tracking
                              → not approved → automatic refund + support contact
```

The doctor step is still there and still mandatory — but it sits **after** a completed, paid order, framed as fulfilment, exactly like quick-green. The "submit for medical review" screen stops being a dead-end the customer lands on *instead of* buying.

---

## 8. Blockers — what the brainstorm can decide vs. what's waiting on someone

| Who | What's needed | Gates which decision |
|---|---|---|
| **Medical partner** | A committed review-turnaround SLA; whether a "verify, don't re-assess" near-instant model is possible; the controller/processor data structure | D-B; the whole review UX |
| **Legal counsel** | Austrian medicine/cannabis **advertising review** of all customer-facing copy (hard launch blocker); the **medicines-law vs. tobacco-monopoly** basis for selling the flower products (hard launch blocker); whether taking **payment before the prescription** is permissible; age-gate sufficiency | D-A; D-E; launch |
| **Procurement** | A payment provider (Stripe / Klarna); PostHog EU; GlitchTip; Usercentrics — EU-region, company-owned, contracts signed by the founder/MD | D-C; D-A Option 2; analytics; consent platform |
| **PO** | The real review fee (D5); real per-product prices (D6); reverse/confirm D3 and D7 | D-E; D-F; D-A; D-C |
| **Backend build** | None exists. Estimate: ~3–5 weeks for an MVP (auth, review workflow, orders, payments, pharmacy integration, QA) **once the partner API specs exist** | everything above becoming real |

---

## 9. Off the table (guardrails)

These are not up for the brainstorm — they're legal / compliance / prior owner decisions:

- **Removing the doctor review**, or **dispatching before a prescription exists** — illegal for prescription medicine.
- **A fake payment form, fake prices presented as final, or a fabricated lab certificate** — compliance, and the September audit already ruled these out. Real integrations only.
- **A pre-assessment product / strain catalogue** or "browse strains" navigation — owner decision + compliance (problem-first, no strain imagery before the assessment).
- **A 6th Solution to house inventory** — owner decision.

---

## 10. Appendix — screen map (current)

| Screen | Route | Real / mock |
|---|---|---|
| Homepage, problem pages | `/`, `/sleep-problems`, `/pain-body-discomfort`, `/stress-anxiety`, `/migraine-head-tension` | Real |
| Age gate | (shown before `/assessment/start`) | Real check, client-side only |
| Assessment | `/assessment/start` | Real |
| Result / recommendation | `/assessment/result` | Real logic; the "submit" button target is mock |
| Medical-review status | `/assessment/review` | **Fully mock** — no doctor, no email, status never changes |
| Product page | `/shop/:solution` | Real UI; placeholder prices/COA |
| Cart | `/shop/cart` | Real |
| Checkout | `/shop/checkout` | Real form + gating; **no payment**, no validation |
| Order confirmation | `/shop/confirmation` | Mock order; new 3-step status copy |
| Dashboard "My area" | `/dashboard/*` | Real UI; all data from browser mocks |
| Follow-up | `/dashboard/follow-up` | Mock (local, no reminder) |
| Login | `/login` | Mock — any email; password + confirm ignored |
