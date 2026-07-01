// Tests for the editorial project list (DESIGN.md "Layout: Projects";
// U3 in docs/plans/2026-06-30-001-feat-portfolio-hub-rebuild-plan.md).
//
// Component-render testing note: astro/container's experimental_AstroContainer
// (node_modules/astro/dist/container) can render a compiled AstroComponentFactory,
// but importing a real `.astro` file into a Vitest test requires the Astro Vite
// plugin to be active in the test's Vite config (plain esbuild/Vite cannot parse
// `.astro` syntax at all — confirmed empirically: importing src/components/
// SkipLink.astro under the current plain `defineConfig` in vitest.config.ts fails
// with "invalid JS syntax"). Making it work means switching vitest.config.ts to
// `getViteConfig` from `astro/config` (confirmed empirically to work and to not
// break the existing 23 U1/U2 tests) -- but that's a repo-wide test-infrastructure
// change outside U3's file list, and it would depart from the pattern already
// established by tests/theme-toggle.test.ts and tests/projects-collection.test.js
// (both explicitly test pure logic extracted from the Astro runtime, for the same
// reason documented in projects-collection.test.js: astro:content/`.astro` only
// resolve inside Astro's own runtime, not a bare Vitest process).
//
// So: the filter/sort/index logic is extracted into src/lib/projects.ts (mirroring
// the src/lib/theme.ts pattern) and tested here as pure functions. The *rendered*
// behavior this can't cover from Vitest -- actual DOM output, dev-only route
// absence from dist/, responsive reflow, a11y landmarks/contrast, hover state --
// was verified separately by running `astro build` / `astro dev` and inspecting
// real output (screenshots, computed styles, and structural queries via a headless
// browser). See the implementation report for what was checked and against which
// DESIGN.md values.
import { describe, it, expect } from 'vitest';
import {
  filterLiveProjects,
  compareProjects,
  sortLiveProjects,
  formatIndex,
  type ProjectLike,
} from '../src/lib/projects';

function project(overrides: Partial<ProjectLike> & { name: string }): ProjectLike {
  return {
    hook: `${overrides.name} hook`,
    tech: ['Python'],
    repo_url: `https://github.com/korabeland/${overrides.name}`,
    status: 'live',
    ...overrides,
  };
}

describe('filterLiveProjects', () => {
  it('keeps only status === "live" entries', () => {
    const projects = [
      project({ name: 'a', status: 'live' }),
      project({ name: 'b', status: 'skipped' }),
      project({ name: 'c', status: 'live' }),
    ];

    const result = filterLiveProjects(projects);

    expect(result.map((p) => p.name)).toEqual(['a', 'c']);
  });

  it('a status: skipped card never appears in the filtered result', () => {
    const projects = [project({ name: 'only-one', status: 'skipped' })];
    expect(filterLiveProjects(projects)).toHaveLength(0);
  });

  it('returns an empty array for an empty collection', () => {
    expect(filterLiveProjects([])).toEqual([]);
  });
});

describe('compareProjects (resolved sort semantic)', () => {
  it('sorts two ordered entries ascending by order', () => {
    const a = project({ name: 'a', order: 2 });
    const b = project({ name: 'b', order: 1 });
    expect(compareProjects(a, b)).toBeGreaterThan(0); // a should sort after b
    expect(compareProjects(b, a)).toBeLessThan(0); // b should sort before a
  });

  it('an ordered entry always sorts before an unordered entry, regardless of last_push', () => {
    const ordered = project({ name: 'ordered', order: 99 });
    const unordered = project({ name: 'unordered', last_push: new Date('2026-06-30') });
    expect(compareProjects(ordered, unordered)).toBeLessThan(0);
    expect(compareProjects(unordered, ordered)).toBeGreaterThan(0);
  });

  it('sorts two unordered entries by last_push descending (most recent first)', () => {
    const older = project({ name: 'older', last_push: new Date('2026-01-01') });
    const newer = project({ name: 'newer', last_push: new Date('2026-06-01') });
    expect(compareProjects(newer, older)).toBeLessThan(0); // newer sorts first
    expect(compareProjects(older, newer)).toBeGreaterThan(0);
  });

  it('an unordered entry with no last_push sorts after an unordered entry that has one', () => {
    const withDate = project({ name: 'with-date', last_push: new Date('2026-01-01') });
    const withoutDate = project({ name: 'without-date' });
    expect(compareProjects(withDate, withoutDate)).toBeLessThan(0);
    expect(compareProjects(withoutDate, withDate)).toBeGreaterThan(0);
  });

  it('two unordered entries with no last_push are equal (stable, no crash)', () => {
    const a = project({ name: 'a' });
    const b = project({ name: 'b' });
    expect(compareProjects(a, b)).toBe(0);
  });
});

describe('sortLiveProjects (mixed order/no-order case)', () => {
  it('resolves a mix of ordered and unordered entries per the documented rule', () => {
    // Mirrors the actual mixed shape the watchdog (U6) can produce: some cards
    // carry a manual `order`, newly-appended ones don't and fall back to
    // last_push. This is the "resolved-but-nontrivial rule" the plan calls out.
    const projects = [
      project({ name: 'no-order-recent', last_push: new Date('2026-06-28') }),
      project({ name: 'order-2', order: 2 }),
      project({ name: 'no-order-old', last_push: new Date('2026-01-01') }),
      project({ name: 'order-1', order: 1 }),
      project({ name: 'no-order-no-date' }),
    ];

    const result = sortLiveProjects(projects);

    expect(result.map((p) => p.name)).toEqual([
      'order-1',
      'order-2',
      'no-order-recent',
      'no-order-old',
      'no-order-no-date',
    ]);
  });

  it('filters out status: skipped entries before sorting', () => {
    const projects = [
      project({ name: 'live-1', order: 1 }),
      project({ name: 'skipped-1', order: 0, status: 'skipped' }),
      project({ name: 'live-2', order: 2 }),
    ];

    const result = sortLiveProjects(projects);

    expect(result.map((p) => p.name)).toEqual(['live-1', 'live-2']);
  });

  it('renders one row per live card, in the resolved sort order, for the actual seed shape', () => {
    // Mirrors src/content/projects/*.md as landed by U2: three live cards, all
    // with explicit order values 1, 2, 3.
    const seeds = [
      project({ name: 'fantasy-baseball-drafter', order: 3, last_push: new Date('2026-03-15') }),
      project({ name: 'perian-jobsearch', order: 2, last_push: new Date('2026-06-28') }),
      project({ name: 'perian', order: 1, last_push: new Date('2026-06-28') }),
    ];

    const result = sortLiveProjects(seeds);

    expect(result.map((p) => p.name)).toEqual([
      'perian',
      'perian-jobsearch',
      'fantasy-baseball-drafter',
    ]);
  });

  it('handles a single-card collection', () => {
    const result = sortLiveProjects([project({ name: 'only-one', order: 1 })]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('only-one');
  });

  it('handles an empty collection', () => {
    expect(sortLiveProjects([])).toEqual([]);
  });

  it('handles a collection with only skipped entries (empty result, not a crash)', () => {
    const result = sortLiveProjects([project({ name: 'skipped-only', status: 'skipped' })]);
    expect(result).toEqual([]);
  });
});

describe('formatIndex', () => {
  it('formats as "NN / total", both zero-padded to 2 digits (DESIGN.md example: "01 / 03")', () => {
    expect(formatIndex(1, 3)).toBe('01 / 03');
    expect(formatIndex(2, 3)).toBe('02 / 03');
    expect(formatIndex(3, 3)).toBe('03 / 03');
  });

  it('produces "01 / 01" for a single-card collection, not a broken "01 / 0"', () => {
    expect(formatIndex(1, 1)).toBe('01 / 01');
  });

  it('does not pad beyond 2 digits for totals >= 10 (no leading zero truncation)', () => {
    expect(formatIndex(11, 12)).toBe('11 / 12');
  });
});
