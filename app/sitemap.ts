import { getAllPosts } from "@lib/blog";
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

  return [...staticEntries, ...postEntries];
}
