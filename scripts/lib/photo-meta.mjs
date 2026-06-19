// Metadata extraction for the photo pipeline (scripts/gen-photos.mjs). Reads a
// photo's EXIF (camera settings) and XMP (title) from its header in one sharp
// pass and formats them for the committed manifest. Lives script-side because
// the running site reads pre-computed values from lib/photographs.json — it
// never parses an image at build or request time.
import exifReader from "exif-reader";
import sharp from "sharp";

/**
 * EXIF + XMP + orientation-corrected dimensions from an image buffer, in one
 * header-only sharp pass. Never throws.
 */
export async function inspect(buffer) {
  try {
    const meta = await sharp(buffer).metadata();
    let exif = null;
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

// ---------- XMP ----------

function decodeXmlEntities(s) {
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

/** XMP dc:title (darktable/Lightroom "Title"), rdf:Alt/li or plain form. */
export function xmpTitle(xml) {
  if (!xml) return null;
  const block = xml.match(/<dc:title>([\s\S]*?)<\/dc:title>/i);
  if (!block) return null;
  const li = block[1].match(/<rdf:li\b[^>]*>([\s\S]*?)<\/rdf:li>/i);
  const raw = (li ? li[1] : block[1]).trim();
  return raw ? decodeXmlEntities(raw) : null;
}

// ---------- camera settings ----------

/** "SONY" -> "Sony"; leaves mixed-case makes untouched. */
function tidyMake(make) {
  const cleaned = make.replace(/\s*corporation\s*$/i, "").trim();
  if (cleaned === cleaned.toUpperCase()) {
    return cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return cleaned;
}

function formatBody(exif) {
  const make = exif?.Image?.Make?.trim();
  const model = exif?.Image?.Model?.trim();
  if (!model) return make ? tidyMake(make) : null;
  if (!make) return model;
  if (model.toLowerCase().includes(make.toLowerCase().split(/\s+/)[0])) {
    return model;
  }
  return `${tidyMake(make)} ${model}`;
}

function formatLens(exif) {
  const lens = exif?.Photo?.LensModel?.trim();
  if (lens && lens !== "----") return lens;
  return null;
}

function formatIso(exif) {
  const raw = exif?.Photo?.ISOSpeedRatings ?? exif?.Image?.ISOSpeedRatings;
  const iso = Array.isArray(raw) ? raw[0] : raw;
  return typeof iso === "number" && iso > 0 ? `ISO ${iso}` : null;
}

/** 0.005 -> "1/200s", 2 -> "2s", 0.5 -> "1/2s". */
function formatShutter(exif) {
  let t = exif?.Photo?.ExposureTime;
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
function formatAperture(exif) {
  let f = exif?.Photo?.FNumber;
  if (typeof f !== "number" && typeof exif?.Photo?.ApertureValue === "number") {
    f = Math.SQRT2 ** exif.Photo.ApertureValue;
  }
  if (typeof f !== "number" || f <= 0) return null;
  return `f/${f % 1 === 0 ? f : f.toFixed(1)}`;
}

export function formatSettings(exif) {
  return {
    body: formatBody(exif),
    lens: formatLens(exif),
    iso: formatIso(exif),
    shutter: formatShutter(exif),
    aperture: formatAperture(exif),
  };
}

export function dateTaken(exif) {
  const d = exif?.Photo?.DateTimeOriginal ?? exif?.Image?.DateTime;
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

/** "golden-hour_01" -> "Golden Hour 01" */
export function prettifyName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
