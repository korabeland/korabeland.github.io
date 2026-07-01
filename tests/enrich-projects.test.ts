import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildGithubMeta,
  computeFreshestPush,
  countLiveProjects,
  fetchRepoMeta,
  getLiveRepoSlugs,
} from '../scripts/enrich-projects';

/** Builds a fake `fetch` that resolves per-slug per the provided map. */
function mockFetchFor(
  responses: Record<string, { ok: boolean; body?: unknown; throws?: boolean }>,
): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const slug = url.split('/').pop() ?? '';
    const config = responses[slug];

    if (!config || config.throws) {
      throw new Error(`simulated network error for ${slug}`);
    }

    return {
      ok: config.ok,
      json: async () => config.body,
    } as Response;
  }) as typeof fetch;
}

const tmpDirs: string[] = [];

/** Writes a temp `projects/` dir with the given frontmatter status lines and returns its path. */
function makeProjectsDir(statuses: Array<string | undefined>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'enrich-projects-test-'));
  tmpDirs.push(dir);
  statuses.forEach((status, i) => {
    const statusLine = status === undefined ? '' : `status: "${status}"\n`;
    writeFileSync(
      path.join(dir, `project-${i}.md`),
      `---\nname: "p${i}"\nslug: "p${i}"\n${statusLine}---\n`,
      'utf8',
    );
  });
  return dir;
}

afterEach(() => {
  while (tmpDirs.length) {
    const dir = tmpDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe('fetchRepoMeta', () => {
  it('returns language + last_push on a successful response', async () => {
    const fetchImpl = mockFetchFor({
      perian: { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:19Z' } },
    });

    const result = await fetchRepoMeta('perian', fetchImpl);
    expect(result).toEqual({ language: 'Python', last_push: '2026-06-28T10:47:19Z' });
  });

  it('returns null on a non-200 response', async () => {
    const fetchImpl = mockFetchFor({ perian: { ok: false, body: {} } });
    expect(await fetchRepoMeta('perian', fetchImpl)).toBeNull();
  });

  it('returns null when fetch throws (network error)', async () => {
    const fetchImpl = mockFetchFor({});
    expect(await fetchRepoMeta('perian', fetchImpl)).toBeNull();
  });

  it('returns null for a malformed payload (missing both language and pushed_at)', async () => {
    const fetchImpl = mockFetchFor({ perian: { ok: true, body: { full_name: 'korabeland/perian' } } });
    expect(await fetchRepoMeta('perian', fetchImpl)).toBeNull();
  });

  it('handles a payload missing only pushed_at without crashing, returning the field it has', async () => {
    const fetchImpl = mockFetchFor({ perian: { ok: true, body: { language: 'Python' } } });
    const result = await fetchRepoMeta('perian', fetchImpl);
    expect(result).toEqual({ language: 'Python', last_push: null });
  });

  it('handles an unexpected shape (json() resolves to null) without throwing', async () => {
    const fetchImpl = (async () => ({ ok: true, json: async () => null }) as Response) as typeof fetch;
    expect(await fetchRepoMeta('perian', fetchImpl)).toBeNull();
  });
});

describe('computeFreshestPush', () => {
  it('returns the max date across repos as an ISO string', () => {
    const result = computeFreshestPush({
      a: { language: 'Python', last_push: '2026-06-28T10:47:19Z' },
      b: { language: 'Python', last_push: '2026-03-15T11:00:27Z' },
      c: { language: 'Python', last_push: '2026-06-28T10:47:28Z' },
    });
    expect(result).toBe(new Date('2026-06-28T10:47:28Z').toISOString());
  });

  it('returns null when no repo has a last_push', () => {
    expect(computeFreshestPush({ a: { language: 'Python', last_push: null } })).toBeNull();
  });

  it('ignores unparsable date strings rather than crashing', () => {
    const result = computeFreshestPush({
      a: { language: 'Python', last_push: 'not-a-date' },
      b: { language: 'Python', last_push: '2026-03-15T11:00:27Z' },
    });
    expect(result).toBe(new Date('2026-03-15T11:00:27Z').toISOString());
  });
});

describe('countLiveProjects', () => {
  it('counts entries with status "live" and entries with status omitted (schema default)', () => {
    const dir = makeProjectsDir(['live', undefined, 'live']);
    expect(countLiveProjects(dir)).toBe(3);
  });

  it('excludes entries with status "skipped"', () => {
    const dir = makeProjectsDir(['live', 'skipped', 'live']);
    expect(countLiveProjects(dir)).toBe(2);
  });

  it('returns 0 for a directory with no project files', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'enrich-projects-test-empty-'));
    tmpDirs.push(dir);
    expect(countLiveProjects(dir)).toBe(0);
  });

  it('returns 0 when the directory does not exist, without throwing', () => {
    expect(countLiveProjects('/nonexistent/path/does-not-exist')).toBe(0);
  });
});

describe('getLiveRepoSlugs', () => {
  it('returns the slug of every live entry, not a hardcoded list', () => {
    const dir = makeProjectsDir(['live', undefined, 'live']);
    // makeProjectsDir names files project-{i}.md with slug: "p{i}" — proves
    // the slugs come from reading the directory, not a fixed array, since
    // these values ("p0", "p1", "p2") don't match any real repo.
    expect(getLiveRepoSlugs(dir).sort()).toEqual(['p0', 'p1', 'p2']);
  });

  it('excludes skipped entries', () => {
    const dir = makeProjectsDir(['live', 'skipped', 'live']);
    expect(getLiveRepoSlugs(dir).sort()).toEqual(['p0', 'p2']);
  });

  it('picks up a project added after the fact — proves enrichment stays in sync as the watchdog grows the collection', () => {
    const dir = makeProjectsDir(['live']);
    expect(getLiveRepoSlugs(dir)).toEqual(['p0']);

    writeFileSync(path.join(dir, 'watchdog-added.md'), '---\nname: "new"\nslug: "watchdog-added"\nstatus: "live"\n---\n', 'utf8');
    expect(getLiveRepoSlugs(dir).sort()).toEqual(['p0', 'watchdog-added']);
  });
});

describe('buildGithubMeta', () => {
  it('writes language + last_push for each live card on a successful API response', async () => {
    const fetchImpl = mockFetchFor({
      perian: { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:19Z' } },
      'perian-jobsearch': { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:28Z' } },
      'fantasy-baseball-drafter': { ok: true, body: { language: 'Python', pushed_at: '2026-03-15T11:00:27Z' } },
    });

    const meta = await buildGithubMeta(fetchImpl, 3);

    expect(meta.repos.perian).toEqual({ language: 'Python', last_push: '2026-06-28T10:47:19Z' });
    expect(meta.repos['perian-jobsearch']).toEqual({ language: 'Python', last_push: '2026-06-28T10:47:28Z' });
    expect(meta.repos['fantasy-baseball-drafter']).toEqual({ language: 'Python', last_push: '2026-03-15T11:00:27Z' });
    expect(meta.freshest_push).toBe(new Date('2026-06-28T10:47:28Z').toISOString());
  });

  it('falls back to the seed per-repo when the API call fails (network error / non-200), and the build still succeeds', async () => {
    // No mocked responses at all == every fetch throws.
    const fetchImpl = mockFetchFor({});

    const meta = await buildGithubMeta(fetchImpl, 3);

    // Falls back to the committed seed (src/data/github-meta.seed.json) values.
    expect(meta.repos.perian.language).toBe('Python');
    expect(meta.repos.perian.last_push).toBe('2026-06-28T10:47:19Z');
    expect(meta.repos['fantasy-baseball-drafter'].last_push).toBe('2026-03-15T11:00:27Z');
  });

  it('falls back per-repo: one repo succeeds, another fails, both resolve without throwing', async () => {
    const fetchImpl = mockFetchFor({
      perian: { ok: true, body: { language: 'TypeScript', pushed_at: '2026-07-01T00:00:00Z' } },
      // perian-jobsearch and fantasy-baseball-drafter omitted -> both throw.
    });

    const meta = await buildGithubMeta(fetchImpl, 3);

    expect(meta.repos.perian).toEqual({ language: 'TypeScript', last_push: '2026-07-01T00:00:00Z' });
    // Fallen back to seed data, not null/crashed.
    expect(meta.repos['perian-jobsearch'].language).toBe('Python');
    expect(meta.repos['fantasy-baseball-drafter'].language).toBe('Python');
  });

  it('handles a malformed payload (missing pushed_at) per-field without crashing the build', async () => {
    const fetchImpl = mockFetchFor({
      perian: { ok: true, body: { language: 'Python' } }, // no pushed_at
      'perian-jobsearch': { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:28Z' } },
      'fantasy-baseball-drafter': { ok: true, body: { language: 'Python', pushed_at: '2026-03-15T11:00:27Z' } },
    });

    const meta = await buildGithubMeta(fetchImpl, 3);

    // language present from the live response; last_push falls back to seed.
    expect(meta.repos.perian.language).toBe('Python');
    expect(meta.repos.perian.last_push).toBe('2026-06-28T10:47:19Z');
  });

  it('the live project count equals the count passed in from the local content collection, not a separate API number', async () => {
    const fetchImpl = mockFetchFor({
      perian: { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:19Z' } },
      'perian-jobsearch': { ok: true, body: { language: 'Python', pushed_at: '2026-06-28T10:47:28Z' } },
      'fantasy-baseball-drafter': { ok: true, body: { language: 'Python', pushed_at: '2026-03-15T11:00:27Z' } },
    });

    const meta = await buildGithubMeta(fetchImpl, 3);
    expect(meta.live_project_count).toBe(3);
  });
});
