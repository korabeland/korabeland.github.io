import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { readProjectFiles } from '../src/lib/project-files';
import { sortLiveProjects } from '../src/lib/projects';

// Mirrors the `projects` collection schema defined in `src/content.config.ts`.
// Duplicated here (rather than imported) because `content.config.ts` imports
// from the `astro:content` virtual module, which only resolves inside the
// Astro content-layer runtime, not a bare Vitest process.
const projectSchema = z.object({
  name: z.string(),
  slug: z.string(),
  hook: z.string(),
  tech: z.array(z.string()),
  repo_url: z.string(),
  language: z.string().optional(),
  last_push: z.coerce.date().optional(),
  order: z.number().optional(),
  status: z.enum(['live', 'skipped']).default('live'),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '..', 'src', 'content', 'projects');

function readAllProjectEntries() {
  return readProjectFiles(projectsDir);
}

const validFixture = {
  name: 'perian',
  slug: 'perian',
  hook: 'A local-first framework for small-model AI agents.',
  tech: ['Python'],
  repo_url: 'https://github.com/korabeland/perian',
};

describe('projects collection schema', () => {
  it('rejects an entry missing name/slug/repo_url', () => {
    const { name, slug, repo_url, ...rest } = validFixture;

    expect(projectSchema.safeParse({ ...rest }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validFixture, name: undefined }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validFixture, slug: undefined }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validFixture, repo_url: undefined }).success).toBe(false);
  });

  it('defaults status to "live" when omitted, and accepts "skipped"', () => {
    const omitted = projectSchema.safeParse(validFixture);
    expect(omitted.success).toBe(true);
    if (omitted.success) {
      expect(omitted.data.status).toBe('live');
    }

    const skipped = projectSchema.safeParse({ ...validFixture, status: 'skipped' });
    expect(skipped.success).toBe(true);
    if (skipped.success) {
      expect(skipped.data.status).toBe('skipped');
    }

    const invalidStatus = projectSchema.safeParse({ ...validFixture, status: 'archived' });
    expect(invalidStatus.success).toBe(false);
  });

  it('accepts tech as a string array and rejects a non-array value', () => {
    const arrayResult = projectSchema.safeParse({ ...validFixture, tech: ['Python', 'Astro'] });
    expect(arrayResult.success).toBe(true);

    const nonArrayResult = projectSchema.safeParse({ ...validFixture, tech: 'Python' });
    expect(nonArrayResult.success).toBe(false);
  });

  it('treats language, last_push, and order as optional', () => {
    const result = projectSchema.safeParse(validFixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBeUndefined();
      expect(result.data.last_push).toBeUndefined();
      expect(result.data.order).toBeUndefined();
    }
  });
});

describe('projects seed content', () => {
  const launchSlugs = ['perian', 'perian-jobsearch', 'fantasy-baseball-drafter'];

  it('validates every project file against the schema with status "live" or "skipped"', () => {
    const entries = readAllProjectEntries();
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      const result = projectSchema.safeParse(entry.data);
      expect(result.success, `${entry.file} failed schema validation: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      if (result.success) {
        expect(['live', 'skipped']).toContain(result.data.status);
      }
    }
  });

  it('includes the three expected launch cards first in sortLiveProjects order', () => {
    const entries = sortLiveProjects(
      readAllProjectEntries().map((entry) => projectSchema.parse(entry.data)),
    );

    expect(entries.slice(0, launchSlugs.length).map((entry) => entry.slug)).toEqual(launchSlugs);
  });

  it('accepts a skipped card and excludes it from the launch-cards-first check', () => {
    const skippedResult = projectSchema.safeParse({
      ...validFixture,
      name: 'skipped-project',
      slug: 'skipped-project',
      repo_url: 'https://github.com/korabeland/skipped-project',
      order: 0,
      status: 'skipped',
    });

    expect(skippedResult.success).toBe(true);
    if (!skippedResult.success) return;
    expect(skippedResult.data.status).toBe('skipped');

    const liveEntries = sortLiveProjects([
      skippedResult.data,
      ...readAllProjectEntries().map((entry) => projectSchema.parse(entry.data)),
    ]);

    expect(liveEntries.map((entry) => entry.slug)).not.toContain('skipped-project');
    expect(liveEntries.slice(0, launchSlugs.length).map((entry) => entry.slug)).toEqual(launchSlugs);
  });
});
