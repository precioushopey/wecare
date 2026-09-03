# WeCare

A German/Austrian‑market **digital health platform for medical cannabis**, built
**problem‑first** (Sleep · Pain & Body Comfort · Stress & Anxiety · Migraine). A
short guided self‑assessment leads to one or two recommended "Solutions" and then
to a **medical‑review** step; the doctor / prescription / pharmacy layer is
required but sits **behind** the assessment, never in front of it.

> **Status: front‑end prototype.** There is **no backend.** Authentication, the
> medical review, payments, order fulfilment and lab (COA) data are **mocked or
> placeholder**; all state lives in the browser (`localStorage`).
> `noindex, nofollow` + `robots.txt: Disallow: /` are set until launch.

The full requirements & design analysis is in
**[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** (rewritten
2026‑09‑02 to match the current codebase). `CLAUDE.md` is the working notebook of
scope, copy rules and the running log of product‑owner decisions and is
effectively a second source of truth. Two upstream briefs
(`WeCare_CLI_Implementation_Prompt.md`, `WeCare Website Structure.md`) are
referenced by `CLAUDE.md` but are **not in this repo** — they should be added to
`docs/`.

---

## Overview

| | |
|---|---|
| **What it is** | Marketing site + guided assessment (+ 18+/DOB gate) + recommendation + medical‑review status flow + Solution/COA pages + a mock cart/checkout + a signed‑in "My area" dashboard, fully bilingual (DE default, EN toggle). |
| **Market** | Austria first (`de-AT`, EUR, DHL, Austrian legal framework); Germany implied. |
| **Origin** | Reskinned from an unrelated Figma Make export; the demo code has been stripped phase by phase, the Vite + React + Tailwind v4 + shadcn/ui substrate kept. |
| **Not a production system** | Built for stakeholder validation and as a front‑end baseline for a real build. |

## Objectives

1. Problem‑first entry — nav and homepage lead with the 4 problems, never "prescription/treatment".
2. A ~60–90‑second, 6‑question assessment replaces catalogue browsing.
3. Never imply everyone gets a prescription; new users are never led with the stronger option; every recommendation routes through a medical review.
4. Full DE/EN parity for every string, including dynamic content (all DE copy says **"Fragebogen"**, not "Assessment").
5. One signature visual device (the **Assessment Ring**); quiet motion; a liquid‑glass + blue‑gradient brand language. **Light‑only** (a dark theme was built then removed — owner decision).
6. Commerce exists but is never in the primary nav (reachable only post‑assessment / footer / dashboard); checkout is auth‑gated.
7. A visible legal/compliance surface (6 legal drafts, COA/lab‑tests, checkout disclaimer, 18+/DOB gate) — and nothing fabricated is presented as real (`PRICES_CONFIRMED` / `COA_CONFIRMED` flags gate every price and lab claim).

## Scope

- **In scope (built / partial):** homepage (9 sections), 4 problem landing pages (+ hidden General Wellness), 18+/DOB age gate, assessment engine, recommendation logic, result page, **medical‑review status page** (`/assessment/review`, 6‑status mock model), 5 Solution detail pages + dispensing‑options accordion + gated COA, shop index, cart, **auth‑gated** mock checkout + order + confirmation, mock login, dashboard (7 views, desktop sidebar app‑shell + mobile app‑bar/tab‑bar), 6 legal draft documents, gated lab‑tests page, FAQ page, costs page, real `/contact` page, 404, redirects, a per‑category consent banner, a consent‑gated analytics seam, an app‑wide error boundary, `robots.txt` / `sitemap.xml` / `.env.example`.
- **Out of scope (deliberate — do not re‑add):** real backend/auth/payment/medical‑review integration; CBD Flowers/Hash/Vapes/Aroma Pebbles as products; `/about` `/careers` `/providers`; Knowledge Hub; **dark theme** (built Aug 2026, fully removed Sept 2026); a 6th Solution; any leaf/smoke/dispensary imagery or recreational language.
- **Not yet real (launch tasks):** a backend for every mocked capability; real product/COA/pricing/review‑fee data; a real consent‑management platform (Usercentrics — the banner + gate are in place); a wired analytics vendor (PostHog EU — the seam is in place, `dispatch()` is empty); a wired error reporter (GlitchTip); real legal entity data + counsel review; Austria prescription‑advertising review; real payment methods; image optimisation; ESLint/Prettier; tests; CI; deployment config; a mobile real‑device QA pass.

## Target Users

- **Prospective patient (anonymous)** — adult in DE/AT with a sleep/pain/stress‑anxiety/migraine concern; problem‑aware, product‑unaware. Passes the 18+/DOB gate before the assessment. The whole flow is designed for them.
- **Returning patient (authenticated, mock)** — uses "My area" (`/dashboard/*`) for the journey stepper, assessment recap, recommendation, review status, orders, follow‑up, support, editable profile.
- **Unsure visitor** — routed to the hidden **General Wellness** page (from the 404 and the assessment‑start default only).
- Doctor / pharmacy roles are referenced in copy + a mock status enum only — **no UI, no integration.**

## Key Features

| Feature | Status |
|---|---|
| Global header (4 problem links + language + conditional cart + Login/"My area" + CTA) + dark footer + skip link | Implemented |
| Homepage (9 sections; rotating hero problem word) | Implemented |
| 4 problem landing pages from one shared template + hidden General Wellness | Implemented |
| 18+ / date‑of‑birth **age gate** before the assessment (device‑local, self‑reported) | Implemented (legal sufficiency TBD) |
| 6‑question assessment engine (single page, resumable, `?problem=` pre‑fill, per‑option hints) | Implemented |
| Deterministic recommendation (fixed primary/secondary per problem, "Advanced option" & "start gentle" flags, always requires medical review) | Implemented |
| Result page (summary + one dominant primary card + quiet alternative link + D1 personalisation copy + consolidated disclaimer panel) | Implemented |
| **Submit for medical review** → **review status page** (6 statuses: submitted / inReview / infoRequired / approved / notApproved / consultation) | **Mock** (`localStorage`, no backend, no email) |
| 5 Solution detail pages (why/usage/suitability/format/ingredients + provisional oil formulation + dispensing‑options accordion + gated COA + FAQ + single "Add to cart") | Implemented (data partly placeholder) |
| Shop index (5 Solution cards, no filters, not in nav) | Implemented |
| Cart (grams, `SolutionId`‑keyed, persistent; `lineCount` badge) | Implemented |
| Checkout (**auth‑gated**; customer + shipping + payment method + 2 required confirmations) → mock order → confirmation | **Mock** (no real payment; invoice / bank transfer only) |
| Mock auth (any email) + editable profile (name/phone) + dashboard (7 views, desktop sidebar app‑shell + mobile app‑bar/tab‑bar, journey stepper, delivery card) | **Mock** |
| Follow‑up check‑in | Implemented |
| 6 legal draft documents + gated lab‑tests page + FAQ page + costs page + real `/contact` page | Implemented (legal = **unreviewed draft** with provisional entity data) |
| Per‑category consent banner (Essential locked + Analytics toggle) + consent‑gated analytics seam | Implemented (**not a real CMP; no vendor wired**) |
| App‑wide React error boundary (bilingual fallback) | Implemented |
| i18n (DE default + fallback, EN toggle, locale date/currency, "Fragebogen") | Implemented |
| Assessment Ring, Journey Stepper, gradient backdrop, liquid‑glass surfaces, entrance motion | Implemented |
| Self‑hosted brand fonts (zero request to `fonts.gstatic.com`) | Implemented |
| Light / **Dark** appearance + toggle | **Removed** (built Aug 2026, fully removed Sept 2026 — owner decision; light‑only) |

See `docs/DESIGN-SPECIFICATION.md` §10 for the full feature inventory with IDs, dependencies and 7 explicit `REMOVED` entries.

## User Roles

One real authorization boundary: **authenticated vs. not**, gating `/dashboard/*` **and** `/shop/checkout`.

| Role | Become it | Access |
|---|---|---|
| Anonymous | default | Everything except `/dashboard/*` and `/shop/checkout` (→ redirected to `/login` with a return path; checkout also carries `reason: "checkout"`). |
| Authenticated (mock) | submit **any non‑empty email** at `/login` (password `required minLength={8}` but ignored); session in `localStorage:wecare.auth` | Everything, incl. `/dashboard/*` and checkout. Editable profile (name, phone). |
| Doctor / Pharmacy / Admin | — | **not modelled** |

> On sign‑out and on a **different‑email** sign‑in, `wecare.assessment` / `cart` / `orders` / `followup` / `review` are cleared (a first sign‑in from anonymous is not cleared). `wecare.language` / `wecare.consent` / `wecare.ageConfirmed` are device preferences and are kept.

## User Flows

Detailed flows with Mermaid diagrams are in `docs/DESIGN-SPECIFICATION.md` §8:
first‑time visitor → age gate → completed assessment → recommendation → **submit
for medical review** · returning user · mock auth + dashboard/checkout gate ·
cart → **auth‑gated** checkout → mock order · follow‑up check‑in · redirects &
dead ends · render‑error recovery.

## Requirements

Functional (`FR‑001…040`), non‑functional (`NFR‑001…013`), user stories
(`US‑001…020`), business rules (`BR‑001…049`) and acceptance criteria
(`AC‑1…15`, Given/When/Then) are in `docs/DESIGN-SPECIFICATION.md` §6–§8, §11, §18.

## Business Rules

Full list in `docs/DESIGN-SPECIFICATION.md` §11. Highlights:

- The **primary** recommended Solution is fixed per problem and never changes with severity or experience (`recommendation.ts`). **Q2 (frequency) and Q6 (format preference) do not change the match** — they personalise the Result copy only (owner decision D1).
- **Every** recommendation always requires a medical review; no Solution is ever sold directly. The Result CTA **creates a mock `MedicalReview` and routes to `/assessment/review`**.
- The 18+/DOB **age gate** must be passed once per device before the assessment engine renders (device‑local, self‑reported — not identity verification).
- **Checkout requires authentication.** "Place order" is disabled until **both** the Terms and the "not intended to diagnose, treat, cure or prevent disease" checkboxes are ticked; delivery fee = €0; payment method is invoice / bank transfer only (owner decision D7).
- Primary nav = **exactly** the 4 problems (Sleep · **Pain & Body Comfort** · Stress & Anxiety · Migraine). No Shop/Products; "How It Works" & "FAQ" deliberately excluded.
- German is the default **and** fallback locale; no `navigator` auto‑detect; every string ships DE **and** EN with identical key trees; DE copy uses "Fragebogen", not "Assessment".
- Austria language rules: never "treats/cures"; "recommended solution" not "prescription"; a prescription is never guaranteed. No leaf/smoke/recreational imagery or language; no product/strain photos before the assessment.
- `PRICES_CONFIRMED` / `COA_CONFIRMED` (`src/config.ts`, both `false`) gate every price and every COA‑derived claim — while `false`, prices carry an "indicative" note and the COA is a plain "you'll get a real batch certificate" line.
- COA / batch / test‑date values are **deterministically synthesised**, not real lab data.

## Technical Architecture

- **Client‑only SPA.** No server, SSR, API layer or database.
- **Entry:** `index.html` (`lang="de"`, `color-scheme: light`, `noindex,nofollow`, static title/description + OG/Twitter tags, self‑hosted‑font preloads) → `src/main.tsx` (`StrictMode`; imports `./i18n/config` + `./styles/index.css`) → `src/app/App.tsx` (`<RootErrorBoundary><RouterProvider></RootErrorBoundary>`) → `src/app/router.tsx` → `RootLayout`.
- **Shell:** `Providers` (`AuthProvider › SessionScopedProviders → AssessmentProvider › CartProvider`, keyed by `sessionKey`) → skip link + `GradientBackdrop` + (`SiteHeader` unless dashboard) + `<main>` (`PageReveal` → `<Outlet/>`) + (`SiteFooter` unless dashboard) + `ScrollRestoration` + `ScrollToHash` + (`DashboardTabBar` if dashboard) + `ConsentBanner`.
- **Routing:** `react-router` v7 **data/library mode** (`createBrowserRouter`), all routes under one layout route (dashboard routes nested under `DashboardLayout`). Guards are **in‑component** `<Navigate replace>` (no `loader`/`action`/`errorElement`). **No route‑level code splitting** (single ~763 kB JS chunk).
- **State:** 3 React contexts (auth, assessment, cart) + 5 module singletons (`orders`, `followup`, `review`, `consent`, `age`), each mirrored to `localStorage`; `i18next` holds the language. No global store library.
- **Recommendation** is a pure function (`src/features/assessment/recommendation.ts`) with **no i18n inside** (keys only).
- **Data:** static TS (`src/data/solutions.ts` — 5 Solutions; `src/data/products.ts` — 19 strains + placeholder COA generator) + build‑time image globs (`siteImages.ts`, `productImages.ts`). *(A `dispensing.ts` `DispensingOption` type sketch — the target fulfilment model — was removed in the 2026‑09‑02 cleanup; the field list lives in `CLAUDE.md` / `docs/STRAIN-SOLUTION-MAPPING.md`, re‑create it when real pharmacy data lands.)*
- **Error handling:** `src/app/RootErrorBoundary.tsx` (class) wraps the router — a render error anywhere shows a bilingual recovery screen, not a blank page.

### Stack

| | |
|---|---|
| React 18.3.1 · TypeScript 5.7.2 (strict) · Vite 6.3.5 | |
| Tailwind CSS **v4** via `@tailwindcss/vite` — **CSS‑configured** in `src/styles/index.css`; **no `tailwind.config.js`**; `postcss.config.mjs` is empty; **light‑only** (`color-scheme: light`, no `.dark` block) | |
| shadcn/ui (Radix) — trimmed to `button`, `input`, `label`, `sheet`, `accordion` (+ `utils`) | |
| `react-router` 7.13 · `i18next` 24.2 + `react-i18next` 15.4 · `lucide-react` 0.487 | |
| `class-variance-authority` · `clsx` · `tailwind-merge` (`cn()`), `tw-animate-css` | |
| pnpm (single‑package workspace); `onlyBuiltDependencies`: `@tailwindcss/oxide`, `esbuild` | |

### Integrations

**None wired.** No auth provider, payment provider, analytics vendor, error
reporter, email, storage/CDN, or medical/pharmacy API. The analytics
`dispatch()` (PostHog EU) and the error‑boundary `componentDidCatch` (GlitchTip)
are documented, EU‑region‑required seams. Footer DHL mark is a static image;
payment/social/app‑store marks were removed.

## Project Structure

```
src/
├── main.tsx                 # entry (StrictMode; imports i18n + styles)
├── config.ts                # SUPPORT_EMAIL · SITE_ORIGIN · PRICES_CONFIRMED · COA_CONFIRMED (all placeholder)
├── app/
│   ├── App.tsx              # <RootErrorBoundary><RouterProvider>
│   ├── RootErrorBoundary.tsx# app-wide render-error fallback (bilingual)
│   ├── router.tsx           # all routes (createBrowserRouter)
│   ├── paths.ts             # route path constants + PRIMARY_NAV (the 4 problems)
│   ├── Providers.tsx        # Auth › session-scoped (Assessment › Cart)
│   ├── usePageTitle.ts      # <title> + <meta description> sync
│   └── components/
│       ├── ui/              # shadcn primitives (button, input, label, sheet, accordion, utils)
│       └── figma/ImageWithFallback.tsx
├── components/
│   ├── brand/               # Logo, AssessmentRing (signature), SolutionMark
│   ├── layout/              # RootLayout, SiteHeader, SiteFooter, FooterIcons,
│   │                        #   LanguageToggle, ScrollToHash, ConsentBanner
│   └── marketing/           # Section, Reveal, PageReveal, JourneyStepper, MedicalNotice,
│                            #   GradientBackdrop, FloatingChip, InfoHint, RotatingWord,
│                            #   OrbitRings, AustriaMap, ComboCard
├── features/                # client state (each mirrored to localStorage)
│   ├── assessment/          # questions.ts, recommendation.ts (pure), AssessmentContext.tsx
│   ├── auth/AuthContext.tsx           # MOCK (any email); editable name/phone; session-scoped clears
│   ├── cart/CartContext.tsx           # grams; lineCount badge
│   ├── conditions/conditions.ts       # the 4 ConditionKeys + icons
│   ├── review/review.ts               # MOCK medical-review store (6 statuses)  wecare.review
│   ├── age/age.ts                     # 18+/DOB gate store  wecare.ageConfirmed (device-level)
│   ├── consent/                       # consent.ts store + useConsent.ts  wecare.consent
│   ├── orders/orders.ts               # MOCK order store  wecare.orders
│   └── followup/followup.ts           # step-6 check-in  wecare.followup
├── data/
│   ├── solutions.ts         # 5 named Solutions (user-facing layer)
│   ├── products.ts          # 19 real strains + placeholder COA generator
│   ├── siteImages.ts        # marketing photo glob + IMG map
│   └── productImages.ts     # product photo glob (NFC filename lookup)
├── lib/
│   ├── analytics.ts         # consent-gated track() seam; empty dispatch() (PostHog EU)
│   └── format.ts            # locale date / EUR formatting
├── pages/                   # one folder/file per route or route group
│   ├── HomePage.tsx + home/sections.tsx   (9 sections)
│   ├── conditions.tsx + conditions/ConditionLandingPage.tsx  (shared template ×5)
│   ├── assessment.tsx + assessment/ (AgeGate, AssessmentEnginePage, ResultPage, ReviewStatusPage)
│   ├── shop/ (ShopIndex, Product, Cart, Checkout, OrderConfirmation, SolutionRedirect)
│   ├── dashboard/ (DashboardLayout, DashboardTabBar, nav.ts, ui.tsx, pages.tsx)
│   ├── legal/LegalPage.tsx
│   ├── content.tsx (ContactPage — real)
│   └── FaqPage, CostsPage, LabTestsPage, LoginPage, NotFoundPage
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
- **Type:** Figtree (body/UI), Schibsted Grotesk → Figtree (headings) — both OFL, **self‑hosted** from `public/fonts/` (no Google Fonts request); Batangas → Figtree (accents, **not loaded**); system monospace (verified data only).
- **Language:** liquid‑glass surfaces (`.glass` / `.glass-strong`), a fixed blue page gradient + drifting colour orbs, full‑pill buttons, a soft Azure→cyan `cta` gradient, `--radius: 20px`.
- **Motion is quiet:** a route‑transition reveal (`PageReveal`, replays per pathname), a scroll‑in reveal (`Reveal`), a 250 ms glass hover‑lift, a slow orb drift, the rotating hero word, and the Assessment Ring's one sanctioned arc‑sweep on load. The hero photo/ring do not drift; the info chips rise in then gently bob. Everything respects `prefers-reduced-motion`. Dashboard / shop / cart / checkout / login stay static.
- **Accessibility:** a skip‑to‑content link, semantic landmarks, ARIA on interactive/decorative elements, `role="progressbar"`, `<fieldset>`/`<legend>` groups, focus‑visible rings. **Target assumed WCAG 2.2 AA — not audited** (see spec §13.5 / §20‑U2).

## Development Setup

**Prerequisites:** Node (≥ 20 recommended) and **pnpm**.

```bash
pnpm install     # first run; native builds (@tailwindcss/oxide, esbuild) are allowlisted in package.json
```

## Environment Variables

**None are consumed yet** except `import.meta.env.DEV` (in `src/lib/analytics.ts`).
`.env.example` documents the seams for the decided‑but‑not‑wired integrations —
copy to `.env.local`:

| Var | Purpose |
|---|---|
| `VITE_SITE_ORIGIN` | canonical URLs, sitemap, OG tags, cookie domain (owner decision D20) |
| `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | PostHog EU analytics — wire `dispatch()` in `analytics.ts` (D17) |
| `VITE_ERROR_DSN` | GlitchTip / Sentry‑compatible error reporting — wire `componentDidCatch()` in `RootErrorBoundary.tsx` (D19) |

`src/config.ts` holds hard‑coded placeholders: `SUPPORT_EMAIL`, `SITE_ORIGIN`,
`PRICES_CONFIRMED = false`, `COA_CONFIRMED = false`. All future hosting +
sub‑processors must be **EU/EEA region** (owner decision D16).

## Running the Project

```bash
pnpm dev         # Vite dev server on http://localhost:5173
pnpm build       # production build to dist/  — NOTE: does NOT typecheck
pnpm preview     # serve the production build locally
pnpm typecheck   # tsc --noEmit (strict) — run this separately; currently green
```

## Testing

**No test suite, no test runner, no lint config.** (No Vitest/Jest/Playwright,
no ESLint/Prettier config, no CI.) `pnpm typecheck` is the only automated check.
Recommended first tests: `recommendation.ts` (pure, high‑value), the route‑guard /
redirect behaviour, and the age‑gate / consent‑gate logic. See spec §15.3 and §22.

## Build & Deployment

`pnpm build` emits a static SPA to `dist/`. **No deployment configuration exists**
(no `netlify.toml` / `vercel.json` / `Dockerfile` / `_redirects`). Any host must
provide SPA history fallback (serve `index.html` for unknown paths) and be
**EU‑region**. `public/robots.txt` (`Disallow: /`), `public/sitemap.xml` (14
public routes, `wecare.example` origin) and `index.html`'s `noindex, nofollow`
are all **pre‑launch** — flip them and swap the real origin/OG image at launch.

## Documentation

- **[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** — full discovery & requirements document (brief, requirements, roles, user stories, flows, IA, feature inventory, business rules, edge cases, UI/UX, design system, technical + data + API requirements, acceptance criteria, traceability, open questions, readiness). Rewritten 2026‑09‑02.
- **[`docs/BUSINESS-FLOW.md`](docs/BUSINESS-FLOW.md)** — plain‑language end‑to‑end flow brief for the conversion brainstorm: what's real vs. mock at each step, the stakeholder feedback mapped to fixes/decisions, a quick‑green.com benchmark, the open decisions (D‑A…D‑F) and who must sign off.
- **[`docs/BACKEND-ARCHITECTURE.md`](docs/BACKEND-ARCHITECTURE.md)** — product‑owner backend direction (EU residency, the medical‑review flow, MVP services, entities, a 3–5‑week estimate caveat).
- **[`docs/STRAIN-SOLUTION-MAPPING.md`](docs/STRAIN-SOLUTION-MAPPING.md)** — provisional strain→Solution mapping audit + PO decision sets 3–4 (Option B built / Option D Phase 2, the "Typical THC range" rule, the `DispensingOption` model).
- **`CLAUDE.md`** — working notes: scope, copy rules, architecture, and the running log of owner decisions/overrides (D1–D26 + sets 3–4). Read before changing IA or copy.
- Per‑folder `README.md` files under `src/assets/*` and `public/`.
- **Missing / to add:** the upstream briefs `WeCare_CLI_Implementation_Prompt.md` and `WeCare Website Structure.md` (referenced by `CLAUDE.md`, not in repo).

## Known Limitations

- **No backend.** Auth (any email; password required but ignored), the medical review (a 6‑status `localStorage` mock, no email), payments, order fulfilment and COA data are mock/placeholder; state is browser‑local and is cleared on sign‑out / account switch.
- Product genetics, prices, origin, irradiation and **all COA/batch/test‑date values are placeholders** (`getProductCoa` synthesises them). `PRICES_CONFIRMED` / `COA_CONFIRMED` are `false`, so the UI labels prices "indicative" and shows a plain certificate note instead of a fake COA grid.
- The medical‑review touchpoint is a status page driven by a mock store — no doctor queue, no notifications, no real turnaround.
- The **18+/DOB age gate** is device‑local and self‑reported — **not** identity verification, and its legal sufficiency is unconfirmed (see spec §20‑L3).
- The 6 legal documents are **unreviewed draft text** with obviously‑provisional entity facts and no visible draft banner. There is a per‑category consent banner (`src/features/consent/`) but **not** a real consent‑management platform.
- Analytics: a `track()` seam (`src/lib/analytics.ts`) is wired at every funnel event and gated on consent, but **no vendor is connected** — `dispatch()` is empty.
- `/contact` is a real page (support email + hours + `mailto:` form) using the placeholder `SUPPORT_EMAIL`; the form composes a `mailto:`, there is no server handler.
- Order `status` values `shipped` / `delivered` are never set by the app; the dashboard delivery tracker states outright that real courier tracking is not connected.
- Checkout form input is **not** persisted (leaving the page loses the entered address); editable profile persists name + phone only.
- Native‑only form validation (no custom error copy / summary / focus‑to‑error).
- No **route‑level** error boundary or code splitting (single ~763 kB JS chunk); the app‑wide `RootErrorBoundary` only `console.error`s (GlitchTip not wired).
- Large unoptimised PNG photography (no WebP/AVIF, no `srcset`) — deliberately deferred.
- **Repo state:** the trunk is **`main`** (`CLAUDE.md` aligned 2026‑09‑02); active feature work is on **`audit-fixes`** (15+ commits ahead of `main`, a clean fast‑forward). `master` is a stale initial‑commit‑only branch and can be deleted. The open decision is only *when* to fast‑forward `main` (spec §20‑B1).

## Open Questions

Prioritised in `docs/DESIGN-SPECIFICATION.md` §20. Probable blockers:

- Fast‑forward `main` from `audit-fixes` when ready; delete the stale `master` branch.
- Backend model for auth (+ real DOB capture), the medical‑review workflow, payments, orders/fulfilment, and a real product/COA/pricing data source.
- Legal: real entity data + counsel review; the **full Austrian medicine/cannabis advertising review** across all customer‑facing copy (hard blocker); the **medicines‑law vs. tobacco‑monopoly** basis for the flower checkout (hard blocker); age‑gate legal sufficiency; a real consent‑management platform (hard blocker for public launch with tracking).
- Real pricing incl. the (deliberately unstated) medical‑review fee; confirmed shipping economics.
- Procurement: company‑owned PostHog EU / GlitchTip / Usercentrics accounts, then wire the seams.
- Engineering hygiene: ESLint/Prettier, a test setup, `build` gated on `typecheck`, CI, deployment config, EU‑region hosting.
- A mobile real‑device QA pass (mandatory pre‑launch per the PO).

## Development Readiness

**READY WITH CONDITIONS** (front‑end); **NOT READY** for a production build. The
front‑end is coherent, typechecks, builds, uses one (light‑only) design system,
has an error boundary + a consent gate + an analytics seam + a mock
medical‑review flow, and its behaviour is fully documented
(`docs/DESIGN-SPECIFICATION.md`) — frontend polish/feature work can start now
against that spec. It is **not** ready for a production build until the backend,
legal/compliance, procurement, pricing and engineering‑hygiene items above are
resolved. Full checklist & rationale in spec §22.

## Change Log

| Date | Change |
|---|---|
| 2026‑09‑02 (later) | Stakeholder checkout/flow feedback (WhatsApp — Mischa/Ilay). **Safe fixes applied:** checkout no longer re‑asks the email (shows the signed‑in address as a confirmation); the order‑confirmation page reads as a positive 3‑step status instead of a conditional "ships once approved" sentence; the Result page's recommended Solution now has a real "View recommended solution" button beside the review CTA (was a small text link — softens owner decision D3, flagged for PO); `/login` gained a confirm‑password field. `pnpm typecheck` + `build` green; DE/EN parity re‑verified. **Held for the brainstorm** (reopens D3/D7 or needs a payment provider): removing / instant‑ifying the medical review before purchase, credit‑card payment, showing the review fee upfront, guest checkout. See `CLAUDE.md` "Stakeholder checkout/flow feedback (2026‑09‑02)". |
| 2026‑09‑02 | Discovery re‑pass against branch `audit-fixes` @ `0958279`. Rewrote `docs/DESIGN-SPECIFICATION.md` and this README to current reality: **dark mode removed**; the medical‑review flow rebuilt as `ReviewStatusPage` at `/assessment/review` (D3, 6‑status mock); **18+/DOB age gate** (D14 + set 4); **per‑category consent banner** + **consent‑gated analytics seam** (WC‑02/07); **app‑wide error boundary**; **self‑hosted fonts**; **desktop dashboard app‑shell** + journey/delivery widgets; `/contact` now a real page (WC‑03); `PRICES_CONFIRMED` / `COA_CONFIRMED` gating (D6/D11); checkout **auth‑gated**; DE "Fragebogen" rename; "Pain & Body Comfort"; payment badges removed (D7); `src/data/dispensing.ts` target schema; `robots.txt` / `sitemap.xml` / `.env.example`. Work is now committed (branch situation updated). No source/behaviour changes in this pass. |
| 2026‑08‑31 | **Light / Dark appearance** implemented (later removed). Pre‑development discovery pass: added `docs/DESIGN-SPECIFICATION.md`; expanded this README. |
| (earlier) | Rebuild phases 1–10 + client‑guideline pass + owner overrides + the `audit-fixes` pass (WC‑01…25) + PO decision briefs D1–D26 + sets 3–4 — see `CLAUDE.md` and `git log`. |
