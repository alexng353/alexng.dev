import "server-only";
import manifest from "./photographs.json";

// The portfolio is driven by a committed manifest (lib/photographs.json),
// generated locally by scripts/gen-photos.mjs. The photo bytes live on the CDN
// (cdn.alexng.dev), not in this repo — so nothing here reads the filesystem or
// parses an image at build or request time. To add/update photos: drop them in
// ./photographs and run `bun run photos --upload`.

/** The five camera settings surfaced on hover. */
export type PhotoSettings = {
  /** camera body, e.g. "Sony A7 III" */
  body: string | null;
  /** lens, e.g. "FE 24-70mm F2.8 GM" */
  lens: string | null;
  /** ISO, e.g. "ISO 400" */
  iso: string | null;
  /** shutter speed, e.g. "1/200s" */
  shutter: string | null;
  /** aperture, e.g. "f/2.8" */
  aperture: string | null;
};

export type Photo = {
  /** filename without extension, e.g. "DSC03595" */
  name: string;
  /** human title (XMP dc:title, else EXIF caption, else a prettified name) */
  title: string;
  /** full-resolution CDN URL */
  src: string;
  /** thumbnail CDN URL */
  thumb: string;
  /** intrinsic full-image dimensions (for aspect-ratio reservation) */
  width: number;
  height: number;
  /** ISO date the photo was taken, if known */
  date: string | null;
  /** lower-case keywords from XMP dc:subject; also the tag-page URL segments */
  tags: string[];
  settings: PhotoSettings;
};

/**
 * A tag surfaces as its own page only once it has enough photos to be worth
 * visiting. Below this the link would lead somewhere emptier than the gallery
 * it came from, so the filter simply doesn't offer it.
 */
const MIN_PHOTOS_PER_TAG = 2;

/** All photographs, already sorted newest-first by the generator. */
export function getPhotos(): Photo[] {
  return manifest as Photo[];
}

export function getPhotosByTag(tag: string): Photo[] {
  return getPhotos().filter((photo) => photo.tags.includes(tag));
}

/**
 * Tags worth linking to, with their counts, most photos first. Derived from
 * the manifest rather than hard-coded, so the tag list can never drift from
 * what the photos actually carry.
 */
export function getTags(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const photo of getPhotos()) {
    for (const tag of photo.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= MIN_PHOTOS_PER_TAG)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
