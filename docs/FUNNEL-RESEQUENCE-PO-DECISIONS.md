# Funnel re-sequence — decisions needed (Sept 2026)

**For:** Mischa / Product Owner sign-off, following the 2026-09-08 QA feedback and the funnel re-sequence built in response.
**Status of the build:** the interim (Part B) is done, reviewed, and green on `audit-fixes` — not yet committed or merged. Full detail: `docs/superpowers/specs/2026-09-08-funnel-resequence-design.md` (Part A = the target flow this brief is mostly about; Part B = what's already built) and `docs/superpowers/plans/2026-09-08-funnel-resequence.md`.

---

## 1. What already shipped, no decision needed

The dead-end is gone. The flow is now one continuous pass: age/DOB → postcode → 6 questions + "Final checks" safety questions (merged into one sitting, doctor questions before the product) → your match → choose your amount → "Review & confirm your request" → **"Your request is in."** No marketing header/footer or dashboard shell appears anywhere in it. This directly answers Mischa's core complaints: all questions before the product, dashboard out of the order flow, and a real endpoint you can reach.

What it does **not** do yet: take payment. There's no total shown, no card field, no "billing" in the money sense — the request is submitted, and the customer is told they'll confirm payment once a doctor issues a prescription. That's the one item below that isn't a small ratification — it's the real decision.

---

## D-1 — Pay at checkout now, or keep "request → pay after approval"?

> **RESOLVED 2026-09-08 — Option B (pay at checkout) is the ratified target.**
> A written "PO decision" (drafted via an AI agent Mischa consulted) recommended Option A — no payment until after doctor approval. That directly contradicts what Mischa said himself, twice, in the original WhatsApp thread: *"the current flow will not convert. goal must be: 1. fastest way to pass the questions 2. **choose product and payment** 3. billing page 4. Thank you page."* — said in direct answer to "do you want it immediately available for purchasing after the quiz, just like quick-green?" When the two conflicted, the user (Precious) ruled Mischa's own direct statement stands. **Option B is the goal; the live build stays the Option A interim until its blockers clear** (see the tracked checklist below) — this is not yet buildable as real payment, only ratified as the direction to build toward.
>
> **Blocker status, as confirmed 2026-09-08 (nothing below is resolved — every row is "not confirmed / not available"):**
>
> | Blocker | Status |
> |---|---|
> | PSP that explicitly accepts Austrian prescription medical-cannabis transactions | NOT CONFIRMED — a candidate contact ("Eli," via the 2026-09-14 WhatsApp thread) has offered API + webhooks access, but none of the acceptance questions below have written answers yet |
> | Company-owned PSP account (credentials, contract, pricing, authorized signatory) | NOT SET UP |
> | Card / SEPA / Klarna support | NOT CONFIRMED — Klarna is a candidate only, no written yes |
> | Authorize-now → capture-after-approval support, and max hold duration | NOT CONFIRMED |
> | Charge-now → auto-refund-if-declined | NOT legally or commercially cleared — fallback concept only |
> | **Merchant of record** (WeCare, the pharmacy, or another entity contracts with the PSP) | NOT DECIDED |
> | Real per-gram / per-unit pharmacy prices (incl. the €59 inhaler figure) | NOT AVAILABLE — every price in the app today is a labelled placeholder |
> | Medical-review fee (amount, who charges it, when, refundable?) | NOT CONFIRMED |
> | Austrian counsel: payment-before-prescription permissibility (both the authorize-only and charge+refund models) | NOT AVAILABLE — no ruling |
> | Austrian advertising-copy clearance; flower's medicines-law vs. tobacco-monopoly classification | NOT AVAILABLE — pre-existing blockers, unchanged |
>
> **The three tracked asks** (PSP / pharmacy pricing / counsel), each with its full sub-checklist, are logged in `docs/FUNNEL-RESEQUENCE-PAYMENT-BLOCKERS.md` — that's the document to hand to procurement, the pharmacy partner, and counsel respectively.

Mischa's literal ask was "choose product **and payment** → billing page → thank-you." What's live is "choose amount → confirm request → thank-you," with payment happening later, offline (invoice/bank transfer), after a doctor approves.

- **Option A — keep the interim as the answer.** No PSP, no reversal of D7, ships as-is. Converts better than the old flow (no dead end) but doesn't fully match what Mischa asked for.
- **Option B — build the target flow** (`docs/superpowers/specs/2026-09-08-funnel-resequence-design.md` Part A): pay at checkout (card/Klarna/SEPA/invoice), full refund if the prescription isn't issued, doctor review becomes fulfilment framing — exactly quick-green's model. Needs:
  - **PO:** reverse D-A (payment after approval) and D7 (invoice/bank-transfer only)
  - **Counsel:** confirm taking payment for a prescription-medicine request *before* the prescription exists is permissible, with the refund policy shown before payment
  - **Procurement:** a PSP (Klarna is one integration covering card + invoice + instalments for DACH)
  - **PO:** real per-gram prices (D6) — `COMMERCE_ENABLED` stays off until they exist
- **Sign-off:** PO (the reversal) + counsel + procurement. This is the one decision everything else is downstream of.
- **Recommendation:** if the goal is to fully close Mischa's ask, Option B is where this eventually has to go — but it's a real project (PSP integration, real prices, counsel clearance), not a follow-up patch. Worth deciding now whether that's committed to, so the PSP/counsel/pricing work can start in parallel rather than waiting for another QA round to trigger it.

---

## D-2 — Ratify: safety questions moved before the product (reverses B1/B2)

**Was:** the two safety Yes/No questions + conditions checklist ran on a separate page, reached *after* the product screen (PO decision set 5, Sept 2026).
**Now:** merged into the same continuous pass as the 6 assessment questions, before any product is shown — Mischa's explicit ask, and how every competitor does it.
**Sign-off:** PO ratification of the reversal.
**Recommendation:** ratify. This is what was asked for; B1/B2 predates this feedback round.

---

## D-3 — Ratify: the signed-in journey no longer stays inside the dashboard shell

**Was:** "the signed-in journey stays inside the dashboard shell" (owner decision, Sept 2026) — cart/checkout/confirmation lived under `/dashboard`, and a signed-in user browsing the funnel got the dashboard sidebar.
**Now:** the whole funnel (`/assessment/*`, `/shop/:id`, `/cart`, `/checkout`, `/order-confirmation`) is a standalone shell (logo + a 4-step progress bar) for every visitor, signed in or not. Cart/checkout/confirmation moved to top-level URLs. The dashboard is reached only from the "Your request is in" page onward — Mischa's explicit "the dashboard overview page is not needed in the order flow."
**Sign-off:** PO ratification of the reversal.
**Recommendation:** ratify.

---

## D-4 — Ratify: Result page always leads to the product (reframes D3)

**Was:** the Result page's primary button was "Submit my assessment for medical review."
**Now:** since the review is created automatically at the end of the question pass (D-2 above), the Result page's primary button is "Choose your amount," opening the product directly. A quiet line under the intro ("A doctor is now reviewing your request") + a link covers the review-status case.
**Sign-off:** PO.
**Recommendation:** ratify — it's the natural consequence of D-2, not an independent choice.

---

## D-5 — Ratify: `/cart` shows "Continue" and hides prices even while `COMMERCE_ENABLED` is off

**Was:** the cart's checkout button was gated behind `COMMERCE_ENABLED` (currently `false`), so a user with items in the cart had no way forward from that page.
**Now:** an unconditional "Continue" → checkout, and per-line prices hidden while prices are still placeholders — the same "no price surface, but the flow still proceeds" rule already applied to `/checkout`, extended one page further back.
**Sign-off:** PO (minor, but it is a rule extension, not something explicitly asked for).
**Recommendation:** ratify — the alternative is a cart that's a dead end again.

---

## D-6 — Not built: SMS/WhatsApp OTP as the account credential

Mischa specifically asked for this ("deliver the account password by SMS or WhatsApp — doubles as identity/KYC verification"). Today, checkout still creates an account with email + a typed password.
**Needs:** an SMS provider + a WhatsApp Business API sender, and a real auth backend (auth is currently mock — any email signs in).
**Sign-off:** procurement (same bucket as PostHog EU / GlitchTip / Usercentrics — company-owned, not developer-owned) + the backend build.
**Recommendation:** no action needed now beyond acknowledging it's Part A / not started. Worth deciding whether it's worth prototyping the OTP *screen* (clearly labelled as preview) before the real backend exists, purely so the flow reads complete in the prototype Mischa reviews.

---

## D-7 — Not built: returning-customer fast path

quick-green's "have you had a prescription before?" first question, skipping the assessment for returning, previously-approved customers.
**Needs:** a real backend (identity + review history) to know who's returning.
**Sign-off:** already logged as Phase 2 in the design doc; no new decision here, just confirming it stays there.
**Recommendation:** defer, no action.

---

## D-8 — The "doctor's questionnaire" content is still thin

Mischa's flow calls the merged safety step "doctor's questionnaire." Today it's exactly what existed before: two Yes/No questions (pregnancy, recent supply) + a conditions checklist. A real doctor's questionnaire (current medications, medical history, contraindications, prior cannabis therapy) is fuller than this.
**Sign-off:** the medical partner needs to specify the real field list; legal/compliance review follows from that.
**Recommendation:** loop in the medical partner now if D-1 Option B is being pursued — this is on the critical path for a "real" doctor step either way.

---

## D-9 — New scope: mandatory legal-consent interstitial before the questionnaire

**2026-09-14 WhatsApp:** Mischa forwarded a quick-green.de screenshot — a mandatory "please read and confirm" legal-notice screen (checkbox "I have read all the notes and agree" + a confirm button) shown before their assessment starts. His read: *"this page seems to be a mandatory page, to aware the customers to the legal rights. seems to be part of the compliance. we should this also integrate to our site, before the questionary starts."*
**Status:** new feature request, not yet designed. This is distinct from the existing `AgeGate` (DOB + 18+ checkbox) and the `ConsentBanner` (cookie/analytics consent) already built — Mischa is describing a separate legal-terms acknowledgment gate.
**Sign-off:** design pass first (see the brainstorm this triggered), then PO + likely counsel input on exactly what it must say, since "part of the compliance" is Mischa's read, not a confirmed legal requirement.
**Recommendation:** design before building — logged here so the ask survives to whoever picks it up.

---

## Also on the standing counsel queue (not new, just re-surfaced by this round)

- The DE confirmation/result copy was tightened to a conditional "if approved…" framing (was presupposing approval) — queued in `docs/CLAIM-LANGUAGE-REVIEW.md`, not yet counsel-cleared.
- Every existing counsel blocker (pay-before-prescription permissibility, the full Austrian advertising-copy review, age-gate/DOB sufficiency, the medicines-law-vs-tobacco-monopoly question) is unchanged by this work — still open, still blocking public launch regardless of D-1's outcome.

---

## Suggested order

1. **D-1** first — it determines whether D-6 (OTP) and the PSP/pricing work start now or stay parked.
2. **D-2 through D-5** are fast ratifications of what's already built and matches Mischa's ask — no reason to hold these up.
3. **D-8** (medical partner) can start in parallel with D-1 if Option B is likely.
4. **D-6 / D-7** stay Phase 2 unless D-1 lands on Option B with a committed timeline.
