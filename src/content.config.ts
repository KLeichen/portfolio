import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    lang: z.enum(['es', 'en']),
    page: z.string(), // URL slug, shared by both languages (not "slug": the glob loader would use it as the entry id)
    date: z.coerce.date(),
    cover: z.string(),
    tools: z.array(z.string()),
    github: z.string().optional(),
    report: z.string().optional(),
    embed: z.string().optional(),
    embedHeight: z.number().optional(), // px; default 820
    caseStudy: z.string().optional(), // long, detailed version of the project (standalone page)
    simulated: z.boolean().default(false),
    highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  }),
});

export const collections = { projects };
