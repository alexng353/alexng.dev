import { getPostBySlug } from "@lib/blog";
import { SITE } from "@lib/site";
import { ImageResponse } from "next/og";

export const alt = "Blog post on alexng.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? SITE.name;
  const tags = post?.tags ?? [];

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#000000",
        color: "#ffffff",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 40 }}>
        <span style={{ color: "#4ade80", fontWeight: 700 }}>&gt;_</span>
        <span style={{ color: "#9ca3af", marginLeft: 18, fontSize: 28 }}>
          alexng.dev / blog
        </span>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 64 : 80,
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {post?.date ? (
          <span style={{ display: "flex", color: "#9ca3af", fontSize: 28 }}>
            {post.date}
          </span>
        ) : null}
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            style={{
              display: "flex",
              color: "#4ade80",
              fontSize: 26,
              border: "1px solid #1f2937",
              borderRadius: 999,
              padding: "4px 16px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>,
    size,
  );
}
