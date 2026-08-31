import { useCallback, useSyncExternalStore } from "react";

import {
  applyTheme,
  detectInitialTheme,
  persistTheme,
  type Theme,
} from "./theme";

/**
 * `useTheme()` — read + change the appearance. Backed by a tiny module-level
 * store (no context/provider needed), mirrored to `localStorage` and to the
 * `<html>` class. Mirrors the `useLanguage()` shape: `{ theme, setTheme, toggle }`.
 */

let currentTheme: Theme = detectInitialTheme();
const listeners = new Set<() => void>();

// Belt-and-suspenders: also apply on module load, for the (rare) case the
// pre-paint script in index.html did not run (e.g. a test environment).
applyTheme(currentTheme);

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME_SNAPSHOT;
}

const DEFAULT_THEME_SNAPSHOT: Theme = "light";

function set(next: Theme): void {
  if (next === currentTheme) return;
  currentTheme = next;
  persistTheme(next);
  emit();
}

interface UseThemeResult {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => set(next), []);
  const toggle = useCallback(
    () => set(currentTheme === "light" ? "dark" : "light"),
    [],
  );

  return { theme, themes: ["light", "dark"], setTheme, toggle };
}
