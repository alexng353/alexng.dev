import { describe, expect, test } from "bun:test";
import { orphanKeys, rcloneSyncCommands } from "./gen-photos.mjs";
import { xmpKeywords } from "./lib/photo-meta.mjs";

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

describe("orphaned R2 objects", () => {
  const remote = [
    "DSC00001.jpg",
    "DSC00001.thumb.jpg",
    "DSC00002.jpg",
    "DSC00002.thumb.jpg",
    "photographs.json",
  ];

  test("selects both objects of a photo that left the manifest", () => {
    expect(orphanKeys(remote, ["DSC00001.jpg", "DSC00001.thumb.jpg"])).toEqual([
      "DSC00002.jpg",
      "DSC00002.thumb.jpg",
    ]);
  });

  test("never selects the manifest, even when nothing is kept", () => {
    expect(orphanKeys(remote, [])).not.toContain("photographs.json");
    expect(orphanKeys(["photographs.json"], [])).toEqual([]);
  });

  test("leaves a fully-synced prefix alone", () => {
    expect(orphanKeys(remote, remote)).toEqual([]);
  });

  test("matches .jpeg as well as .jpg", () => {
    expect(orphanKeys(["a.jpeg", "b.JPG", "notes.txt"], [])).toEqual([
      "a.jpeg",
      "b.JPG",
    ]);
  });
});

describe("xmp keywords", () => {
  const bag = (...items) =>
    `<dc:subject><rdf:Bag>${items
      .map((i) => `<rdf:li>${i}</rdf:li>`)
      .join("")}</rdf:Bag></dc:subject>`;

  test("reads every rdf:li in the bag, sorted", () => {
    expect(xmpKeywords(bag("people", "city"))).toEqual(["city", "people"]);
  });

  test("lower-cases and dedupes, since tags become URL segments", () => {
    expect(xmpKeywords(bag("City", "city", "CITY"))).toEqual(["city"]);
  });

  test("decodes entities", () => {
    expect(xmpKeywords(bag("black &amp; white"))).toEqual(["black & white"]);
  });

  test("returns an empty list for untagged or unparseable XMP", () => {
    expect(xmpKeywords(null)).toEqual([]);
    expect(xmpKeywords("<dc:title>Roses</dc:title>")).toEqual([]);
    expect(xmpKeywords(bag())).toEqual([]);
  });
});
