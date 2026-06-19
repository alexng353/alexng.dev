import fs from "node:fs";
import path from "node:path";
import { bufferHasGeo, PHOTOS_DIR } from "@lib/photos";

// Reading the filesystem per request — never prerender or cache the handler
// itself (the response still carries its own Cache-Control for the CDN).
export const dynamic = "force-dynamic";

/**
 * Serve a photograph (full-res or `.thumb.jpg`) from the filesystem, but only
 * after confirming it carries no GPS location. This is the runtime backstop
 * behind the generator and the pre-commit hook: even if a geo-tagged file
 * slipped into the repo, it is refused here and never reaches a visitor.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const rel = slug.map(decodeURIComponent).join("/");

  // Only JPEGs live in this tree.
  if (!/\.(jpe?g)$/i.test(rel)) {
    return new Response("Not found", { status: 404 });
  }

  // Resolve within PHOTOS_DIR and reject any traversal escape.
  const resolved = path.resolve(PHOTOS_DIR, rel);
  if (resolved !== PHOTOS_DIR && !resolved.startsWith(PHOTOS_DIR + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  let buffer: Buffer;
  try {
    buffer = await fs.promises.readFile(resolved);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (await bufferHasGeo(buffer)) {
    return new Response(
      "This image carries location metadata and will not be served.",
      { status: 403, headers: { "Content-Type": "text/plain" } },
    );
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Length": String(buffer.byteLength),
    },
  });
}
