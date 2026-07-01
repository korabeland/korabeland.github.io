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

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const REPO_OWNER = 'korabeland';
const SITE_REPO_NAMES = new Set(['korabeland.github.io', 'korabeland.com']);
const PR_TITLE_PREFIX = 'Add project card: ';

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
  return allRepos
    .filter(isIncludable)
    .map((repo) => ({
      name: repo.name,
      slug: slugify(repo.name),
      hook: repo.description ?? '',
      language: repo.language,
    }))
    .filter((candidate) => !existingSlugs.has(candidate.slug) && !openPrSlugs.has(candidate.slug));
}

/**
 * Renders the frontmatter markdown file body for a new project card.
 * Matches the hand-written seed style (double-quoted scalars, flow-style
 * array) rather than js-yaml's default block style, so watchdog-generated
 * files look identical to human-authored ones.
 */
export function toCardFile(candidate: RepoCandidate): string {
  const hook = candidate.hook.replace(/"/g, '\\"');
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
  let files: string[];
  try {
    files = readdirSync(projectsDir);
  } catch {
    return slugs;
  }
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(path.join(projectsDir, file), 'utf-8');
    const match = /^slug:\s*"?([^"\n]+)"?\s*$/m.exec(raw);
    if (match) {
      slugs.add(match[1].trim());
    } else {
      // Fall back to the filename stem if slug isn't parseable — still
      // counts as "present" so we never double-propose.
      slugs.add(file.replace(/\.md$/, ''));
    }
  }
  return slugs;
}

/** Fetches the slugs of repos that already have an open watchdog PR, via `gh pr list`. */
export function readOpenWatchdogPrSlugs(): Set<string> {
  const slugs = new Set<string>();
  let stdout: string;
  try {
    stdout = execFileSync(
      'gh',
      ['pr', 'list', '--state', 'open', '--json', 'title', '--jq', '.[].title'],
      { encoding: 'utf-8' }
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

/** Fetches all public, non-fork-filtered repo listing for REPO_OWNER via the GitHub REST API. */
export async function fetchPublicRepos(): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  let page = 1;
  for (;;) {
    const res = await fetch(
      `https://api.github.com/users/${REPO_OWNER}/repos?type=public&per_page=100&page=${page}`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    }
    const batch = (await res.json()) as GitHubRepo[];
    repos.push(...batch);
    if (batch.length < 100) break;
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
