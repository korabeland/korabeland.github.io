import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchPublicRepos,
  filterNewRepos,
  isIncludable,
  readExistingSlugs,
  readOpenWatchdogPrSlugs,
  slugify,
  toCardFile,
  type GitHubRepo,
} from '../scripts/scan-repos';
import { parseFrontmatter } from '../src/lib/project-files';

/** Builds a fake execFileSync (injected, per readOpenWatchdogPrSlugs's execImpl parameter). */
function fakeExec(result: { stdout?: string; throws?: boolean }): typeof execFileSync {
  return vi.fn(() => {
    if (result.throws) throw new Error('simulated: gh command failed');
    return result.stdout ?? '';
  }) as unknown as typeof execFileSync;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '..', 'src', 'content', 'projects');

/**
 * Real data fetched via `gh repo list korabeland` (see task brief). Kept
 * verbatim so the "real data produces zero new proposals" integration test
 * reflects the actual current state of the GitHub account, not an invented
 * fixture. Do NOT mutate this to construct the positive-path test — use
 * REAL_REPOS_WITH_NEW_TOOL below for that instead.
 */
const REAL_REPOS: GitHubRepo[] = [
  { name: 'perian-monorepo', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Python' },
  { name: 'personal-os', fork: false, archived: false, private: true, size: 1000, description: null, language: 'HTML' },
  { name: 'perian-private', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Python' },
  {
    name: 'perian-jobsearch',
    fork: false,
    archived: false,
    private: false,
    size: 1000,
    description: 'Runnable reference implementation of the Perian job-search workflow, on placeholder data.',
    language: 'Python',
  },
  {
    name: 'perian',
    fork: false,
    archived: false,
    private: false,
    size: 1000,
    description:
      'Local-first framework for building, evaluating, and trusting small-model AI agents — plan once, execute locally, refine on demand.',
    language: 'Python',
  },
  { name: 'pacha-story-forge', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Python' },
  { name: 'auto-think-build', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Python' },
  { name: 'atb-profiles', fork: false, archived: false, private: true, size: 1000, description: null, language: null },
  { name: 'korabeland.github.io', fork: false, archived: false, private: false, size: 1000, description: '', language: 'Astro' },
  { name: 'personal-brand', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Astro' },
  { name: 'korabeland.com', fork: false, archived: false, private: false, size: 1000, description: '', language: 'Astro' },
  {
    name: 'gstack',
    fork: true,
    archived: false,
    private: false,
    size: 1000,
    description: "Use Garry Tan's exact Claude Code setup...",
    language: 'TypeScript',
  },
  {
    name: 'fantasy-baseball-drafter',
    fork: false,
    archived: false,
    private: false,
    size: 1000,
    description: 'Configurable fantasy baseball draft assistant for any league format. Built for Claude Code.',
    language: 'Python',
  },
  { name: 'fantasy-baseball-agent-2026', fork: false, archived: false, private: true, size: 1000, description: null, language: 'Python' },
  { name: 'SailCast-Claude', fork: false, archived: false, private: true, size: 1000, description: null, language: 'HTML' },
];

/** Reads the real, current src/content/projects/ directory and extracts slugs. */
function readRealExistingSlugs(): Set<string> {
  return readExistingSlugs(projectsDir);
}

describe('slugify', () => {
  it('lowercases and passes through simple names unchanged', () => {
    expect(slugify('perian')).toBe('perian');
    expect(slugify('fantasy-baseball-drafter')).toBe('fantasy-baseball-drafter');
  });

  it('converts dots and underscores to hyphens (repo names can contain dots, e.g. site repos)', () => {
    expect(slugify('korabeland.github.io')).toBe('korabeland-github-io');
    expect(slugify('korabeland.com')).toBe('korabeland-com');
    expect(slugify('some_repo_name')).toBe('some-repo-name');
  });

  it('lowercases mixed-case names', () => {
    expect(slugify('SailCast-Claude')).toBe('sailcast-claude');
  });

  it('collapses consecutive separators and trims leading/trailing hyphens', () => {
    expect(slugify('foo..bar__baz')).toBe('foo-bar-baz');
    expect(slugify('.leading-dot')).toBe('leading-dot');
    expect(slugify('trailing-dot.')).toBe('trailing-dot');
  });

  it('is stable — calling it twice on the same input yields the same slug', () => {
    const name = 'korabeland.github.io';
    expect(slugify(name)).toBe(slugify(name));
  });
});

describe('isIncludable', () => {
  const base: GitHubRepo = {
    name: 'some-repo',
    fork: false,
    archived: false,
    private: false,
    size: 500,
    description: 'A repo.',
    language: 'Python',
  };

  it('keeps an original, non-archived, non-empty, public repo', () => {
    expect(isIncludable(base)).toBe(true);
  });

  it('Covers AE2 — drops a fork', () => {
    expect(isIncludable({ ...base, name: 'gstack', fork: true })).toBe(false);
  });

  it('drops an archived repo', () => {
    expect(isIncludable({ ...base, archived: true })).toBe(false);
  });

  it('drops an empty repo (size 0)', () => {
    expect(isIncludable({ ...base, size: 0 })).toBe(false);
  });

  it('drops a private repo', () => {
    expect(isIncludable({ ...base, private: true })).toBe(false);
  });

  it('Covers AE2 — drops both site repos by exact name', () => {
    expect(isIncludable({ ...base, name: 'korabeland.github.io' })).toBe(false);
    expect(isIncludable({ ...base, name: 'korabeland.com' })).toBe(false);
  });
});

describe('filterNewRepos — integration check against real current state', () => {
  it('given the real repo list and the real current src/content/projects/ state, proposes zero new cards', () => {
    const existingSlugs = readRealExistingSlugs();
    // Sanity: the three launch seeds must actually be present, otherwise this
    // "zero new proposals" assertion would be vacuous.
    expect(existingSlugs.has('perian')).toBe(true);
    expect(existingSlugs.has('perian-jobsearch')).toBe(true);
    expect(existingSlugs.has('fantasy-baseball-drafter')).toBe(true);

    const openPrSlugs = new Set<string>();
    const result = filterNewRepos(REAL_REPOS, existingSlugs, openPrSlugs);

    expect(result).toEqual([]);
  });
});

describe('filterNewRepos — synthetic positive path', () => {
  it('Covers AE1 — proposes exactly one new card for a hypothetical new public repo', () => {
    const repos: GitHubRepo[] = [
      ...REAL_REPOS,
      {
        name: 'some-new-tool',
        fork: false,
        archived: false,
        private: false,
        size: 250,
        description: 'A brand new public tool that has never been proposed before.',
        language: 'TypeScript',
      },
    ];
    const existingSlugs = readRealExistingSlugs();
    const openPrSlugs = new Set<string>();

    const result = filterNewRepos(repos, existingSlugs, openPrSlugs);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'some-new-tool',
      slug: 'some-new-tool',
      hook: 'A brand new public tool that has never been proposed before.',
      language: 'TypeScript',
    });
  });

  it('the proposed candidate renders to a card file with status: live and the GitHub description as starter hook, not a live-merged page', () => {
    const candidate = {
      name: 'some-new-tool',
      slug: 'some-new-tool',
      hook: 'A brand new public tool that has never been proposed before.',
      language: 'TypeScript',
    };

    const fileContents = toCardFile(candidate);

    expect(fileContents).toContain('status: "live"');
    expect(fileContents).toContain('hook: "A brand new public tool that has never been proposed before."');
    expect(fileContents).toContain('repo_url: "https://github.com/korabeland/some-new-tool"');
    expect(fileContents).toContain('tech: ["TypeScript"]');
    // This is a file on disk, not a merged/deployed page — scan-repos never
    // touches git or opens a PR itself. That gating lives in U7.
  });
});

describe('filterNewRepos — dedup rules', () => {
  const newPublicRepo: GitHubRepo = {
    name: 'previously-seen-repo',
    fork: false,
    archived: false,
    private: false,
    size: 500,
    description: 'Some repo that has already been triaged.',
    language: 'Python',
  };

  it('R13 — a repo already present as status: skipped is not re-proposed', () => {
    // Simulates a committed `status: skipped` denylist entry: its slug is
    // present in existingSlugs regardless of status, per readExistingSlugs
    // reading ANY entry in src/content/projects/.
    const existingSlugs = new Set(['previously-seen-repo']);
    const openPrSlugs = new Set<string>();

    const result = filterNewRepos([newPublicRepo], existingSlugs, openPrSlugs);

    expect(result).toEqual([]);
  });

  it('R13 (end-to-end via disk) — a committed status: skipped fixture file suppresses re-proposal', () => {
    // tests/fixtures/projects-with-skipped/rejected-tool.md is a real file
    // on disk with status: skipped, exercising readExistingSlugs' actual
    // frontmatter parsing rather than a hand-built Set.
    const fixtureDir = path.join(__dirname, 'fixtures', 'projects-with-skipped');
    const existingSlugs = readExistingSlugs(fixtureDir);
    expect(existingSlugs.has('rejected-tool')).toBe(true);

    const result = filterNewRepos(
      [
        {
          name: 'rejected-tool',
          fork: false,
          archived: false,
          private: false,
          size: 500,
          description: 'A repo Korab reviewed and decided not to feature.',
          language: 'Python',
        },
      ],
      existingSlugs,
      new Set<string>()
    );

    expect(result).toEqual([]);
  });

  it('a repo already present as status: live is not duplicated', () => {
    const existingSlugs = new Set(['perian']);
    const openPrSlugs = new Set<string>();

    const result = filterNewRepos(
      [
        {
          name: 'perian',
          fork: false,
          archived: false,
          private: false,
          size: 673,
          description: 'Local-first framework for building, evaluating, and trusting small-model AI agents.',
          language: 'Python',
        },
      ],
      existingSlugs,
      openPrSlugs
    );

    expect(result).toEqual([]);
  });

  it('a repo with an already-open watchdog PR is not re-proposed', () => {
    const existingSlugs = new Set<string>();
    const openPrSlugs = new Set(['previously-seen-repo']);

    const result = filterNewRepos([newPublicRepo], existingSlugs, openPrSlugs);

    expect(result).toEqual([]);
  });
});

describe('readExistingSlugs', () => {
  it('reads the real seed slugs from src/content/projects/, including via a status: skipped fixture', () => {
    const slugs = readRealExistingSlugs();
    expect(slugs.has('perian')).toBe(true);
    expect(slugs.has('perian-jobsearch')).toBe(true);
    expect(slugs.has('fantasy-baseball-drafter')).toBe(true);
  });

  it('returns an empty set for a directory that does not exist, rather than throwing', () => {
    const slugs = readExistingSlugs(path.join(__dirname, 'fixtures', 'does-not-exist'));
    expect(slugs.size).toBe(0);
  });
});

describe('readOpenWatchdogPrSlugs', () => {
  it('extracts the slug from PR titles matching the exact "Add project card: {slug}" prefix', () => {
    const exec = fakeExec({ stdout: 'Add project card: some-new-tool\nAdd project card: another-tool\n' });
    const slugs = readOpenWatchdogPrSlugs(exec);
    expect(slugs).toEqual(new Set(['some-new-tool', 'another-tool']));
  });

  it('ignores open PRs whose title does not match the watchdog prefix', () => {
    const exec = fakeExec({ stdout: 'Add project card: real-one\nfix: unrelated bug\nAdd project card: real-two\n' });
    const slugs = readOpenWatchdogPrSlugs(exec);
    expect(slugs).toEqual(new Set(['real-one', 'real-two']));
  });

  it('returns an empty set when there are no open PRs at all', () => {
    const exec = fakeExec({ stdout: '' });
    expect(readOpenWatchdogPrSlugs(exec).size).toBe(0);
  });

  it('returns an empty set (not a throw) when gh itself fails — e.g. not installed, not authenticated, or a transient API error', () => {
    const exec = fakeExec({ throws: true });
    const slugs = readOpenWatchdogPrSlugs(exec);
    expect(slugs.size).toBe(0);
  });
});

describe('fetchPublicRepos', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockFetchJson(pages: unknown[][]) {
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const body = pages[call] ?? [];
        call += 1;
        return { ok: true, json: async () => body } as Response;
      })
    );
  }

  it('drops entries missing a usable name field, keeps well-formed ones', async () => {
    mockFetchJson([
      [
        { name: 'good-repo', fork: false, archived: false, private: false, size: 10, description: 'x', language: 'Python' },
        { name: '', fork: false, archived: false, private: false, size: 10, description: 'x', language: 'Python' },
        { fork: false, archived: false, private: false, size: 10, description: 'x', language: 'Python' },
      ],
    ]);
    const repos = await fetchPublicRepos();
    expect(repos).toEqual([
      { name: 'good-repo', fork: false, archived: false, private: false, size: 10, description: 'x', language: 'Python' },
    ]);
  });

  it('defaults malformed/missing fork, archived, private, and size fields to whichever value isIncludable() excludes on', async () => {
    mockFetchJson([[{ name: 'malformed-repo' }]]);
    const [repo] = await fetchPublicRepos();
    expect(repo).toEqual({
      name: 'malformed-repo',
      fork: true,
      archived: true,
      private: true,
      size: 0,
      description: null,
      language: null,
    });
    // Every default above independently causes isIncludable() to exclude —
    // the whole point of defaulting this way for a curation tool.
    expect(isIncludable(repo)).toBe(false);
  });

  it('throws when the API returns a non-array body, instead of silently proceeding with no repos', async () => {
    mockFetchJson([]);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ message: 'rate limited' }) }) as Response));
    await expect(fetchPublicRepos()).rejects.toThrow('non-array');
  });

  it('paginates using the raw page size, not the post-filter count, so a page containing malformed entries does not stop pagination early', async () => {
    const fullPageWithOneMalformed = Array.from({ length: 100 }, (_, i) =>
      i === 0
        ? { noNameField: true }
        : { name: `repo-${i}`, fork: false, archived: false, private: false, size: 10, description: null, language: null }
    );
    mockFetchJson([fullPageWithOneMalformed, [{ name: 'second-page-repo', fork: false, archived: false, private: false, size: 10, description: null, language: null }]]);
    const repos = await fetchPublicRepos();
    // 99 well-formed from page 1 (one dropped) + 1 from page 2 — proves
    // page 2 was actually fetched despite page 1's filtered length being 99, not 100.
    expect(repos).toHaveLength(100);
    expect(repos.some((r) => r.name === 'second-page-repo')).toBe(true);
  });
});

describe('toCardFile', () => {
  it('escapes double quotes in the hook so the frontmatter stays valid YAML', () => {
    const candidate = {
      name: 'quote-repo',
      slug: 'quote-repo',
      hook: 'A tool that says "hello" to everyone.',
      language: 'Python',
    };

    const fileContents = toCardFile(candidate);
    expect(fileContents).toContain('hook: "A tool that says \\"hello\\" to everyone."');
  });

  it('renders an empty tech array when language is null', () => {
    const candidate = { name: 'no-lang-repo', slug: 'no-lang-repo', hook: 'No detected language.', language: null };
    const fileContents = toCardFile(candidate);
    expect(fileContents).toContain('tech: []');
  });

  it('escapes a literal backslash in the hook so the frontmatter stays valid YAML', () => {
    const candidate = {
      name: 'backslash-repo',
      slug: 'backslash-repo',
      hook: 'Path: C:\\Users\\test',
      language: 'Python',
    };

    const fileContents = toCardFile(candidate);
    // Round-trips through the real parser rather than asserting on the raw
    // escaped string — proves the frontmatter is valid YAML AND that the
    // parsed value matches the original, not just that *some* escaping happened.
    const { data } = parseFrontmatter(fileContents);
    expect(data.hook).toBe(candidate.hook);
  });

  it('round-trips a hook containing both quotes and backslashes', () => {
    const candidate = {
      name: 'mixed-repo',
      slug: 'mixed-repo',
      hook: 'He said \\"hi\\" from C:\\temp',
      language: 'Python',
    };

    const fileContents = toCardFile(candidate);
    const { data } = parseFrontmatter(fileContents);
    expect(data.hook).toBe(candidate.hook);
  });
});

describe('sanity: real seed files on disk still validate as the schema expects', () => {
  it('every file under src/content/projects/ has a slug field readable by readExistingSlugs', () => {
    const files = readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const raw = readFileSync(path.join(projectsDir, file), 'utf-8');
      expect(raw).toMatch(/^slug:\s*"?[^"\n]+"?\s*$/m);
    }
  });
});
