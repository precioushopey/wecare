# public/

Static files served from the site root, copied as-is (no hashing). Reference
by absolute path, e.g. `/favicon.png`.

| File | Referenced from |
|------|-----------------|
| `favicon.png` (512×512) | `index.html` → `<link rel="icon">` — white WeCare mark on an Azure `#218390` rounded tile |
| `apple-touch-icon.png` (180×180) | `index.html` → `<link rel="apple-touch-icon">` — same, opaque |

Regenerate both from `src/assets/logos/wecare-mark-white.png` if the mark
changes (composite onto a `#218390` rounded square).

Add `robots.txt` / `sitemap.xml` here at launch. Everything else — logos in
components, product photos — belongs in `src/assets/`.
