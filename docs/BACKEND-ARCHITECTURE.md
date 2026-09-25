# WeCare — Backend architecture direction

Product-owner direction from the 2026-09-01 decision brief (items **D3, D16,
D24**). This records the intended shape; it is **not built** — the current app
mocks everything server-side in `localStorage`. Estimate for an MVP backend
+ integration + QA once the doctor/pharmacy API specs exist: **3–5 weeks** with
an experienced full-stack engineer/team. Do not treat that as fixed before
partner specifications are available.

## Hard constraints

- **EU/EEA data residency (D16)** for all personal and health data: backend,
  database, auth, file storage, medical records, pharmacy integration, email,
  error reporting, backups. Every sub-processor must be EU-region.
- **Data minimisation (D16)** — analytics and error reporting receive coarse
  events / identifiers only (`assessment_completed`, `problem_category=sleep`,
  `recommendation_viewed`). They must never receive: free-text assessment
  answers, medication names, diagnoses, uploaded documents, full name/email,
  date of birth. This is already enforced in `src/lib/analytics.ts`.
- **Prices are not hard-coded** — served from pharmacy-driven config (D6). The
  frontend flag `PRICES_CONFIRMED` (`src/config.ts`) stays `false` until real
  prices are in place. **`COMMERCE_ENABLED` disables the whole checkout in
  production** while prices are placeholders (PO 2026-09-04) — no order total,
  no "Place order". Lifting `PRICES_CONFIRMED` re-opens it.
- **Payment after medical approval** for MVP — invoice + bank transfer only
  (D7). The frontend abstraction seam exists: `src/features/payments/payments.ts`
  (`PAYMENT_METHODS` with per-method `enabled`, no-op `requestPayment()`). Wire a
  PSP branch there for card / SEPA / Klarna. **Update 2026-09-24:** the owner now
  wants wire transfer, credit card, Apple Pay and crypto at checkout, chosen
  before submitting — see "Handoff from the 2026-09-24 frontend pass" below.
- **Shipping address** is entered at checkout as separate `first_name` /
  `last_name` + address + optional phone. The frontend keeps it in
  `sessionStorage` only (never `localStorage`); the backend must persist it on
  the authenticated user/order record, EU-hosted.

## Core flow (D3)

`Assessment → Recommendation → Submit for medical review → Review status page`

Purchase / payment come **after** an `approved` outcome. The current frontend
already routes the recommendation CTA into a review-status page
(`/assessment/review`) backed by a mock `wecare.review` store with the status
model below.

### Review statuses

`submitted · inReview · infoRequired · approved · notApproved · consultation`

Each transition fires an email: review received · additional information
requested · approved · not approved · consultation required.

## Services (MVP)

| Concern | MVP approach | Notes |
|---|---|---|
| **Auth** | EU-region managed auth (e.g. Supabase Auth EU or equivalent) | verified email, password reset, sessions, RBAC, secure logout. **Update 2026-09-24:** checkout no longer asks for a password — the customer confirms a mobile number by SMS instead (see the handoff section below); the canonical identity (phone vs email) is still to be decided. Collect real **date of birth** at registration (D14, revised PO decision set 4) — the frontend gate now collects a DOB client-side (`src/features/age/age.ts`, device-local, self-reported); this is the real backend-side capture + validation it still needs. **Update 2026-09-25:** `/login` is now the SMS "Track your order" sign-in (mobile number + 6-digit code, then straight to My orders); password, email, Google/Apple sign-in and the separate `/signup` were removed, since an account is created by ordering. The prototype cannot look an account up by phone (it starts an empty session), so the backend must resolve a verified phone to an account and return its orders: that lookup is what makes "track your order" real. Open: what identifies the account when a phone number is shared or changed. |
| **Database** | PostgreSQL, EU region | entities below |
| **Health data** | logically separated from commerce data; strict authorization | assessment answers, recommendations, medical reviews |
| **Product / pricing** | **priced at the `DispensingOption`, not the `Solution`** (owner decision #1, PO decision set 4) — a Solution has no single real price; each dispensing option under it can carry its own pharmacy price. Pharmacy-driven / configurable: product id, pharmacy, €/g or per-unit price, pack size, availability, last-updated. Full target field list in `docs/STRAIN-SOLUTION-MAPPING.md` (a `src/data/dispensing.ts` type sketch existed briefly and was removed in a repo cleanup — re-create it here). |
| **Medical-partner integration** | API / webhook preferred; fallback = a secure staff portal to move review status | no patient data over plain email / spreadsheets |
| **Pharmacy integration** | API/feed preferred (stock, batch, price, cannabinoid profile, COA, availability) (owner decision #4); MVP fallback = an authenticated pharmacy/admin interface, not manual code edits | **every update must be audited** — timestamp, operator/admin id, source, and previous-value history (`AuditEvents`) |
| **Email** | EU-compatible transactional provider | account verification, review submitted, review update, payment request, **order confirmation, DHL dispatched (with tracking link), order cancelled**, order update, follow-up |
| **Payments** | abstraction only for MVP (invoice / bank transfer after approval) | Stripe / SEPA later |
| **File storage** | EU-region encrypted object storage | only if document upload is required |

### Entities

Users · Profiles · Assessments · Recommendations · MedicalReviews · Orders ·
Products · PharmacyProducts · Payments · Follow-ups · ConsentRecords ·
AuditEvents

### Security

Encryption in transit + at rest · RBAC · audit logs · rate limiting · secure
secrets · backups · data-retention policy.

## Handoff from the 2026-09-24 frontend pass

Source: the product owner's (Mischa's) WhatsApp messages and the frontend built
against them — see "Mischa's exact WhatsApp messages vs. what was built" in
`CLAUDE.md`. He said the **database changes** and a **review of the shop CRM**
come *after the frontend is finished*, and the chat assigns DB + CRM to the
backend team (Justin and Marwell). Everything below is **mocked in the browser
today**; this is what the backend / host has to provide for it to be real.

| # | Item (owner's words) | What the frontend does today | What the backend / host needs to do |
|---|---|---|---|
| 1 | **IP → country for the homepage delivery map** — "I would add an IP identification behind it. If it's an IP from Austria show Austria; if IP Germany show the German version" | `detectVisitorCountry()` (`src/features/delivery/country.ts`) first reads `<meta name="wecare-country" content="AT">` (or `DE`) from the page; without it, it falls back to the browser time zone, then language, then Austria. Automated browsers (the prerender) always get AT. There is a manual AT / DE switch on the map. **No geo-IP call is made from the browser** — visitor IPs would reach a third party before any consent (ePrivacy / GDPR, D16). | Resolve the country from the request IP **at the host / edge** (EU-hosted) and write that tag into the served HTML, values `AT` or `DE` only. Do not store the IP; add the processing to the privacy policy. **Caching:** HTML shared across countries would show the wrong map, so inject after the cache or vary by country. The prerendered pages (`INDEXABLE_ROUTES`) are static, so the tag must be added per request, not at build. |
| 2 | **Germany as a market** — "Germany is wanted to market too … probably some DB amendings" | Postcode step accepts a 4-digit Austrian or 5-digit German postcode (`src/features/delivery/delivery.ts`); checkout Country is a dropdown (Austria / Germany) that drives postcode validation; `isServiceableAt()` returns true for any valid postcode (no coverage data). The order stores `country` as a **display label** ("Germany" / "Deutschland"). | Store country as an **ISO code** (`AT` / `DE`) with per-country postcode validation. Per-country coverage and routing (which medical partner and pharmacy serve Germany), per-country prices, VAT and DHL rates, and German delivery regions (only Austrian states are modelled). Real serviceability must come from the partners, not the frontend. **Counsel, not engineering:** the shipping / terms / imprint texts are still Austria-only, and the German medical-cannabis regime differs — see D12 / D15. |
| 3 | **Data captured at checkout** | Per order: `lines` (Solution id + grams), `shipTo` = first name, last name, street, postal code, city, country, **SMS-verified phone (E.164)** and **date of birth** (validated 18+ client-side), the account email, `paymentMethod`, and `totalEur` (null while fees are unknown). Address + DOB live in `sessionStorage` only (`src/features/orders/orders.ts`). | Persist all of it on the authenticated order record, EU-hosted, and **re-validate 18+ server-side** — the client check is self-reported. Name + DOB are the identity-match keys for the medical / pharmacy chain; keep them out of analytics (D16). |
| 4 | **SMS verification instead of a password** — "customer does not need anymore in these times to do passwords" | Seam `src/features/phone/verification.ts`: `normalizePhone()` (E.164; a leading 0 is read as +43), `sendVerificationCode()`, `checkVerificationCode()`. `PHONE_VERIFICATION_LIVE = false` in `src/config.ts` means an honest **preview**: nothing is sent, any 6 digits pass, and the UI says so; the live branches fail closed ("unavailable"). Checkout creates the account from email + verified phone; `AuthUser.phoneVerified` is set. | An EU-hosted SMS-OTP provider and server-side verification: code TTL, attempt limits, resend throttling (the frontend already maps `rateLimited`, `unavailable`, `wrongCode`). Decide the **canonical identity (phone or email)** and the sign-in flow for returning customers — **Update 2026-09-25:** `/login` is now the SMS sign-in (see the Auth row and item 5 of the 2026-09-25 handoff below), and "Already with WeCare? Yes" sends the visitor there, but without a backend it cannot find that customer's account. Flip `PHONE_VERIFICATION_LIVE` only together with the real adapter. |
| 5 | **Payment provider** — "API of Payment provider: did you receive it?" (asked of Ilay) | Checkout lists wire transfer (works), credit card, Apple Pay and crypto (listed, **disabled**, tagged "Available soon"). `requestPayment()` in `src/features/payments/payments.ts` is a no-op; flip `enabled` per method once wired. Only wire transfer is selectable; the order records the chosen `paymentMethod`. | PSP integration for card and Apple Pay; a crypto processor (**counsel** to confirm it is acceptable for a prescription product); wire-transfer reference / instructions; webhooks that set an order's payment status. This moves toward **pay at checkout** (the target in `docs/FUNNEL-RESEQUENCE-PO-DECISIONS.md`); the open questions on authorize-only vs charge-and-refund and the PSP / merchant-of-record are in `docs/FUNNEL-RESEQUENCE-PAYMENT-BLOCKERS.md`. |
| 6 | **Order summary amounts** — DHL shipping, "Doctors fee — I need to ask how much it will be", total, VAT sentence | The summary shows product, grams x price per gram, DHL shipping, subtotal, doctor's fee and total. Shipping and the fee are `null` in `src/config.ts` (`SHIPPING_FEE_EUR`, `REVIEW_FEE_EUR`), so they read "To be confirmed" and the **total appears only when both are set**. Per-gram prices are still placeholders (`PRICES_CONFIRMED = false`), so the panel is labelled "indicative". The VAT sentence (`checkout.vatNote`) is the owner's German-VAT wording. | Serve real DHL rates, the doctor's fee and per-gram prices from pharmacy-driven config (D6) and compute the total server-side. **Counsel** to confirm the VAT wording: it cites a German provision (§ 4 No. 14 a UStG) on an Austrian-market shop. |
| 7 | **"The online doctor prescription is instant"** | No timing claim appears anywhere in the copy (no wording from the owner; D4 says no invented SLA). The review is still modelled as an asynchronous status (`submitted`, `inReview`, ...). | If the doctor's decision really is instant, the medical-partner integration needs a real-time API and the review-status model above may collapse to a synchronous outcome at checkout. Confirm with the medical partner before any "instant" copy is written. |
| 8 | **Shop CRM review** — "I would like to review the CRM for the shop after all frontend is finished" | Not built; the frontend only emits coarse analytics events (`src/lib/analytics.ts`, includes `checkout_phone_code_sent`, `checkout_phone_verified`, `assessment_existing_customer_answered`). | Schedule the CRM review with the owner once the frontend is signed off; it is the same DB work as rows 2-4. |

## Handoff from the 2026-09-25 frontend pass

Source: the product owner's (Mischa's) WhatsApp messages of 2026-09-24/25 and the frontend built against them (details in `CLAUDE.md`). Everything below is **mocked in the browser today**.

| # | Item (owner's words) | What the frontend does today | What the backend / host needs to do |
|---|---|---|---|
| 1 | **The thank-you page shows the target flow** — "at this stage, the customer did place the order and paid" | `OrderConfirmationPage` says "Thank you for your order / Your order is confirmed", shows the summary, a shipping rule and a DHL-email line, and no longer mentions a doctor step. The prototype does none of that: no in-flow doctor approval, no payment, no email. My Orders still says "In medical review", checkout still says "Submit my request". | The page is only true once (a) the doctor's approval happens before the order exists, (b) payment is taken at checkout (PSP, see `docs/FUNNEL-RESEQUENCE-PAYMENT-BLOCKERS.md`) and (c) an order-confirmation email is sent when the order is created. Until then keep the wording and the order status in step. |
| 2 | **Shipping cut-off** — "Orders before 12 will be shipped same day, order after the next day" | Static copy (`shop:confirmation.shipping`). It is **not** in the Shipping policy text, which is deliberately neutral (`[LEGAL REVIEW REQUIRED]`), and the 2026-09-04 product-owner decisions had removed such claims. | Model the cut-off as configuration (time, time zone Europe/Vienna, working days, holidays) used by both the page and the dispatch job, so the promise and the operation cannot drift. Operations and counsel confirm it before it is shown as fact. |
| 3 | **Emails** — "you will be informed by Email once the DHL package is sent out" | Nothing is sent (no provider). The confirmation page says "We'll email you as soon as your DHL package is on its way". | Transactional emails: order confirmation (order created), DHL-dispatched with a tracking link (from the label/DHL webhook), order cancelled. EU-hosted provider, SPF/DKIM/DMARC on the sending domain (system admin, see `docs/HOSTING-HANDOFF.md`). No health data in email bodies. |
| 4 | **Cancel an order** — "there should be a way to cancel order" | My Orders shows **Cancel order** on `inReview` / `processing` orders, with a confirmation dialog. `cancelOrder(id)` (`src/features/orders/orders.ts`) flips the local status to `cancelled` and stamps `cancelledAt`. Browser only. | `POST /orders/:id/cancel`, allowed only before dispatch (`inReview`/`processing` -> `cancelled`; refuse after `shipped`), idempotent, with an audit event. Side effects: tell the medical partner and pharmacy, stop preparing, **refund any payment already taken**, send the cancellation email, keep the order visible as Cancelled. Decide whether the medical review record is closed or kept (the prototype leaves it). The order status enum becomes `processing · inReview · shipped · delivered · cancelled`; `shipped` / `delivered` must be set by the pharmacy/DHL webhook, never the client. **Counsel:** how this relates to the statutory withdrawal right and the refund policy. |
| 5 | **"Track your order" sign-in** — "on log in, it should be different... this should be the order tracking" | `/login` = mobile number + SMS code, then My Orders; `/signup` redirects to it; checkout accounts have no password. Mock: any 6 digits pass, and a phone sign-in starts an **empty** session (sign-out also wipes the local orders). | See the Auth row: resolve a verified phone to an account and return its orders (that lookup is what makes tracking real), OTP TTL / attempt limits / resend throttling, and decide the canonical identity (phone or email) when a number is shared or changed. |
| 6 | **Legal-consent record** — the new "Before you begin" screen (four notes plus Terms and Privacy) | Stores a bare flag `wecare.legalConsent.v2` in `localStorage` (the key carries the version). No timestamp, no text version, nothing server-side. | A `ConsentRecords` row per acceptance: user or session, timestamp, the version/hash of the notes and documents shown, language. **Counsel** decides whether the health-data note needs its own explicit Art. 9 consent instead of this shared checkbox. |
| 7 | **Two Solutions in one order** — the alternative card's "Add to cart" | A cart and an order can hold the matched Solution and the alternative (usually a stronger one). The prototype reviews neither differently. | The medical review must cover **every** line, with the doctor's decision per line (approve / decline / change); order and payment proceed only for approved lines. See the counsel question in `docs/CLAIM-LANGUAGE-REVIEW.md`. |
| 8 | **Server-side validation of what checkout checks client-side** | Inline errors plus a summary above the submit button: first/last name, street, city, postcode per country, email, birthday 18+ (and plausible), verified phone. All client-side and self-reported. | Re-validate all of it on the server (postcode per country, DOB 18+ and plausible range, phone verified for this order, email) and return field-level errors so the existing summary can show them. |

## Partners & data still required before build (decision brief §4–§5)

- **D9** real registered entity details
- **D10** medical partner + pharmacy identities, licensing, contracts, and the
  legal controller/processor/joint-controller structure (**counsel** decides
  this — not engineering)
- **D11** real COA / lab data feed
- **D12 / D15** counsel review of the legal layer and the full funnel
- **D4 / D5** the real review-turnaround SLA and any review fee
