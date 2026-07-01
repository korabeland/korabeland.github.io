import { describe, expect, it } from 'vitest';
import { formatSyncDate, formatSyncFlourish, loadGithubMeta } from '../src/lib/github-meta';

describe('formatSyncDate', () => {
  it('formats an ISO date string as a compact "D Mon YYYY" date', () => {
    expect(formatSyncDate('2026-06-28T10:47:28Z')).toBe('28 Jun 2026');
  });

  it('returns null for a null input', () => {
    expect(formatSyncDate(null)).toBeNull();
  });

  it('returns null for an unparseable date string', () => {
    expect(formatSyncDate('not-a-date')).toBeNull();
  });
});

describe('formatSyncFlourish', () => {
  it('renders the exact DESIGN.md copy: "synced from github · {date} · {N} public repos"', () => {
    const text = formatSyncFlourish({
      freshest_push: '2026-06-28T10:47:28Z',
      live_project_count: 3,
    });
    expect(text).toBe('synced from github · 28 Jun 2026 · 3 public repos');
  });

  it('uses singular "public repo" when the count is exactly 1', () => {
    const text = formatSyncFlourish({
      freshest_push: '2026-06-28T10:47:28Z',
      live_project_count: 1,
    });
    expect(text).toBe('synced from github · 28 Jun 2026 · 1 public repo');
  });

  it('falls back to "unknown date" when freshest_push is null', () => {
    const text = formatSyncFlourish({
      freshest_push: null,
      live_project_count: 3,
    });
    expect(text).toBe('synced from github · unknown date · 3 public repos');
  });
});

describe('loadGithubMeta', () => {
  const seedMeta = {
    repos: { perian: { language: 'Python', last_push: '2026-06-28T10:47:19Z' } },
    live_project_count: 3,
    freshest_push: '2026-06-28T10:47:28Z',
  };

  it('reads the generated file when it exists', () => {
    const generatedMeta = { ...seedMeta, live_project_count: 4 };
    const exists = (path: string) => path === '/data/github-meta.json';
    const readFile = (path: string) =>
      path === '/data/github-meta.json' ? JSON.stringify(generatedMeta) : JSON.stringify(seedMeta);

    const meta = loadGithubMeta('/data/github-meta.json', '/data/github-meta.seed.json', exists, readFile);

    expect(meta.live_project_count).toBe(4);
  });

  it('falls back to the seed file when the generated file does not exist', () => {
    const exists = () => false;
    const readFile = (path: string) =>
      path === '/data/github-meta.seed.json' ? JSON.stringify(seedMeta) : '{}';

    const meta = loadGithubMeta('/data/github-meta.json', '/data/github-meta.seed.json', exists, readFile);

    expect(meta).toEqual(seedMeta);
  });

  it('falls back to the seed file when the generated file exists but is malformed', () => {
    const exists = (path: string) => path === '/data/github-meta.json';
    const readFile = (path: string) =>
      path === '/data/github-meta.json' ? '{ not valid json' : JSON.stringify(seedMeta);

    const meta = loadGithubMeta('/data/github-meta.json', '/data/github-meta.seed.json', exists, readFile);

    expect(meta).toEqual(seedMeta);
  });
});
