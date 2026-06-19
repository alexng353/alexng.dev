# photographs/

Filesystem source of truth for the [`/photography`](../app/photography) gallery.
Served (gated) under `/photographs/*.jpg` by
[`app/photographs/[...slug]/route.ts`](../app/photographs/%5B...slug%5D/route.ts).

## Layout

Each photo is a pair:

```
my-photo.jpg        full resolution (what the lightbox shows)
my-photo.thumb.jpg  generated thumbnail (what the grid shows)
```

## Adding photos

1. Drop full-resolution `.jpg` / `.jpeg` files in here (no `.thumb` suffix).
2. Run the generator:

   ```sh
   bun run photos          # strip geo EXIF + build missing thumbnails
   bun run photos --force  # rebuild every thumbnail
   ```

`bun run photos` does two things to each source file:

- **Strips GPS / geo EXIF in place** (via `exiftool`), while keeping the camera
  settings the gallery shows on hover (body, lens, ISO, shutter, aperture).
- **Generates `*.thumb.jpg`** (long edge 900px, q72) with all metadata dropped.

## Location safety (three layers)

1. `bun run photos` strips geo from every source.
2. The **pre-commit hook** ([`.githooks/pre-commit`](../.githooks/pre-commit))
   strips geo from any staged JPEG and re-stages it — so a geotagged file can't
   enter git history. For staged base photos it also (re)generates and stages
   the matching `*.thumb.jpg`, so committing a `.jpg` is enough — no separate
   `bun run photos` step needed. Wired via `git config core.hooksPath .githooks`
   (the `prepare` npm script sets this on install).
3. The **route handler refuses to serve** any image that still carries a GPS
   coordinate (HTTP 403), and `listPhotos()` hides it from the gallery.

## Notes

- The gallery only picks up a photo once its `*.thumb.jpg` exists — the
  pre-commit hook ensures that for committed photos; run `bun run photos` to
  generate thumbnails while developing locally.
- Photos sort newest-first by EXIF capture date.
- Titles come from the EXIF `ImageDescription`, falling back to a prettified
  filename (`golden-hour` → "Golden Hour").
- The sample gradients shipped here are placeholders — replace them with real
  photographs.
