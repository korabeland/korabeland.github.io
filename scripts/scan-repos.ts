// Watchdog scan-and-draft script.
//
// Lists korabeland's public GitHub repos, applies the inclusion filter,
// dedups against the `projects` content collection (any status, per R13)
// and any open watchdog PR, and writes a pending
// `src/content/projects/{slug}.md` file for each genuinely-new, includable
// repo. Invoked by the scheduled GitHub Action in .github/workflows/watchdog.yml
// (a separate unit) — this script only produces files on disk; opening the
// PR is the workflow's job.
//
// PR-detection convention (for the calling workflow to stay consistent with):
// a repo has an "open watchdog PR" if there is an open PR whose title matches
// `Add project card: {slug}` (see PR_TITLE_PREFIX below). The workflow that
// opens PRs must use this exact title format.

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readProjectFiles } from '../src/lib/project-files';
import { githubApiHeaders } from '../src/lib/github-api';

const REPO_OWNER = 'korabeland';
const SITE_REPO_NAMES = new Set(['korabeland.github.io', 'korabeland.com']);
const PR_TITLE_PREFIX = 'Add project card: ';
// A hang (network accepted, response never sent) is not a rejection on its
// own, so it wouldn't otherwise surface as an error — a timeout turns it
// into a normal fetch/exec failure instead of blocking the watchdog job
// indefinitely (up to GitHub Actions' 6-hour default job ceiling).
const FETCH_TIMEOUT_MS = 10_000;
const EXEC_TIMEOUT_MS = 10_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', 'src', 'content', 'projects');

/** Subset of the GitHub REST API repo shape this script depends on. */
export interface GitHubRepo {
  name: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
  /** Repo size in KB, as reported by the GitHub API. 0 means empty. */
  size: number;
  description: string | null;
  language: string | null;
}

/** A repo that has passed the inclusion filter, normalized for downstream use. */
export interface RepoCandidate {
  name: string;
  slug: string;
  hook: string;
  language: string | null;
}

/**
 * Converts a repo name into a filesystem-safe, stable slug.
 * Repo names are already fairly safe on GitHub, but this defends against
 * dots, underscores, and mixed case (e.g. `korabeland.github.io`) so slugs
 * stay predictable filenames.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[._]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Inclusion filter: keep original (non-fork), non-archived, non-empty,
 * public repos, excluding the two site repos by exact name.
 * Private repos are expected to have already been excluded by the caller
 * (the repo listing is fetched with `type=public`), but the private check
 * is kept here too as a defensive backstop.
 */
export function isIncludable(repo: GitHubRepo): boolean {
  if (repo.fork) return false;
  if (repo.archived) return false;
  if (repo.private) return false;
  if (repo.size === 0) return false;
  if (SITE_REPO_NAMES.has(repo.name)) return false;
  return true;
}

/**
 * Pure function: given the full repo list and the current state (slugs
 * already present in src/content/projects/ under ANY status, and slugs
 * with an open watchdog PR), returns exactly the genuinely-new, includable
 * repo candidates. No network calls, no filesystem access — fully
 * unit-testable with injected fixtures.
 */
export function filterNewRepos(
  allRepos: GitHubRepo[],
  existingSlugs: Set<string>,
  openPrSlugs: Set<string>
): RepoCandidate[] {
  const candidates = allRepos
    .filter(isIncludable)
    .map((repo) => ({
      name: repo.name,
      slug: slugify(repo.name),
      hook: repo.description ?? '',
      language: repo.language,
    }))
    .filter((candidate) => !existingSlugs.has(candidate.slug) && !openPrSlugs.has(candidate.slug));

  // Two different repo names can slugify to the same value (e.g. `my.tool`
  // and `my-tool` both become `my-tool`). Writing both as {slug}.md would
  // silently clobber one with the other. Drop every candidate involved in a
  // same-batch collision rather than guessing which one "wins" — a human
  // can add the dropped repo(s) by hand or wait for a follow-up run once
  // the ambiguity is resolved (e.g. one repo renamed).
  const slugCounts = new Map<string, number>();
  for (const candidate of candidates) {
    slugCounts.set(candidate.slug, (slugCounts.get(candidate.slug) ?? 0) + 1);
  }
  const collisions = [...slugCounts.entries()].filter(([, count]) => count > 1).map(([slug]) => slug);
  if (collisions.length > 0) {
    console.warn(
      `scan-repos: slug collision(s) detected in this batch, dropping affected candidates: ${collisions.join(', ')}`
    );
  }
  return candidates.filter((candidate) => !collisions.includes(candidate.slug));
}

/**
 * Renders the frontmatter markdown file body for a new project card.
 * Matches the hand-written seed style (double-quoted scalars, flow-style
 * array) rather than js-yaml's default block style, so watchdog-generated
 * files look identical to human-authored ones.
 */
export function toCardFile(candidate: RepoCandidate): string {
  // Escape backslashes before quotes: inside a double-quoted YAML scalar,
  // backslash is itself the escape character, so a repo description
  // containing one (e.g. "Path: C:\Users\x") would otherwise silently
  // corrupt the frontmatter — `\U` isn't a valid YAML escape and `\t`
  // would become a literal tab, desyncing the parsed value from the
  // source text without raising an error at write time.
  const hook = candidate.hook.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const tech = candidate.language ? [candidate.language] : [];
  const techLine = `[${tech.map((t) => `"${t}"`).join(', ')}]`;
  const lines = [
    '---',
    `name: "${candidate.name}"`,
    `slug: "${candidate.slug}"`,
    `hook: "${hook}"`,
    `tech: ${techLine}`,
    `repo_url: "https://github.com/${REPO_OWNER}/${candidate.name}"`,
    'status: "live"',
    '---',
    '',
  ];
  return lines.join('\n');
}

/** Reads the slugs of every entry currently in src/content/projects/, regardless of status. */
export function readExistingSlugs(projectsDir: string): Set<string> {
  const slugs = new Set<string>();
  for (const entry of readProjectFiles(projectsDir)) {
    const slug = entry.data.slug;
    // Fall back to the filename stem if slug isn't a string — still counts
    // as "present" so we never double-propose.
    slugs.add(typeof slug === 'string' && slug.trim() ? slug.trim() : entry.file.replace(/\.md$/, ''));
  }
  return slugs;
}

/**
 * Fetches the slugs of repos that already have an open watchdog PR, via
 * `gh pr list`. `execImpl` is injectable (mirrors fetchRepoMeta's
 * `fetchImpl` parameter elsewhere in this file) so this is unit-testable
 * without actually shelling out to `gh` — mocking `execFileSync` as a
 * module import proved unreliable across this file/test-file boundary,
 * so dependency injection is the pattern this codebase already uses for
 * exactly this problem.
 */
export function readOpenWatchdogPrSlugs(
  execImpl: typeof execFileSync = execFileSync
): Set<string> {
  const slugs = new Set<string>();
  let stdout: string;
  try {
    stdout = execImpl(
      'gh',
      ['pr', 'list', '--state', 'open', '--json', 'title', '--jq', '.[].title'],
      { encoding: 'utf-8', timeout: EXEC_TIMEOUT_MS }
    );
  } catch (err) {
    console.warn('scan-repos: could not list open PRs via gh, proceeding with no open-PR slugs known:', err);
    return slugs;
  }
  for (const title of stdout.split('\n')) {
    if (title.startsWith(PR_TITLE_PREFIX)) {
      slugs.add(title.slice(PR_TITLE_PREFIX.length).trim());
    }
  }
  return slugs;
}

/**
 * Normalizes one raw GitHub API repo object into GitHubRepo, or null to drop
 * it if `name` — the one field nothing downstream can function without —
 * isn't a usable string. For the boolean/size filter fields, a
 * missing/malformed value defaults to whichever value isIncludable()
 * treats as "exclude" (fork/archived/private: true, size: 0): if the API
 * ever returns a field we don't expect, the safe failure mode for a
 * curation tool is to leave the repo out, not to silently include
 * something a real value would have excluded.
 */
function normalizeRepo(raw: unknown): GitHubRepo | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== 'string' || !r.name) return null;
  return {
    name: r.name,
    fork: typeof r.fork === 'boolean' ? r.fork : true,
    archived: typeof r.archived === 'boolean' ? r.archived : true,
    private: typeof r.private === 'boolean' ? r.private : true,
    size: typeof r.size === 'number' ? r.size : 0,
    description: typeof r.description === 'string' ? r.description : null,
    language: typeof r.language === 'string' ? r.language : null,
  };
}

/** Fetches all public, non-fork-filtered repo listing for REPO_OWNER via the GitHub REST API. */
export async function fetchPublicRepos(): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  const headers = githubApiHeaders();
  let page = 1;
  for (;;) {
    const res = await fetch(
      `https://api.github.com/users/${REPO_OWNER}/repos?type=public&per_page=100&page=${page}`,
      { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    );
    if (!res.ok) {
      throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    }
    const rawBatch = await res.json();
    if (!Array.isArray(rawBatch)) {
      throw new Error('GitHub API returned a non-array repo list');
    }
    const batch = rawBatch.map(normalizeRepo).filter((repo): repo is GitHubRepo => repo !== null);
    repos.push(...batch);
    if (rawBatch.length < 100) break;
    page += 1;
  }
  return repos;
}

/** I/O wrapper: fetches live state, runs the pure filter, and writes any new card files. */
export async function scanAndDraft(): Promise<RepoCandidate[]> {
  const [allRepos, existingSlugs, openPrSlugs] = await Promise.all([
    fetchPublicRepos(),
    Promise.resolve(readExistingSlugs(PROJECTS_DIR)),
    Promise.resolve(readOpenWatchdogPrSlugs()),
  ]);

  const candidates = filterNewRepos(allRepos, existingSlugs, openPrSlugs);

  for (const candidate of candidates) {
    const filePath = path.join(PROJECTS_DIR, `${candidate.slug}.md`);
    writeFileSync(filePath, toCardFile(candidate), 'utf-8');
    console.log(`scan-repos: wrote ${filePath}`);
  }

  if (candidates.length === 0) {
    console.log('scan-repos: no new repos to propose.');
  }

  return candidates;
}

// Only run when invoked directly (not when imported by tests).
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  scanAndDraft().catch((err) => {
    console.error('scan-repos: failed:', err);
    process.exitCode = 1;
  });
}
