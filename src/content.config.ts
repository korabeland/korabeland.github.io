import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
        name: z.string(),
        slug: z.string(),
        hook: z.string(),
        tech: z.array(z.string()),
        repo_url: z.string(),
        language: z.string().optional(),
        last_push: z.coerce.date().optional(),
        order: z.number().optional(),
        status: z.enum(['live', 'skipped']).default('live'),
    }),
});

export const collections = { projects };
