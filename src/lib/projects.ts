// Pure list-shaping logic for the editorial project list (DESIGN.md "Projects"
// section). Kept separate from ProjectList.astro so the filter/sort/indexing
// rules are unit-testable without the Astro content-layer runtime — mirrors
// the src/lib/theme.ts pattern (pure logic, consumed by both the component
// and tests/project-list.test.ts).
//
// Sort semantic (resolved decision — see docs/plans/2026-06-30-001-feat-
// portfolio-hub-rebuild-plan.md, "Deferred to Implementation: whether to keep
// a minimal `order` convention or sort purely by last_push"):
//   1. Entries with an explicit `order` sort first, ascending by `order`.
//   2. Entries without `order` sort after those, by `last_push` descending
//      (most recent first).
//   3. An unordered entry with no `last_push` either sorts last (treated as
//      least-recent).

export interface ProjectLike {
  name: string;
  hook: string;
  tech: string[];
  repo_url: string;
  order?: number;
  last_push?: Date;
  status: 'live' | 'skipped';
}

/** Keeps only status === 'live' entries. */
export function filterLiveProjects<T extends { status: string }>(projects: T[]): T[] {
  return projects.filter((project) => project.status === 'live');
}

/**
 * Comparator implementing the resolved sort semantic above. Pass to
 * `Array.prototype.sort`. Pure — does not mutate its arguments.
 */
export function compareProjects(a: ProjectLike, b: ProjectLike): number {
  const aHasOrder = typeof a.order === 'number';
  const bHasOrder = typeof b.order === 'number';

  // Both ordered: ascending by order.
  if (aHasOrder && bHasOrder) {
    return (a.order as number) - (b.order as number);
  }

  // Only one is ordered: ordered entries always sort first.
  if (aHasOrder) return -1;
  if (bHasOrder) return 1;

  // Neither ordered: descending by last_push (most recent first).
  // Missing last_push sorts last (treated as least-recent).
  const aTime = a.last_push?.getTime();
  const bTime = b.last_push?.getTime();

  if (aTime === undefined && bTime === undefined) return 0;
  if (aTime === undefined) return 1;
  if (bTime === undefined) return -1;
  return bTime - aTime;
}

/** Filters to live projects, then sorts per the resolved semantic. */
export function sortLiveProjects<T extends ProjectLike>(projects: T[]): T[] {
  return filterLiveProjects(projects).sort(compareProjects);
}

/**
 * Formats a 1-based position as a `NN / total` mono index string, e.g.
 * `01 / 03` (DESIGN.md's own example — both numbers zero-padded to 2 digits).
 */
export function formatIndex(position: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(position)} / ${pad(total)}`;
}
