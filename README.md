# WeCare

A German/Austrian-market **digital health platform for medical cannabis**, built
**problem-first** (Sleep · Pain & Body Comfort · Stress & Anxiety · Migraine). A
short guided self-assessment leads to one or two recommended "Solutions" and then
to a **medical-review** step; the doctor / prescription / pharmacy layer is
required but sits **behind** the assessment, never in front of it.

> **Status: front-end prototype.** There is **no backend.** Authentication, SMS
> verification, the medical review, payments, order fulfilment and lab (COA) data
> are **mocked or placeholder**; all state lives in the browser (`localStorage` /
> `sessionStorage`). The whole site is `noindex, nofollow` (and `robots.txt`
> disallows everything) until the indexing gate is deliberately opened at launch.

The full requirements & design analysis is in
**[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** (rewritten
2026-09-02). It **predates** the SEO foundation, the funnel re-sequence (2026-09-08),
the dashboard consolidation (2026-09-09) and the 2026-09-24 checkout/assessment
rework — **where they differ, `CLAUDE.md` wins.** `CLAUDE.md` is the working
notebook of scope, copy rules and the running log of product-owner decisions and
is effectively a second source of truth. Two upstream briefs
(`WeCare_CLI_Implementation_Prompt.md`, `WeCare Website Structure.md`) are
referenced by `CLAUDE.md` but are **not in this repo** — they should be added to
`docs/`.

---

## Overview

| | |
|---|---|
| **What it is** | Marketing site + a guided assessment (existing-customer question · 18+/DOB gate · legal consent · delivery postcode · 6 questions · final safety checks) → the matched **Solution page** (with an alternative product card) → cart → **checkout** (SMS phone verification, delivery details, order summary, payment method) → confirmation, plus a medical-review status page and a signed-in "My area" dashboard. Fully bilingual (DE default, EN toggle). |
| **Market** | **Austria and Germany** (`de-AT`, EUR, DHL). Austria is the primary market and the legal framework used throughout; Germany was added 2026-09-24 (delivery map, 5-digit postcodes, checkout country). |
| **Origin** | Reskinned from an unrelated Figma Make export; the demo code has been stripped phase by phase, the Vite + React + Tailwind v4 + shadcn/ui substrate kept. |
| **Not a production system** | Built for stakeholder validation and as a front-end baseline for a real build. |

## Objectives

1. Problem-first entry — nav and homepage lead with the 4 problems, never "prescription/treatment".
2. A ~60-90-second, 6-question assessment replaces catalogue browsing.
3. Never imply everyone gets a prescription; new users are never led with the stronger option; every recommendation routes through a medical review.
4. Full DE/EN parity for every string, including dynamic content (all DE copy says **"Fragebogen"**, not "Assessment").
5. One signature visual device (the **Assessment Ring**, used outside the assessment itself); quiet motion; a liquid-glass + blue-gradient brand language. **Light-only** (a dark theme was built then removed — owner decision).
6. Commerce exists but is never in the primary nav; checkout is a standalone funnel step with **no password** — the customer confirms a mobile number by SMS instead.
7. A visible legal/compliance surface (6 legal drafts, COA/lab-tests, 18+/DOB gate, legal-consent gate) — and nothing fabricated is presented as real: `PRICES_CONFIRMED`, `COA_CONFIRMED` and `PHONE_VERIFICATION_LIVE` are `false`, and the DHL shipping / doctor's-fee amounts are `null` ("To be confirmed") until real numbers exist.

## Scope

- **In scope (built / partial):** homepage (9 sections, incl. a delivery map that shows Austria or Germany), 4 problem landing pages with **German slugs** (+ hidden General Wellness), a "How WeCare works" page, the assessment engine + recommendation logic, **5 Solution detail pages** (dispensing-options accordion, gated COA, alternative-product card), shop index, cart, **checkout** + order + confirmation, **medical-review status page** (`/assessment/review`, 6-status mock model), mock login / sign-up, dashboard (**5 areas**, desktop sidebar app-shell + mobile app-bar/tab-bar), 6 legal draft documents, gated lab-tests page, FAQ page, costs page, real `/contact` page, 404, redirects, a per-category consent banner, a consent-gated analytics seam, an app-wide error boundary, and the **SEO foundation** (per-route head management, JSON-LD, generated `robots.txt` / `sitemap.xml`, optional prerender).
- **Out of scope (deliberate — do not re-add):** real backend/auth/payment/medical-review integration; CBD Flowers/Hash/Vapes/Aroma Pebbles as products; `/about` `/careers` `/providers`; Knowledge Hub; **dark theme** (built Aug 2026, fully removed Sept 2026); a 6th Solution; any leaf/smoke/dispensary imagery or recreational language.
- **Not yet real (launch tasks):** a backend for every mocked capability; an **SMS provider** (checkout's verification is an honest preview); a **payment provider** (card / Apple Pay / crypto are listed but disabled); **IP-based country detection** (needs a host tag — see below); real product/COA/pricing, DHL shipping and doctor's-fee data; a real consent-management platform (Usercentrics — the banner + gate are in place); a wired analytics vendor (PostHog EU — the seam is in place, `dispatch()` is empty); a wired error reporter (GlitchTip); real legal entity data + counsel review (incl. Germany); Austria prescription-advertising review; image optimisation; ESLint/Prettier; tests; CI; deployment config; a mobile real-device QA pass.

## Target Users

- **Prospective patient (anonymous)** — adult in DE/AT with a sleep/pain/stress-anxiety/migraine concern; problem-aware, product-unaware. Passes the gates, the assessment and checkout **without creating a password**. The whole flow is designed for them.
- **Returning patient (authenticated, mock)** — says "Yes" to "Already with WeCare?" and signs in; uses "My area" (`/dashboard/*`) for the recommendation overview, review status, orders, follow-up, support and an editable profile.
- **Unsure visitor** — routed to the hidden **General Wellness** page (from the 404 and the assessment-start default only).
- Doctor / pharmacy roles are referenced in copy + a mock status enum only — **no UI, no integration.**

## Key Features

| Feature | Status |
|---|---|
| Marketing header (4 problem links + language + cart + account + CTA) + dark footer + skip link | Implemented |
| **Standalone funnel shell** (`FunnelChrome`: logo, 3-step bar, thin progress line, minimal legal footer) on `/assessment/*`, `/shop*`, `/cart`, `/checkout`, `/order-confirmation` | Implemented |
| Homepage (9 sections; rotating hero problem word; delivery map for Austria **or Germany**, with a manual AT/DE switch) | Implemented |
| 4 problem landing pages from one shared template (German slugs) + hidden General Wellness | Implemented |
| **Assessment**, one continuous pass: "Already with WeCare?" (Yes → login) → 18+/DOB gate → legal consent → delivery postcode (AT 4-digit / DE 5-digit) → 6 questions (all **auto-advance**, `?problem=` pre-fill, per-option hints) → final safety checks | Implemented |
| Deterministic recommendation (fixed primary/secondary per problem, "Advanced option" & "start gentle" flags, always requires medical review) | Implemented |
| The pass creates a mock medical review and lands on the **matched Solution page** (the old separate Result page was merged into it) | Implemented |
| **Solution page**: dominant primary card + amount picker, **full alternative-product card** ("Choose {name}" → straight to checkout), personalised copy, disclaimer panel, dispensing options, gated COA | Implemented (data partly placeholder) |
| **Review status page** (6 statuses: submitted / inReview / infoRequired / approved / notApproved / consultation) | **Mock** (`localStorage`, no backend, no email) |
| Shop index (5 Solution cards, no filters, not in nav) and Cart (grams, `SolutionId`-keyed, persistent) | Implemented |
| **Checkout**: SMS phone verification (no password) → delivery (name, street, PLZ, city, **country AT/DE**, birthday 18+, email) → **order summary** (product, grams × €/g, DHL shipping, subtotal, doctor's fee, total, VAT sentence) → **payment method** (wire transfer works; credit card / Apple Pay / crypto listed, disabled) → Terms + Privacy box → confirmation | **Mock** (no real SMS or payment; amounts "To be confirmed" until set) |
| Mock auth (any email) + editable profile (name / phone / address / photo) + dashboard (5 areas; Overview, My Orders, Follow-up, Support, Profile) | **Mock** |
| Follow-up check-in | Implemented |
| 6 legal draft documents + gated lab-tests page + FAQ page + costs page + real `/contact` page | Implemented (legal = **unreviewed draft** with provisional entity data) |
| Per-category consent banner (Essential locked + Analytics toggle) + consent-gated analytics seam | Implemented (**not a real CMP; no vendor wired**) |
| SEO foundation: per-route title / description / canonical / robots / OG, JSON-LD, generated `robots.txt` + `sitemap.xml`, optional prerender | Implemented (**site stays `noindex` until launch approval**) |
| App-wide React error boundary (bilingual fallback) | Implemented |
| i18n (DE default + fallback, EN toggle, locale date/currency, "Fragebogen") | Implemented |
| Assessment Ring, gradient backdrop, liquid-glass surfaces, entrance motion | Implemented |
| Self-hosted brand fonts (zero request to `fonts.gstatic.com`) | Implemented |
| Light / **Dark** appearance + toggle | **Removed** (built Aug 2026, fully removed Sept 2026 — owner decision; light-only) |

See `docs/DESIGN-SPECIFICATION.md` §10 for the (older) feature inventory with IDs, dependencies and `REMOVED` entries.

## User Roles

One real authorization boundary: **authenticated vs. not**, and it gates **only `/dashboard/*`**. The funnel, including checkout, is open to everyone.

| Role | Become it | Access |
|---|---|---|
| Anonymous | default | Everything except `/dashboard/*` (→ redirected to `/login` with a return path). Checkout creates an account inline from the **verified phone number + email** (no password). |
| Authenticated (mock) | submit **any non-empty email** at `/login` or `/signup` (password `required minLength={8}` but ignored; "Continue with Google / Apple" run the same mock sign-in); session in `localStorage:wecare.auth` | Everything, incl. `/dashboard/*`. Editable profile. A number verified at checkout is stored on the profile (`phoneVerified`). |
| Doctor / Pharmacy / Admin | — | **not modelled** |

> On sign-out and on a **different-email** sign-in, `wecare.assessment` / `cart` / `orders` / `followup` / `review` (and the session-only order addresses) are cleared; a first sign-in from anonymous is not cleared. `wecare.language`, `wecare.consent`, `wecare.ageConfirmed`, `wecare.legalConsent`, `wecare.newCustomer` and `wecare.returning` are device preferences and are kept.

## User Flows

The assessment-to-order path, as built:

1. **Home / problem page → "Start assessment"** (`/assessment/start`, optionally `?problem=`).
2. **Gates and questions** (one page, no route changes, thin progress line under the header): *Already with WeCare?* (Yes → `/login`; No is remembered per device) → *18+ / date of birth* → *legal consent* → *delivery postcode* → questions 1-6 (each auto-advances) → *final safety checks*. Answering the safety checks creates the mock medical review.
3. **Matched Solution page** (`/shop/:id`): choose an amount, or "Choose {alternative}" on the second card. `/assessment/result` and `/solution` redirect here.
4. **Checkout** (`/checkout`): verify the mobile number by SMS → delivery details → order summary + payment method + Terms/Privacy → "Submit my request" → `/order-confirmation`.
5. **My area** (`/dashboard`): review status, orders, follow-up, support, profile. `/assessment/medical-review` redirects to the review-status page (`/assessment/review`).

Older flow diagrams (Mermaid) are in `docs/DESIGN-SPECIFICATION.md` §8 and pre-date this sequence; `docs/superpowers/` holds the funnel re-sequence design and plan, and `CLAUDE.md` has the current rules.

## Requirements

Functional (`FR-001…040`), non-functional (`NFR-001…013`), user stories (`US-001…020`), business rules (`BR-001…049`) and acceptance criteria (`AC-1…15`, Given/When/Then) are in `docs/DESIGN-SPECIFICATION.md` §6-§8, §11, §18 (as of 2026-09-02 — see the note at the top).

## Business Rules

Full list in `docs/DESIGN-SPECIFICATION.md` §11, plus the later owner decisions in `CLAUDE.md`. Highlights:

- The **primary** recommended Solution is fixed per problem and never changes with severity or experience (`recommendation.ts`). **Q2 (frequency) and Q6 (format preference) do not change the match** — they personalise the copy only (owner decision D1). A new user is never led with the stronger option; the alternative card is shown second.
- **Every** recommendation always requires a medical review; no Solution is ever sold directly. The review record is created when the final safety checks are answered; a prescription is never guaranteed.
- The **18+/DOB gate** and the **legal-consent gate** must each be passed once per device before the assessment renders (device-local, self-reported — not identity verification). Checkout re-collects and re-validates the date of birth (18+).
- **Checkout:** no password — the customer verifies a mobile number by SMS (an honest preview until a provider exists: nothing is sent, any 6 digits pass, and the page says so). Country is **Austria or Germany**, and the postcode format follows it (4 vs 5 digits). "Submit" needs only the **Terms + Privacy** box (the "not intended to diagnose, treat, cure or prevent disease" checkbox was removed at the owner's instruction — see the open point in `CLAUDE.md`). Wire transfer is the only payment method that works; card / Apple Pay / crypto are listed but disabled until a provider is wired.
- **Order summary amounts:** DHL shipping and the doctor's fee are `null` in `src/config.ts` (`SHIPPING_FEE_EUR`, `REVIEW_FEE_EUR`) until confirmed, so they read "To be confirmed" and the **total appears only once both are set**. Per-gram prices are placeholders, so the summary carries the "indicative" note.
- Primary nav = **exactly** the 4 problems (Sleep · **Pain & Body Comfort** · Stress & Anxiety · Migraine). No Shop/Products; "How It Works" & "FAQ" deliberately excluded.
- German is the default **and** fallback locale; no `navigator` auto-detect; every string ships DE **and** EN with identical key trees; DE copy uses "Fragebogen", not "Assessment" and the slash gender form (`Nutzer/innen`).
- Austria language rules: never "treats/cures"; "recommended solution" not "prescription"; a prescription is never guaranteed. No leaf/smoke/recreational imagery or language; no strain names up front; product photos only after the assessment (and on the reference `/shop` pages — a tracked compliance tension).
- `PRICES_CONFIRMED` / `COA_CONFIRMED` / `PHONE_VERIFICATION_LIVE` (`src/config.ts`, all `false`) gate every price, every COA-derived claim and the "verified by SMS" behaviour.
- COA / batch / test-date values are **deterministically synthesised**, not real lab data.
- **Every button is `text-base`** (owner request, 2026-09-24), except a few deliberate exceptions listed in `CLAUDE.md`.

## Technical Architecture

- **Client-only SPA.** No server, SSR, API layer or database.
- **Entry:** `index.html` (`lang="de-AT"`, `color-scheme: light`, `noindex,nofollow`, static title/description + OG/Twitter tags, self-hosted-font preloads) → `src/main.tsx` (`StrictMode`; imports `./i18n/config` + `./styles/index.css`) → `src/app/App.tsx` (`<RootErrorBoundary><RouterProvider></RootErrorBoundary>`) → `src/app/router.tsx` → `RootLayout`.
- **Shell:** `Providers` (`AuthProvider › SessionScopedProviders → AssessmentProvider › CartProvider`, keyed by `sessionKey`) wraps `RootLayout`, whose inner `RoutedShell` picks one of **three chromes**: the **marketing** chrome (`SiteHeader` + `SiteFooter`), the **funnel** chrome (`FunnelChrome`, for `isFunnelRoute` paths) or the **dashboard** chrome (`DashboardChrome`, sidebar + tab bar). Always present: skip link, `GradientBackdrop`, `PageReveal` → `<Outlet/>`, `ScrollRestoration`, `ScrollToHash`, `ConsentBanner`.
- **Routing:** `react-router` v7 **data/library mode** (`createBrowserRouter`), all routes under one layout route (dashboard routes nested under `DashboardLayout`). Guards are **in-component** `<Navigate replace>` (no `loader`/`action`/`errorElement`). Indexable public paths are **German slugs** (`/schlafprobleme`, `/schmerzen`, `/stress-angst`, `/migraene-kopfdruck`, `/haeufige-fragen`, `/kosten`, `/kontakt`, `/impressum`, `/datenschutz`, `/agb`, `/cookie-richtlinie`, `/versand`, `/rueckerstattung`, `/labortests`, `/so-funktioniert-wecare`); funnel / shop / dashboard / auth paths stay English (they are `noindex`). Old URLs redirect through `LEGACY_REDIRECTS` (`src/app/paths.ts`). **No route-level code splitting** (single ~832 kB JS chunk).
- **State:** 3 React contexts (auth, assessment, cart) + module singletons (`orders`, `followup`, `review`, `consent`, `age`, `legalGate`, `existingCustomer`), each mirrored to `localStorage`; shipping addresses (with the date of birth) are `sessionStorage`-only; `i18next` holds the language. No global store library.
- **Recommendation** is a pure function (`src/features/assessment/recommendation.ts`) with **no i18n inside** (keys only).
- **Data:** static TS (`src/data/solutions.ts` — 5 Solutions; `src/data/products.ts` — 19 strains + placeholder COA generator) + build-time image globs (`siteImages.ts`, `productImages.ts`). *(A `DispensingOption` type sketch — the target fulfilment model — lives in `CLAUDE.md` / `docs/STRAIN-SOLUTION-MAPPING.md`; re-create it when real pharmacy data lands.)*
- **Seams for real integrations** (each a single module, documented, currently mocked): `src/features/phone/verification.ts` (SMS OTP; flip `PHONE_VERIFICATION_LIVE`), `src/features/payments/payments.ts` (per-method `enabled`), `src/lib/analytics.ts` (`dispatch()`), `RootErrorBoundary.componentDidCatch`, and **visitor country**: `detectVisitorCountry()` (`src/features/delivery/country.ts`) reads a `<meta name="wecare-country" content="AT|DE">` tag if the host writes one from the request IP, and otherwise falls back to browser time zone, then language, then Austria. No geo-IP call is made from the browser (it would send visitor IPs to a third party before consent).
- **SEO:** `usePageTitle` syncs title / description / canonical / robots / OG per route; `src/seo/` holds the indexing gate (`VITE_SEO_INDEXABLE` + a real `VITE_SITE_ORIGIN`) and JSON-LD; `vite.config.ts` generates `robots.txt` + `sitemap.xml` at build and can prerender the 11 indexable routes (see Build & Deployment).
- **Error handling:** `src/app/RootErrorBoundary.tsx` (class) wraps the router — a render error anywhere shows a bilingual recovery screen, not a blank page.

### Stack

| | |
|---|---|
| React 18.3.1 · TypeScript 5.7.2 (strict) · Vite 6.3.5 (pinned by a pnpm override) | |
| Tailwind CSS **v4** (4.1.12) via `@tailwindcss/vite` — **CSS-configured** in `src/styles/index.css`; **no `tailwind.config.js`** and no PostCSS config (the Vite plugin needs none); **light-only** (`color-scheme: light`, no `.dark` block) | |
| shadcn/ui (Radix) — trimmed to `button`, `input`, `label`, `password-input`, `sheet`, `accordion` (+ `utils`) | |
| `react-router` 7.13 · `i18next` 24.2 + `react-i18next` 15.4 · `lucide-react` 0.487 | |
| `class-variance-authority` · `clsx` · `tailwind-merge` (`cn()`), `tw-animate-css` | |
| Build-time only: `@prerenderer/rollup-plugin` + `@prerenderer/renderer-puppeteer` (**`puppeteer` pinned to 21.11.0** — newer versions fail the prerender) | |
| pnpm (single-package workspace); `onlyBuiltDependencies`: `@tailwindcss/oxide`, `esbuild`, `puppeteer` | |

### Integrations

**None wired.** No auth provider, SMS provider, payment provider, analytics vendor, error reporter, email, storage/CDN, or medical/pharmacy API. The seams above are documented and EU-region-required. Footer DHL mark is a static image; card / social / app-store marks were removed.

## Project Structure

```
src/
├── main.tsx                 # entry (StrictMode; imports i18n + styles)
├── config.ts                # SUPPORT_EMAIL · PRICES_CONFIRMED · COMMERCE_ENABLED · COA_CONFIRMED
│                            #   · PHONE_VERIFICATION_LIVE · SHIPPING_FEE_EUR · REVIEW_FEE_EUR
├── app/
│   ├── App.tsx              # <RootErrorBoundary><RouterProvider>
│   ├── RootErrorBoundary.tsx# app-wide render-error fallback (bilingual)
│   ├── router.tsx           # all routes (createBrowserRouter)
│   ├── paths.ts             # route constants, LEGACY_REDIRECTS, funnel-route helpers, PRIMARY_NAV
│   ├── Providers.tsx        # Auth › session-scoped (Assessment › Cart)
│   ├── usePageTitle.ts      # <title> / description / canonical / robots / OG sync
│   └── components/
│       ├── ui/              # shadcn primitives (button, input, label, password-input, sheet, accordion, utils)
│       └── figma/ImageWithFallback.tsx
├── components/
│   ├── brand/               # Logo, AssessmentRing (signature), SolutionMark
│   ├── layout/              # RootLayout, SiteHeader, SiteFooter, FooterIcons, LanguageToggle, ScrollToHash,
│   │                        #   ConsentBanner, FunnelChrome (funnel shell + progress line + legal footer)
│   └── marketing/           # Section, Reveal, PageReveal, PageShell, PageHeader, PhotoTile, MedicalNotice,
│                            #   GradientBackdrop, FloatingChip, InfoHint, InfoTile, NextSteps, PromptCard,
│                            #   RotatingWord, OrbitRings, DeliveryMap (AT/DE), DeliveryConfirmation, ComboCard
├── features/                # client state / logic (mock stores mirrored to localStorage)
│   ├── assessment/          # questions, recommendation (pure), steps, exclusions, existingCustomer, AssessmentContext
│   ├── auth/                # AuthContext (MOCK, phoneVerified), returning
│   ├── cart/CartContext.tsx           # grams; lineCount badge
│   ├── conditions/conditions.ts       # the 4 ConditionKeys + icons
│   ├── review/review.ts               # MOCK medical-review store (6 statuses)
│   ├── age/age.ts                     # 18+/DOB gate (device-level)
│   ├── legal/legalGate.ts             # legal-consent gate (device-level)
│   ├── consent/                       # consent store + useConsent
│   ├── orders/orders.ts               # MOCK orders; address + DOB in sessionStorage only
│   ├── followup/followup.ts           # step-6 check-in
│   ├── payments/payments.ts           # payment-method model + provider seam
│   ├── phone/verification.ts          # SMS-verification seam (preview until PHONE_VERIFICATION_LIVE)
│   └── delivery/                      # delivery.ts (AT/DE postcodes, regions), country.ts (visitor country)
├── data/
│   ├── solutions.ts         # 5 named Solutions (user-facing layer)
│   ├── products.ts          # 19 real strains + placeholder COA generator
│   ├── siteImages.ts        # marketing photo glob + IMG map
│   └── productImages.ts     # product photo glob (NFC filename lookup)
├── lib/                     # analytics.ts (consent-gated track() seam), format.ts, image.ts
├── seo/                     # config.ts (indexing gate, canonical, robots), StructuredData.tsx (JSON-LD)
├── pages/                   # one folder/file per route or route group
│   ├── HomePage.tsx + home/sections.tsx   (9 sections)
│   ├── conditions.tsx + conditions/ConditionLandingPage.tsx  (shared template ×5)
│   ├── assessment.tsx + assessment/  (AssessmentEnginePage + StepFrame, OptionTile, ExistingCustomerStep,
│   │                                  AgeGate, LegalConsentGate, PostcodeStep, QuestionStep, ExclusionStep,
│   │                                  ReviewStatusPage; ResultPage + MedicalReviewFormPage are redirects)
│   ├── shop/ (ShopIndex, Product, Cart, Checkout, PhoneVerification, OrderConfirmation, SolutionRedirect)
│   ├── dashboard/ (DashboardLayout, DashboardChrome, DashboardTabBar, nav.ts, ui.tsx, pages.tsx)
│   ├── legal/LegalPage.tsx
│   ├── content.tsx (ContactPage — real)
│   └── FaqPage, CostsPage, HowItWorksPage, LabTestsPage, LoginPage, NotFoundPage
├── i18n/
│   ├── config.ts            # de default + fallback, en toggle; 9 namespaces
│   ├── useLanguage.ts
│   └── locales/{de,en}/*.json   # common, home, conditions, assessment, dashboard, shop, faq, costs, legal
└── styles/
    ├── index.css            # THE design system (tokens, base, components, utilities) — light-only
    └── fonts.css            # @font-face for the self-hosted brand faces
```

## Design & UX

- **Single source of truth:** `src/styles/index.css` (Tailwind v4, `@theme` + `:root` + `@layer` + utility classes). No `tailwind.config.js`. **`:root` is `color-scheme: light` only — dark mode was removed (owner decision, Sept 2026).**
- **Colour:** `petrol-*` = the Azure teal ramp (`#218390` primary, `#0d444b` dark) for brand/trust/medical UI + CTA; `sage-*` = Light Green for secondary/progress/"answered"; `danger-*` = functional error red only; `sky-*` = a soft blue companion for gradients/orbs. No warm/amber accent.
- **Type:** Figtree (body/UI), Schibsted Grotesk → Figtree (headings) — both OFL, **self-hosted** from `public/fonts/` (no Google Fonts request); Batangas → Figtree (accents, **not loaded**); system monospace (verified data only).
- **Language:** liquid-glass surfaces (`.glass` / `.glass-strong`), a fixed blue page gradient + drifting colour orbs, full-pill buttons (all `text-base`), a soft Azure→cyan `cta` gradient, `--radius: 20px`.
- **Assessment layout** (modelled on quick-green's onboarding, rebuilt in WeCare's own design and copy): every step uses `StepFrame` (eyebrow, big centred title, one-line subtitle) and `OptionTile` (large tile with a radio/check circle on the right); a thin progress line sits under the funnel header; on a phone the Start over / Back / Next bar is pinned to the very bottom of the screen and the footer is hidden.
- **Motion is quiet:** a route-transition reveal (`PageReveal`, replays per pathname), a scroll-in reveal (`Reveal`), a 250 ms glass hover-lift, a slow orb drift, the rotating hero word, and the Assessment Ring's one sanctioned arc-sweep on load. The hero photo/ring do not drift; the info chips rise in then gently bob. Everything respects `prefers-reduced-motion`. Dashboard / shop / cart / checkout / login stay static.
- **Accessibility:** a skip-to-content link, semantic landmarks, ARIA on interactive/decorative elements, `role="progressbar"`, `<fieldset>`/`<legend>` groups, focus-visible rings, 3:1 contrast on the option-tile radio circles. **Target assumed WCAG 2.2 AA — not audited** (see spec §13.5 / §20-U2).

## Development Setup

**Prerequisites:** Node (≥ 20 recommended) and **pnpm**.

```bash
pnpm install     # first run; native builds (@tailwindcss/oxide, esbuild, puppeteer) are allowlisted in package.json
```

## Environment Variables

Consumed at build/runtime: `import.meta.env.DEV` (in `src/lib/analytics.ts`) and the SEO
variables below (read by `vite.config.ts` and `src/seo/config.ts`). `.env.example`
documents all of them, including the seams for the decided-but-not-wired
integrations — copy to `.env.local`:

| Var | Purpose |
|---|---|
| `VITE_SITE_ORIGIN` | canonical URLs, sitemap, OG tags (owner decision D20). While it is the placeholder `https://wecare.example`, the site stays `noindex`. |
| `VITE_SEO_INDEXABLE` | the **indexing gate**. The whole site stays `noindex` unless this is exactly `true` in production **and** `VITE_SITE_ORIGIN` is a real domain. Never flip it without product-owner + Austrian legal approval. |
| `VITE_ORG_LEGAL_NAME` | real registered company name; empty → the `Organization` JSON-LD is omitted (placeholder company data is never indexed) |
| `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | PostHog EU analytics — wire `dispatch()` in `analytics.ts` (D17) |
| `VITE_ERROR_DSN` | GlitchTip / Sentry-compatible error reporting — wire `componentDidCatch()` in `RootErrorBoundary.tsx` (D19) |

`src/config.ts` holds the hard-coded switches: `SUPPORT_EMAIL`, `PRICES_CONFIRMED = false`,
`COMMERCE_ENABLED` (= `PRICES_CONFIRMED`), `COA_CONFIRMED = false`,
`PHONE_VERIFICATION_LIVE = false`, and `SHIPPING_FEE_EUR` / `REVIEW_FEE_EUR` (both `null`
until confirmed). All future hosting + sub-processors must be **EU/EEA region** (owner decision D16).

## Running the Project

```bash
pnpm dev         # Vite dev server on http://localhost:5173
pnpm build       # production build to dist/  — NOTE: does NOT typecheck
pnpm preview     # serve the production build locally
pnpm typecheck   # tsc --noEmit (strict) — run this separately; currently green
PRERENDER=true pnpm build   # also prerenders the 11 indexable routes (~45 s; uses puppeteer)
```

## Testing

**No test suite, no test runner, no lint config.** (A Vitest setup existed briefly and
was dropped; there is no ESLint/Prettier config and no CI.) `pnpm typecheck` +
`pnpm build` are the only automated checks. Recommended first tests: `recommendation.ts`
(pure, high-value), the postcode / country helpers in `delivery.ts`, `normalizePhone`, the
route-guard / redirect behaviour, and the age-gate / consent-gate logic.

## Build & Deployment

`pnpm build` emits a static SPA to `dist/`. **No deployment configuration exists**
(no `netlify.toml` / `vercel.json` / `Dockerfile` / `_redirects`). Any host must provide
SPA history fallback (serve `index.html` for unknown paths) and be **EU-region**.

- **`robots.txt` and `sitemap.xml` are generated at build** by `seoAssetsPlugin` in
  `vite.config.ts`. Default = `Disallow: /` and an empty sitemap; once the indexing gate is
  open (`VITE_SEO_INDEXABLE=true` + a real `VITE_SITE_ORIGIN`) they allow the site and list the
  11 indexable routes. `public/robots.txt` is only the dev-safe fallback.
- **Prerender:** the go-live build (gate open) — or `PRERENDER=true` — writes real static HTML for
  the 11 indexable routes into `dist/<route>/index.html`. Automated browsers (including the
  prerender) are treated as Austria, so the static HTML always carries the Austria delivery map.
- **Before indexing:** replace the SPA redirects in `LEGACY_REDIRECTS` with **host-level 301s**;
  swap in the real origin and OG image (`public/banner.png` shows a person and a retired score pill).
- **Country by IP (owner request):** the host / edge should resolve the visitor's country from the
  request IP and write `<meta name="wecare-country" content="AT">` (or `DE`) into the served HTML;
  the frontend already reads it. Mind caching — HTML shared across countries would show the wrong
  map, and the prerendered pages are static, so the tag must be added per request.

## Documentation

- **[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** — full discovery & requirements document (as of 2026-09-02; see the note at the top).
- **[`docs/BUSINESS-FLOW.md`](docs/BUSINESS-FLOW.md)** — plain-language end-to-end flow brief for the conversion brainstorm: what's real vs. mock at each step, the open decisions (D-A…D-F) and who must sign off.
- **[`docs/BACKEND-ARCHITECTURE.md`](docs/BACKEND-ARCHITECTURE.md)** — product-owner backend direction (EU residency, the medical-review flow, MVP services, entities) **plus a handoff table** of what the backend / host must provide for the 2026-09-24 frontend work (IP → country tag, Germany, SMS, payments, order amounts).
- **[`docs/FUNNEL-RESEQUENCE-PO-DECISIONS.md`](docs/FUNNEL-RESEQUENCE-PO-DECISIONS.md)** and **[`docs/FUNNEL-RESEQUENCE-PAYMENT-BLOCKERS.md`](docs/FUNNEL-RESEQUENCE-PAYMENT-BLOCKERS.md)** — the pay-at-checkout decision log and the three blockers (payment provider, real pricing, counsel ruling).
- **[`docs/SEO-FOUNDATION.md`](docs/SEO-FOUNDATION.md)** — Austrian SEO audit, keyword architecture, indexing gate, go-live checklists.
- **[`docs/STRAIN-SOLUTION-MAPPING.md`](docs/STRAIN-SOLUTION-MAPPING.md)** — provisional strain→Solution mapping audit + PO decision sets 3-4.
- **[`docs/CLAIM-LANGUAGE-REVIEW.md`](docs/CLAIM-LANGUAGE-REVIEW.md)** — inventory of every effect / comparative / suitability claim for counsel; **[`docs/UX-AUDIT-2026-09-04.md`](docs/UX-AUDIT-2026-09-04.md)** — the UX audit; **[`docs/COMPETITOR-QUICK-GREEN.md`](docs/COMPETITOR-QUICK-GREEN.md)** — the quick-green.com funnel teardown.
- **`docs/superpowers/`** — design specs and implementation plans for the quick-green UX polish and the funnel re-sequence.
- **`CLAUDE.md`** — working notes: scope, copy rules, architecture, and the running log of owner decisions/overrides (D1-D26, decision sets 3-5, and the 2026-09-24 sections). Read before changing IA or copy.
- **`ATTRIBUTIONS.md`** — licence credits (shadcn/ui, Unsplash). Per-folder `README.md` files under `src/assets/*`.
- **Missing / to add:** the upstream briefs `WeCare_CLI_Implementation_Prompt.md` and `WeCare Website Structure.md` (referenced by `CLAUDE.md`, not in repo).

## Known Limitations

- **No backend.** Auth (any email; password required but ignored), the SMS verification (a preview: nothing is sent, any 6 digits pass), the medical review (a 6-status `localStorage` mock, no email), payments, order fulfilment and COA data are mock/placeholder; state is browser-local and is cleared on sign-out / account switch.
- Product genetics, prices, origin, irradiation and **all COA/batch/test-date values are placeholders** (`getProductCoa` synthesises them). The order summary shows placeholder €/g prices labelled "indicative"; **DHL shipping and the doctor's fee are "To be confirmed"** and there is **no total** until both are set.
- **Only wire transfer works** at checkout; credit card, Apple Pay and crypto are shown greyed out ("Available soon"). The submit button still reads "Submit my request" because no payment is taken.
- **Germany is only partly supported:** the map, postcode step and checkout country accept it, but `isServiceableAt()` accepts any valid postcode (no coverage data), there are no German regions, and the shipping / terms / imprint texts are Austria-only. The VAT sentence in the summary is a German-law provision (§ 4 No. 14 a UStG) on an Austrian-market shop — needs counsel.
- The **visitor country** falls back to time zone / language until the host provides the `wecare-country` tag; the manual AT/DE switch covers a wrong guess.
- **Open compliance point:** the diagnose/treat checkbox was removed at checkout on the owner's premise that "page 1 confirms it"; page 1 (the legal-consent gate) carries Terms + Privacy but not that sentence. Add it there (counsel to word it) or restore the checkbox.
- The medical-review touchpoint is a status page driven by a mock store — no doctor queue, no notifications, no real turnaround; no "instant prescription" claim appears anywhere in the copy.
- The **18+/DOB gate** is device-local and self-reported — **not** identity verification, and its legal sufficiency is unconfirmed (see spec §20-L3); checkout's date of birth is re-validated client-side only.
- The 6 legal documents are **unreviewed draft text** with obviously-provisional entity facts. There is a per-category consent banner but **not** a real consent-management platform.
- Analytics: a `track()` seam is wired at every funnel event and gated on consent, but **no vendor is connected** — `dispatch()` is empty.
- `/kontakt` is a real page (support email + hours + `mailto:` form) using the placeholder `SUPPORT_EMAIL`; there is no server handler.
- Order `status` values `shipped` / `delivered` are never set by the app; the dashboard delivery tracker states outright that real courier tracking is not connected.
- Checkout form input is **not** persisted (leaving the page loses the entered address); the profile persists name, phone, address and photo.
- No **route-level** error boundary or code splitting (single ~832 kB JS chunk); `RootErrorBoundary` only `console.error`s (GlitchTip not wired).
- Large unoptimised PNG photography (no WebP/AVIF, no `srcset`) — deliberately deferred.
- **Repo state (2026-09-24):** the trunk is **`main`** and now contains all work up to commit `9dc44e6`; the older feature branch `audit-fixes` and the stale initial-commit-only `master` can be deleted.

## Open Questions

Prioritised in `docs/DESIGN-SPECIFICATION.md` §20 (older) and `CLAUDE.md`. Probable blockers:

- **Backend** model for auth (phone vs email as the canonical identity, real DOB capture), SMS OTP, the medical-review workflow (is the doctor's decision really instant?), payments (PSP for card / Apple Pay, a crypto processor, wire-transfer references), orders/fulfilment, Germany (coverage, prices, VAT, rates) and a real product/COA/pricing data source — see the handoff table in `docs/BACKEND-ARCHITECTURE.md`.
- **Numbers from the owner:** the DHL shipping cost and the doctor's fee.
- Legal: real entity data + counsel review (incl. Germany); the **full Austrian medicine/cannabis advertising review** across all customer-facing copy (hard blocker); the **medicines-law vs. tobacco-monopoly** basis for the flower checkout (hard blocker); the VAT wording; age-gate and consent-gate legal sufficiency; where the diagnose/treat statement should live; a real consent-management platform (hard blocker for public launch with tracking).
- SEO go-live: real origin, host-level 301s, the indexing gate (`VITE_SEO_INDEXABLE`) opened only after documented approval.
- Procurement: company-owned PostHog EU / GlitchTip / Usercentrics accounts, an SMS provider and a payment provider, then wire the seams.
- Engineering hygiene: ESLint/Prettier, a test setup, `build` gated on `typecheck`, CI, deployment config, EU-region hosting.
- A mobile real-device QA pass (mandatory pre-launch per the PO).

## Development Readiness

**READY WITH CONDITIONS** (front-end); **NOT READY** for a production build. The front-end is coherent, typechecks, builds, uses one (light-only) design system, has an error boundary + a consent gate + an analytics seam + mock SMS / payment / medical-review flows, and its behaviour is documented — frontend polish/feature work can continue against `CLAUDE.md`. It is **not** ready for a production build until the backend, legal/compliance, procurement, pricing and engineering-hygiene items above are resolved.

## Change Log

| Date | Change |
|---|---|
| 2026-09-24 | **Changes matrix + the owner's corrections.** Checkout: SMS phone verification replaces email + password (honest preview), delivery fields in the requested order incl. birthday (18+) and email, "Checkout" title; a right-hand **order summary** (product, grams × €/g, DHL shipping, subtotal, doctor's fee, total, VAT sentence) with a **payment-method** section (wire transfer live; card / Apple Pay / crypto disabled) and the Terms + Privacy box; the diagnose/treat checkbox removed. Product page: cross-sell modal removed, **alternative product as a full card**. Assessment redesigned on the quick-green pattern (StepFrame / OptionTile, new "Already with WeCare?" first step, thin progress line, minimal legal footer), question 6 auto-advances, and the action bar is pinned to the bottom on phones. **Germany:** delivery map with an AT/DE switch, 5-digit postcodes, checkout country dropdown, and a host `wecare-country` tag hook. Homepage problem cards now use a white corner arrow; every button is `text-base`. Unused files removed (`public/README.md`, `postcss.config.mjs`, a `.gitkeep`); backend handoff logged in `docs/BACKEND-ARCHITECTURE.md`. |
| 2026-09-14 | Result + Product merged into one screen (owner request); legal-consent gate before the assessment; catalogue-style product hero; product photos returned to the shop grid and cart (a tracked compliance tension). |
| 2026-09-09 | **Dashboard consolidation:** 7 areas → 5 (Overview, My Orders, Follow-up, Support, Profile; 3 primary tabs), delivery card moved to My Orders, editable address on the profile; sticky continue bar on the question steps. |
| 2026-09-08 | **Funnel re-sequence:** questions → product → checkout → done in a standalone `FunnelChrome` shell; the safety questions folded into the assessment pass; cart / checkout / confirmation moved to top-level routes and opened to signed-out visitors. |
| 2026-09-04 | UX polish and the 14-point commerce/legal ratification (`COMMERCE_ENABLED`, no fabricated certainty, blanked legal dates, real support email), final-tone copy pass, claim-language inventory for counsel. |
| 2026-09-03 | **SEO foundation:** German slugs + `LEGACY_REDIRECTS`, per-route head management, JSON-LD, generated `robots.txt` / `sitemap.xml`, optional prerender, the `VITE_SEO_INDEXABLE` gate; quick-green UX polish (auto-advance, postcode step); PO decision set 5. |
| 2026-09-02 (later) | Stakeholder checkout/flow feedback (WhatsApp — Mischa/Ilay). Safe fixes applied: checkout no longer re-asks the email; the order-confirmation page reads as a positive 3-step status; `/login` gained a confirm-password field. Held for the brainstorm: removing / instant-ifying the medical review before purchase, credit-card payment, showing the review fee upfront, guest checkout. |
| 2026-09-02 | Discovery re-pass against branch `audit-fixes` @ `0958279`. Rewrote `docs/DESIGN-SPECIFICATION.md` and this README to current reality: dark mode removed; the medical-review flow rebuilt as `ReviewStatusPage` (D3, 6-status mock); 18+/DOB age gate (D14 + set 4); per-category consent banner + consent-gated analytics seam; app-wide error boundary; self-hosted fonts; desktop dashboard app-shell; `/contact` a real page; `PRICES_CONFIRMED` / `COA_CONFIRMED` gating; DE "Fragebogen" rename; "Pain & Body Comfort". |
| 2026-08-31 | **Light / Dark appearance** implemented (later removed). Pre-development discovery pass: added `docs/DESIGN-SPECIFICATION.md`; expanded this README. |
| (earlier) | Rebuild phases 1-10 + client-guideline pass + owner overrides + the `audit-fixes` pass (WC-01…25) + PO decision briefs D1-D26 + sets 3-4 — see `CLAUDE.md` and `git log`. |
