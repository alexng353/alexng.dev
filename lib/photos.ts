import "server-only";
import fs from "node:fs";
import path from "node:path";
import exifReader from "exif-reader";
import sharp from "sharp";

// Filesystem source of truth for the portfolio. Each photo is a pair:
//   <name>.jpg        full-resolution image
//   <name>.thumb.jpg  generated thumbnail (see scripts/gen-photos.mjs)
// Images are served through app/photographs/[...slug]/route.ts (NOT public/)
// so every byte passes the geo-EXIF gate before it leaves the server.
export const PHOTOS_DIR = path.join(process.cwd(), "photographs");

const THUMB_SUFFIX = ".thumb.jpg";

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
  /** filename without extension, e.g. "golden-hour" */
  name: string;
  /** human title (XMP dc:title, else EXIF caption, else a prettified name) */
  title: string;
  /** full-resolution URL */
  src: string;
  /** thumbnail URL */
  thumb: string;
  /** intrinsic full-image dimensions (for aspect-ratio reservation) */
  width: number;
  height: number;
  /** ISO date the photo was taken, if known */
  date: string | null;
  settings: PhotoSettings;
};

type Exif = ReturnType<typeof exifReader>;

/**
 * Everything we need from an image's header in a single sharp pass (header
 * only, no pixel decode): the parsed EXIF, the raw XMP packet (where darktable
 * and Lightroom store the title — and a second copy of GPS), and the display
 * dimensions corrected for orientation. Never throws — an unreadable file
 * yields empty fields, which callers treat the same as "no metadata".
 */
type Inspected = {
  exif: Exif | null;
  xmp: string | null;
  width: number;
  height: number;
};

async function inspect(buffer: Buffer): Promise<Inspected> {
  try {
    const meta = await sharp(buffer).metadata();
    let exif: Exif | null = null;
    if (meta.exif) {
      try {
        exif = exifReader(meta.exif);
      } catch {
        exif = null;
      }
    }
    // EXIF orientations 5–8 are 90°/270° rotations that swap the axes.
    const orientation = exif?.Image?.Orientation ?? meta.orientation ?? 1;
    const swap = orientation >= 5;
    return {
      exif,
      xmp: meta.xmp ? meta.xmp.toString("utf8") : null,
      width: (swap ? meta.height : meta.width) ?? 0,
      height: (swap ? meta.width : meta.height) ?? 0,
    };
  } catch {
    return { exif: null, xmp: null, width: 0, height: 0 };
  }
}

/**
 * True if the image carries any GPS location. This is the gate: the route
 * handler refuses to serve a file for which this returns true, so a photo
 * that slipped past the generator/pre-commit strip can never leak a location.
 */
export function exifHasGeo(exif: Exif | null): boolean {
  const gps = exif?.GPSInfo;
  if (!gps) return false;
  // A lone GPSVersionID with no coordinates is not a location; require an
  // actual lat/long (the most common pair) or a destination coordinate.
  return Boolean(
    (gps.GPSLatitude && gps.GPSLongitude) ||
      (gps.GPSDestLatitude && gps.GPSDestLongitude),
  );
}

// ---------- XMP (titles + a second place GPS can hide) ----------

/** First non-empty value of an XMP property, in attribute or element form. */
function xmpValue(xml: string, tag: string): string | null {
  const attr = xml.match(new RegExp(`${tag}\\b\\s*=\\s*"([^"]*)"`, "i"));
  if (attr?.[1].trim()) return attr[1].trim();
  const elem = xml.match(
    new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  );
  if (elem?.[1].trim()) return elem[1].trim();
  return null;
}

/**
 * GPS can live in XMP (exif:GPSLatitude/Longitude) independently of the EXIF
 * GPS block — e.g. a darktable export. The gate checks both so a location
 * can't sneak through whichever block the EXIF-only check would miss.
 */
function xmpHasGeo(xml: string | null): boolean {
  if (!xml) return false;
  return Boolean(
    xmpValue(xml, "exif:GPSLatitude") && xmpValue(xml, "exif:GPSLongitude"),
  );
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&"); // last, so "&amp;lt;" decodes to "&lt;" not "<"
}

/**
 * The photo's title from XMP `dc:title` — the field darktable and Lightroom
 * write to (their "Title"). Handles both the rdf:Alt / rdf:li
 * language-alternative form and a plain text node. Null when absent.
 */
function xmpTitle(xml: string | null): string | null {
  if (!xml) return null;
  const block = xml.match(/<dc:title>([\s\S]*?)<\/dc:title>/i);
  if (!block) return null;
  const li = block[1].match(/<rdf:li\b[^>]*>([\s\S]*?)<\/rdf:li>/i);
  const raw = (li ? li[1] : block[1]).trim();
  return raw ? decodeXmlEntities(raw) : null;
}

/** Does this image buffer contain geo data in EITHER EXIF or XMP? */
export async function bufferHasGeo(buffer: Buffer): Promise<boolean> {
  const { exif, xmp } = await inspect(buffer);
  return exifHasGeo(exif) || xmpHasGeo(xmp);
}

// ---------- formatting ----------

/** "SONY" -> "Sony"; leaves mixed-case makes untouched. */
function tidyMake(make: string): string {
  const cleaned = make.replace(/\s*corporation\s*$/i, "").trim();
  if (cleaned === cleaned.toUpperCase()) {
    return cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return cleaned;
}

function formatBody(exif: Exif | null): string | null {
  const make = exif?.Image?.Make?.trim();
  const model = exif?.Image?.Model?.trim();
  if (!model) return make ? tidyMake(make) : null;
  if (!make) return model;
  const tidyMakeStr = tidyMake(make);
  // Avoid "Nikon NIKON Z6" — drop the make if the model already names it.
  if (model.toLowerCase().includes(make.toLowerCase().split(/\s+/)[0])) {
    return model;
  }
  return `${tidyMakeStr} ${model}`;
}

function formatLens(exif: Exif | null): string | null {
  const lens = exif?.Photo?.LensModel?.trim();
  if (lens && lens !== "----") return lens;
  return null;
}

function formatIso(exif: Exif | null): string | null {
  const raw = exif?.Photo?.ISOSpeedRatings ?? exif?.Image?.ISOSpeedRatings;
  const iso = Array.isArray(raw) ? raw[0] : raw;
  return typeof iso === "number" && iso > 0 ? `ISO ${iso}` : null;
}

/** 0.005 -> "1/200s", 2 -> "2s", 0.5 -> "1/2s". */
function formatShutter(exif: Exif | null): string | null {
  let t = exif?.Photo?.ExposureTime;
  // Fall back to APEX ShutterSpeedValue: t = 2^(-SSV).
  if (
    typeof t !== "number" &&
    typeof exif?.Photo?.ShutterSpeedValue === "number"
  ) {
    t = 2 ** -exif.Photo.ShutterSpeedValue;
  }
  if (typeof t !== "number" || t <= 0) return null;
  if (t >= 1) return `${Number.isInteger(t) ? t : t.toFixed(1)}s`;
  return `1/${Math.round(1 / t)}s`;
}

/** 2.8 -> "f/2.8". */
function formatAperture(exif: Exif | null): string | null {
  let f = exif?.Photo?.FNumber;
  // Fall back to APEX ApertureValue: f = sqrt(2)^AV.
  if (typeof f !== "number" && typeof exif?.Photo?.ApertureValue === "number") {
    f = Math.SQRT2 ** exif.Photo.ApertureValue;
  }
  if (typeof f !== "number" || f <= 0) return null;
  // f/1.8, f/8 — trim a trailing ".0".
  return `f/${f % 1 === 0 ? f : f.toFixed(1)}`;
}

export function formatSettings(exif: Exif | null): PhotoSettings {
  return {
    body: formatBody(exif),
    lens: formatLens(exif),
    iso: formatIso(exif),
    shutter: formatShutter(exif),
    aperture: formatAperture(exif),
  };
}

function dateTaken(exif: Exif | null): string | null {
  const d = exif?.Photo?.DateTimeOriginal ?? exif?.Image?.DateTime;
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

/** "golden-hour_01" -> "Golden Hour 01" */
function prettifyName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- filesystem ----------

function isBasePhoto(file: string): boolean {
  const lower = file.toLowerCase();
  return (
    (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) &&
    !lower.endsWith(THUMB_SUFFIX) &&
    !file.startsWith(".")
  );
}

function thumbNameFor(file: string): string {
  return `${file.replace(/\.(jpe?g)$/i, "")}${THUMB_SUFFIX}`;
}

/**
 * Enumerate the gallery, newest first. Reads each full image's EXIF for the
 * hover settings and intrinsic size. A photo whose thumbnail is missing is
 * skipped (run `bun run photos` to generate thumbnails) so the grid never
 * points at a 404. A photo carrying geo EXIF is also skipped — it would be
 * refused by the route handler anyway, so we never advertise it.
 */
export async function listPhotos(): Promise<Photo[]> {
  if (!fs.existsSync(PHOTOS_DIR)) return [];

  const files = fs.readdirSync(PHOTOS_DIR).filter(isBasePhoto);

  const photos = await Promise.all(
    files.map(async (file): Promise<Photo | null> => {
      const fullPath = path.join(PHOTOS_DIR, file);
      const thumbFile = thumbNameFor(file);
      if (!fs.existsSync(path.join(PHOTOS_DIR, thumbFile))) return null;

      const buffer = await fs.promises.readFile(fullPath);
      const { exif, xmp, width, height } = await inspect(buffer);
      if (exifHasGeo(exif) || xmpHasGeo(xmp)) return null;

      const name = file.replace(/\.(jpe?g)$/i, "");

      return {
        name,
        // XMP dc:title (darktable/Lightroom "Title") wins, then the EXIF
        // caption, then a prettified filename as a last resort.
        title:
          xmpTitle(xmp) ||
          exif?.Image?.ImageDescription?.trim() ||
          prettifyName(name),
        src: `/photographs/${encodeURIComponent(file)}`,
        thumb: `/photographs/${encodeURIComponent(thumbFile)}`,
        width,
        height,
        date: dateTaken(exif),
        settings: formatSettings(exif),
      };
    }),
  );

  return photos
    .filter((p): p is Photo => p !== null)
    .sort((a, b) => {
      // Newest first by capture date; undated photos sort after dated ones,
      // then alphabetically for a stable order.
      if (a.date && b.date) return a.date < b.date ? 1 : -1;
      if (a.date) return -1;
      if (b.date) return 1;
      return a.name < b.name ? -1 : 1;
    });
}
