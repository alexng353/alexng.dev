#!/usr/bin/env bun
// Build the photography portfolio from local source photos in ./photographs:
//
//   1. Strip geo (GPS) EXIF/XMP from each <name>.jpg in place, keeping the
//      camera settings the gallery shows. ABORTS if any location survives —
//      the gate now lives here, before a byte ever leaves the machine.
//   2. Generate a web-sized <name>.thumb.jpg.
//   3. Read each photo's metadata (title, settings, dimensions, capture date)
//      and write the committed manifest lib/photographs.json, with image URLs
//      pointing at the CDN.
//   4. With --upload, push the photos, thumbnails, and manifest to R2 via rclone.
//
//   bun run photos             # strip + thumbnail + rewrite the manifest
//   bun run photos --force     # also rebuild every thumbnail
//   bun run photos --upload    # ...and sync the bytes to R2 (needs the remote)
//
// The running site never touches these files — it reads lib/photographs.json
// and loads the bytes straight from the CDN. Config (env, with defaults):
//   PHOTOS_CDN_HOST   https://cdn.alexng.dev
//   PHOTOS_PREFIX     assets/alexng.dev/photos
//   PHOTOS_R2_REMOTE  (required for --upload) rclone remote+bucket, e.g. r2:my-bucket

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  dateTaken,
  formatSettings,
  inspect,
  prettifyName,
  xmpTitle,
} from "./lib/photo-meta.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS_DIR = path.join(ROOT, "photographs");
const MANIFEST = path.join(ROOT, "lib", "photographs.json");
const THUMB_SUFFIX = ".thumb.jpg";
const THUMB_LONG_EDGE = 900;
const THUMB_QUALITY = 72;

const CDN_HOST = (
  process.env.PHOTOS_CDN_HOST ?? "https://cdn.alexng.dev"
).replace(/\/+$/, "");
const PREFIX = (
  process.env.PHOTOS_PREFIX ?? "assets/alexng.dev/photos"
).replace(/^\/+|\/+$/g, "");
const BASE_URL = `${CDN_HOST}/${PREFIX}`;

const force = process.argv.includes("--force");
const doUpload = process.argv.includes("--upload");

function requireTool(bin, hint) {
  try {
    execFileSync(bin, ["--version"], { stdio: "ignore" });
  } catch {
    console.error(`✗ ${bin} is required but was not found on PATH.\n  ${hint}`);
    process.exit(1);
  }
}

/** Surgically remove all GPS tags (EXIF + XMP) in place, preserving mtime. */
function stripGeo(file) {
  execFileSync(
    "exiftool",
    ["-gps:all=", "-xmp:geotag=", "-overwrite_original", "-P", "-q", file],
    { stdio: "inherit" },
  );
}

/** Throw if any GPS coordinate remains, in EXIF or XMP. The hard gate. */
function assertNoGeo(file) {
  const out = execFileSync(
    "exiftool",
    [
      "-s3",
      "-GPSLatitude",
      "-GPSLongitude",
      "-XMP-exif:GPSLatitude",
      "-XMP-exif:GPSLongitude",
      "--",
      file,
    ],
    { encoding: "utf8" },
  ).trim();
  if (out) {
    throw new Error(
      `${path.basename(file)} still reports a location after stripping:\n${out}\n` +
        "Refusing to publish a geotagged photo.",
    );
  }
}

function isStale(srcPath, thumbPath) {
  if (!fs.existsSync(thumbPath)) return true;
  return fs.statSync(srcPath).mtimeMs > fs.statSync(thumbPath).mtimeMs;
}

async function buildThumb(srcPath, thumbPath) {
  await sharp(srcPath)
    .rotate() // bake in EXIF orientation before metadata is dropped
    .resize(THUMB_LONG_EDGE, THUMB_LONG_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
    .toFile(thumbPath);
}

function isBasePhoto(f) {
  const lower = f.toLowerCase();
  return (
    (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) &&
    !lower.endsWith(THUMB_SUFFIX) &&
    !f.startsWith(".")
  );
}

/** Newest-first by capture date; undated last; filename as the stable tiebreak. */
function bySortOrder(a, b) {
  if (a.date && b.date) return a.date < b.date ? 1 : -1;
  if (a.date) return -1;
  if (b.date) return 1;
  return a.name < b.name ? -1 : 1;
}

/**
 * Resolve the rclone destination + the child env to run it with. Prefers the
 * CLOUDFLARE_R2_* credentials already in the environment, driving rclone's
 * on-the-fly :s3: backend — nothing is written to rclone.conf and secrets pass
 * through the child env, never argv. Falls back to a pre-configured named
 * remote in PHOTOS_R2_REMOTE. Returns null if neither is available.
 */
function resolveR2() {
  const {
    CLOUDFLARE_R2_ACCESS_KEY_ID: key,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: secret,
    CLOUDFLARE_R2_S3_ENDPOINT: endpoint,
  } = process.env;
  if (key && secret && endpoint) {
    const bucket = process.env.PHOTOS_R2_BUCKET ?? "default";
    return {
      remote: `:s3:${bucket}`,
      env: {
        ...process.env,
        RCLONE_S3_PROVIDER: "Cloudflare",
        RCLONE_S3_ACCESS_KEY_ID: key,
        RCLONE_S3_SECRET_ACCESS_KEY: secret,
        RCLONE_S3_ENDPOINT: endpoint,
      },
    };
  }
  if (process.env.PHOTOS_R2_REMOTE) {
    return { remote: process.env.PHOTOS_R2_REMOTE, env: process.env };
  }
  return null;
}

function uploadToR2() {
  const r2 = resolveR2();
  if (!r2) {
    console.error(
      "✗ --upload needs R2 credentials. Either:\n" +
        "  • set CLOUDFLARE_R2_ACCESS_KEY_ID / _SECRET_ACCESS_KEY / _S3_ENDPOINT\n" +
        "    (optionally PHOTOS_R2_BUCKET, default 'default'), or\n" +
        "  • set PHOTOS_R2_REMOTE to a configured rclone remote (e.g. r2:my-bucket).",
    );
    process.exit(1);
  }
  requireTool("rclone", "Install rclone (the R2 upload uses its S3 backend).");
  const dest = `${r2.remote}/${PREFIX}`;
  console.log(`\nUploading photos + thumbnails to ${dest} …`);
  // rclone copy skips files already present with the same size — so re-running
  // only ships what changed. Both *.jpg and *.thumb.jpg match the filter.
  execFileSync(
    "rclone",
    [
      "copy",
      PHOTOS_DIR,
      dest,
      "--include",
      "*.jpg",
      "--include",
      "*.jpeg",
      "--progress",
    ],
    { stdio: "inherit", env: r2.env },
  );
  console.log(`\nUploading manifest to ${dest}/photographs.json …`);
  execFileSync(
    "rclone",
    ["copyto", MANIFEST, `${dest}/photographs.json`, "--progress"],
    { stdio: "inherit", env: r2.env },
  );
}

async function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`✗ ${path.relative(ROOT, PHOTOS_DIR)} does not exist.`);
    process.exit(1);
  }
  requireTool(
    "exiftool",
    "Install it, e.g. `sudo pacman -S perl-image-exiftool`.",
  );

  const sources = fs.readdirSync(PHOTOS_DIR).filter(isBasePhoto);
  const entries = [];
  let builtThumbs = 0;

  for (const file of sources) {
    const srcPath = path.join(PHOTOS_DIR, file);
    const name = file.replace(/\.(jpe?g)$/i, "");
    const thumbFile = `${name}${THUMB_SUFFIX}`;
    const thumbPath = path.join(PHOTOS_DIR, thumbFile);

    stripGeo(srcPath);
    assertNoGeo(srcPath);

    if (force || isStale(srcPath, thumbPath)) {
      await buildThumb(srcPath, thumbPath);
      builtThumbs++;
    }

    const buffer = await fs.promises.readFile(srcPath);
    const { exif, xmp, width, height } = await inspect(buffer);

    entries.push({
      name,
      title:
        xmpTitle(xmp) ||
        exif?.Image?.ImageDescription?.trim() ||
        prettifyName(name),
      src: `${BASE_URL}/${encodeURIComponent(file)}`,
      thumb: `${BASE_URL}/${encodeURIComponent(thumbFile)}`,
      width,
      height,
      date: dateTaken(exif),
      settings: formatSettings(exif),
    });
  }

  entries.sort(bySortOrder);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(
    `✓ ${path.relative(ROOT, MANIFEST)} — ${entries.length} photo(s), ${builtThumbs} thumbnail(s) built`,
  );

  if (doUpload) uploadToR2();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
