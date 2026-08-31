import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    pattern: "**/index.{md,mdx}",
    base: "./src/content/posts",
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts };
