# Agent Notes

## Photography Workflow

- Photo bytes under `photographs/*.jpg` and `photographs/*.jpeg` are intentionally gitignored. The tracked source of truth for the site is `lib/photographs.json`; image bytes live on R2/CDN.
- Do not hand-edit a title only in `lib/photographs.json` if the source image exists locally. `bun run photos` regenerates the manifest from image metadata and can overwrite manual JSON edits. Update the source photo metadata with `exiftool` first, then run `bun run photos` or `bun run photos:upload`.
- `bun run photos:upload` uses dynamic rclone S3 env (`RCLONE_S3_PROVIDER`, access key, secret, endpoint) derived from `CLOUDFLARE_R2_*`. If you verify with raw `rclone :s3:` commands, pass the same env or rclone may fail with provider/access errors even though the upload script works.
- The upload script copies photos and thumbnails to `PHOTOS_PREFIX` and also uploads `lib/photographs.json` as `photographs.json` in that same R2 prefix.
- Biome ignores `lib/photographs.json`, and `bun lint` currently only prints Biome help. Use `bun check` for type verification and `bunx biome check --write <changed source files>` for files Biome actually includes.
