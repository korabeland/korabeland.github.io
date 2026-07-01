import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { describe, expect, it } from 'vitest';

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

/** Splits a markdown file into its frontmatter object and body string. */
function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error('No frontmatter block found');
  }
  const [, frontmatterYaml, body] = match;
  return { data: yaml.load(frontmatterYaml), body };
}

function readAllProjectEntries() {
  return readdirSync(projectsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(path.join(projectsDir, file), 'utf-8');
      return { file, ...parseFrontmatter(raw) };
    });
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
    expect(omitted.data.status).toBe('live');

    const skipped = projectSchema.safeParse({ ...validFixture, status: 'skipped' });
    expect(skipped.success).toBe(true);
    expect(skipped.data.status).toBe('skipped');

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
    expect(result.data.language).toBeUndefined();
    expect(result.data.last_push).toBeUndefined();
    expect(result.data.order).toBeUndefined();
  });
});

describe('projects seed content', () => {
  it('contains exactly three entries under src/content/projects', () => {
    const entries = readAllProjectEntries();
    expect(entries).toHaveLength(3);
  });

  it('validates every seed file against the schema, all defaulting/set to status "live"', () => {
    const entries = readAllProjectEntries();
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      const result = projectSchema.safeParse(entry.data);
      expect(result.success, `${entry.file} failed schema validation: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      expect(result.data.status).toBe('live');
    }
  });

  it('includes the three expected launch cards by slug, in order', () => {
    const entries = readAllProjectEntries()
      .map((entry) => projectSchema.parse(entry.data))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    expect(entries.map((entry) => entry.slug)).toEqual([
      'perian',
      'perian-jobsearch',
      'fantasy-baseball-drafter',
    ]);
  });
});
