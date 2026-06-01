import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_VERSION } from "./content-version";

// Re-exported so the blog pages take a build-time dependency on the content
// version. The dev watcher (scripts/dev.mjs) bumps that module whenever a
// markdown post is saved, which makes Next's dev server hot-reload the page.
export const _contentVersion = CONTENT_VERSION;

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
// Drafts live in a gitignored dir: visible in local dev, excluded from a
// production build, and never committed — so they can't reach the deploy.
const DRAFTS_DIR = path.join(process.cwd(), "content", "drafts");

function contentDirs(): string[] {
  return process.env.NODE_ENV === "production"
    ? [BLOG_DIR]
    : [BLOG_DIR, DRAFTS_DIR];
}

type PostMeta = {
  slug: string;
  title: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  excerpt: string;
  tags: string[];
  /** estimated reading time in minutes */
  readingTime: number;
  /** true for an unpublished draft (only ever surfaced in local dev) */
  draft: boolean;
};

export type Post = PostMeta & { content: string };

/** ~200 words per minute, rounded up, never less than one. */
function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** gray-matter parses YAML dates into Date objects; normalize back to ISO. */
function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ? String(value) : "";
}

// A markdown file is a post unless it's a README or starts with "_" (a handy
// convention for scratch notes that live alongside drafts but shouldn't render).
function isPostFile(file: string): boolean {
  return (
    file.endsWith(".md") &&
    !file.startsWith("_") &&
    file.toLowerCase() !== "readme.md"
  );
}

export function getPostSlugs(): string[] {
  const slugs = new Set<string>();
  for (const dir of contentDirs()) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (isPostFile(file)) slugs.add(file.replace(/\.md$/, ""));
    }
  }
  return [...slugs];
}

export function getPostBySlug(slug: string): Post | null {
  // BLOG_DIR is checked first, so a published post shadows a draft of the
  // same slug.
  for (const dir of contentDirs()) {
    const fullPath = path.join(dir, `${slug}.md`);
    if (!fs.existsSync(fullPath)) continue;

    const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
    return {
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      date: toDateString(data.date),
      excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      readingTime: readingTime(content),
      draft: dir === DRAFTS_DIR,
      content,
    };
  }
  return null;
}

/** All posts, newest first. */
export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** "June 1, 2026" — falls back to the raw value if it isn't a real date. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
