#!/usr/bin/env bun
// Prepare the filesystem-backed photography portfolio:
//   1. Strip GPS / geo EXIF from every full-resolution <name>.jpg in place
//      (keeping the camera settings the gallery shows on hover).
//   2. Generate a web-sized <name>.thumb.jpg for the grid.
//
// Idempotent. Run after dropping new photos into ./photographs:
//   bun run photos            # only build missing/stale thumbnails
//   bun run photos --force    # rebuild every thumbnail
//
// Geo stripping uses exiftool (surgical: GPS only). Thumbnails are produced by
// sharp with all metadata dropped, so a thumbnail can never carry a location.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS_DIR = path.join(ROOT, "photographs");
const THUMB_SUFFIX = ".thumb.jpg";
const THUMB_LONG_EDGE = 900; // px on the long edge
const THUMB_QUALITY = 72;

const rawArgs = process.argv.slice(2);
const force = rawArgs.includes("--force");
// Optional explicit source files. With none, the whole photographs/ dir is
// processed; with some (used by the pre-commit hook), only those are. Paths are
// resolved against the current working directory.
const fileArgs = rawArgs.filter((a) => !a.startsWith("--"));

function requireExiftool() {
  try {
    execFileSync("exiftool", ["-ver"], { stdio: "ignore" });
  } catch {
    console.error(
      "✗ exiftool is required to strip geo EXIF but was not found on PATH.\n" +
        "  Install it (e.g. `sudo pacman -S perl-image-exiftool`) and re-run.",
    );
    process.exit(1);
  }
}

/** Surgically remove all GPS tags in place, preserving file mtime. */
function stripGeo(file) {
  execFileSync(
    "exiftool",
    [
      "-gps:all=",
      "-xmp:geotag=",
      "-overwrite_original",
      "-P", // preserve modification time so the staleness check stays meaningful
      "-q",
      file,
    ],
    { stdio: "inherit" },
  );
}

function isBasePhotoName(f) {
  const lower = f.toLowerCase();
  return (
    (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) &&
    !lower.endsWith(THUMB_SUFFIX) &&
    !f.startsWith(".")
  );
}

/**
 * The set of source photos to process, as basenames within PHOTOS_DIR. Either
 * everything in the directory, or just the explicit file arguments (each of
 * which must be a base photo living directly in photographs/).
 */
function selectSources() {
  if (fileArgs.length === 0) {
    return fs.readdirSync(PHOTOS_DIR).filter(isBasePhotoName);
  }
  const names = [];
  for (const arg of fileArgs) {
    const resolved = path.resolve(arg);
    const base = path.basename(resolved);
    if (
      path.dirname(resolved) !== PHOTOS_DIR ||
      !isBasePhotoName(base) ||
      !fs.existsSync(resolved)
    ) {
      console.error(`• skipping ${arg} (not a photograph in ./photographs)`);
      continue;
    }
    names.push(base);
  }
  return names;
}

/** True if the source is newer than its thumbnail (or the thumb is absent). */
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

async function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`✗ ${path.relative(ROOT, PHOTOS_DIR)} does not exist.`);
    process.exit(1);
  }
  requireExiftool();

  const sources = selectSources();

  if (sources.length === 0) {
    console.log(
      "No photographs found. Drop some .jpg files into ./photographs.",
    );
    return;
  }

  let built = 0;
  let stripped = 0;
  for (const file of sources) {
    const srcPath = path.join(PHOTOS_DIR, file);
    const thumbPath = path.join(
      PHOTOS_DIR,
      `${file.replace(/\.(jpe?g)$/i, "")}${THUMB_SUFFIX}`,
    );

    stripGeo(srcPath);
    stripped++;

    if (force || isStale(srcPath, thumbPath)) {
      await buildThumb(srcPath, thumbPath);
      built++;
      console.log(`✓ ${path.basename(thumbPath)}`);
    }
  }

  console.log(
    `\nDone. Stripped geo from ${stripped} photo(s); built ${built} thumbnail(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
