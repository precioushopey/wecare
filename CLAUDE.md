# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**WeCare** — a German/Austrian-market digital health platform for medical cannabis, built **problem-first** (Sleep, Pain, Stress & Anxiety, Migraine). The doctor / prescription / pharmacy layer is required but sits *behind* the assessment flow, never in front of it.

This codebase was repurposed from an unrelated Figma Make export ("Visualize Code", an hours-tracking demo). That demo's code is being stripped out phase by phase; its *engineering substrate* (Vite + React + Tailwind v4 + shadcn/ui) is being kept and reskinned. The rebuild spec lives at `../Downloads/WeCare_CLI_Implementation_Prompt.md` — it is the source of truth for scope, IA, copy rules, and the design system.

Git repo (initialised Aug 2026). Default branch `master`; put feature work on a branch and only commit / push when asked.

## Commands

```
pnpm install     # native build scripts (esbuild, @tailwindcss/oxide) are allowlisted in package.json > pnpm.onlyBuiltDependencies
pnpm dev         # Vite dev server on :5173
pnpm build       # vite build
pnpm typecheck   # tsc --noEmit  (strict; keep this green)
```

`pnpm build` does **not** type-check — run `pnpm typecheck` separately.

## Hard rules (from the spec — do not violate)

- No leaf/smoke/dispensary imagery or recreational language anywhere.
- Homepage and problem pages lead with the **problem**, never "prescription" / "treatment". The medical layer appears *after* the assessment as "medical review" / "prescription if medically appropriate" — never guaranteed.
- Never imply every user gets a prescription.
- Primary nav: **Sleep · Pain · Stress & Anxiety · Migraine** + (right) Login · Start Assessment. **No "Shop" / "Products" / "Flowers" / "Vapes" in primary nav.** **"How It Works" and "FAQ" were deliberately removed from `PRIMARY_NAV` (owner decision, Aug 2026) — do NOT re-add them.** How-It-Works is a homepage section below the final CTA, and `/how-it-works` **redirects** to it (`/#how-it-works`; `ScrollToHash` in `RootLayout` does the scroll). The `/faq` page **has real content** (`src/pages/FaqPage.tsx`, `faq` i18n namespace, categorised service FAQ) but is linked only from the footer, not the primary nav. This intentionally overrides the spec's §17 nav list.
- The user-facing product layer is the **5 named Solutions** (abstract wellness names), never strain/format names up front. A **new** user (assessment q5 = "No, I am new") is **never** led with the stronger (higher-THC) option regardless of severity — `gentleFirst` wins, and the result-page nudge frames oil as the controlled starting format before flower/vape.
- Every new or touched string ships in **both** DE and EN via react-i18next, including dynamic content. Variables go *inside* translation strings, not concatenated around them.

## Architecture

### Styling & tokens — `src/styles/`  (WECARE BRAND BOOK 2026)
- **`index.css` is the whole design system** — it imports `fonts.css`, imports Tailwind, then holds `@theme static` (brand primitives), `:root` (semantic layer), `.dark` (scaffold) and `@layer base`. `theme.css` / `tailwind.css` no longer exist.
- **Color** (brand book): Light Azure `#f9fdfe` · **Azure `#218390`** (primary — the printed `#2d190e` is a typo) · **Dark Azure `#0d444b`** · Light Green `#e8f4ed`. Exposed as: `petrol-*` = the Azure teal ramp (brand / trust / medical UI + CTA), `sage-*` = the Light Green ramp (secondary / progress / "answered"), `danger-*` = a functional error red **only** (not a brand colour). Brand-name aliases: `--color-azure`, `--color-dark-azure`, `--color-light-azure`, `--color-light-green`. There is **no warm/amber accent** — the brand colour is the CTA (`--cta` = Azure, `--cta-hover` = Dark Azure).
- `:root` maps shadcn's `--primary`/`--card`/`--muted`/… onto the palette so vendored `ui/*` inherit it. `@theme inline` bridges to utilities.
- **Fonts** (`fonts.css`): `--wc-font-sans` = **Inter** (body, loaded from Google Fonts) · `--wc-font-display` = **TT Hoves → Inter** (headings; TT Hoves is commercial, stack-loaded) · `--wc-font-accent` = **Batangas → Inter** (accents) · `--wc-font-data` = system **monospace** (verified data only — COA values, batch numbers, prices, IDs). Utilities: `font-sans` / `font-display` / `font-accent` / `font-mono`. Eyebrows are Inter `font-semibold uppercase tracking-[0.16em]`, not mono.
- **Logo**: `src/components/brand/Logo.tsx` — `<Logo>` (full lockup image, size by height) and `<LogoMark>` (square mark image); `inverse` prop switches to the white artwork on dark surfaces. Uses the official PNGs in `src/assets/logos/` (`wecare-lockup-*` / `wecare-mark-*`, trimmed from `black ver.png` / `White ver.png`).
- **Liquid-glass + blue-gradient design language** (the "We Care" refinement, on top of the brand palette):
  - `<body>` paints a soft `--page-gradient` (sky → white → mint), fixed. `GradientBackdrop` (mounted in `RootLayout`) adds blurred colour orbs behind everything.
  - `.glass` / `.glass-strong` / `.glass-hover` (in `@layer components`, index.css) = frosted translucent surface + backdrop-blur + luminous border + soft shadow. Use on calm/marketing surfaces (cards, nav, panels); **keep forms, the COA table and the assessment options solid** for legibility. `.glass-strong` (higher opacity) for data panels (cart, checkout summary, question card).
  - `.image-glow` = radial "held" glow behind a floating product/hero image; pair with a `drop-shadow` on the `<img>`.
  - `--radius` = 20px; buttons are full pills; the `cta` button variant is a soft Azure→cyan gradient (`--cta-gradient`) with glow; `outline` buttons are frosted.
  - `sky-*` = the soft blue companion (gradients/orbs only — Azure stays the interactive colour). Shadow tokens: `--shadow-soft/float/glow`.
  - `AssessmentRing` arc = a blue→azure `<linearGradient>` stroke with a drop-shadow glow.
  - `SiteFooter` background is `--footer-gradient` (deep navy-blue → teal); its icon strip sits in a dark glass panel.
- Motion stays quiet (fade+rise reveal, 250ms glass hover-lift) except the Assessment Ring arc-fill. `.dark` block (incl. dark glass tokens) is scaffold only.
- `AssessmentRing` tones: `brand` (default) · `mint` · `deep`. `Section` tones: `surface` (transparent) · `raised` (faint frosted band) · `brand` (blue-teal gradient) · `mint` (mint wash).

### i18n — `src/i18n/`
- `config.ts` inits react-i18next: `de` default + fallback, `en` toggle. Namespaces: `common` (nav/footer/shared), `home`, `conditions`, `assessment`, `dashboard`, `shop`, `faq`. Add a new namespace rather than growing one. Language persists to `localStorage` (`wecare.language`) and syncs `<html lang>`.
- `useLanguage()` hook — `{ language, setLanguage, toggle }`.
- Locale JSON: `src/i18n/locales/{de,en}/<ns>.json`. DE and EN key parity is required — components reference keys dynamically.
- Interpolate variables inside strings (`"{{answered}} von {{total}}"`), never concatenate around `t()`.

### Client state — `src/features/*` (contexts mounted by `RootLayout` via `src/app/Providers.tsx`)
- `assessment/AssessmentContext` — answers + computed `result`, persisted to `localStorage` (`wecare.assessment`). Six questions in `questions.ts` (verbatim per "Short Assessment Flow"), logic in `recommendation.ts`.
- `cart/CartContext` — line items; `productId` is a **`SolutionId`**, `quantity` is always **grams**. `localStorage` (`wecare.cart`).
- `auth/AuthContext` — **MOCK** login, any email, `localStorage` (`wecare.auth`). No backend.
- `orders/orders.ts` — plain `localStorage` (`wecare.orders`) helpers (`OrderLine.productId: SolutionId`), written at checkout.
- `followup/followup.ts` — the Step-6 experience check-in ("How was your experience…?" → Good / stronger / lighter / another format / I need support), stored at `localStorage` (`wecare.followup`). Rendered by `DashboardFollowUpPage`.

### Products & shop — two layers
- **Solution layer (what the user sees)** — `src/data/solutions.ts`: the **5 named Solutions** — `night-now`, `calm-night`, `deep-ease`, `synergy-forte`, `synergy-ultra` — abstract wellness names, `tier` (`lighter`/`stronger`), `thcRange`, `priceEur` (€/g), `conditionKeys` (Deep Ease = pain only), `heroStrainId`, `strainIds[]`. Per-Solution **`category`** + **`blurb`** (the "Product Role Mapping" guideline: Sleep Support / Advanced Sleep Support / Body Comfort Support / Daily Balance Support / Advanced Balance Support + one-line role description) live in `shop:solutions.<id>.{category,blurb}` and render as a pill + line on every Solution card / result card / product header / landing preview. Helpers `SOLUTION_BY_ID` / `isSolutionId` / `solutionImage` / `solutionExampleCoa` / `solutionStrains` / `solutionsForCondition`. This is the id used by the cart, orders, the recommendation, and the `/shop/:productId` route.
- **Formats deliberately NOT built** — CBD Flowers (strain layer, post-assessment only), CBD Hash, Vapes, Aroma Pebbles are all "not homepage / not advertising / not problem-first" per "Product Role Mapping": no products, no routes, no marketing surface for them. Only add behind an explicit compliance decision.
- **Strain layer (fulfilment)** — `src/data/products.ts`: **19 real products** from the photos in `src/assets/products/` (18 flowers + Curaleaf inhaler). Each Solution is dispensed as one of its `strainIds` after the prescription; the product page shows them under "Dispensed as". Genetics, prices, origin, COA, irradiation are **placeholders**.
- `recommendation.ts` — `getRecommendation(answers)` → `{ problem, primarySolutionId, secondarySolutionId, secondaryIsAdvanced, gentleFirst, requiresMedicalReview, explanationKey }`. The `PAIR` table fixes primary + secondary per problem ("Recommendation Logic" guideline): sleep → Night Now / Calm Night · pain → Deep Ease / Synergy Ultra · stress → Synergy Forte / Synergy Ultra · migraine → Synergy Forte / Deep Ease. **The primary never changes** — a new user (q5 = "No, I am new") is never led with the stronger option. Strong/very-strong severity or prior cannabis/CBD use only sets `secondaryIsAdvanced` (Result page then labels the secondary "Advanced option"). `gentleFirst` (new / mild / moderate) shows the "start gentle, oil-first" nudge. `requiresMedicalReview` is **always true** → Result always routes through Medical Review. `pairCounterpart` / `matchedSolutionIds` are the external helpers (follow-up, landing pages).
- Shop pages (`ShopIndexPage` = 5 Solution cards, no filters; `ProductPage` = Solution detail with gram selector, "Dispensed as" strain list + example COA) . **Kept out of primary nav** — reachable only post-assessment, from the footer, and the dashboard. Strain photos never appear on homepage / landing pages (landing pages show a low-emphasis "What you might be matched with" Solution preview only).

### Components
- `src/app/components/ui/*` — shadcn/ui (Radix), **trimmed to what's in use**: `button`, `input`, `label`, `sheet`, `accordion`, plus `utils` (`cn`). The other ~40 vendored components + their exclusive deps (MUI, react-dnd, recharts, react-slick, embla, vaul, cmdk, sonner, most `@radix-ui/*`, …) were removed as Figma-Make-demo remnants. Re-add a shadcn component with `npx shadcn@latest add <name>` if you genuinely need one.
- `src/components/brand/AssessmentRing.tsx` — the one signature visual device (progress arc / hero decoration / result reveal / dashboard indicator). Never a spinner. Respects reduced-motion.
- `src/app/components/figma/ImageWithFallback.tsx` — `<img>` with inline-SVG fallback; keep.
- The old hand-rolled `atoms/molecules/organisms/shared` set has been **removed** — build with the shadcn primitives above (add more via the CLI if needed).

### Entry
`src/main.tsx` (StrictMode, imports `./i18n/config` for side effects) → `src/app/App.tsx`. `App.tsx` is currently a **temporary foundation preview** (palette + type + ring), replaced from the navigation/homepage phase onward.

### Assets  (each folder has a README)
- `src/assets/logos/` — official WeCare logo (`wecare-lockup-*` / `wecare-mark-*`), used by `src/components/brand/Logo.tsx`.
- `src/assets/icons/` — third-party payment / social / shipping / app-store marks → `src/components/layout/FooterIcons.tsx` footer strip. Social + app links are `#` placeholders.
- `src/assets/products/` — the 19 real product photos → `src/data/products.ts` via `src/data/productImages.ts` (glob, matched by filename).
- `src/assets/images/` — marketing photography → `src/data/siteImages.ts` (glob, `IMG` map). Wired: homepage hero + 4 problem-card banners + final-CTA doctor; the 4 condition landing-page heroes. Per-condition section photos + Knowledge Hub set are available but not yet placed.

### Homepage & landing structure (guideline-locked)
- **Homepage** (`src/pages/HomePage.tsx` → `home/sections.tsx`, `home` ns) — the six sections, in the **current render order**: (1) Hero — headline + subheadline verbatim, Primary CTA "Start Free Assessment" / Secondary "How It Works", **5** trust points; (2) "What do you need help with?" — 4 problem cards; (3) "Simple recommendations. No confusing catalog." — 4 support cards (Sleep / Body Comfort / Daily Balance / Head Tension Support), **no prices**; (4) "A guided and responsible experience" — **5** badges; (5) final CTA; (6) **"How WeCare works"** — **4** steps (choose / assessment / match / continue). The How-It-Works section was **moved below the final CTA** (owner decision, Aug 2026) when it left the primary nav — `HomePage.tsx` renders `<HowItWorksSection />` last; don't reorder it back. It carries `id="how-it-works"` + `scroll-mt-24` as the redirect target for the retired `/how-it-works` page. A visual-enrichment pass (Aug 2026) added: the layered hero (photo + `AssessmentRing` decoration arc + two **static** info chips — the `wc-float` drift was added then removed at the owner's request, so the hero must not animate), a photo + vertical step-timeline in a `glass-strong` panel for How-It-Works, Azure icon medallions + one anchor photo each for sections 3 & 4, and a bottom-faded (`.image-fade-b`) portrait on the final CTA. Below-fold images carry `width`/`height` + `loading="lazy"`. (A testimonials section was removed earlier — fabricated quotes/names, never part of the spec.)
- **Problem landing pages** — `ConditionLandingPage.tsx`, one template, `conditions` ns. URLs are now bare slugs: `/sleep-problems` · `/pain-body-discomfort` · `/stress-anxiety` · `/migraine-head-tension` (old `/conditions/*` paths 301-redirect). Per page: hero (headline/subheadline/CTA verbatim) → "What this is about" → "Common situations" (5–6 bullets) → "How WeCare helps" (4 per-page steps, `<key>.helpSteps`) → low-emphasis "What you might be matched with" (the 2 matched Solutions, name + THC only, no buy CTA) → brand CTA. `general-wellness` is a hidden fallback, never counted as one of the 4.
- `public/` — `favicon.png` (512², white mark on Azure tile) + `apple-touch-icon.png`, linked from `index.html`.

Every glob resolver renders through `ImageWithFallback` (`src/app/components/figma/`), so a wrong key degrades to a placeholder instead of breaking.

### Footer
`SiteFooter` is **dark** (`bg-petrol-900`, uses `<Logo inverse />`). Below the link columns: a social · shipping · payment · app-store icon strip (`FooterIcons.tsx`), then a bottom bar with `footer.copyright` + `footer.emergencyDisclaimer` ("WeCare does not replace emergency care") + `LanguageToggle`.

### Vite
`@` → `src/` alias. `figma:asset/<f>` imports resolve to `src/assets/<f>`. Keep the React + Tailwind plugins.

## Build order (spec Section 13)

1–10 ✅ complete: audit · design tokens/fonts/i18n · navigation · homepage · four problem landing pages (+ General Wellness demoted) · assessment engine + recommendation logic · result page · Recommended Solution page + COA section · shop/cart/checkout out of nav · DE/EN pass across everything touched. (`MedicalReviewPage` still exists at `/assessment/medical-review` but the Result CTA now goes straight to the product page per the consolidated doc.)

### Client-guideline pass — `../Downloads/WeCare Website Structure.md` is the consolidated source of truth; every section 1–17 is implemented and browser-verified, **except the owner overrides listed at the end of this file** (nav, homepage section order, hero motion)
- **§1–2 Main Direction / 4 Problems** — problem-first guided flow; exactly 4 problems; 5 named Solutions backed by the 19 strains.
- **§3/§9 Core Flow + Result Page** — assessment shows "~60–90 s · not a medical form" + a linear progress bar; Result headline "Your recommended solution is ready." / subheadline / "Selected problem·Frequency·Strength·Recommended product·Secondary product·Explanation" / CTAs "View Recommended Solution" (→ product page, not medical review) + "Change My Answers" / exact disclaimer.
- **§4 Homepage / §5 Landing Pages / §6 Assessment / §7 Recommendation Logic / §8 Product Role Mapping** — see "Homepage & landing structure" and "Products & shop"; question labels + CTA + fixed primary/secondary + "Advanced option" labelling + per-Solution category/blurb all match verbatim.
- **§10 Recommended Solution Page** — name · category · why · who-it-suits · **product format** · **key ingredients** · COA (+ "Lab tested" badge) · FAQ · CTA (Add to cart / Check availability — no aggressive language). `JourneyStepper current="product"`.
- **§11 Checkout** — summary shows name·qty·price·**Delivery**·Total; form has customer details · shipping · **payment method** (invoice / bank transfer) · **Terms confirmation** + the required **"not intended to diagnose, treat, cure or prevent disease"** checkbox — Place order stays disabled until both are ticked. `DELIVERY_FEE_EUR = 0`.
- **§12 Dashboard** — `DashboardLayout` menu = Overview · My Assessment · My Recommendation · My Orders · Follow-up · Support · Profile. `DashboardHomePage` (index) shows last problem · recommended product · order status · follow-up reminder · support button. `DashboardAssessmentPage` moved to `/dashboard/assessment`.
- **§13 Follow-up** — `DashboardFollowUpPage`: prompt + 5 options → then 4 actions (reorder / try secondary / retake / contact support) + "Update My Recommendation" CTA + the 14–21-day window note. State in `followup/followup.ts` (`wecare.followup`).
- **§15 Legal & COA** — `/legal/{terms,privacy,cookie-policy,imprint,product-disclaimer,shipping-policy,refund-policy}` (`PagePlaceholder` stubs, title+description localized) + `/contact` + real **`/lab-tests`** (`LabTestsPage`) table: CBD·CBG·CBN·THC·batch·test date·safety per Solution. All linked in the footer Legal column.
- **§16 Design** — progress bar + trust badges + lab-test badges added; no cannabis-leaf / smoke / recreational visuals (brand hard rule).
- One standing tension: "Short Assessment Flow" / "Final MVP" say oils are the main solutions, but the 5 Solutions are format-agnostic — resolved as *sequencing* (new users never led with the stronger Solution) + *copy* (gentle nudge + the product-page "Product format" line frame oil as the controlled starting format), not a separate oil SKU. CBD Flowers/Hash/Vapes/Aroma Pebbles remain unbuilt per §8.

**Content still stubbed**: `/about`, `/careers`, `/providers`, `/contact`, `/knowledge-hub`, `/legal/*` are localized `PagePlaceholder`s (title + one-line description only). COA values, product data, auth backend, per-product FAQ are placeholders. (`/faq` is now a real page; `/how-it-works` redirects to the homepage section — both out of the primary nav per Hard rules. The old site at wecare360.de has a built Knowledge Hub — 9 articles — that this rebuild still stubs; see the old-site memory.)

**Owner overrides of the spec (Aug 2026) — keep these, don't "fix" them back:** primary nav trimmed to the 4 problems (no How It Works / FAQ); the "How WeCare works" homepage section sits below the final CTA and `/how-it-works` redirects to it; `/faq` is a real footer-linked page (`FaqPage.tsx` + `faq` namespace), still not in the primary nav; the hero image is static (no float); `Solution.oilFormulation` (in `src/data/solutions.ts`) carries the founder-spec CBD-oil profile and renders as an "Oil formulation — starting format" block on the Recommended Solution page, kept distinct from the flower COA. Repo is now under git — feature work goes on a branch off `master`.

Flag anything in the codebase that conflicts with the spec instead of silently working around it.
