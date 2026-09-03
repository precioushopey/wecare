# Logos

Official WeCare artwork (WECARE BRAND BOOK 2026), wired into
`src/components/brand/Logo.tsx`.

| File | What | Use |
|------|------|-----|
| `wecare-lockup-black.png` | lockup trimmed to content (~2815×464) | `<Logo />` on light |
| `wecare-lockup-white.png` | ″ white | `<Logo inverse />` on dark |
| `wecare-mark-black.png`   | square sprout mark only (~436²) | `<LogoMark />` on light |
| `wecare-mark-white.png`   | ″ white | `<LogoMark inverse />` on dark |

The `wecare-*` files are tight crops (transparent background) of the original
3000×1000 source lockups `black ver.png` / `White ver.png`, which were deleted
in a 2026-09-02 repo cleanup — restore them from git history if the source art
needs regenerating.

## Usage

```tsx
import { Logo, LogoMark } from "@/components/brand/Logo";

<Logo />                 // lockup, size by height:  <Logo className="h-8" />
<Logo inverse />         // white lockup, for dark surfaces
<LogoMark />             // square mark only
<LogoMark inverse />     // white mark
```

Header, footer and the mobile menu already use `<Logo />`.

## Favicon

Done: `public/favicon.png` + `public/apple-touch-icon.png` (white mark on an
Azure `#218390` tile), linked from `index.html`.
