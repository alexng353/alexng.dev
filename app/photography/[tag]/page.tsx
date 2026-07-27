import { Gallery } from "@components/photography/gallery";
import { TagLinks } from "@components/photography/tag-links";
import { getPhotosByTag, getTags } from "@lib/photos";
import { SITE_URL } from "@lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ tag: string }> };

/**
 * One static page per tag, from the same manifest the gallery reads. A tag
 * that falls below the surfacing threshold gets no page at all, so a pill can
 * never link somewhere that 404s and a stale URL fails honestly.
 */
export function generateStaticParams() {
  return getTags().map(({ tag }) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const title = `${tag[0].toUpperCase()}${tag.slice(1)} photographs`;
  const description = `Photographs tagged ${tag}.`;

  return {
    title: `${title} | Alexander Ng`,
    description,
    alternates: { canonical: `/photography/${tag}` },
    openGraph: {
      title: `${title} | Alexander Ng`,
      description,
      url: `${SITE_URL}/photography/${tag}`,
    },
  };
}

export default async function PhotographyTagPage({ params }: Params) {
  const { tag } = await params;
  const photos = getPhotosByTag(tag);
  if (photos.length === 0) notFound();

  return (
    <main className="mb-20 mt-10 px-5">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl tracking-wide capitalize">{tag}</h1>
        <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
          {photos.length} photograph{photos.length === 1 ? "" : "s"} tagged{" "}
          {tag}. Hover a frame to see what it was shot with; click to view it
          full-size.
        </p>

        <TagLinks active={tag} />

        <div className="mt-8">
          {/* Gallery takes the filtered set, so lightbox arrows stay inside
              this tag rather than wandering into photos that aren't shown. */}
          <Gallery photos={photos} />
        </div>
      </div>
    </main>
  );
}
