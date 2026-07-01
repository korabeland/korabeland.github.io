// Footer "synced from github" flourish (DESIGN.md "The Technical Flourish" +
// "Layout: Footer" — mono "synced from github · {date} · {N} public repos").
//
// Reads the build-time-generated src/data/github-meta.json (U5's prebuild
// script output, gitignored) with a defensive fallback to the committed
// src/data/github-meta.seed.json when the generated file is missing — e.g.
// the prebuild hook was skipped. Mirrors U5's own script, which never lets a
// GitHub-API/data problem fail the build.
//
// Kept as a pure/injectable module (not inline in Footer.astro) so the
// date-formatting and fallback logic are unit-testable, matching the
// src/lib/theme.ts and src/lib/projects.ts pattern.

export interface RepoMeta {
  language: string | null;
  last_push: string | null;
}

export interface GithubMetaFile {
  repos: Record<string, RepoMeta>;
  live_project_count: number;
  freshest_push: string | null;
}

export interface ReadFileSync {
  (path: string, encoding: 'utf8'): string;
}

export interface ExistsSync {
  (path: string): boolean;
}

/**
 * Loads github-meta.json if present, otherwise falls back to the committed
 * seed. A dynamic fs read (not a static ES `import`) so a missing generated
 * file never hard-fails the build — the seed always exists as the floor.
 *
 * The generated-file read is itself wrapped in a try/catch (not left to the
 * caller): a present-but-malformed generated file — e.g. an interrupted
 * write — should degrade to the seed the same way a missing one does, and
 * that safety needs to live in this function so any future caller gets it
 * for free rather than having to remember to wrap the call themselves.
 */
export function loadGithubMeta(
  generatedPath: string,
  seedPath: string,
  exists: ExistsSync,
  readFile: ReadFileSync
): GithubMetaFile {
  if (exists(generatedPath)) {
    try {
      return JSON.parse(readFile(generatedPath, 'utf8'));
    } catch {
      // Fall through to the seed below.
    }
  }
  return JSON.parse(readFile(seedPath, 'utf8'));
}

/**
 * Formats an ISO date string as a compact, readable date, e.g. "28 Jun 2026".
 * Returns null for a missing/unparseable input so the caller can render a
 * sensible placeholder instead of "Invalid Date".
 */
export function formatSyncDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Builds the exact footer copy: "synced from github · {date} · {N} public repos". */
export function formatSyncFlourish(meta: Pick<GithubMetaFile, 'freshest_push' | 'live_project_count'>): string {
  const date = formatSyncDate(meta.freshest_push) ?? 'unknown date';
  const repoWord = meta.live_project_count === 1 ? 'public repo' : 'public repos';
  return `synced from github · ${date} · ${meta.live_project_count} ${repoWord}`;
}
