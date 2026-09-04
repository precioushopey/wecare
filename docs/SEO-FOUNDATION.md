# WeCare — SEO Foundation, Audit & Go-Live Plan

**Date:** 2026-09-03 · **Status:** audit + strategy delivered; technical implementation NOT yet built (needs a scope decision — see §G).
**Market:** Austria · **Primary indexed language:** German (`de-AT`) · **Indexing:** the site stays **noindex** until Product Owner + legal launch approval (owner rule, §4 of the brief).

This document is a strategy + audit reference. It invents **no** search volumes, CPCs, difficulty scores, traffic forecasts, company data, medical claims, prices, COA data, or physician identities. Anything that needs Austrian legal sign-off is tagged **LEGAL REVIEW REQUIRED**. Anything that needs verified keyword tooling is tagged **VOLUME NOT VERIFIED**.

---

## 0. Data limits (read first)

- **No verified keyword data.** There is no Ahrefs/Semrush/GSC access in this engagement. All "volume" is omitted; intent is a **qualitative HIGH/MEDIUM/LOW** judgement only. Validate every term against a real tool + Search Console before committing content resource.
- **No live Austrian SERP scrape.** Automated Google querying trips bot-detection and the brief forbids bypassing it. SERP-feature / PAA / competitor-ranking observations below are **directional**, from general market knowledge and the `docs/COMPETITOR-QUICK-GREEN.md` teardown — not a logged SERP audit. A person must run the Austrian SERP inspection for the Phase-1 terms.
- **Rendered-UX audit** is based on this session's repeated end-to-end walkthroughs of every page (homepage, 4 problem pages, assessment, result, review, product, checkout, login, dashboard, legal) + the source. A formal JS-rendering crawl (Screaming Frog in rendered mode, or Sitebulb) should be run **after** the technical implementation lands.

---

## PART 1 — AUDIT

### 1.1 Route inventory

`Idx` = recommended index status once launch is approved. Today **every** route is `noindex` via the hard-coded `<meta name="robots" content="noindex, nofollow">` in `index.html` + `robots.txt Disallow: /`.

| URL | Page type | Rendered H1 (DE) | `<title>` today | Meta description today | Canonical | Idx (target) | Search intent | Recommended SEO role |
|---|---|---|---|---|---|---|---|---|
| `/` | Homepage | "Finde die richtige Unterstützung bei [Schlaf/…]" (rotating word) | **`WeCare`** (title arg is `undefined` — bug) | `pages.home.subtitle` (client-set) | none | **index** | Brand + category ("was ist WeCare", "geführte Wellness Österreich") | Category hub → routes to the 4 problems |
| `/sleep-problems` | Problem page | "Schwierigkeiten beim Ein- oder Durchschlafen?" | `<condition title> · WeCare` | `pages.conditions.sleep.description` | none | **index** | HIGH — Schlafprobleme / Einschlafprobleme / Durchschlafprobleme | **Money page 1** — primary sleep entry |
| `/pain-body-discomfort` | Problem page | "Lebst du mit täglichen Schmerzen oder Körperbeschwerden?" | `… · WeCare` | `pages.conditions.pain.description` | none | **index** | HIGH — chronische Schmerzen / Rückenschmerzen / Körperbeschwerden | **Money page 2** |
| `/stress-anxiety` | Problem page | "Gestresst, angespannt oder unfähig abzuschalten?" | `… · WeCare` | `pages.conditions.stressAnxiety.description` | none | **index** | HIGH — Stress / innere Unruhe / nicht abschalten können | **Money page 3** (anxiety terms → LEGAL REVIEW) |
| `/migraine-head-tension` | Problem page | "Wiederkehrende Kopfspannung oder migränebedingte Beschwerden?" | `… · WeCare` | `pages.conditions.migraine.description` | none | **index** | HIGH — Migräne / Kopfschmerzen / Kopfdruck | **Money page 4** |
| `/general-wellness` | Problem page (fallback) | "Nicht sicher, worum es geht?" | `… · WeCare` | `pages.conditions.generalWellness.description` | none | **noindex** | none (internal fallback) | Keep noindex — thin, no query |
| `/conditions/*` (×5) | Redirect | — | — | — | — | — | Client-side `<Navigate replace>` → returns **HTTP 200 + JS**, not a 301. Needs real server redirect. |
| `/how-it-works` | Redirect → `/#how-it-works` | — | — | — | — | — | MEDIUM intent ("wie funktioniert …") is currently pointed at a homepage anchor. Consider a real `/so-funktioniert-wecare` page (see §C). |
| `/faq` | FAQ page | "Häufige Fragen" | `Häufige Fragen · WeCare` | `pages.faq.description` | none | **index** | MEDIUM — service questions | Support/trust asset; `FAQPage` schema candidate |
| `/costs` | Info page | "Was dich erwartet – und was es kostet" | `… · WeCare` | `pages.costs.description` | none | **index** | MEDIUM — "was kostet …", "Kosten" | Trust/transparency asset (carries **no €** figures by design — BR-045) |
| `/lab-tests` | Info page | "Labortests / COA" | `Labortests / COA · WeCare` | `pages.labTests.description` | none | **noindex until `COA_CONFIRMED`** | LOW public intent | Gate: while `COA_CONFIRMED = false` this is a plain list, not real data → noindex |
| `/contact` | Contact page | "Kontakt" | `Kontakt · WeCare` | `pages.contact.description` | none | **index** | LOW — brand nav | `ContactPoint` in Organization schema; page itself low priority |
| `/legal/{imprint,privacy,terms,cookie-policy,shipping-policy,refund-policy}` | Legal | doc title | `<doc> · WeCare` | per-doc description | none | **index, low priority** | Compliance/nav only | Keep crawlable (Impressum is legally expected in AT); drop `priority` noise |
| `/assessment/start` | App / funnel | "Dein Fragebogen" (+ AgeGate) | `Dein Fragebogen · WeCare` | `pages.assessmentStart.description` | none | **noindex** | — | Funnel step — never index |
| `/assessment/result` | App / funnel (personal) | "Deine empfohlene Lösung ist bereit." | `… · WeCare` | `pages.result.description` | none | **noindex** | — | Personalised result — never index |
| `/assessment/review` | App / funnel (personal) | status title | `Deine ärztliche Prüfung · WeCare` | (none) | none | **noindex** | — | Personal review status — never index |
| `/solution` | Redirect | — | — | — | — | **noindex** | — | Resolves to recommended product |
| `/shop` | Solution index | grid | `Shop · WeCare` (`pages.shop.title`) | `pages.shop.description` | none | **noindex OR thin-index** | LOW pre-assessment; brand "WeCare Lösungen" | Post-assessment surface. Default **noindex** (brief §17: problem pages are the entry, not the catalogue). Revisit only with PO approval. |
| `/shop/{night-now,calm-night,deep-ease,synergy-forte,synergy-ultra}` | Solution page | solution name | `<name> · WeCare` | (none) | none | **index (brand only) — LEGAL REVIEW** | LOW — brand/product names, factual composition | Can rank for the 5 Solution names + factual info. **Not** for problem queries. Needs unique meta + LEGAL REVIEW on any effect/benefit copy. |
| `/shop/cart` · `/shop/checkout` · `/shop/confirmation` | Commerce | — | per-page | (varies) | none | **noindex** | — | Never index |
| `/dashboard` + `/dashboard/{assessment,recommendation,orders,follow-up,support,profile}` | Account (auth) | per-page | `Mein Bereich · WeCare` | `pages.dashboard.description` | none | **noindex** | — | Auth-gated — never index |
| `/login` | Auth | "Anmelden" | `Anmelden · WeCare` | `pages.login.description` | none | **noindex** | — | Never index |
| `*` (404) | Not-found | "Diese Seite gibt es nicht" | `Diese Seite gibt es nicht · WeCare` | (none) | none | **noindex + real 404** | — | **Soft-404 today** (SPA returns HTTP 200). Needs host-level 404. |

**Solution pages the diagram/brief cares about:** exactly the 5 (`night-now`, `calm-night`, `deep-ease`, `synergy-forte`, `synergy-ultra`). There are **no** public strain URLs and there must not be (brief §17–18).

### 1.2 Technical SEO findings — severity-ranked

Severity: **P0** = blocks indexing / causes harm · **P1** = major organic ceiling · **P2** = meaningful · **P3** = polish · **P4** = nice-to-have.

| ID | Severity | Finding | Evidence | Fix |
|---|---|---|---|---|
| T-01 | **P0** | **Client-only rendering (SPA).** No SSR/SSG. `index.html` is one shell; per-page `<title>`, description, OG, canonical, JSON-LD are all set by JS after hydration (`usePageTitle`). Social/link crawlers (OG) never run JS; Googlebot renders JS but slowly and unreliably for a YMYL launch. | `src/main.tsx` `createRoot`; `vite.config.ts` has no prerender; `index.html` static `<title>WeCare</title>`. | **Prerender the marketable routes** (homepage, 4 problem pages, How-It-Works, FAQ, costs, articles). Options in §G. This is architectural — needs a decision. |
| T-02 | **P0** | **No canonical tags anywhere.** | `grep canonical src/` → 0 hits. | Self-referencing canonical per indexable page, origin from `VITE_SITE_ORIGIN`. |
| T-03 | **P0** | **`wecare.example` hard-coded** in `robots.txt`, `sitemap.xml`, `src/config.ts SITE_ORIGIN`. `.env.example` has `VITE_SITE_ORIGIN` but nothing reads it. | files as cited | Consume `VITE_SITE_ORIGIN` everywhere; build fails / stays noindex if it's still `wecare.example`. |
| T-04 | **P0** | **Index control not environment-aware.** `<meta robots noindex>` and `robots.txt Disallow: /` are static. Correct now, but there's no switch for "prod after approval". | `index.html:17`, `public/robots.txt` | Env-driven robots meta + generated `robots.txt`; a single `SEO_INDEXABLE` flag, default `false`. |
| T-05 | **P0** | **Soft 404.** Unknown URLs return HTTP **200** with the SPA shell, then render `NotFoundPage`. Google treats these as thin duplicates. | `router.tsx` `path: "*"`; static host serves `index.html` for all paths. | Host-level rule to serve the 404 body with a real `404` status (Netlify `_redirects` / Vercel / Cloudflare / nginx). |
| T-06 | **P1** | **Homepage `<title>` is just "WeCare".** `usePageTitle(undefined, …)` — the keyword-rich `pages.home.title` key exists but is unused for the title. | `HomePage.tsx:20` | Pass `pages.home.title`; keep it problem-first, ≤ ~60 chars. |
| T-07 | **P1** | **No structured data at all.** No `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, `Article`. | `grep ld+json src/` → 0 | Add a small JSON-LD infra: site-wide `Organization` + `WebSite`; per-page `BreadcrumbList`; `FAQPage` where a real Q&A block exists; `Article` on `/ratgeber/*`. Conservative — **no** `MedicalClinic`/`Physician`/`Review`. |
| T-08 | **P1** | **`<html lang>` is `de` / `en`, not `de-AT`.** `persistLanguage()` sets `document.documentElement.lang = "de"`. | `src/i18n/config.ts` | Set `lang="de-AT"` (and `en` variant only if EN is ever indexed). Static in `index.html` + runtime. |
| T-09 | **P1** | **English URL slugs on a German-primary site** (`/sleep-problems`, `/pain-body-discomfort`, `/stress-anxiety`, `/migraine-head-tension`). German searchers and Google's German index both favour German slugs. | `src/app/paths.ts` | Migrate to `/schlafprobleme`, `/schmerzen`, `/stress-angst`, `/migraene-kopfdruck` with **real 301s** from the old slugs. Do it **before** first indexing so there's no redirect debt. (CLAUDE.md fixes the slugs "by the Problem Landing Pages guideline" — confirm with PO before rename.) |
| T-10 | **P1** | **Static hand-maintained `sitemap.xml`.** Wrong origin, no `<lastmod>`, will drift. | `public/sitemap.xml` | Generate from the router's indexable set at build; real `lastmod` from content/git timestamps. |
| T-11 | **P1** | **Client-side "redirects" aren't redirects.** `/conditions/*` and `/how-it-works` use `<Navigate replace>` → HTTP 200 + a client bounce. No link equity passes, Google may index both. | `router.tsx:57–80` | Real 301s at the host; keep the SPA `<Navigate>` only as a fallback. Document every rule (§29). |
| T-12 | **P2** | **No per-page Open Graph.** Every share shows "WeCare" + favicon. `og:locale` is correctly `de_AT`. No 1200×630 image (WC-20 / brief §51). | `index.html:24–39` | Per-page OG (title/description/url/image/locale) via the same head system as T-01/T-02; commission the 1200×630 banner (brief in §51). |
| T-13 | **P2** | **Single JS bundle ~762 KB (226 KB gzip).** Every build warns "chunks larger than 500 kB". No route-level code-splitting. | `pnpm build` output | `React.lazy` + route-level `Suspense` for the dashboard/shop/checkout/legal clusters; keep the marketing routes in the main chunk. Helps mobile LCP/INP. |
| T-14 | **P2** | **No image `srcset`/next-gen formats.** WC-17 deferred. Product photos are large PNGs (0.5–4 MB in `dist`). | `pnpm build` asset list | `sharp` + a Vite image plugin OR pre-processed `.webp`/`.avif` + `<img srcset>`. Marketing hero + condition heroes first. (Build-infra decision — flag to the team, per CLAUDE.md.) |
| T-15 | **P2** | **Condition H1s don't carry the head term.** "Schwierigkeiten beim Ein- oder Durchschlafen?" has no "Schlafprobleme". Engaging, but leaves the exact-match signal to the `<title>` only. | `de/conditions.json` | Keep the empathetic H1, add an early `<h2>` or intro sentence with "Schlafprobleme" / "chronische Schmerzen" / "Migräne" / "Stress und innere Unruhe". |
| T-16 | **P2** | **No breadcrumbs** (UI or `BreadcrumbList`). Fine for a 1-level site now; required once `/ratgeber/*` exists. | — | Ship breadcrumb infra with the content hub. |
| T-17 | **P3** | `/lab-tests` in the sitemap while `COA_CONFIRMED = false` (no real data). | `sitemap.xml:15` | Exclude from sitemap + `noindex` until the gate flips. |
| T-18 | **P3** | Legal pages carry `priority`/`changefreq` in the sitemap (ignored by Google; noise). Impressum should stay crawlable (AT expectation); the rest are low value. | `sitemap.xml:17–22` | Keep Impressum + Datenschutz; the generator can drop `priority`. |
| T-19 | **P3** | No GSC / Bing verification, no analytics for organic. | — | §I checklist. |
| T-20 | **P4** | `twitter:card` is `summary` (small). With a real 1200×630 image, use `summary_large_image`. | `index.html:33` | Flip when the banner exists. |
| T-21 | **P4** | `PageReveal` / `Reveal` fade-in on route change can cause a brief CLS/paint delay on slower devices; all are `prefers-reduced-motion` safe. | CLAUDE.md motion notes | Verify CLS in a real Lighthouse-mobile run; likely fine. |

**Not broken (credit where due):** self-hosted preloaded fonts (zero Google Fonts request), `og:locale` = `de_AT`, below-fold `loading="lazy"` + width/height, per-page meta descriptions already written in decent problem-first DE, `robots.txt Disallow: /` + `<meta noindex>` correctly locking a pre-launch site, skip-link + `<main id>` + semantic sections, no fabricated reviews/testimonials, `.env.example` already names the `VITE_SITE_ORIGIN` seam (D20).

---

## PART 2 — DELIVERABLES

### A. SEO Executive Strategy

**Where organic growth comes from.** Not from "CBD Öl kaufen Österreich". From Austrians typing their **problem** — *"kann nicht schlafen"*, *"ständig gestresst"*, *"Migräne was hilft"*, *"chronische Rückenschmerzen"* — landing on a calm, useful WeCare problem page or guide, understanding their situation, and starting the assessment. CBD/cannabis education appears **later** in the journey, transparently, on its own neutral pages — never as the hook.

**Why problem-first is the right SEO model here (not just a product preference):**
1. **Compliance headroom.** Problem/education intent can be served with general, sourced, non-promotional content. Product/condition→claim intent ("CBD gegen Schlafstörungen") is exactly what Austrian medicine/cannabis advertising law restricts. Problem-first keeps the indexable surface in the defensible zone. *(This is a strategy rationale, not legal advice — the specific copy still needs review.)*
2. **Bigger, earlier demand.** Problem searches ("Schlafprobleme", "innere Unruhe") dwarf branded/product searches for a new entrant, and they catch the user before they've decided on a solution — which is precisely where WeCare's guided model wins.
3. **Topical authority compounds.** Four tight clusters (Sleep / Pain / Stress / Migraine) with genuinely useful hubs + articles build entity authority Google can trust, which then lifts the money pages. A strain catalogue builds none of that.
4. **It matches the product.** The site *is* problem → education → assessment → solution → review → fulfilment → follow-up. SEO that mirrors the product is coherent to users and to Google.

**Primary keyword clusters (qualitative):**
- **Sleep** (HIGH): Schlafprobleme, Einschlafprobleme, Durchschlafprobleme, "kann nicht schlafen", nachts aufwachen, "ständig müde".
- **Pain** (HIGH): chronische Schmerzen, Rückenschmerzen, Nervenschmerzen, Muskelverspannungen, "langanhaltende Schmerzen".
- **Stress/Anxiety** (HIGH, with anxiety terms held for LEGAL REVIEW): Stress, innere Unruhe, "nicht abschalten können", "ständig gestresst", Stress-Symptome.
- **Migraine** (HIGH): Migräne, Kopfschmerzen, Kopfdruck, Migräne-Symptome, Migräne-Auslöser.
- **CBD/cannabis education** (SAFE-if-neutral, some LEGAL REVIEW): "was ist CBD", "CBD vs THC", "was bedeutet THC-Prozent", "was ist ein COA".
- **Brand** (owned): WeCare, WeCare Österreich, + the 5 Solution names.

**Content strategy.** Phase 1 = the foundation (homepage + 4 problem pages + a real How-It-Works + a CBD-basics hub + FAQ + all technical SEO). Phase 2 = 12–20 genuinely useful problem guides across the 4 clusters. Phase 3 = long-tail expansion driven by **real Search Console data**. Phase 4 = refresh by rank/CTR/conversion. No programmatic pages, ever, without explicit PO approval (§46).

**Technical strategy.** Fix the P0s first — they're the ceiling: prerender the marketing routes, add canonical + env-driven index control + a generated sitemap + real 404/301s at the host, and a small conservative JSON-LD layer. Then per-page metadata + OG, then performance (code-split, next-gen images).

**The guardrail.** SEO supports the product; it does not redefine it (§54). No homepage pivot to "CBD Shop Österreich". No strain pages. Beginners never have to learn "THC 22 %" to use the assessment.

### B. Keyword map

**VOLUME NOT VERIFIED** for every row. `Intent` is qualitative. `Risk` ∈ {A safe/educational, B commercial/product, C medical/high-risk, D LEGAL REVIEW REQUIRED}.

| Cluster | Query / concept (DE) | Intent | Target page | Priority | Risk |
|---|---|---|---|---|---|
| Sleep | schlafprobleme | HIGH info+solution | `/schlafprobleme` | P1 | A |
| Sleep | einschlafprobleme / durchschlafprobleme | HIGH | `/schlafprobleme` (+ H2s) | P1 | A |
| Sleep | kann nicht schlafen / schlecht schlafen | HIGH info | `/schlafprobleme` | P1 | A |
| Sleep | nachts aufwachen / ständig müde | MED info | `/ratgeber/schlaf/naechtliches-aufwachen` (Ph2) | P2 | A |
| Sleep | schlafprobleme durch stress | MED info | `/ratgeber/schlaf/stress-und-schlaf` (Ph2) | P2 | A |
| Sleep | wann schlafprobleme zum arzt | MED info | article + FAQ on `/schlafprobleme` | P2 | C (source-backed) |
| Sleep | schlafhygiene / was hilft beim einschlafen | MED info | `/ratgeber/schlaf/schlafhygiene` (Ph2) | P2 | A |
| Pain | chronische schmerzen | HIGH | `/schmerzen` | P1 | A |
| Pain | rückenschmerzen / nervenschmerzen / muskelverspannungen | HIGH | `/schmerzen` (+ H2s) / Ph2 articles | P1–P2 | A |
| Pain | langanhaltende schmerzen was tun | MED | `/schmerzen` | P2 | A |
| Pain | wann mit schmerzen zum arzt | MED | article + FAQ | P2 | C (source-backed) |
| Pain | behandlungsmöglichkeiten bei chronischen schmerzen | MED | `/ratgeber/schmerzen/behandlungsmoeglichkeiten` (Ph2) | P2 | C |
| Stress | stress / ständig gestresst | HIGH | `/stress-angst` | P1 | A |
| Stress | innere unruhe / nicht abschalten können | HIGH | `/stress-angst` | P1 | A |
| Stress | körperliche symptome von stress | MED | `/ratgeber/stress/koerperliche-symptome` (Ph2) | P2 | A |
| Stress | dauerstress / mentale belastung | MED | `/ratgeber/stress/dauerstress` (Ph2) | P2 | A |
| Anxiety | angst und unruhe / angstsymptome | MED | **hold** — `/stress-angst` only if legally cleared | P3 | **D** |
| Migraine | migräne | HIGH | `/migraene-kopfdruck` | P1 | A |
| Migraine | kopfschmerzen / kopfdruck | HIGH | `/migraene-kopfdruck` (+ H2s) | P1 | A |
| Migraine | migräne symptome / migräne auslöser | MED | `/ratgeber/migraene/symptome`, `/ratgeber/migraene/ausloeser` (Ph2) | P2 | A |
| Migraine | migräne oder spannungskopfschmerz | MED | `/ratgeber/migraene/migraene-vs-kopfschmerz` (Ph2) | P2 | A |
| Migraine | wann mit kopfschmerzen zum arzt / warnzeichen | MED | article + FAQ | P2 | **C** (source-backed, warning-signs) |
| CBD edu | was ist cbd | HIGH info | `/wissen/cbd/was-ist-cbd` | P1 | A (neutral) / **D** if effects mentioned |
| CBD edu | cbd vs thc / unterschied cbd thc | HIGH info | `/wissen/cbd/cbd-vs-thc` | P1 | A / **D** if effects |
| CBD edu | macht cbd high | MED info | FAQ + `/wissen/cbd/was-ist-cbd` | P2 | A |
| CBD edu | was bedeutet thc prozent | MED info | `/wissen/cbd/thc-prozent-erklaert` | P2 | A |
| CBD edu | cbg cbn erklärt / full spectrum | LOW–MED | `/wissen/cbd/cannabinoide-glossar` | P2 | A |
| CBD edu | was ist ein coa / laborzertifikat | LOW | `/wissen/cbd/coa-laborzertifikat` | P3 | A |
| CBD edu | öl vs blüte vs vape | LOW–MED | `/wissen/cbd/formate-im-vergleich` | P3 | **D** (format→use framing) |
| CBD comm | cbd öl kaufen österreich / cbd shop | HIGH commercial | **do not target** — conflicts with product strategy (§54) | — | **B/D** |
| Cannabis med | medizinisches cannabis österreich / rezept | HIGH commercial | **hold** — only post-launch, LEGAL REVIEW, likely `/so-funktioniert-wecare` | — | **D** |
| Brand | wecare / wecare österreich | — owned | `/` | P1 | A |
| Brand | night now / calm night / deep ease / synergy forte / synergy ultra | LOW owned | `/shop/<id>` | P3 | **D** (any benefit copy) |

### C. URL architecture (recommended)

German slugs, flat, one primary destination per intent (§43). **Migrate before first indexing** so there's no redirect debt; keep real 301s from every old slug.

```
/                                  Homepage (category hub)

/schlafprobleme                    Problem page — Sleep        (was /sleep-problems)
/schmerzen                         Problem page — Pain         (was /pain-body-discomfort)
/stress-angst                      Problem page — Stress       (was /stress-anxiety)
/migraene-kopfdruck                Problem page — Migraine     (was /migraine-head-tension)

/so-funktioniert-wecare            How WeCare works — REAL page (currently a homepage section + a redirect)

/ratgeber/                         Content hub index
/ratgeber/schlaf/                  Sleep cluster hub
/ratgeber/schlaf/<article>
/ratgeber/schmerzen/               Pain cluster hub
/ratgeber/stress/                  Stress cluster hub
/ratgeber/migraene/                Migraine cluster hub

/wissen/                           Knowledge hub index (CBD/cannabinoid education — neutral)
/wissen/cbd/was-ist-cbd
/wissen/cbd/cbd-vs-thc
/wissen/cbd/thc-prozent-erklaert
/wissen/cbd/cannabinoide-glossar
/wissen/cbd/coa-laborzertifikat
/wissen/cbd/formate-im-vergleich          (LEGAL REVIEW)

/haeufige-fragen                   FAQ           (was /faq)
/kosten                            Costs         (was /costs)
/kontakt                           Contact       (was /contact)
/impressum  /datenschutz  /agb  /cookie-richtlinie  /versand  /rueckerstattung   (was /legal/*)

# noindex, not in sitemap:
/fragebogen  (+ result / review)   was /assessment/*     — funnel
/loesungen   + /loesungen/<id>     was /shop, /shop/<id> — post-assessment (Solution pages: brand-only index, LEGAL REVIEW)
/warenkorb  /kasse  /bestellbestaetigung
/mein-bereich/*  /anmelden
/general-wellness / /allgemeines-wohlbefinden
```

> **PO decisions embedded here to confirm:** (1) rename the 4 problem slugs to German; (2) promote How-It-Works to a real `/so-funktioniert-wecare` page (CLAUDE.md currently has it as a section + redirect by owner decision — this recommendation extends that); (3) German slugs for FAQ/costs/contact/legal; (4) whether `/loesungen` (shop index) is `noindex` (recommended) or thin-index. None of these are code changes I've made — they're in the plan for §G.

### D. Page optimization map (core pages)

Titles ≤ ~60 chars, descriptions ~150 chars, **draft** DE copy — every line touching CBD/cannabis/medical framing is **LEGAL REVIEW REQUIRED**.

| URL | Intent | Primary keyword | Title (draft) | H1 (keep/adjust) | Idx |
|---|---|---|---|---|---|
| `/` | brand + category | WeCare / geführte Unterstützung | `Unterstützung bei Schlaf, Schmerzen, Stress & Migräne | WeCare` | keep rotating-word H1; add head-term intro line | index |
| `/schlafprobleme` | Schlafprobleme | schlafprobleme | `Schlafprobleme verstehen & nächste Schritte | WeCare` | keep "Schwierigkeiten beim Ein- oder Durchschlafen?"; add `<h2>` "Schlafprobleme: mögliche Ursachen" | index |
| `/schmerzen` | chronische Schmerzen | chronische schmerzen | `Chronische Schmerzen & Körperbeschwerden | WeCare` | keep empathetic H1; early line w/ "chronische Schmerzen" | index |
| `/stress-angst` | Stress / innere Unruhe | stress innere unruhe | `Stress & innere Unruhe verstehen | WeCare` | keep H1; early line w/ "Stress und innere Unruhe" | index |
| `/migraene-kopfdruck` | Migräne / Kopfdruck | migräne kopfschmerzen | `Migräne & Kopfdruck: Infos & nächste Schritte | WeCare` | keep H1; early line w/ "Migräne" + "Kopfschmerzen" | index |
| `/so-funktioniert-wecare` | wie funktioniert WeCare | so funktioniert wecare | `So funktioniert WeCare: der geführte Ablauf | WeCare` | "So funktioniert WeCare" | index |
| `/wissen/cbd/was-ist-cbd` | was ist CBD | was ist cbd | `Was ist CBD? Einfach erklärt | WeCare` | "Was ist CBD?" | index (LEGAL REVIEW on any effect statements) |
| `/wissen/cbd/cbd-vs-thc` | CBD vs THC | cbd vs thc | `CBD vs. THC: die Unterschiede | WeCare` | "CBD und THC: die Unterschiede" | index (LEGAL REVIEW) |
| `/haeufige-fragen` | service Q&A | häufige fragen wecare | `Häufige Fragen zu WeCare | WeCare` | "Häufige Fragen" | index (+ `FAQPage` schema) |
| `/kosten` | Kosten / was kostet | wecare kosten | `Ablauf & Kosten transparent erklärt | WeCare` | "Was dich erwartet – und was es kostet" | index |
| `/loesungen/night-now` (etc.) | brand product | night now | `Night Now – Übersicht | WeCare` | "Night Now" | index — **brand only**, LEGAL REVIEW on all benefit copy |

**Homepage meta description (draft):** *"Du hast Schlafprobleme, Schmerzen, Stress oder Migräne? Beantworte einen kurzen Fragebogen und erhalte eine passende Empfehlung – mit ärztlicher Prüfung, wenn sie medizinisch sinnvoll ist."* — `CBD-basierte Lösung` (currently in `home.hero.subtitle`) is **LEGAL REVIEW REQUIRED** as an indexed claim; keep it visible on-page for transparency but review the exact wording.

**Per problem page, still to build (brief §12):** search-intent definition, secondary keyword list, full H2 outline, FAQ block (from PAA — needs the SERP pass), internal-links-in/out map, schema (`BreadcrumbList` + `FAQPage`), content-length target (problem pages ~700–1,100 words is plenty — match intent, not competitors §33), content-gap-vs-SERP notes, E-E-A-T requirements (author + medical-reviewer slot + last-reviewed date + sources). These are content-team deliverables; the templates go in §49 format.

### E. Content roadmap — first 3 months

**Phase 1 (weeks 1–4) — launch foundation.** No new articles; make the existing surface excellent + crawlable.
- Homepage title fix + head-term intro line.
- 4 problem pages: German slugs + 301s, head-term H2/intro, FAQ block per page (after the SERP/PAA pass), `BreadcrumbList` + `FAQPage` schema.
- Real `/so-funktioniert-wecare` page (from the existing homepage section content).
- `/wissen/cbd/` hub + 2 cornerstone pages: **Was ist CBD?**, **CBD vs. THC** (both LEGAL REVIEW).
- FAQ page → `/haeufige-fragen`, `FAQPage` schema, questions sourced from real search + the existing `faq` namespace.
- All technical SEO from §F.

**Phase 2 (weeks 5–12) — topical authority.** 12–16 genuinely useful guides, evenly across clusters, each ≤ intent-appropriate length, each with sources + internal links + one clear CTA. Prioritised list in §45.

**Phase 3 (month 3+) — expansion by data.** Only after ~4–6 weeks of Search Console: expand the clusters that show impressions/position momentum; refresh underperformers.

**Phase 4 — optimization.** Rolling: title/description CTR tests, FAQ coverage, internal-link tightening, content refresh with a visible "zuletzt geprüft" date.

Do **not** pre-write 100 articles (§44). ~16 in Phase 2, then let GSC choose Phase 3.

### F. Technical SEO audit — see §1.2 (that table IS deliverable F). Summary by severity:
- **P0 (5):** T-01 SPA/no-prerender · T-02 no canonicals · T-03 `wecare.example` hard-coded · T-04 index control not env-aware · T-05 soft 404.
- **P1 (6):** T-06 homepage title · T-07 no structured data · T-08 `lang` not `de-AT` · T-09 English slugs · T-10 static sitemap · T-11 fake redirects.
- **P2 (5):** T-12 no per-page OG / no 1200×630 · T-13 monolithic JS bundle · T-14 no next-gen images · T-15 H1 head-term · T-16 no breadcrumbs.
- **P3 (3):** T-17 `/lab-tests` in sitemap · T-18 legal sitemap noise · T-19 no GSC.
- **P4 (3):** T-20 twitter card size · T-21 route-change CLS check · (image filenames).

### G. Technical changes implemented

**G1 + G2 + G4 + G5 shipped 2026-09-03 (behind the `VITE_SEO_INDEXABLE` gate — no visual change, nothing indexable).**

| File | Change |
|---|---|
| `src/seo/config.ts` | **new** — `siteOrigin()`, `seoIndexable()` (default false; also false while origin is `wecare.example`), `absoluteUrl()`, `robotsContent()`, `orgLegalName()`, `BRAND_NAME`, `OG_IMAGE_PATH`. |
| `src/seo/StructuredData.tsx` | **new** — `SiteStructuredData` (`WebSite` always; `Organization` only when `VITE_ORG_LEGAL_NAME` set), `BreadcrumbJsonLd`, `FaqJsonLd`. `<` escaped in the JSON payload. No `MedicalClinic`/`Physician`/`Review`. |
| `src/app/usePageTitle.ts` | extended: canonical + robots + per-page OG/Twitter + `useLocation`; `opts.noindex` per route; always resets managed tags so nothing leaks between routes. |
| `src/app/paths.ts` | 4 problem pages + FAQ/costs/contact/legal/lab-tests → German slugs; `LEGACY_REDIRECTS` map (old English + `/conditions/*` → new). |
| `src/app/router.tsx` | redirect routes generated from `LEGACY_REDIRECTS`; `/how-it-works` + `/so-funktioniert-wecare` → `/#how-it-works`. |
| `src/components/layout/RootLayout.tsx` | mounts `<SiteStructuredData />`. |
| `index.html` | `<html lang="de-AT">`. |
| `src/i18n/config.ts` | `htmlLang()` → `de` maps to `de-AT`. |
| `src/pages/HomePage.tsx` | `<title>` now `pages.home.title` (was bare "WeCare"). |
| `src/pages/FaqPage.tsx` | `BreadcrumbJsonLd` + `FaqJsonLd` (built from the `faq` namespace). |
| `src/pages/conditions/ConditionLandingPage.tsx` | `BreadcrumbJsonLd`; `general-wellness` forced `noindex`. |
| 9 funnel/shop/dashboard/auth/404 pages | `usePageTitle(…, { noindex: true })`. |
| `vite.config.ts` | `seoAssetsPlugin` — generates `dist/robots.txt` + `dist/sitemap.xml` from env at build. **G5:** `INDEXABLE_ROUTES` list + `@prerenderer/rollup-plugin` (puppeteer renderer) spread in behind `doPrerender = VITE_SEO_INDEXABLE==='true' \|\| PRERENDER==='true'`. |
| `package.json` | **G5 dev-deps** — `@prerenderer/rollup-plugin`, `@prerenderer/renderer-puppeteer`, `puppeteer@21.11.0` (pinned — renderer needs pptr 21). Also `vitest` + `test`/`test:watch` scripts. `puppeteer` added to `pnpm.onlyBuiltDependencies`. |
| `public/sitemap.xml` | **deleted** (now generated); `public/robots.txt` reduced to a dev-safe fallback. |
| `.env.example` | `VITE_SEO_INDEXABLE`, `VITE_ORG_LEGAL_NAME`. |
| `src/config.ts` | `SITE_ORIGIN` const → re-export of `siteOrigin` (no consumers; single source of truth). |
| `CLAUDE.md` | new "SEO foundation" section + German-slug note. |

`pnpm typecheck` + `pnpm build` + `pnpm test` (23) green. Verified: default `pnpm build` (8s) → no prerender, empty `#root`, `dist/robots.txt` = `Disallow: /`, empty sitemap. `PRERENDER=true pnpm build` (~43s) → real static HTML at `dist/<route>/index.html` for all 11 `INDEXABLE_ROUTES` — view-source shows the rendered `<h1>`, per-page `<title> … | WeCare`, `<link rel=canonical>`, `<meta robots>`, inline `WebSite` + `BreadcrumbList` JSON-LD. `VITE_SEO_INDEXABLE=true VITE_SITE_ORIGIN=https://wecare.at` build → prerender + `Allow: /` + private-path disallows + a real German-slug sitemap with `lastmod`.

**G5 done — the SPA now emits crawlable HTML for the marketing routes.** Static `index.html` still ships `<meta robots="noindex, nofollow">` as the safe default; the prerendered per-route snapshots carry the correct per-page robots value (`noindex, nofollow` until `VITE_SEO_INDEXABLE=true`, `index, follow` after). The app is unchanged for users — still a client SPA; prerender is a build-time crawl step that only runs on the go-live build or on demand (`PRERENDER=true`). **The remaining gate to indexing is the robots flip itself (§4) — documented PO + legal approval — not a rendering-model decision anymore.**

**Still NOT done (own decisions):**

| Pkg | What | Risk | Needs a decision on |
|---|---|---|---|
| **G1** | Head-management infra: a `<SEO>` component (or `react-helmet-async`) that sets per-route `<title>`, description, canonical (from `VITE_SITE_ORIGIN`), robots (from an env flag), OG/Twitter, `<html lang="de-AT">`. Replaces the `usePageTitle` hook. Env-driven `robots.txt` + generated `sitemap.xml` at build. | Low–Med — touches every page's head, but additive; behind the noindex flag. | `react-helmet-async` dep vs. a hand-rolled effect. |
| **G2** | JSON-LD infra: `Organization` + `WebSite` site-wide (values from `VITE_*` / config, **placeholder-guarded** — no fake company data indexed), `BreadcrumbList` per page, `FAQPage` on the FAQ + problem pages. | Low — additive `<script type="application/ld+json">`. | Which schema types the PO/legal accept (recommend: those 3 only). |
| **G3** | Real 404 + 301s at the host. `_redirects` / `vercel.json` / `netlify.toml` / nginx snippet for: unknown → 404 status; `/conditions/*`, `/sleep-problems`→`/schlafprobleme` etc., `/how-it-works`. | Low code, but **host-specific** — needs to know the production host. | What's the production host/CDN? |
| **G4** | German slug migration: `paths.ts` + router + every internal `<Link>` + old→new 301s. | **Med** — wide but mechanical; do it before indexing. | PO sign-off on the 4 problem slugs + FAQ/costs/contact/legal slugs (§C). |
| **G5** | ✅ **DONE 2026-09-03** — option (b): `@prerenderer/rollup-plugin` + `@prerenderer/renderer-puppeteer`, spread into `vite.config.ts` plugins behind `doPrerender`. Writes `dist/<route>/index.html` for the 11 `INDEXABLE_ROUTES`. App stays a client SPA; the crawl step runs only on the go-live build (`VITE_SEO_INDEXABLE=true`) or on demand (`PRERENDER=true`), so day-to-day `pnpm build` is unchanged (8s, no prerender). `puppeteer` pinned to `21.11.0` (the renderer is built for pptr 21; pptr 25 fails with a WS-endpoint timeout). | — | Done. |
| **G6** | Performance: route-level `React.lazy` code-split (dashboard/shop/checkout/legal), next-gen hero/condition images with `srcset`. | Med — `React.lazy` is safe; `sharp`/image-plugin is a build-infra call (WC-17 was deliberately deferred). | Whether to add `sharp` + a Vite image plugin now. |

**My recommendation:** **G1 + G2 + G4 + G5 are done.** Still open: **G3** (real host-level 404 + 301s — needs the production-host answer) and **G6** (image pipeline — its own build-infra decision). G1–G5 move technical-SEO readiness from ~7/25 to ~18/25; the remaining technical gap is G3 + the JS bundle.

### H. Legal review queue (Austrian counsel — do not publish without sign-off)

1. **Homepage hero subtitle** — `home.hero.subtitle` currently: *"…wir finden die passende **CBD-basierte Lösung** für deine Bedürfnisse."* Indexed "CBD-based solution" claim tied to problems. Review wording + whether it can be indexed.
2. **Any problem-page copy** that pairs a condition with CBD/cannabis/an outcome — even implicitly ("was dir helfen kann" next to a CBD mention). Review the 4 problem pages end-to-end (already on the decision-set-4 #11 list).
3. **`/wissen/cbd/*` education pages** — "Was ist CBD?", "CBD vs THC", "THC-Prozent erklärt", "Formate im Vergleich". Neutral educational framing is the intent; every sentence that states an *effect* ("CBD wirkt beruhigend", "hilft bei…") needs review or removal. §15 of the brief.
4. **Solution pages** (`/loesungen/<id>`) — all benefit / "who it suits" / effect copy; the 5 Solution names in indexed titles.
5. **FAQ answers** that touch effects, prescriptions, "wie schnell", medical suitability.
6. **Meta descriptions & titles** for the 4 problem pages + CBD pages (they're indexed claims).
7. **`FAQPage` / `Article` schema** — the `text` fields are indexed claims too; review alongside the visible copy.
8. **Migraine "warning signs" / "wann zum Arzt" content** — YMYL; needs source-backed, professionally-reviewed wording (§34).
9. **`Organization` schema** `description` — the one-liner about what WeCare is.
10. **Robots go-live flip itself** — the PO rule (§4): do not set `index, follow` in production without documented PO + legal approval. The env flag makes this a config change, not a deploy — the approval gate is procedural.
11. **Advertising-law review of specific phrasing** across homepage / problem pages / recommendation page / product descriptions / paid-ad landing pages (already logged, decision set 4 #14 — a hard launch blocker).

### I. Search Console setup checklist

- [ ] Create/confirm a **WeCare-company-owned Google account** (not an agency's, not a personal dev account — §39). Add the founder/MD as an Owner.
- [ ] Google Search Console → **add a Domain property** for the real domain (once D20 domain is purchased). Verify via **DNS TXT** (survives host changes). Add the `www`/apex + `https` as needed; set the preferred canonical host in DNS/redirects, not in GSC.
- [ ] Do **not** submit anything for indexing while the site is noindex. GSC can be set up and verified now; it will simply report "excluded by noindex" — that's expected.
- [ ] After the approved go-live flip: submit `https://<domain>/sitemap.xml`; use **URL Inspection** on the homepage + each of the 4 problem pages + How-It-Works to confirm "indexable", correct canonical, correct rendered content.
- [ ] Enable **Core Web Vitals** + **Page Experience** reports (field data appears after ~28 days of traffic).
- [ ] Watch **Coverage / Pages**: "Crawled – currently not indexed", "Discovered – not indexed", soft-404, redirect errors, duplicate-canonical.
- [ ] **Bing Webmaster Tools** (optional, §40): import from GSC, submit the same sitemap. Lower priority than GSC.
- [ ] **No health data in any analytics.** GSC only stores queries/URLs/positions — fine. For product analytics (PostHog EU), the D16 rules already forbid raw answers/PII; keep `landing_page`, first-touch UTM, referrer bucket, device class, locale — nothing else (§41).
- [ ] Connect the SEO funnel: organic landing → `problem_page_cta_clicked` → `assessment_started` → `assessment_completed` → `recommendation_viewed` → `recommendation_continue_clicked` → `medical_review_submitted` → `order_placed` (all events already exist in `src/lib/analytics.ts`; add `traffic_source: "organic"` segmentation once GSC/analytics are linked).

### J. SEO go-live checklist (do NOT approve go-live unless every box is ticked)

**Infrastructure**
- [ ] Real domain configured (D20) and `VITE_SITE_ORIGIN` set to it everywhere (T-03).
- [ ] Canonicals resolve to the real domain, self-referencing, one per indexable page (T-02).
- [ ] `robots.txt` reviewed for production: allows the indexable set, blocks `/fragebogen*`, `/mein-bereich/*`, `/kasse`, `/warenkorb`, `/anmelden`, `/loesungen*` (if noindex), does **not** block CSS/JS (§28).
- [ ] `sitemap.xml` generated, valid, real `lastmod`, excludes all noindex/private/unapproved URLs (T-10, T-17, T-18).
- [ ] Real **404 status** for unknown URLs (T-05); **301s** (not JS bounces) for every renamed slug, no chains (T-11, §29).
- [x] Prerendered HTML for the marketing routes (G5) — `PRERENDER=true pnpm build` writes real HTML for the 11 `INDEXABLE_ROUTES`; view-source shows the H1/title/description/canonical/JSON-LD without JS. **Re-verify on the go-live build** that each route's `<meta robots>` reads `index, follow` once the flag flips.

**Content / data integrity**
- [ ] Austrian legal approval received for all indexed CBD/cannabis/medical/condition copy (§H).
- [ ] Real company information installed in `Organization` schema + Impressum (no `WeCare GmbH` / `Musterstraße 1` placeholders indexed) (§23).
- [ ] `COA_CONFIRMED` still `false` → `/lab-tests` (`/labortests`) stays noindex and out of the sitemap; **no fabricated COA data indexed**.
- [ ] `PRICES_CONFIRMED` still `false` → **no € figures** in indexed copy, titles, descriptions, or `Product`/`Offer` schema (none should exist).
- [ ] No placeholder contact details (`*@wecare.example`, `+43 000…`) in schema, OG, or visible copy.
- [ ] No fabricated reviews / `Review` / `AggregateRating` schema. No `MedicalClinic` / `Physician` / fake doctor persona (§22).

**Per-page**
- [ ] Every indexable page: unique `<title>`, unique meta description, exactly one `<h1>`, sane H2/H3, `de-AT` lang, self-canonical, per-page OG (title/desc/url/image/locale), breadcrumb where >1 level (§19).
- [ ] Every private page (`/fragebogen*`, `/mein-bereich/*`, `/kasse`, `/warenkorb`, `/bestellbestaetigung`, `/anmelden`, `/loesungen*` per decision) is `noindex` **and** absent from the sitemap (§26).
- [ ] `/fragebogen`, `/kasse`, `/mein-bereich` explicitly confirmed `noindex`.

**Operational**
- [ ] 1200×630 OG banner produced to the §51 brief; `twitter:card` → `summary_large_image`.
- [ ] Structured data validated (Rich Results Test + Schema.org validator) — no errors, no `MedicalWebPage`/`Physician`/`Review` types.
- [ ] Search Console property verified + owned by the WeCare company account (§I).
- [ ] Consent/CMP production-ready (real Usercentrics/Cookiebot — still a launch blocker, decision set 3).
- [ ] Mobile real-device QA done (D25) incl. the assessment on a real phone.
- [ ] Core Web Vitals checked (Lighthouse mobile ≥ good LCP/CLS; INP verified in the field after launch) (§30).
- [ ] Custom 404 tested (real status + useful links + "Start assessment" / home).
- [ ] German copy proofread for Austrian market ("Fragebogen", `Nutzer/innen` slash-gendering, `de-AT` number/date formats, no DE-only assumptions) (§52).
- [ ] **Documented PO + legal approval to flip the index flag.** Until then it stays `noindex` (§4, §60).

---

## PART 3 — FINAL REPORT

# WECARE SEO STATUS

**Overall SEO readiness: 34 → 47 / 100** (after the 2026-09-03 G1/G2/G4/G5 pass)

| Dimension | Was | Now | Notes |
|---|---|---|---|
| Technical SEO | 7 / 25 | **18 / 25** | Done: canonical infra, env-driven robots meta + generated `robots.txt`/`sitemap.xml`, `de-AT`, per-page OG, homepage title, conservative JSON-LD, `wecare.example` now config-gated, **prerendered crawlable HTML for the 11 marketing routes (G5)**. Still open: real host-level 404 + 301s (G3 — needs the production host), monolithic JS bundle (G6). |
| Information Architecture | 9 / 15 | **11 / 15** | German slugs shipped with legacy redirects. Still: How-It-Works is a section not a page; no `/ratgeber` or `/wissen` hubs. |
| On-page SEO | 7 / 15 | **10 / 15** | Per-page title/description/canonical/robots/OG now automatic for every page. Still: H1s carry no head term, titles not SERP-verified, no per-page OG image. |
| Content Strategy | 5 / 15 | **5 / 15** | Unchanged — no guides / CBD hub / author-reviewer infra yet. |
| E-E-A-T / Trust | 2 / 10 | **2 / 10** | Unchanged — `Organization` schema wired but omitted until real company data; no author/reviewer/sources/editorial-policy. |
| Performance | 3 / 10 | **3 / 10** | Unchanged — code-split + next-gen images (G6) not done; no measured Lighthouse-mobile. |
| Conversion Alignment | 3 / 5 | **3 / 5** | Unchanged. |
| Measurement | 1 / 5 | **1 / 5** | Unchanged — GSC/Bing/organic segmentation still to do. |

## Status: **NOT READY FOR INDEXING**

Correct and intended — the PO rule is that WeCare stays noindex until legal/company/partner/compliance blockers clear. This score reflects "how much SEO foundation exists", not "should we be live" (we shouldn't). The realistic target after the §G technical work + Phase-1 content + legal sign-off is **65–75 / 100**, at which point "READY WITH CONDITIONS" becomes defensible.

### MUST FIX BEFORE INDEXING
1. ✅ **Rendering model decided + done** (T-01 / G5) — the 11 marketing routes prerender to real HTML on the go-live build. Re-verify each route's `<meta robots>` on that build.
2. ✅ **Canonical + env-driven index control + generated sitemap + real `robots.txt`** using `VITE_SITE_ORIGIN` (T-02/03/04/10 · G1) — done; verify against the real origin once set.
3. **Real 404 + real 301s** at the host (T-05/11 · G3) — needs the production-host answer.
4. ✅ **German slugs + 301s from the old ones** (T-09 · G4) — done; JS redirects now, promote to host 301s with G3.
5. ✅ **Homepage `<title>`**, `de-AT` lang, per-page OG, one conservative JSON-LD layer (`Organization`/`WebSite`/`BreadcrumbList`/`FAQPage`) (T-06/07/08/12 · G1/G2) — done.
6. **Austrian legal sign-off** on every indexed CBD/cannabis/medical/condition string, titles/descriptions, and schema `text` (§H).
7. **Real company data** in Impressum + `Organization` schema; **no** placeholder/COA/price data anywhere indexable (§J).
8. **1200×630 OG banner** (§51) + structured-data validation.
9. **Documented PO + legal approval** to flip the index flag.

### SHOULD FIX BEFORE PAID / SEO SCALE
- Real `/so-funktioniert-wecare` page; `/wissen/cbd/` hub with the 2 cornerstone pages.
- FAQ block per problem page + `FAQPage` schema, sourced from a real Austrian SERP/PAA pass.
- Head-term H2/intro on each problem page; intent-optimised titles.
- Route-level code-split (T-13) + next-gen hero/condition images (T-14); measured Lighthouse-mobile.
- E-E-A-T infra: author + medical-reviewer slot + "zuletzt geprüft" date + sources/methodology/editorial-policy pages.
- GSC verified + owned by the company account; organic funnel segmentation in analytics.
- Phase-2 content: 12–16 useful guides across the 4 clusters (§45 priorities).
- Breadcrumb UI + `BreadcrumbList` shipped with the content hub.

### PHASE 2 OPPORTUNITIES
- Long-tail expansion driven by Search Console data (Phase 3).
- CBD/cannabinoid glossary as a link-worthy asset (§48).
- Original anonymised, consented aggregate data (Austrian sleep/stress trends) for digital PR (§48) — only once enough consented data exists, never individual health info.
- Bing Webmaster Tools.
- Evaluate (don't assume) Google Business Profile eligibility — **only if** a genuine customer-facing location exists; otherwise a documented "not eligible" (§37).
- Revisit whether `/loesungen` (shop index) should thin-index for brand queries, with PO approval.

---

## §49 template — copy for each new indexable page

```
URL:
Page type:            (problem page | hub | article | solution | info)
Search intent:        (what the user wants, in one sentence)
Primary keyword:
Secondary terms:
Title:                (≤ ~60 chars, ends "| WeCare")
Meta description:     (~150 chars, problem-first, no guaranteed outcome)
H1:

Outline:
  H2 ...
    H3 ...
  H2 ...

FAQ:                  (from real PAA / search suggest — not invented)
  Q ...
  Q ...

Internal links IN:    (which pages should link here)
Internal links OUT:   (hub, problem page, assessment, related article)

CTA:                  (always "Fragebogen starten" — never "kaufen")

Schema:               (BreadcrumbList always; FAQPage if a real Q&A block;
                       Article on /ratgeber/* with author + datePublished +
                       dateModified once E-E-A-T infra exists)

Legal-review items:   (every CBD/cannabis/effect/condition claim on the page)
```

## §51 — Open Graph banner brief (1200×630, PNG or static JPG)

- **Contains:** the WeCare wordmark/lockup (`src/assets/logos/wecare-lockup-*`), a short line — e.g. *"Unterstützung bei Schlaf, Schmerzen, Stress & Migräne"* — on the brand light-azure / azure palette (`#f9fdfe` ground, `#218390` accent), calm health-tech feel, generous whitespace.
- **Must not contain:** cannabis leaves, buds, smoke, "CBD Shop", strain names, THC %, prices, any medical claim ("hilft bei…", "Rezept in Minuten"), or a person's face implying a testimonial.
- **Safe zone:** keep text ≥ 80 px from every edge (Slack/WhatsApp/LinkedIn crop differently).
- **Per-page OG** still overrides `og:title`/`og:description`/`og:url`; a single shared banner image is fine for launch, a per-cluster variant is a Phase-2 nicety.
- File: **`public/banner.jpg`** (1200×630, in place — WeCare lockup + DE tagline + a "Fragebogen starten" chip). Wired via `OG_IMAGE_PATH` in `src/seo/config.ts`, emitted as `${VITE_SITE_ORIGIN}/banner.jpg` only when `seoIndexable()`. Review it against the "must not contain" list before go-live; swap for a per-cluster variant later if wanted.
