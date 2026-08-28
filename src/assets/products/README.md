# Product photos

19 transparent-background PNGs (1000×1000) — 18 medical cannabis flowers + the
Curaleaf metered-dose inhaler. Wired into `src/data/products.ts`, resolved by
`src/data/productImages.ts` (`import.meta.glob`, matched by exact filename,
Unicode-NFC-normalised).

Filename pattern: `<Brand> (<THC>_<CBD>) <ABBR> - <Strain>.png`
e.g. `enua (27_1) E85 - G13 Ultra.png` → brand "enua", 27 % THC / <1 % CBD.

## Where they appear (post-assessment only)

- `/shop` grid + `/shop/:id` detail (`ShopIndexPage`, `ProductPage`)
- Result page recommendation cards
- Cart, dashboard "My recommendation"

**Never** on the homepage, problem-landing pages, or in primary nav — per the
spec's imagery/"oils-first" rules and wecare360.de's convention (no public
catalog; products sit behind the assessment + prescription).

## To change the catalogue

Edit `RAW` in `src/data/products.ts` (id, brand, strain, genetics, thcPercent,
priceEur = €/g, originCountry, primaryConditionKey, imageFile). Add a new photo
here and point `imageFile` at its exact name. Genetics, prices, origin, COA and
irradiation values are **placeholders** pending real pharmacy data.

Source PNGs are large (0.5–0.9 MB each). Compress / resize before production.
