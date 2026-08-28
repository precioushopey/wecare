# Logos

Official WeCare artwork (WECARE BRAND BOOK 2026), wired into
`src/components/brand/Logo.tsx`.

| File | What | Use |
|------|------|-----|
| `black ver.png`          | source lockup, black, 3000×1000 | original — keep, not imported |
| `White ver.png`          | source lockup, white, 3000×1000 | original — keep, not imported |
| `wecare-lockup-black.png` | lockup trimmed to content (~2815×464) | `<Logo />` on light |
| `wecare-lockup-white.png` | ″ white | `<Logo inverse />` on dark |
| `wecare-mark-black.png`   | square sprout mark only (~436²) | `<LogoMark />` on light |
| `wecare-mark-white.png`   | ″ white | `<LogoMark inverse />` on dark |

The `wecare-*` files are tight crops of the two source PNGs (transparent
background). Regenerate them if the source art changes; the component imports
only the `wecare-*` set.

## Usage

```tsx
import { Logo, LogoMark } from "@/components/brand/Logo";

<Logo />                 // lockup, size by height:  <Logo className="h-8" />
<Logo inverse />         // white lockup, for dark surfaces
<LogoMark />             // square mark only
<LogoMark inverse />     // white mark
```

Header, footer and the mobile menu already use `<Logo />`.

## Favicon (not done)

`index.html` has no favicon yet. Add a square PNG/SVG to `/public` and link it
— `wecare-mark-black.png` is close to square if you want a quick one, though a
version on an Azure (`#218390`) tile reads better in a browser tab.
