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
  settings: PhotoSettings;
};

/** All photographs, already sorted newest-first by the generator. */
export function getPhotos(): Photo[] {
  return manifest as Photo[];
}
