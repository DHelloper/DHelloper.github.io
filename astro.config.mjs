import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import writeTool from "./integrations/write-tool.mjs";

export default defineConfig({
  site: "https://DHelloper.github.io",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/roadmap")
    }),
    ...(process.env.NODE_ENV !== "production" ? [writeTool()] : [])
  ]
});