import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "lib", "content-version.ts");

/**
 * Write lib/content-version.ts. The blog pages import this module, so changing
 * its contents forces Next's dev server to recompile and reload the page —
 * which is how we turn a markdown save into a live reload.
 */
export function writeContentVersion(value = 0) {
  writeFileSync(
    target,
    [
      "// AUTO-GENERATED — bumped by scripts/dev.mjs whenever a markdown post is saved",
      "// so Next's dev server hot-reloads. Resets to 0 on dev exit and before builds,",
      "// so a 0 here is normal. Safe to commit.",
      `export const CONTENT_VERSION = ${value};`,
      "",
    ].join("\n"),
  );
  return value;
}

// Run directly (e.g. `prebuild`) to reset to a deterministic 0.
if (import.meta.url === `file://${process.argv[1]}`) {
  writeContentVersion(0);
}
