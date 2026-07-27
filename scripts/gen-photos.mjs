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
//   4. With --upload, push the photos, thumbnails, and manifest to R2 via rclone,
//      then delete any remote image with no local counterpart.
//
//   bun run photos               # strip + thumbnail + rewrite the manifest + sync R2
//   bun run photos --force       # also rebuild every thumbnail
//   bun run photos --force-prune # allow a prune that removes more than it keeps
//   bun run photos:local         # local-only regenerate, no R2 sync
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
const forcePrune = process.argv.includes("--force-prune");

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
  // Newest first. Equal dates must fall through to the name tiebreak: returning
  // -1 for both cmp(a,b) and cmp(b,a) is an inconsistent comparator, and the
  // resulting order then depends on readdir order, so a whole shoot shot on one
  // day would reshuffle between runs and churn the manifest diff.
  if (a.date && b.date) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.name < b.name ? 1 : -1;
  }
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

export function rcloneSyncCommands({ photosDir, manifest, dest }) {
  return [
    [
      "copy",
      photosDir,
      dest,
      "--include",
      "*.jpg",
      "--include",
      "*.jpeg",
      "--progress",
    ],
    ["copyto", manifest, `${dest}/photographs.json`, "--progress"],
    [
      "check",
      photosDir,
      dest,
      "--include",
      "*.jpg",
      "--include",
      "*.jpeg",
      "--one-way",
      "--size-only",
    ],
    [
      "check",
      path.dirname(manifest),
      dest,
      "--include",
      "photographs.json",
      "--one-way",
      "--size-only",
    ],
  ];
}

/** Resolve credentials and pre-build the rclone argv once, up front. */
function openR2() {
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
  const [copyPhotos, copyManifest, checkPhotos, checkManifest] =
    rcloneSyncCommands({ photosDir: PHOTOS_DIR, manifest: MANIFEST, dest });
  return {
    env: r2.env,
    dest,
    copyPhotos,
    copyManifest,
    checkPhotos,
    checkManifest,
  };
}

function uploadPhotos(r2) {
  console.log(`\nUploading photos + thumbnails to ${r2.dest} …`);
  // rclone copy skips files already present with the same size — so re-running
  // only ships what changed. Both *.jpg and *.thumb.jpg match the filter.
  execFileSync("rclone", r2.copyPhotos, { stdio: "inherit", env: r2.env });
}

/**
 * Remote objects with no local counterpart. Only ever selects image files:
 * photographs.json lives in this same prefix, and no combination of inputs
 * should be able to put it on a deletion list.
 */
export function orphanKeys(remoteNames, keepNames) {
  const keep = new Set(keepNames);
  return remoteNames.filter(
    (name) => /\.jpe?g$/i.test(name) && !keep.has(name),
  );
}

/**
 * Delete photos that have left the manifest. `rclone copy` never removes
 * anything, so without this a photo dropped from photographs/ disappears from
 * the site while its full-resolution original stays publicly fetchable at the
 * CDN URL it always had — hidden rather than gone.
 */
function pruneR2(r2, keepNames) {
  // Image bytes are gitignored, so a fresh clone has an empty photographs/.
  // That means "nothing to compare against", not "delete the bucket".
  if (keepNames.length === 0) {
    console.error(
      `\n✗ Skipping prune: no local photos to compare against ${r2.dest}.`,
    );
    return;
  }

  const listed = execFileSync("rclone", ["lsf", r2.dest, "--files-only"], {
    env: r2.env,
    encoding: "utf8",
  });
  const orphans = orphanKeys(
    listed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    keepNames,
  );

  if (orphans.length === 0) {
    console.log(`\n✓ No orphaned objects at ${r2.dest}.`);
    return;
  }
  if (!forcePrune && orphans.length > keepNames.length) {
    console.error(
      `\n✗ Skipping prune: ${orphans.length} object(s) would go while only ${keepNames.length} stay.\n` +
        "  That reads like a half-populated photographs/ rather than a deletion:\n" +
        orphans.map((name) => `    ${name}`).join("\n") +
        "\n  Re-run with --force-prune if it really is one.",
    );
    return;
  }

  console.log(
    `\nPruning ${orphans.length} orphaned object(s) from ${r2.dest} …`,
  );
  for (const name of orphans) {
    execFileSync("rclone", ["deletefile", `${r2.dest}/${name}`], {
      stdio: "inherit",
      env: r2.env,
    });
    console.log(`  removed ${name}`);
  }
}

function uploadManifest(r2) {
  console.log(`\nUploading manifest to ${r2.dest}/photographs.json …`);
  execFileSync("rclone", r2.copyManifest, { stdio: "inherit", env: r2.env });
  console.log(`\nVerifying R2 photos at ${r2.dest} …`);
  execFileSync("rclone", r2.checkPhotos, { stdio: "inherit", env: r2.env });
  console.log(`\nVerifying R2 manifest at ${r2.dest}/photographs.json …`);
  execFileSync("rclone", r2.checkManifest, { stdio: "inherit", env: r2.env });
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
  // Every object this run expects to exist remotely, photo + thumbnail.
  const published = [];
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
    published.push(file, thumbFile);

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

  // Ship the bytes *before* the manifest that points at them. `next dev`
  // watches lib/photographs.json and hot-reloads the gallery the instant it
  // lands, so writing it first opens a window where the browser requests a CDN
  // URL that does not exist yet, 404s, and caches the failure — the photo then
  // stays broken until a hard refresh. Uploading first closes that window; the
  // worst case becomes orphaned bytes on R2 rather than broken <img> tags.
  const r2 = doUpload ? openR2() : null;
  if (r2) uploadPhotos(r2);

  entries.sort(bySortOrder);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(
    `✓ ${path.relative(ROOT, MANIFEST)} — ${entries.length} photo(s), ${builtThumbs} thumbnail(s) built`,
  );

  // Prune last: the manifest that no longer references these objects is already
  // live, so there is never a moment where the site points at deleted bytes.
  if (r2) {
    uploadManifest(r2);
    pruneR2(r2, published);
  }
}

if (import.meta.path === Bun.main) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
