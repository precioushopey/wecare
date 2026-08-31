/**
 * Light / dark appearance. Light is the default and the "as designed" theme;
 * dark is a brand-consistent deep teal-navy re-skin (see the `.dark` block in
 * `src/styles/index.css`). A single explicit choice is stored — there is no
 * "follow the OS" mode (owner decision, Aug 2026).
 *
 * The class is toggled on `<html>` so Tailwind's `dark:` variant
 * (`@custom-variant dark (&:is(.dark *))`) and the `.dark { … }` token
 * overrides both apply. `index.html` carries a tiny pre-paint script that adds
 * the class before first paint so there is no light flash on load.
 */

export type Theme = "light" | "dark";

export const THEMES: readonly Theme[] = ["light", "dark"] as const;
export const DEFAULT_THEME: Theme = "light";

const STORAGE_KEY = "wecare.theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The stored choice, or `null` when nothing is stored / storage is blocked. */
export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function detectInitialTheme(): Theme {
  return readStoredTheme() ?? DEFAULT_THEME;
}

/** Reflect a theme onto `<html>` (class + `color-scheme`). */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** Persist the choice and apply it. */
export function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable (private mode / blocked) — still apply below */
  }
  applyTheme(theme);
}
