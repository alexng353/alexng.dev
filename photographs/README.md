# photographs/

Local working directory for the [`/photography`](../app/photography) gallery.

**The image bytes are NOT committed.** They live on the CDN
(`cdn.alexng.dev`), and the site reads a committed manifest
([`../lib/photographs.json`](../lib/photographs.json)) for everything it needs.
Only this README is tracked here; `*.jpg` / `*.jpeg` are gitignored.

## Layout

Each photo is a pair:

```
DSC03595.jpg        full resolution (uploaded; lightbox source)
DSC03595.thumb.jpg  generated thumbnail (uploaded; grid source)
```

## Removing a photo

Delete its `.jpg` (and `.thumb.jpg`) from here and run `bun run photos`. The
manifest drops it and the prune step deletes both objects from R2, so the
full-resolution original stops being fetchable at its CDN URL rather than just
disappearing from the grid. Cloudflare will keep serving the old bytes from its
edge cache until `max-age` (4h) expires; purge the URL if you need it gone now.

The prune refuses to run when `photographs/` is empty (a fresh clone has no
image bytes — they're gitignored) or when it would delete more objects than it
keeps. Pass `--force-prune` to override the second case.

## Adding / updating photos

1. Drop full-resolution `.jpg` / `.jpeg` files in here (no `.thumb` suffix).
2. Generate, upload, and verify the R2 sync:

   ```sh
   bun run photos
   ```
3. Commit `lib/photographs.json` (the manifest). The images and a copy of the
   manifest are already live on the CDN, so the gallery updates as soon as the
   committed manifest deploys.

`bun run photos` does, per source file:

- **Strips geo EXIF/XMP in place** and **aborts if any GPS survives** — the
  location gate, now run before a byte leaves the machine. Camera settings
  (body, lens, ISO, shutter, aperture) are kept.
- **Builds `*.thumb.jpg`** (long edge 900px, q72), metadata dropped.
- **Records metadata** (title from XMP `dc:title` → EXIF caption → filename;
  settings; dimensions; capture date) into the manifest, sorted newest-first.
- **Uploads and verifies R2**: photos, thumbnails, and `lib/photographs.json`
  as `photographs.json` in the same R2 prefix. The image bytes ship *before*
  the manifest is written, so `next dev` never hot-reloads a gallery pointing
  at CDN URLs that are still 404 (a browser caches that failure, and the photo
  stays broken until a hard refresh).

For local-only manifest regeneration without touching R2, use
`bun run photos:local`.

## Upload config (env, with defaults)

| var | default | meaning |
| --- | --- | --- |
| `PHOTOS_CDN_HOST` | `https://cdn.alexng.dev` | public host |
| `PHOTOS_PREFIX` | `assets/alexng.dev/photos` | key prefix (URL + R2) |
| `PHOTOS_R2_REMOTE` | — (required for `--upload`) | rclone remote+bucket, e.g. `r2:my-bucket` |

One-time rclone setup: `rclone config` → new remote, type `s3`, provider
`Cloudflare`, your R2 endpoint + access key/secret. Then:

```sh
PHOTOS_R2_REMOTE=r2:my-bucket bun run photos:upload
```

## Notes

- Titles: set them in darktable/Lightroom (the "Title" field → XMP `dc:title`),
  or name the file nicely (`golden-hour.jpg` → "Golden Hour").
- Ordering is newest-first by EXIF capture date; undated photos sort last, then
  by filename.
- The geo gate is now upload-time only (strip + abort-if-present). There is no
  runtime refusal because the site no longer serves the bytes — the CDN does.
