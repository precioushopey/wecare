import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'

/**
 * Public, indexable routes — single source for the generated sitemap.
 * German slugs (docs/SEO-FOUNDATION.md §C). Funnel / shop / dashboard / auth /
 * legacy-redirect routes are intentionally excluded. Keep in sync with
 * src/app/paths.ts.
 */
const INDEXABLE_ROUTES: { path: string; changefreq: string }[] = [
  { path: '/', changefreq: 'weekly' },
  { path: '/schlafprobleme', changefreq: 'monthly' },
  { path: '/schmerzen', changefreq: 'monthly' },
  { path: '/stress-angst', changefreq: 'monthly' },
  { path: '/migraene-kopfdruck', changefreq: 'monthly' },
  { path: '/so-funktioniert-wecare', changefreq: 'monthly' },
  { path: '/haeufige-fragen', changefreq: 'monthly' },
  { path: '/kosten', changefreq: 'monthly' },
  { path: '/kontakt', changefreq: 'yearly' },
  { path: '/impressum', changefreq: 'yearly' },
  { path: '/datenschutz', changefreq: 'yearly' },
]

/**
 * Writes `dist/robots.txt` and `dist/sitemap.xml` at build from env.
 *
 * - `VITE_SEO_INDEXABLE !== "true"` OR origin still the placeholder →
 *   robots.txt is `Disallow: /` (the whole site stays blocked).
 * - Cleared for indexing → robots.txt allows the site + points at the sitemap;
 *   sitemap lists `INDEXABLE_ROUTES` against the real origin.
 *
 * This replaces the old hand-maintained `public/{robots.txt,sitemap.xml}`.
 */
function seoAssetsPlugin(env: Record<string, string>): Plugin {
  const origin = (env.VITE_SITE_ORIGIN || 'https://wecare.example').replace(/\/$/, '')
  const indexable =
    env.VITE_SEO_INDEXABLE === 'true' && origin !== 'https://wecare.example'

  return {
    name: 'wecare-seo-assets',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      if (!fs.existsSync(outDir)) return

      const robots = indexable
        ? [
            'User-agent: *',
            'Allow: /',
            'Disallow: /fragebogen',
            'Disallow: /assessment',
            'Disallow: /shop',
            'Disallow: /warenkorb',
            'Disallow: /kasse',
            'Disallow: /dashboard',
            'Disallow: /mein-bereich',
            'Disallow: /login',
            'Disallow: /signup',
            'Disallow: /anmelden',
            'Disallow: /solution',
            'Disallow: /labortests',
            'Disallow: /lab-tests',
            'Disallow: /allgemeines-wohlbefinden',
            'Disallow: /general-wellness',
            '',
            `Sitemap: ${origin}/sitemap.xml`,
            '',
          ].join('\n')
        : [
            '# Not cleared for indexing (VITE_SEO_INDEXABLE / VITE_SITE_ORIGIN).',
            '# See docs/SEO-FOUNDATION.md §4.',
            'User-agent: *',
            'Disallow: /',
            '',
          ].join('\n')
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robots)

      const now = new Date().toISOString().slice(0, 10)
      const urls = indexable
        ? INDEXABLE_ROUTES.map(
            (r) =>
              `  <url><loc>${origin}${r.path}</loc><lastmod>${now}</lastmod><changefreq>${r.changefreq}</changefreq></url>`,
          ).join('\n')
        : ''
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        indexable
          ? '<!-- Generated at build from vite.config.ts INDEXABLE_ROUTES. -->'
          : '<!-- Site not cleared for indexing; sitemap intentionally empty. -->',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>',
        '',
      ]
        .filter(Boolean)
        .join('\n')
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Prerender the public marketing routes to real static HTML (PO decision A5).
  // Runs on the go-live build (VITE_SEO_INDEXABLE=true) or on demand
  // (PRERENDER=true) so day-to-day `pnpm build` stays fast. The app stays a
  // client SPA — this only writes a crawlable HTML snapshot per route.
  const doPrerender =
    env.VITE_SEO_INDEXABLE === 'true' || env.PRERENDER === 'true'

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      seoAssetsPlugin(env),
      ...(doPrerender
        ? [
            prerender({
              routes: INDEXABLE_ROUTES.map((r) => r.path),
              renderer: '@prerenderer/renderer-puppeteer',
              rendererOptions: {
                // The SPA sets its head + renders content client-side; give it
                // a beat to settle (i18n + router + head effects).
                renderAfterTime: 2500,
                maxConcurrentRoutes: 2,
                headless: true,
                launchOptions: {
                  args: ['--no-sandbox', '--disable-setuid-sandbox'],
                },
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
