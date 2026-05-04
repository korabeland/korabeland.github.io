import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        tags: z.array(z.string()).optional(),
        excerpt: z.string().optional(),
    }),
});

export const collections = { notes };
