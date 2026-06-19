import { Gallery } from "@components/photography/gallery";
import { listPhotos } from "@lib/photos";
import { SITE_URL } from "@lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photography | Alexander Ng",
  description:
    "A small, growing collection of photographs. Hover any frame to see the body, lens, and exposure it was shot with.",
  alternates: { canonical: "/photography" },
  openGraph: {
    title: "Photography | Alexander Ng",
    description: "A small, growing collection of photographs.",
    url: `${SITE_URL}/photography`,
  },
};

export default async function PhotographyPage() {
  const photos = await listPhotos();

  return (
    <main className="mb-20 mt-10 px-5">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl tracking-wide">Photography</h1>
        <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
          A recently-picked-up, expensive hobby. Hover a frame to see what it
          was shot with; click to view it full-size. Location data is stripped
          from every file before it&apos;s served.
        </p>

        {photos.length === 0 ? (
          <p className="mt-10 text-gray-500">
            No photographs yet — check back soon.
          </p>
        ) : (
          <div className="mt-8">
            <Gallery photos={photos} />
          </div>
        )}
      </div>
    </main>
  );
}
