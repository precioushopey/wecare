# WeCare — Hosting & domain handoff (for the system admin)

**Date:** 2026-09-25 · **For:** whoever connects the domain, hosting and Cloudflare (the owner asked in the project chat: *"I need a System Admin person, who will connect domain, hosting, Cloudflare etc."*).

**Status:** nothing here is set up yet. The host is undecided and the production domain is not confirmed in the repo (the app's support address is `support@wecare360.de`, `SUPPORT_EMAIL` in `src/config.ts`; `VITE_SITE_ORIGIN` is still the placeholder `https://wecare.example`). Everything below is what the site needs from the host. Items marked *recommendation* are advice, not a project decision.

---

## 1. What you are hosting

- A **static single-page app**: React + TypeScript + Vite 6.3.5 + Tailwind v4. `pnpm install && pnpm build` writes `dist/` (about 9 s).
- **No server code, no database, no backend.** Every account, cart, order and review is mocked in the visitor's browser (`localStorage` / `sessionStorage`). What will be added later is in `docs/BACKEND-ARCHITECTURE.md`.
- **Versions:** the repo pins Vite (via a pnpm override) but **not** Node or pnpm. It is built and tested here on Node 24. Pin both in CI. pnpm must be allowed to run the native build scripts of `esbuild`, `@tailwindcss/oxide` and `puppeteer` (`pnpm.onlyBuiltDependencies` in `package.json`).
- **Fonts are self-hosted** (`public/fonts/`, four woff2 files); there is no Google Fonts request. The site makes **no third-party request** today, and none may fire before the visitor gives cookie consent.

## 2. Ground rules from the owner's decisions

- **EU/EEA only** for hosting and every sub-processor (decision D16). *Open, needs counsel:* Cloudflare proxies traffic through its global network, so confirm that using it as a CDN/proxy is acceptable under this rule (and which of its data-localisation options, if any, are needed) before it goes in front of the site.
- **Company-owned accounts** (registrar, DNS, hosting, Cloudflare). The product owner set this rule for PostHog, GlitchTip and Usercentrics: a developer must not personally own them. *Recommendation:* apply it here too.
- **The site stays `noindex`** until the product owner and Austrian legal counsel approve launch (section 5). Do not change that on your own.

## 3. Serving the app

- Serve `dist/` over HTTPS.
- **Two things must both be true, and a plain "everything falls back to `index.html`" rule only does the first:**
  1. Every route the app defines must return `index.html` (HTTP 200) so deep links work.
  2. Any other URL must return a **real 404 status** (the app renders its own "not found" page, but a 200 would be a soft 404; `docs/SEO-FOUNDATION.md` T-05 / G3).

  Routes the app defines (source of truth: `src/app/paths.ts`): `/` `/schlafprobleme` `/schmerzen` `/stress-angst` `/migraene-kopfdruck` `/allgemeines-wohlbefinden` `/so-funktioniert-wecare` `/haeufige-fragen` `/kosten` `/kontakt` `/labortests` `/impressum` `/datenschutz` `/agb` `/cookie-richtlinie` `/versand` `/rueckerstattung` `/login` `/cart` `/checkout` `/order-confirmation` `/shop` `/shop/:id` `/solution` `/assessment/start` `/assessment/result` `/assessment/review` `/assessment/medical-review` `/dashboard`, `/dashboard/follow-up`, `/dashboard/orders`, `/dashboard/profile`, `/dashboard/support`. Query strings such as `?origin=dashboard` and `?problem=` are normal.
- **Caching** *(recommendation)*: `dist/assets/*` are content-hashed, so `Cache-Control: public, max-age=31536000, immutable`; `index.html` and every prerendered `*/index.html`: `no-cache`; fonts: long cache. Enable brotli/gzip.
- **301 redirects.** Today these are client-side bounces (HTTP 200 plus JavaScript), which do not pass search value; they need to be real 301s at the host, with no chains. This is the exact map the app uses (`LEGACY_REDIRECTS` in `src/app/paths.ts`, plus `/how-it-works`):

```
# Cloudflare Pages / Netlify "_redirects" format (adapt to the chosen host)
/signup                          /login                     301
/shop/cart                       /cart                      301
/shop/checkout                   /checkout                  301
/shop/confirmation               /order-confirmation        301
/dashboard/cart                  /cart                      301
/dashboard/checkout              /checkout                  301
/dashboard/order-confirmation    /order-confirmation        301
/dashboard/assessment            /dashboard                 301
/dashboard/recommendation        /dashboard                 301
/sleep-problems                  /schlafprobleme            301
/pain-body-discomfort            /schmerzen                 301
/stress-anxiety                  /stress-angst              301
/migraine-head-tension           /migraene-kopfdruck        301
/general-wellness                /allgemeines-wohlbefinden  301
/conditions/sleep-problems       /schlafprobleme            301
/conditions/chronic-pain         /schmerzen                 301
/conditions/stress-anxiety       /stress-angst              301
/conditions/migraine             /migraene-kopfdruck        301
/conditions/general-wellness     /allgemeines-wohlbefinden  301
/faq                             /haeufige-fragen           301
/costs                           /kosten                    301
/contact                         /kontakt                   301
/lab-tests                       /labortests                301
/legal/imprint                   /impressum                 301
/legal/privacy                   /datenschutz               301
/legal/terms                     /agb                       301
/legal/cookie-policy             /cookie-richtlinie         301
/legal/shipping-policy           /versand                   301
/legal/refund-policy             /rueckerstattung           301
/how-it-works                    /so-funktioniert-wecare    301
```

  Once the host is chosen, this block (and the route allow-list above) can be generated from `paths.ts` and committed, so it cannot drift from the app.

## 4. Build settings

Only `VITE_`-prefixed variables reach the browser, and they are **inlined into the public bundle: never put a secret in one.** They are read at **build** time, so changing one means a rebuild. Template: `.env.example`.

| Variable | Set it to | When |
|---|---|---|
| `VITE_SITE_ORIGIN` | the real `https://` origin, no trailing slash | as soon as the domain exists (canonical URLs, sitemap, OG tags) |
| `VITE_SEO_INDEXABLE` | **leave empty** | only `true` at the approved go-live (section 5) |
| `VITE_ORG_LEGAL_NAME` | the registered company name | before go-live; empty omits the Organization schema (never index placeholder company data) |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | company-owned PostHog **EU** project | before paid acquisition; blank keeps analytics off |
| `VITE_ERROR_DSN` | EU-hosted GlitchTip / Sentry-compatible DSN | launch week; blank keeps error reporting off |

**Two build modes:**

- `pnpm build`: normal (about 9 s), an empty `#root` shell per route.
- **Go-live build** (`VITE_SEO_INDEXABLE=true`, or `PRERENDER=true pnpm build` for a test, about 43 s): also writes real static HTML to `dist/<route>/index.html` for the 11 public routes (`/`, the four problem pages, `/so-funktioniert-wecare`, `/haeufige-fragen`, `/kosten`, `/kontakt`, `/impressum`, `/datenschutz`), using headless Chromium via a pinned `puppeteer` 21.11.0. On a CI container it needs Chromium's system libraries; `--no-sandbox` is already set. The app is still a client-side SPA; this only adds a crawlable snapshot.

## 5. The `noindex` gate

- `index.html` ships `<meta name="robots" content="noindex, nofollow">`, and every build writes `dist/robots.txt` (`Disallow: /`) and an empty `dist/sitemap.xml`.
- The site becomes indexable only when `VITE_SEO_INDEXABLE` is exactly `true` **and** `VITE_SITE_ORIGIN` is a real domain. **That needs documented product-owner and Austrian legal approval.** Never set it on a staging or preview build.
- Do not add host headers (`X-Robots-Tag`) or a hand-written `robots.txt` that contradict the build output. `public/robots.txt` is only a dev fallback.

## 6. Visitor country for the delivery map (the owner's "IP identification" request)

The homepage delivery map shows Austria or Germany. The app reads `<meta name="wecare-country" content="AT">` (or `DE`) from the page; without it, it guesses from the browser's time zone, then language, then Austria (`src/features/delivery/country.ts`). **The browser makes no geo-IP call on purpose:** that would send every visitor's IP to a third party before consent (ePrivacy/GDPR, D16).

So the host has to write that tag, per request, at the edge:

- Values `AT` or `DE` only (anything else: leave the tag out or write `AT`). **Do not store or log the IP for this**, and add the processing to the privacy policy.
- **Caching:** the HTML differs by country, so do not serve one cached copy to everyone. The prerendered pages are static files, so the tag has to be added per request, not at build.
- Cloudflare option, a Worker that reads `request.cf.country` and injects the tag. *Sketch only: adapt to the chosen setup and test it (the assets binding name, cache behaviour and header handling depend on how the site is deployed):*

```js
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request); // or fetch(request) when proxying an origin
    if (!(response.headers.get("content-type") || "").includes("text/html")) return response;
    const country = request.cf && request.cf.country === "DE" ? "DE" : "AT";
    const out = new HTMLRewriter()
      .on("head", {
        element(el) {
          el.append(`<meta name="wecare-country" content="${country}">`, { html: true });
        },
      })
      .transform(response);
    const headers = new Headers(out.headers);
    headers.set("Cache-Control", "private, no-cache"); // country-specific HTML must not be shared
    return new Response(out.body, { status: out.status, headers });
  },
};
```

## 7. Cloudflare settings to check (if it is used)

*(All recommendations; verify each against the account's plan.)*

- SSL/TLS **Full (strict)**, "Always use HTTPS", HSTS once HTTPS is confirmed working.
- **Switch off features that rewrite or inject HTML/JS:** Rocket Loader (can break a React app), Auto Minify if still offered, **Email Address Obfuscation** (the contact page uses a `mailto:` link, and this injects a script), and the **Web Analytics beacon** (a third-party script before consent: enable only if counsel agrees).
- Bot/WAF rules: keep them from blocking legitimate crawlers once the site is approved for indexing.
- If HTML is cached at the edge, vary it by country or bypass the cache for HTML (section 6).

## 8. Security headers *(recommendation, untested)*

`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (the app uses no camera, microphone or geolocation), `X-Frame-Options: DENY` / `frame-ancestors 'none'`.

A **Content-Security-Policy** should start in *report-only* mode. What the app needs today: `default-src 'self'`; `img-src 'self' data:` (profile photos are stored as data URLs); `style-src 'self' 'unsafe-inline'` (React inline styles); `font-src 'self'`; `connect-src 'self'`, plus the PostHog EU host and the error-reporting host once those are switched on. The structured-data blocks are `application/ld+json` (data, not executed).

## 9. Smoke checklist after the first deploy

- [ ] `https://…/` returns 200 over HTTPS; HTTP redirects to HTTPS.
- [ ] `/robots.txt` says `Disallow: /`; `/sitemap.xml` is empty; view-source shows the `noindex` meta.
- [ ] Every redirect in section 3 returns **301** to the listed target, with no chains.
- [ ] An unknown URL returns **404**; a deep link such as `/schlafprobleme` and `/checkout` returns 200 with the app.
- [ ] (Go-live build) `/schlafprobleme`, `/haeufige-fragen` etc. contain real HTML in the response body, not an empty `#root`.
- [ ] Network tab on a first visit with consent unset: **no** third-party requests (no fonts, no analytics).
- [ ] Country tag: a German test IP shows the German map, an Austrian one the Austrian map, anything else Austria.
- [ ] The contact page's `mailto:` link works (email obfuscation is off).

## 10. Not built yet (you will be asked later)

The SMS provider, payment provider, transactional email (the sending domain needs **SPF, DKIM and DMARC** records), the backend and database, a staging environment, analytics and error reporting. All EU-region; see `docs/BACKEND-ARCHITECTURE.md`.

## 11. Open questions for the owner

1. Which domain was bought (decision D20), at which registrar, and under whose account?
2. Which host (Cloudflare Pages or another)? The `*.figma.site` preview link is not a production setup.
3. Is Cloudflare acceptable under the EU-residency rule (counsel)?
4. Do we want a staging site (always `noindex`, ideally behind a password)?
5. Who owns DNS and on-call for the site?
