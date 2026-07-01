import { beforeEach, describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  applyTheme,
  getCurrentTheme,
  getInitialTheme,
  getStoredTheme,
  resolveInitialTheme,
  storeTheme,
  toggleTheme,
} from '../src/lib/theme';

function matchMediaFactory(matches: boolean) {
  return () => ({ matches });
}

describe('resolveInitialTheme (pure)', () => {
  it('defaults to dark when localStorage is empty and no color-scheme preference', () => {
    expect(resolveInitialTheme(null, false)).toBe('dark');
  });

  it('respects prefers-color-scheme: light as the initial signal when nothing is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('light');
  });

  it('a stored preference wins over the color-scheme signal', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('dark', true)).toBe('dark');
  });
});

describe('getStoredTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing is stored', () => {
    expect(getStoredTheme(localStorage)).toBeNull();
  });

  it('returns the stored theme when valid', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    expect(getStoredTheme(localStorage)).toBe('light');
  });

  it('treats a corrupted/unexpected stored value as absent rather than throwing', () => {
    localStorage.setItem(STORAGE_KEY, 'blue');
    expect(getStoredTheme(localStorage)).toBeNull();

    localStorage.setItem(STORAGE_KEY, '');
    expect(getStoredTheme(localStorage)).toBeNull();

    localStorage.setItem(STORAGE_KEY, '{"not":"a theme"}');
    expect(getStoredTheme(localStorage)).toBeNull();
  });

  it('does not throw when storage access itself fails', () => {
    const throwingStorage: Pick<Storage, 'getItem'> = {
      getItem() {
        throw new Error('storage disabled');
      },
    };
    expect(() => getStoredTheme(throwingStorage)).not.toThrow();
    expect(getStoredTheme(throwingStorage)).toBeNull();
  });
});

describe('getInitialTheme (integration over localStorage + matchMedia)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('default load with empty localStorage lands in dark mode', () => {
    const theme = getInitialTheme(localStorage, matchMediaFactory(false));
    expect(theme).toBe('dark');
  });

  it('a stored preference is respected on next load', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const theme = getInitialTheme(localStorage, matchMediaFactory(false));
    expect(theme).toBe('light');
  });

  it('a corrupted stored value falls back through to the color-scheme signal, not a crash', () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-real-theme');
    const theme = getInitialTheme(localStorage, matchMediaFactory(true));
    expect(theme).toBe('light');
  });
});

describe('applyTheme / getCurrentTheme', () => {
  it('sets and reads the data-theme attribute on the given root', () => {
    const root = document.createElement('html');
    applyTheme('light', root);
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(getCurrentTheme(root)).toBe('light');
  });

  it('getCurrentTheme defaults to dark when the attribute is unset', () => {
    const root = document.createElement('html');
    expect(getCurrentTheme(root)).toBe('dark');
  });
});

describe('toggleTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('flips dark to light, applies it to the DOM, and persists it', () => {
    const root = document.createElement('html');
    applyTheme('dark', root);

    const next = toggleTheme('dark', root, localStorage);

    expect(next).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('flips light back to dark and persists it', () => {
    const root = document.createElement('html');
    applyTheme('light', root);

    const next = toggleTheme('light', root, localStorage);

    expect(next).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });
});

describe('storeTheme', () => {
  it('does not throw when the underlying storage.setItem throws', () => {
    const throwingStorage: Pick<Storage, 'setItem'> = {
      setItem() {
        throw new Error('quota exceeded');
      },
    };
    expect(() => storeTheme('dark', throwingStorage)).not.toThrow();
  });
});
