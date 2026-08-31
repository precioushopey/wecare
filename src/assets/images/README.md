# Marketing photography

Calm medical-wellness stock photos for the public pages. Resolved by
`src/data/siteImages.ts` (`import.meta.glob`, keyed `<folder>/<basename>`),
referenced through the `IMG` map. Rendered with `ImageWithFallback`.

## Wired in

| File | Used on |
|------|---------|
| `Knowledge Hub/Hero.png` | homepage hero |
| `Condition Page.png` | homepage "Simple recommendations" section anchor (doctor photo) |
| `How it works Page.png` | homepage final-CTA image (in-grid, bottom-faded) |
| `Homepage/Hero.png` | homepage "A guided and responsible experience" section anchor; General Wellness fallback hero |
| `Homepage/8.png` | "How WeCare works" step 3 card (get matched) |
| `Homepage/9–12.png` | "Choose your concern" card banners (sleep / pain / stress / migraine) |
| `Knowledge Hub/60, 61, 64.png` | "How WeCare works" step cards (choose / assessment / continue) |
| `C1 - Sleep Problem/Hero.png` · `C2/26.png` · `C3/35.png` · `C4/44.png` | condition landing-page heroes |

Homepage section anchors are floated cut-outs with a soft bottom fade
(`.image-fade-b`) and explicit `width`/`height` to hold layout before load.

## Available, not yet wired

- `C1–C4/<numbers>.png` (the remaining per-condition photos) — for the
  "Common situations" / "How WeCare helps" sections of the condition template.
- `Knowledge Hub/59, 63, 65, 66.png` — leftover from the set (`66` has cannabis-leaf imagery — do not use; `63`, the courier-delivery shot, was the step-4 card until swapped for `64`). The "Knowledge Hub" folder name is just where these stock photos originated — the Knowledge Hub *page* itself was removed (owner decision, Aug 2026); these files are generic marketing photography now.
- `Homepage/13–15.png` — former testimonial avatars; the testimonials
  section was removed (fabricated content). Unused.
- `Women_s Pain/` — empty.

Photos are 1000–1920 px PNGs. Compress / convert to WebP before production.
