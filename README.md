# WeCare

A German/Austrian‑market **digital health platform for medical cannabis**, built
**problem‑first** (Sleep · Pain · Stress & Anxiety · Migraine). A short guided
self‑assessment leads to one or two recommended "Solutions"; the doctor /
prescription / pharmacy layer is required but sits **behind** the assessment,
never in front of it.

> **Status: front‑end prototype.** There is **no backend**. Authentication,
> the medical review, payments, order fulfilment and lab (COA) data are
> **mocked or placeholder**; all state lives in the browser (`localStorage`).
> `noindex, nofollow` is set until launch.

The full requirements & design analysis is in
**[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)**.
`CLAUDE.md` is the working notebook of scope, copy rules and owner decisions and
is effectively a second source of truth. Two upstream briefs
(`WeCare_CLI_Implementation_Prompt.md`, `WeCare Website Structure.md`) are
referenced by `CLAUDE.md` but are **not in this repo** — they should be added to
`docs/`.

---

## Overview

| | |
|---|---|
| **What it is** | Marketing site + guided assessment + recommendation + solution/COA pages + a mock cart/checkout and dashboard, fully bilingual (DE default, EN toggle). |
| **Market** | Austria first (`de-AT`, EUR, DHL, Austrian legal framework); Germany implied. |
| **Origin** | Reskinned from an unrelated Figma Make export; the demo code has been stripped phase by phase, the Vite + React + Tailwind v4 + shadcn/ui substrate kept. |
| **Not a production system** | Built for stakeholder validation and as a front‑end baseline for a real build. |

## Objectives

1. Problem‑first entry — nav and homepage lead with the 4 problems, never "prescription/treatment".
2. A ~60–90‑second, 6‑question assessment replaces catalogue browsing.
3. Never imply everyone gets a prescription; new users are never led with the stronger option.
4. Full DE/EN parity for every string, including dynamic content.
5. One signature visual device (the **Assessment Ring**); quiet motion; a liquid‑glass + blue‑gradient brand language.
6. Commerce exists but is never in the primary nav (reachable only post‑assessment / footer / dashboard).
7. A visible legal/compliance surface (6 legal drafts, COA/lab‑tests, checkout disclaimer).

## Scope

- **In scope (built / partial):** homepage, 4 problem landing pages (+ hidden General Wellness), assessment engine, recommendation logic, result page, 5 Solution detail pages + example COA, shop index, cart, mock checkout + order + confirmation, mock login, mock dashboard (7 views), 6 legal draft documents, lab‑tests table, FAQ page, costs page, 404, redirects.
- **Out of scope (deliberate — do not re‑add):** real backend/auth/payment/medical‑review integration; CBD Flowers/Hash/Vapes/Aroma Pebbles as products; `/about` `/careers` `/providers`; Knowledge Hub; dark theme (scaffold only); any leaf/smoke/dispensary imagery or recreational language.
- **Not yet built (launch tasks):** `/contact` real content; real data (products/COA/pricing/review fee); `robots.txt` / `sitemap.xml`; real social & app‑store URLs; consent‑management platform; analytics; SEO metadata; tests; CI; deployment config; `.env.example`.

## Target Users

- **Prospective patient (anonymous)** — adult in DE/AT with a sleep/pain/stress‑anxiety/migraine concern; problem‑aware, product‑unaware. The whole flow is designed for them.
- **Returning patient (authenticated, mock)** — uses "My area" (`/dashboard/*`) for assessment, recommendation, orders, follow‑up, support, profile.
- **Unsure visitor** — routed to the hidden **General Wellness** page (from the 404 and "not sure?" links only).
- Doctor / pharmacy roles are referenced in copy only — **no UI**.

## Key Features

| Feature | Status |
|---|---|
| Global header (4 problem links + language + conditional cart + Login + CTA) + dark footer | Implemented |
| Homepage (8 sections) | Implemented |
| 4 problem landing pages from one shared template + hidden General Wellness | Implemented |
| 6‑question assessment engine (single page, resumable, `?problem=` pre‑fill) | Implemented |
| Deterministic recommendation (fixed primary/secondary per problem, "Advanced option" & "start gentle" flags, always requires medical review) | Implemented |
| Result page (summary + primary/secondary Solution + explanation + disclaimer + "what's next") | Implemented |
| Medical‑review waiting page | Implemented but **orphaned** (URL‑only; not linked from Result) |
| 5 Solution detail pages (why/usage/suitability/format/ingredients + oil formulation + "dispensed as" strains + example COA + FAQ) | Implemented (data partly placeholder) |
| Shop index (5 cards, no filters, not in nav) | Implemented |
| Cart (grams, `SolutionId`‑keyed, persistent) | Implemented |
| Checkout (customer + shipping + payment method + 2 required confirmations) → mock order → confirmation | **Mock** (no real payment) |
| Mock auth (any email) + dashboard (7 views with empty states) | **Mock** |
| Follow‑up check‑in | Implemented |
| 6 legal draft documents + lab‑tests / COA table + FAQ page + costs page | Implemented (legal = **unreviewed draft** with placeholders) |
| i18n (DE default + fallback, EN toggle, locale date/currency) | Implemented |
| Assessment Ring, Journey Stepper, gradient backdrop, liquid‑glass surfaces | Implemented |
| Light / Dark appearance + toggle (footer), persisted, pre‑paint | Implemented — brand‑consistent teal‑navy dark re‑skin; Light is the default & reference design |

See `docs/DESIGN-SPECIFICATION.md` §10 for the full feature inventory with IDs and dependencies.

## User Roles

One real authorization boundary: **authenticated vs. not**, gating `/dashboard/*`.

| Role | Become it | Access |
|---|---|---|
| Anonymous | default | everything except `/dashboard/*` (→ redirected to `/login` with return path) |
| Authenticated (mock) | submit **any non‑empty email** at `/login` (password ignored); session in `localStorage:wecare.auth` | everything, incl. `/dashboard/*` |
| Doctor / Pharmacy / Admin | — | **not modelled** |

## User Flows

Detailed flows with Mermaid diagrams are in `docs/DESIGN-SPECIFICATION.md` §8:
first‑time visitor → completed assessment → recommendation · returning user ·
mock auth + dashboard gate · cart → checkout → mock order · follow‑up check‑in ·
redirects & dead ends.

## Requirements

Functional (`FR‑001…032`) and non‑functional (`NFR‑001…012`) requirements,
user stories (`US‑001…016`) and acceptance criteria (`AC‑1…12`, Given/When/Then)
are in `docs/DESIGN-SPECIFICATION.md` §6–§8, §18.

## Business Rules

Full list (`BR‑001…036`) in `docs/DESIGN-SPECIFICATION.md` §11. Highlights:

- The **primary** recommended Solution is fixed per problem and never changes with severity or experience (`recommendation.ts`).
- **Every** recommendation always requires a medical review; no Solution is ever sold directly.
- The Result CTA routes to the **Solution page**, not the medical‑review page.
- Checkout "Place order" is disabled until **both** the Terms and the "not intended to diagnose, treat, cure or prevent disease" checkboxes are ticked; delivery fee = €0.
- Primary nav = **exactly** the 4 problems (no Shop/Products; "How It Works" & "FAQ" deliberately excluded).
- German is the default **and** fallback locale; no `navigator` auto‑detect; every string ships DE **and** EN with identical key trees.
- Austria language rules: never "treats/cures"; "recommended solution" not "prescription"; a prescription is never presented as guaranteed. No leaf/smoke/recreational imagery or language anywhere.
- COA / batch / test‑date values are **deterministically synthesised**, not real lab data.

## Technical Architecture

- **Client‑only SPA.** No server, SSR, API layer or database.
- **Entry:** `index.html` → `src/main.tsx` (`StrictMode`; imports `./i18n/config` + `./styles/index.css`) → `src/app/App.tsx` (`<RouterProvider>`) → `src/app/router.tsx` → `RootLayout`.
- **Shell:** `Providers` (`AuthProvider › AssessmentProvider › CartProvider`) → `GradientBackdrop` + `SiteHeader` + routed `<Outlet/>` + `SiteFooter` + `ScrollRestoration` + `ScrollToHash`.
- **Routing:** `react-router` v7 **data/library mode** (`createBrowserRouter`), all routes under one layout route. Guards are **in‑component** `<Navigate replace>` (no `loader`/`action`/`errorElement`). **No route‑level code splitting.**
- **State:** 3 React contexts (auth, assessment, cart) + 2 module singletons (`orders`, `followup`), each mirrored to `localStorage`; `i18next` holds the language. No global store library.
- **Recommendation** is a pure function (`src/features/assessment/recommendation.ts`) with **no i18n inside** (keys only).
- **Data:** static TS (`src/data/solutions.ts` — 5 Solutions; `src/data/products.ts` — 19 strains) + build‑time image globs (`siteImages.ts`, `productImages.ts`).

### Stack

| | |
|---|---|
| React 18.3.1 · TypeScript 5.7.2 (strict) · Vite 6.3.5 | |
| Tailwind CSS **v4** via `@tailwindcss/vite` — **CSS‑configured** in `src/styles/index.css`; **no `tailwind.config.js`**; `postcss.config.mjs` is empty | |
| shadcn/ui (Radix) — trimmed to `button`, `input`, `label`, `sheet`, `accordion` (+ `utils`) | |
| `react-router` 7.13 · `i18next` 24.2 + `react-i18next` 15.4 · `lucide-react` 0.487 | |
| `class-variance-authority` · `clsx` · `tailwind-merge` (`cn()`), `tw-animate-css` | |
| pnpm (single‑package workspace); `onlyBuiltDependencies`: `@tailwindcss/oxide`, `esbuild` | |

### Integrations

**None.** No auth provider, payment provider, analytics, email, storage/CDN, or
medical/pharmacy API. Footer payment/social/app‑store marks are **static images**;
social & app‑store links are `#` placeholders.

## Project Structure

```
src/
├── main.tsx                 # entry (StrictMode; imports i18n + styles)
├── app/
│   ├── App.tsx              # <RouterProvider>
│   ├── router.tsx           # all routes (createBrowserRouter)
│   ├── paths.ts             # route path constants + PRIMARY_NAV
│   ├── Providers.tsx        # Auth › Assessment › Cart
│   ├── usePageTitle.ts
│   └── components/
│       ├── ui/              # shadcn primitives (button, input, label, sheet, accordion, utils)
│       └── figma/ImageWithFallback.tsx
├── components/
│   ├── brand/               # Logo, AssessmentRing (signature visual)
│   ├── layout/              # RootLayout, SiteHeader, SiteFooter, FooterIcons,
│   │                        #   LanguageToggle, ScrollToHash
│   └── marketing/           # Section, SectionHeading, Reveal, JourneyStepper,
│                            #   MedicalNotice, GradientBackdrop, FloatingChip, ComboCarousel
├── features/                # client state (each mirrored to localStorage)
│   ├── assessment/          # questions.ts, recommendation.ts, AssessmentContext.tsx
│   ├── auth/AuthContext.tsx           # MOCK (any email)
│   ├── cart/CartContext.tsx
│   ├── conditions/conditions.ts       # the 4 ConditionKeys + icons
│   ├── orders/orders.ts               # MOCK order store
│   └── followup/followup.ts           # step-6 check-in
├── data/
│   ├── solutions.ts         # 5 named Solutions (user-facing layer)
│   ├── products.ts          # 19 real strains + placeholder COA generator
│   ├── siteImages.ts        # marketing photo glob + IMG map
│   └── productImages.ts     # product photo glob (NFC filename lookup)
├── pages/                   # one folder/file per route or route group
│   ├── HomePage.tsx + home/sections.tsx
│   ├── conditions/ConditionLandingPage.tsx (shared template ×5)
│   ├── assessment/ (AssessmentEnginePage, ResultPage, MedicalReviewPage)
│   ├── shop/ (ShopIndex, Product, Cart, Checkout, OrderConfirmation, SolutionRedirect)
│   ├── dashboard/ (DashboardLayout, pages.tsx)
│   ├── legal/LegalPage.tsx
│   └── FaqPage, CostsPage, LabTestsPage, LoginPage, NotFoundPage, PagePlaceholder, content.tsx
├── i18n/
│   ├── config.ts            # de default + fallback, en toggle; namespaces
│   ├── useLanguage.ts
│   └── locales/{de,en}/*.json   # common, home, conditions, assessment, dashboard, shop, faq, costs, legal
├── lib/format.ts            # locale date / EUR formatting
├── styles/
│   ├── index.css            # THE design system (tokens, base, components, utilities)
│   └── fonts.css            # font stacks
└── assets/{logos,icons,images,products}/   # each has a README
```

## Design & UX

- **Single source of truth:** `src/styles/index.css` (Tailwind v4, `@theme` + `:root` + `.dark` + `@layer` + utility classes). No `tailwind.config.js`.
- **Colour:** `petrol-*` = the Azure teal ramp (`#218390` primary, `#0d444b` dark) for brand/trust/medical UI + CTA; `sage-*` = Light Green for secondary/progress/"answered"; `danger-*` = functional error red only; `sky-*` = a soft blue companion for gradients/orbs. No warm/amber accent.
- **Type:** Figtree (body/UI), Schibsted Grotesk → Figtree (headings), Batangas → Figtree (accents, **not loaded**), system monospace (verified data only).
- **Language:** liquid‑glass surfaces (`.glass` / `.glass-strong`), a fixed blue page gradient + drifting colour orbs, full‑pill buttons, a soft Azure→cyan `cta` gradient, `--radius: 20px`.
- **Motion is quiet:** fade‑and‑rise section reveals, a 250 ms glass hover‑lift, a slow orb drift, and the Assessment Ring's one sanctioned arc‑sweep on load. Everything respects `prefers-reduced-motion`.
- **Light / Dark:** Light is the default and the reference design. Dark is a brand‑consistent "night" re‑skin — **colour tokens only** (layout/type/motion shared): deep teal‑navy ground, brightened brand bands, dimmed photography. Toggle sits in the footer; the choice persists to `localStorage:wecare.theme` and is applied before first paint (`src/theme/`, `index.html`). It is a single explicit choice — there is no "follow the OS" mode.
- **Accessibility:** semantic landmarks, ARIA on interactive/decorative elements, `role="progressbar"`, `<fieldset>`/`<legend>` groups, focus‑visible rings. **Target assumed WCAG 2.2 AA — not audited** (see spec §13.5 / §20‑U2).

## Development Setup

**Prerequisites:** Node (≥ 20 recommended) and **pnpm**.

```bash
pnpm install     # first run; native builds (@tailwindcss/oxide, esbuild) are allowlisted in package.json
```

## Environment Variables

**None.** The app reads no `import.meta.env` / `process.env` values and there is
no `.env.example`. (A real build will need env config — see spec §15.3 / §20‑T4.)

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
Recommended first tests: `recommendation.ts` (pure, high‑value) and the
route‑guard / redirect behaviour. See spec §15.3 and §22.

## Build & Deployment

`pnpm build` emits a static SPA to `dist/`. **No deployment configuration exists**
(no `netlify.toml` / `vercel.json` / `Dockerfile` / `_redirects`). Any host must
provide SPA history fallback (serve `index.html` for unknown paths). `index.html`
carries `noindex, nofollow` — remove at launch and add `robots.txt` / `sitemap.xml`
in `public/`.

## Documentation

- **[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** — full discovery & requirements document (brief, requirements, roles, user stories, flows, IA, feature inventory, business rules, edge cases, UI/UX, design system, technical + data + API requirements, acceptance criteria, traceability, open questions, readiness).
- **`CLAUDE.md`** — working notes: scope, copy rules, architecture, and the running log of owner decisions/overrides. Read before changing IA or copy.
- Per‑folder `README.md` files under `src/assets/*` and `public/`.
- **Missing / to add:** the upstream briefs `WeCare_CLI_Implementation_Prompt.md` and `WeCare Website Structure.md` (referenced by `CLAUDE.md`, not in repo).

## Known Limitations

- **No backend.** Auth (any email, password required but ignored), the medical review, payments, order fulfilment and COA data are mock/placeholder; state is browser‑local (`localStorage`), now cleared on sign‑out / account switch so it doesn't leak between users on a shared browser.
- Product genetics, prices, origin, irradiation and **all COA/batch/test‑date values are placeholders** (`getProductCoa` synthesises them).
- `MedicalReviewPage` is reachable only by direct URL (the Result page no longer links it) — there is no real medical‑review touchpoint in the walked flow.
- The 6 legal documents are **unreviewed draft text** with obviously‑provisional entity facts; there is a lightweight consent banner (`src/features/consent/`) but **not** a real consent‑management platform, and fonts still load from Google's CDN.
- Analytics: a `track()` seam (`src/lib/analytics.ts`) is wired at every funnel event and gated on consent, but **no vendor is connected** — `dispatch()` is empty.
- `/contact` is now a real page (support email + hours + `mailto:` form) using the placeholder `SUPPORT_EMAIL` in `src/config.ts`; footer social & app‑store links are `#`.
- Order `status` values `shipped` / `delivered` are never set by the app.
- Checkout form input is **not** persisted (leaving the page loses the entered address); editable profile persists name + phone only.
- Native‑only form validation (no custom error copy / summary / focus‑to‑error).
- No React error boundary — a render error anywhere unmounts the whole app.
- Large unoptimised PNG photography (no WebP/AVIF, no `srcset`); `public/robots.txt` is Disallow‑all and `index.html` carries `noindex` — flip both at launch.
- **Dark appearance** is implemented and wired, but the dark palette has **not had a formal WCAG contrast audit**; a few polish items remain (native unchecked radios read slightly rusty under `color-scheme: dark`; the Assessment Ring `startLabel` pill and a couple of gradient‑medallion glyphs keep near‑white on the brightened teal; `tone="raised"` bands are very faint in dark; the condition‑page hero gradient stays literal). See `CLAUDE.md`.
- **Repo state:** current work is on branch `faq-page-and-howitworks-redirect` with a **large uncommitted working tree**; `master` holds only the initial commit. Committing a baseline and confirming the trunk is a prerequisite for handoff.

## Open Questions

Prioritised in `docs/DESIGN-SPECIFICATION.md` §20. Probable blockers:

- Confirm the trunk branch and commit the working tree as the baseline.
- Backend model for auth, medical review, payments, orders/fulfilment, and a real product/COA data source.
- Legal: real entity data + counsel review of the draft legal pages; Austria prescription‑advertising review; a consent‑management platform.
- Real pricing incl. the (deliberately unstated) medical‑review fee; honest payment methods.
- Engineering hygiene: ESLint/Prettier, a test setup, an error boundary, `build` gated on `typecheck`, CI, deployment config.

## Development Readiness

**READY WITH CONDITIONS.** The front‑end is coherent, typechecks, uses one design
system, and its behaviour is fully documented (`docs/DESIGN-SPECIFICATION.md`) —
frontend polish/feature work can start now against that spec. It is **not** ready
for a production build until the backend, legal/compliance, pricing and
engineering‑hygiene items above are resolved. Full checklist & rationale in spec §22.

## Change Log

| Date | Change |
|---|---|
| 2026‑08‑31 | **Light / Dark appearance** implemented (owner request): `src/theme/` store + `ThemeToggle` in the footer, `.dark` token block in `index.css`, pre‑paint script in `index.html`, `common:theme.*`. Brand‑consistent teal‑navy dark re‑skin; Light unchanged. `pnpm typecheck` + `pnpm build` green. |
| 2026‑08‑31 | Pre‑development discovery pass: added `docs/DESIGN-SPECIFICATION.md`; expanded this README to reflect the actual implementation, mock/placeholder boundaries, project structure, and readiness. |
| (earlier) | Rebuild phases 1–10 + client‑guideline pass + owner overrides — see `CLAUDE.md` and `git log`. |
