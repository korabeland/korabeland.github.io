#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectFiles } from '../src/lib/project-files';
import { githubApiHeaders } from '../src/lib/github-api';
import type { RepoMeta, GithubMetaFile } from '../src/lib/github-meta';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const projectsDir = resolve(repoRoot, 'src/content/projects');
const outDir = resolve(repoRoot, 'src/data');
const outFile = resolve(outDir, 'github-meta.json');
const seedFile = resolve(outDir, 'github-meta.seed.json');

// The three live seed repos this build enriches. Kept as a plain list (not
// derived from the GitHub API) because the enrichment target is "the repos
// we already curate," not "everything on the account."
const LIVE_REPO_SLUGS = ['perian', 'perian-jobsearch', 'fantasy-baseball-drafter'];
const GITHUB_OWNER = 'korabeland';

/**
 * Counts live projects directly from the content collection on disk. This is
 * the same number U3's `NN / total` index displays — never fetched from
 * GitHub or invented separately.
 */
export function countLiveProjects(dir: string = projectsDir): number {
  return readProjectFiles(dir).filter((entry) => (entry.data.status ?? 'live') === 'live').length;
}

/** Fetches `{ language, pushed_at }` for one repo. Returns null on any failure. */
export async function fetchRepoMeta(
  slug: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RepoMeta | null> {
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${GITHUB_OWNER}/${slug}`, {
      headers: githubApiHeaders(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || typeof data !== 'object') return null;

    const language = typeof data.language === 'string' ? data.language : null;
    const last_push = typeof data.pushed_at === 'string' ? data.pushed_at : null;

    if (language === null && last_push === null) return null;

    return { language, last_push };
  } catch {
    return null;
  }
}

/** Reads the committed seed file. Throws only if it's missing entirely. */
function readSeed(): GithubMetaFile {
  if (!existsSync(seedFile)) {
    throw new Error(`enrich-projects: no seed found at ${seedFile}`);
  }
  return JSON.parse(readFileSync(seedFile, 'utf8'));
}

/** Computes the max ISO date string across a set of repo entries, or null if none are set. */
export function computeFreshestPush(repos: Record<string, RepoMeta>): string | null {
  const dates = Object.values(repos)
    .map((r) => r.last_push)
    .filter((d): d is string => typeof d === 'string')
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString();
}

/**
 * Builds the enriched metadata file. Falls back to the seed's per-repo data
 * whenever a live fetch fails or returns incomplete data for that repo — the
 * build must never fail because GitHub is unreachable or rate-limited.
 */
export async function buildGithubMeta(
  fetchImpl: typeof fetch = fetch,
  liveProjectCount: number = countLiveProjects(),
): Promise<GithubMetaFile> {
  const seed = readSeed();
  const repos: Record<string, RepoMeta> = {};

  // Independent per-repo fetches — no data dependency between them, so run
  // concurrently rather than serializing 3x the network latency.
  const fetchedBySlug = await Promise.all(
    LIVE_REPO_SLUGS.map(async (slug) => [slug, await fetchRepoMeta(slug, fetchImpl)] as const),
  );

  for (const [slug, fetched] of fetchedBySlug) {
    const seeded = seed.repos[slug];

    if (fetched) {
      repos[slug] = {
        language: fetched.language ?? seeded?.language ?? null,
        last_push: fetched.last_push ?? seeded?.last_push ?? null,
      };
    } else {
      repos[slug] = seeded ?? { language: null, last_push: null };
    }
  }

  return {
    repos,
    live_project_count: liveProjectCount,
    freshest_push: computeFreshestPush(repos),
  };
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  let meta: GithubMetaFile;
  try {
    meta = await buildGithubMeta();
  } catch (error) {
    // buildGithubMeta() only throws if the seed itself can't be read (the
    // one input this script can't recover from). Try a raw copy of the seed
    // as an absolute last resort; if even that fails, log and move on
    // without writing an output file — the build must never fail because of
    // this script, so a missing file here has to be a no-op, not a crash.
    console.warn(`enrich-projects: falling back to raw seed (${(error as Error).message})`);
    try {
      meta = JSON.parse(readFileSync(seedFile, 'utf8'));
    } catch (seedError) {
      console.warn(
        `enrich-projects: seed also unavailable, skipping metadata write (${(seedError as Error).message})`,
      );
      return;
    }
  }

  writeFileSync(outFile, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`enrich-projects: wrote metadata for ${Object.keys(meta.repos).length} repos → ${outFile}`);
}

// Only run when executed directly (not when imported by tests).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Last-resort net: nothing in main() should throw past this point (every
  // failure path is handled above), but the build must survive even a bug
  // in this script, so an uncaught error here logs instead of failing the
  // parent `npm run build`/`npm run dev` process.
  main().catch((error) => {
    console.warn(`enrich-projects: unexpected error, continuing without metadata (${error?.message ?? error})`);
  });
}
