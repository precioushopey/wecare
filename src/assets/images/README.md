# Marketing photography

Calm medical-wellness stock photos for the public pages. Resolved by
`src/data/siteImages.ts` (`import.meta.glob`, keyed `<folder>/<basename>`),
referenced through the `IMG` map. Rendered with `ImageWithFallback`.

Every file in this folder is now wired in — the unreferenced spares (the
per-condition section shots, the pre-swap step photos, the removed-testimonial
avatars, the Knowledge-Hub leftovers) were deleted in a 2026-09-02 repo
cleanup. Restore any from git history if a slot needs a different photo.

## Wired in

| File | Used on |
|------|---------|
| `Knowledge Hub/Hero.png` | homepage hero (`IMG.homeHero`) |
| `hero section.png` | homepage "Simple recommendations" anchor + login welcome panel (`IMG.homeSolutions`, `IMG.login`) |
| `Condition Page.png` | homepage "A guided and responsible experience" section (`IMG.homeGuidance`) |
| `Homepage/Hero.png` | homepage final-CTA image + General Wellness fallback hero (`IMG.homeDoctor`, `IMG.conditionHero.generalWellness`) |
| `Homepage/9–12.png` | "Choose your concern" card banners (sleep / pain / stress / migraine) |
| `assessment.jpg` · `results.jpg` | "How WeCare works" step 2 / step 3 cards (`IMG.process.assessment`, `IMG.process.match`) |
| `Knowledge Hub/60.png` · `Knowledge Hub/63.png` | "How WeCare works" step 1 (choose) / step 4 (continue) cards |
| `C1 - Sleep Problem/Hero.png` · `C2 - Chronic Pain/26.png` · `C3 - Stress & Anxiety/35.png` · `C4 - Migraine/44.png` | condition landing-page heroes |

`assessment.jpg` / `results.jpg` are JPGs at the photography root, not in a
dated subfolder — `siteImages.ts`'s glob matches `.jpg`/`.jpeg` alongside `.png`
to pick them up.

Homepage section anchors are floated cut-outs with a soft bottom fade
(`.image-fade-b`) and explicit `width`/`height` to hold layout before load.

The "Knowledge Hub" folder name is a leftover from the removed Knowledge Hub
page — the photos in it are just generic marketing stock now.

Photos are 1000–1920 px PNGs. Compress / convert to WebP before production.
