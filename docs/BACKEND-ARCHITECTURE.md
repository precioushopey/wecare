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
  prices are in place.
- **Payment after medical approval** for MVP — invoice + bank transfer only
  (D7). Abstract the payment layer so card / SEPA / Klarna can be added later.

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
| **Auth** | EU-region managed auth (e.g. Supabase Auth EU or equivalent) | verified email, password reset, sessions, RBAC, secure logout. Collect real **date of birth** at registration (D14, revised PO decision set 4) — the frontend gate now collects a DOB client-side (`src/features/age/age.ts`, device-local, self-reported); this is the real backend-side capture + validation it still needs. |
| **Database** | PostgreSQL, EU region | entities below |
| **Health data** | logically separated from commerce data; strict authorization | assessment answers, recommendations, medical reviews |
| **Product / pricing** | **priced at the `DispensingOption`, not the `Solution`** (owner decision #1, PO decision set 4) — a Solution has no single real price; each dispensing option under it can carry its own pharmacy price. Pharmacy-driven / configurable: product id, pharmacy, €/g or per-unit price, pack size, availability, last-updated. See `src/data/dispensing.ts` for the target shape. |
| **Medical-partner integration** | API / webhook preferred; fallback = a secure staff portal to move review status | no patient data over plain email / spreadsheets |
| **Pharmacy integration** | API/feed preferred (stock, batch, price, cannabinoid profile, COA, availability) (owner decision #4); MVP fallback = an authenticated pharmacy/admin interface, not manual code edits | **every update must be audited** — timestamp, operator/admin id, source, and previous-value history (`AuditEvents`) |
| **Email** | EU-compatible transactional provider | account verification, review submitted, review update, payment request, order update, follow-up |
| **Payments** | abstraction only for MVP (invoice / bank transfer after approval) | Stripe / SEPA later |
| **File storage** | EU-region encrypted object storage | only if document upload is required |

### Entities

Users · Profiles · Assessments · Recommendations · MedicalReviews · Orders ·
Products · PharmacyProducts · Payments · Follow-ups · ConsentRecords ·
AuditEvents

### Security

Encryption in transit + at rest · RBAC · audit logs · rate limiting · secure
secrets · backups · data-retention policy.

## Partners & data still required before build (decision brief §4–§5)

- **D9** real registered entity details
- **D10** medical partner + pharmacy identities, licensing, contracts, and the
  legal controller/processor/joint-controller structure (**counsel** decides
  this — not engineering)
- **D11** real COA / lab data feed
- **D12 / D15** counsel review of the legal layer and the full funnel
- **D4 / D5** the real review-turnaround SLA and any review fee
