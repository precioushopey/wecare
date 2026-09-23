# Payment-at-checkout — blockers and the exact asks (Sept 2026)

**Context:** the Product Owner ratified "pay at checkout" (not "request now, pay after approval") as the target checkout model — see `docs/FUNNEL-RESEQUENCE-PO-DECISIONS.md` D-1. **Nothing below is resolved.** Every item is confirmed as-of 2026-09-08 to be genuinely unresolved, not just undocumented — this is the checklist to hand to each owner, not a status report claiming progress. Until all three sections clear, the live build stays the "submit request → doctor approval → pay after approval → fulfilment" flow — that's not a fallback choice, it's the only flow that doesn't pretend infrastructure exists that doesn't.

**Update 2026-09-14 (WhatsApp, Mischa/Eli/Justine):** a candidate payment-provider contact ("Eli") has surfaced and confirmed he'll provide **API + webhooks + a portal login**, which means WeCare builds its own billing-page design rather than embedding a hosted page (Mischa confirmed this explicitly: "since its with API and webhooks, we can do our own design on the billing page"). **This is a candidate contact, not a contracted/confirmed PSP** — none of the §1 questions below have written answers yet (Austria market support, prescription-cannabis MCC acceptance, merchant-of-record, authorize-vs-capture, refund/chargeback terms, settlement timing). Do not build the payment UI against this contact's API until those are answered in writing, same rule as every other PSP candidate. Mischa also specified the concrete UI he wants *once this is buildable* — captured in a new §4 below so it isn't lost, without being treated as authorization to build it now (per PO instruction 2026-09-14: hold all payment-UI work until PSP + real prices are confirmed).

---

## 1. Procurement / Finance — payment provider

**No provider is approved.** Klarna is a candidate worth approaching (DACH presence, bundles card + invoice + instalments in one integration); Eli's unnamed provider is now a second candidate (see the 2026-09-14 update above). Neither is confirmed. Do not build against Klarna, Eli's provider, Stripe, Adyen, Mollie, or any other PSP until they've answered, in writing, all of the following:

- Do they accept WeCare's exact business model — a licensed platform selling prescription medical cannabis in Austria?
- Is Austria supported as a settlement/operating market?
- Do they explicitly support prescription medical-cannabis transactions (not just "pharmacy" or "healthcare" broadly)?
- **Who is allowed to be merchant of record** — WeCare, the dispensing pharmacy, or a third entity? (This determines who actually contracts with the PSP and who's liable for chargebacks/disputes — a business/legal decision, not just a technical one.)
- Card support?
- SEPA support, if wanted?
- Klarna / buy-now-pay-later products, if wanted?
- **Crypto support, if wanted** (Mischa's 2026-09-14 method list includes it) — this is a materially different question from card/SEPA/Klarna: crypto payment for a licensed medical-prescription platform raises its own AML/KYC and payment-processing-license questions in Austria/EU that don't automatically ride along with a card-PSP's clearance. Flag explicitly for counsel (§3) — do not assume a "yes" to card also covers crypto.
- **Do they support authorization without immediate capture** (hold funds, capture later)?
- If so, what's the **maximum authorization-hold duration**, and can it be extended/re-authorized if the medical review takes longer?
- Refund behavior and any refund fees?
- Reserve requirements (do they hold back a percentage of revenue)?
- Chargeback rules and who bears them?
- Settlement timing (when does WeCare/the pharmacy actually receive funds)?
- Their explicit MCC (merchant category code) / risk classification for a cannabis-adjacent business, and whether that classification itself creates account restrictions.

**Do not assume any mainstream PSP will accept this account without that written confirmation** — cannabis-adjacent categories are commonly declined or restricted regardless of the medical/legal status of the product.

---

## 2. Pharmacy partner / Business — real prices

**No real prices exist.** Every €/gram figure currently in the app is a labelled placeholder, hidden from customers, and the checkout shows no total at all. Needed, per actual dispensing option (each real product/strain/device the pharmacy will ship):

- Pharmacy product/SKU ID
- Commercial product name
- Format (flower / device / future formats)
- €/g for flower, or €/unit for a device (e.g. the currently-unverified €59 inhaler figure — treat as unverified until the pharmacy confirms it directly)
- Available pack/quantity rules (what quantities can actually be dispensed)
- VAT treatment, where applicable
- Current stock / availability
- Effective date of the price, and how often pricing is expected to change
- Whether the quoted price is final to the patient, or additional pharmacy fees apply on top

**Separately, a commercial decision is needed: is there a medical-review fee at all?** If yes:
- exact amount
- who charges it (WeCare or the pharmacy/medical partner)
- when it's charged
- whether it's refundable
- what happens to it if the review declines the request
- whether it's shown as part of the displayed total, or itemised separately

Without this, there is no basis for a checkout total a customer can actually trust.

---

## 3. Austrian legal counsel — payment timing

**No ruling exists.** The question, scoped to exactly two models — don't let this broaden into a general "review the whole flow" ask, that's covered separately by the existing advertising-copy and product-classification reviews:

**Model A — authorization only (preferred, pending PSP capability):**
> May the customer's payment instrument be authorized (funds held, not captured) before a prescription is issued, provided no funds are captured unless and until the licensed doctor approves and the prescription/order becomes valid?

Counsel should weigh, beyond medicines law: consumer-contract formation timing, distance-selling / cancellation-and-refund disclosure requirements, applicable pharmacy regulations, who the contractual seller is, who is merchant of record (ties to §1 above), and how a declined request is unwound.

**Model B — charge then refund (fallback only, if Model A isn't technically feasible):**
> May the customer actually be charged before a prescription exists, if the transaction is expressly conditional on medical approval and a full, automatic refund is issued on decline?

Neither model has been cleared. Counsel's answer to Model A vs. B also feeds back into §1 — the PSP requirement ("does it support authorize-then-capture, and for how long") depends on which model counsel actually clears.

This sits alongside the two pre-existing, still-open counsel items (unchanged by this work): the full Austrian advertising-copy review, and the medicines-law-vs-tobacco-monopoly classification of the dispensed flower.

---

## 4. UI spec supplied 2026-09-14 (for whenever this unblocks — not built)

Mischa gave concrete direction on the billing page, once §1–3 clear. Captured verbatim-in-substance so it doesn't need re-eliciting:

- **Own design, not the provider's hosted page** — confirmed once Eli said the integration is API + webhooks (see the update note above).
- **"Choose payment method" section**, placed under the order/price summary, methods listed top to bottom:
  1. Credit card
  2. Apple Pay
  3. Crypto
  (Note: his own reference screenshots also showed PayPal / Rechnung / Bankeinzug / Vorkasse — he did not ask for those in the final list, only the three above.)
- **Summary of payment must show:** price of product, shipping price, total amount.
- **Selecting "Credit card" reveals:** card number (16-digit), an expiry field, CVV. Mischa first referenced an example with separate month/year dropdowns, then explicitly overrode it: *"I prefer here expiration date in one field. mm/yy — saves space."* — one combined MM/YY field, not two dropdowns.
- Asked the team to "research how to display" the card-entry fields — this is the PCI-DSS / tokenization question: whichever PSP is eventually contracted almost certainly dictates the actual capture pattern (hosted/tokenizing fields embedded in our layout vs. a redirect vs. something else). A plain `<input>` capturing the raw PAN into this app's own state is not an acceptable implementation regardless of which PSP is chosen — resolve the integration pattern with the PSP's docs before building any card-shaped form, not before.

---

## Bottom line

Payment-at-checkout is blocked on five things, none of them UI work:

1. PSP acceptance (written, specific to this business model)
2. Merchant-of-record structure
3. Real pharmacy pricing (SKU-level)
4. The medical-review-fee decision
5. Austrian legal clearance on payment timing (Model A or B)

Until all five clear, the production flow stays: **assessment → recommendation → request submission → doctor approval → verified price/payment → pharmacy fulfilment.** That's the honest current state, not the target — the target (D-1, Option B) is ratified and this document is what moves it from "someday" to "in progress."
