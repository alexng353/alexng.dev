import Content from "@components/content";
import { formatDate, getAllPosts } from "@lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alexander Ng | Blog",
  description: "Occasional writing about code, open source, and side projects.",
};

export default function Blog() {
  const posts = getAllPosts();

  return (
    <Content className="w-full">
      <h1 className="text-3xl">Blog</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Occasional writing about code, open source, and the things I build on a
        whim.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {posts.length === 0 ? (
          <p className="text-gray-500 italic">Nothing here yet. Soon.</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 hover:border-green-500 transition-colors"
            >
              <span className="text-green-600 dark:text-green-400 group-hover:underline font-medium text-lg">
                {post.title}
              </span>
              <span className="text-gray-500 text-xs">
                {[formatDate(post.date), `${post.readingTime} min read`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {post.excerpt && (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {post.excerpt}
                </span>
              )}
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
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
            </Link>
          ))
        )}
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          ← Back home
        </Link>
      </div>
    </Content>
  );
}
