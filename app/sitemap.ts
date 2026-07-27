import { getAllPosts } from "@lib/blog";
import { getTags } from "@lib/photos";
import { SITE_URL } from "@lib/site";
import type { MetadataRoute } from "next";

const STATIC_ROUTES = [
  "",
  "/projects",
  "/projects/envx",
  "/projects/rv",
  "/projects/cf-ips",
  "/projects/github-discord-webhook",
  "/blog",
  "/contact",
  "/photography",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const postEntries = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(`${post.date}T00:00:00Z`) : undefined,
  }));

  // Derived, not listed above: tag pages come and go with the manifest, and a
  // hand-maintained list would outlive the tags themselves.
  const tagEntries = getTags().map(({ tag }) => ({
    url: `${SITE_URL}/photography/${tag}`,
  }));

  return [...staticEntries, ...tagEntries, ...postEntries];
}
