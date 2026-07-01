// Shared project-card file reading, used by scripts/enrich-projects.ts,
// scripts/scan-repos.ts, and tests/projects-collection.test.js. Extracted
// because all three independently hand-rolled frontmatter parsing for the
// same src/content/projects/*.md files — two via ad-hoc regexes, one via a
// real js-yaml parse. This is the real parse, promoted to the one shared
// implementation.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface ProjectFrontmatter {
  [key: string]: unknown;
}

export interface ProjectFileEntry {
  file: string;
  data: ProjectFrontmatter;
}

/** Splits a project markdown file into its frontmatter object and body string. */
export function parseFrontmatter(raw: string): { data: ProjectFrontmatter; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error('No frontmatter block found');
  }
  const [, frontmatterYaml, body] = match;
  return { data: (yaml.load(frontmatterYaml) as ProjectFrontmatter) ?? {}, body };
}

/** Reads and parses every project card (*.md) file in a directory. Returns [] if the directory doesn't exist. */
export function readProjectFiles(dir: string): ProjectFileEntry[] {
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(path.join(dir, file), 'utf-8');
      const { data } = parseFrontmatter(raw);
      return { file, data };
    });
}
