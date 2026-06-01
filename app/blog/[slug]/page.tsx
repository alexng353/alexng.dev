import "highlight.js/styles/github-dark.css";

import { DraftBadge } from "@components/blog/draft-badge";
import { Markdown } from "@components/blog/markdown";
import Content from "@components/content";
import { formatDate, getPostBySlug, getPostSlugs } from "@lib/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Alexander Ng | Blog" };

  return {
    title: `Alexander Ng | ${post.title}`,
    description: post.excerpt || undefined,
  };
}

export default async function Post({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <Content>
      <article>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl">{post.title}</h1>
          {post.draft && <DraftBadge />}
        </div>
        <p className="mt-2 text-gray-500 text-sm">
          {[formatDate(post.date), `${post.readingTime} min read`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {post.tags.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Markdown>{post.content}</Markdown>
        </div>
      </article>

      <div className="mt-12">
        <Link
          href="/blog"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          ← All posts
        </Link>
      </div>
    </Content>
  );
}
