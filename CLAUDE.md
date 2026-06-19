# Agent Notes

## Photography Workflow

- Photo bytes under `photographs/*.jpg` and `photographs/*.jpeg` are intentionally gitignored. The tracked source of truth for the site is `lib/photographs.json`; image bytes live on R2/CDN.
- Do not hand-edit a title only in `lib/photographs.json` if the source image exists locally. `bun run photos` regenerates the manifest from image metadata and can overwrite manual JSON edits. Update the source photo metadata with `exiftool` first, then run `bun run photos`.
- `bun run photos` is the full publish path: strip geo, build stale thumbnails, regenerate `lib/photographs.json`, upload photos/thumbnails/manifest to R2, then run `rclone check` against R2. Use `bun run photos:local` only when you intentionally want no R2 access.
- `bun run photos` uses dynamic rclone S3 env (`RCLONE_S3_PROVIDER`, access key, secret, endpoint) derived from `CLOUDFLARE_R2_*`. If you verify with raw `rclone :s3:` commands, pass the same env or rclone may fail with provider/access errors even though the upload script works.
- The pre-commit hook runs `bun run photos`, stages `lib/photographs.json`, then runs `bun check`. Commits need R2 credentials available unless the hook is intentionally bypassed.
- Biome ignores `lib/photographs.json`, and `bun lint` currently only prints Biome help. Use `bun check` for type verification and `bunx biome check --write <changed source files>` for files Biome actually includes.
