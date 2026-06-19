import { describe, expect, test } from "bun:test";
import { rcloneSyncCommands } from "./gen-photos.mjs";

describe("photo R2 sync commands", () => {
  test("uploads and verifies photos plus manifest", () => {
    const commands = rcloneSyncCommands({
      photosDir: "/repo/photographs",
      manifest: "/repo/lib/photographs.json",
      dest: ":s3:default/assets/alexng.dev/photos",
    });

    expect(commands).toEqual([
      [
        "copy",
        "/repo/photographs",
        ":s3:default/assets/alexng.dev/photos",
        "--include",
        "*.jpg",
        "--include",
        "*.jpeg",
        "--progress",
      ],
      [
        "copyto",
        "/repo/lib/photographs.json",
        ":s3:default/assets/alexng.dev/photos/photographs.json",
        "--progress",
      ],
      [
        "check",
        "/repo/photographs",
        ":s3:default/assets/alexng.dev/photos",
        "--include",
        "*.jpg",
        "--include",
        "*.jpeg",
        "--one-way",
        "--size-only",
      ],
      [
        "check",
        "/repo/lib",
        ":s3:default/assets/alexng.dev/photos",
        "--include",
        "photographs.json",
        "--one-way",
        "--size-only",
      ],
    ]);
  });
});
