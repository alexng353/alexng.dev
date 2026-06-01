import { spawn } from "node:child_process";
import { mkdirSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeContentVersion } from "./gen-content-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const watchDirs = [
  join(root, "content", "blog"),
  join(root, "content", "drafts"),
];

// Start from a clean 0 so the module exists before `next dev` compiles it.
writeContentVersion(0);

// Forward any extra args (e.g. `-p 4399`) straight through to next dev.
const child = spawn("next", ["dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

let timer;
let counter = 0;
// Editor noise to ignore: vim swap/backup files (.foo.md.swp, foo.md~), vim's
// "4913" write-probe, and other dotfiles. Everything else in this directory is
// a post — including the unnamed temp files that atomic-save editors rename
// over the original, so we react to those too (the debounce lets the rename
// settle before we re-read from disk).
const IGNORE = /(^\.|\.sw[a-z]$|~$|^\d{4,5}$)/;

for (const dir of watchDirs) {
  mkdirSync(dir, { recursive: true }); // ensure it exists so watch() can attach
  watch(dir, (_event, filename) => {
    if (filename && IGNORE.test(filename)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      writeContentVersion(++counter);
      console.log(`[content] ${filename ?? "post"} saved — reloading…`);
    }, 120);
  });
}

function shutdown(code) {
  clearTimeout(timer);
  writeContentVersion(0); // leave the working tree clean
  if (child.exitCode === null && !child.killed) child.kill("SIGINT");
  process.exit(code ?? 0);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
child.on("exit", (code) => shutdown(code ?? 0));
