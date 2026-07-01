// Theme resolution + persistence logic (warm-terminal design system).
//
// Single source of truth for the dark/light decision. Consumed by:
// - the `is:inline` pre-paint script in BaseLayout.astro (mirrors this logic
//   inline, since `is:inline` scripts cannot `import` — see comment there)
// - ThemeToggle.astro's client-side toggle script (imports this module directly)
// - tests/theme-toggle.test.ts (imports this module directly)
//
// Per DESIGN.md's Accessibility section: "`prefers-color-scheme` respected as
// the initial signal when no stored toggle preference exists (default dark
// otherwise)". Resolution order:
//   1. A valid stored preference in localStorage wins.
//   2. Otherwise, `prefers-color-scheme: light` is respected as the signal.
//   3. Otherwise (no preference / dark / unsupported), default to dark.

export type Theme = 'dark' | 'light';

export const STORAGE_KEY = 'theme';

const VALID_THEMES: readonly Theme[] = ['dark', 'light'];

function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (VALID_THEMES as readonly string[]).includes(value);
}

/** Reads the stored preference, if any. Returns null for missing/corrupted values. */
export function getStoredTheme(storage: Pick<Storage, 'getItem'> = localStorage): Theme | null {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    // Storage inaccessible (private browsing, disabled storage, etc.)
    return null;
  }
  return isValidTheme(raw) ? raw : null;
}

/**
 * Resolves the theme to use on initial load, given an optional stored value
 * and whether the environment signals a light-mode preference.
 * Pure function — no I/O — so it's trivially unit-testable.
 */
export function resolveInitialTheme(
  storedTheme: Theme | null,
  prefersLight: boolean
): Theme {
  if (storedTheme) return storedTheme;
  return prefersLight ? 'light' : 'dark';
}

/** Convenience wrapper that reads localStorage + matchMedia and resolves the theme. */
export function getInitialTheme(
  storage: Pick<Storage, 'getItem'> = localStorage,
  matchMedia: (query: string) => { matches: boolean } = (query) => window.matchMedia(query)
): Theme {
  const stored = getStoredTheme(storage);
  const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
  return resolveInitialTheme(stored, prefersLight);
}

/** Applies the theme to the document root as a `data-theme` attribute. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-theme', theme);
}

/** Persists the theme choice. Silently no-ops if storage is unavailable. */
export function storeTheme(theme: Theme, storage: Pick<Storage, 'setItem'> = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore — persistence is best-effort (private browsing, quota, etc.)
  }
}

/** Flips dark <-> light, applying and persisting the new value. Returns the new theme. */
export function toggleTheme(
  current: Theme,
  root: HTMLElement = document.documentElement,
  storage: Pick<Storage, 'setItem'> = localStorage
): Theme {
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, root);
  storeTheme(next, storage);
  return next;
}

/** Reads the currently-applied theme from the DOM, defaulting to dark if unset. */
export function getCurrentTheme(root: HTMLElement = document.documentElement): Theme {
  const attr = root.getAttribute('data-theme');
  return isValidTheme(attr) ? attr : 'dark';
}
