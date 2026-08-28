# WeCare

German/Austrian-market digital health platform for medical cannabis, presented
problem-first (Sleep · Pain · Stress & Anxiety · Migraine). Doctor-led,
prescription-appropriate — the medical layer sits behind the assessment, never
in front of it.

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS v4 (CSS-configured — no `tailwind.config.js`); design tokens in `src/styles/theme.css`
- shadcn/ui component library (`src/app/components/ui/`)
- react-i18next — German default, English toggle (`src/i18n/`)

## Commands

```
pnpm install     # first run; native build scripts are allowlisted in package.json
pnpm dev         # Vite dev server
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
```

## Localization

Every user-facing string goes through react-i18next. German (`de`) is the default
and fallback locale; English (`en`) is the toggle. Interpolate variables inside
translation strings — never concatenate outside them. See `src/i18n/`.
