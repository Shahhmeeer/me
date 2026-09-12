import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { pictureProblems } from "./pictures";

/** A PNG header for the given size: the eight-byte signature, then IHDR. */
function png(width: number, height: number): Buffer {
  const header = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header);
  header.writeUInt32BE(13, 8);
  header.write("IHDR", 12, "ascii");
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return header;
}

describe("pictureProblems", () => {
  const publicDir = mkdtempSync(join(tmpdir(), "pictures-"));
  writeFileSync(join(publicDir, "square.png"), png(100, 100));
  writeFileSync(join(publicDir, "photo.jpg"), Buffer.from("not a png"));

  const square = { src: "/square.png", alt: "A square", width: 100, height: 100 };

  it("accepts a picture whose file is on disk at the size it claims", () => {
    expect(pictureProblems(square, publicDir)).toEqual([]);
  });

  it("rejects a picture whose file is missing", () => {
    expect(
      pictureProblems({ ...square, src: "/missing.png" }, publicDir),
    ).not.toEqual([]);
  });

  it("rejects a PNG whose claimed size is not its real size", () => {
    expect(pictureProblems({ ...square, width: 200 }, publicDir)).not.toEqual([]);
    expect(pictureProblems({ ...square, height: 50 }, publicDir)).not.toEqual([]);
  });

  it("rejects empty alt text", () => {
    expect(pictureProblems({ ...square, alt: " " }, publicDir)).not.toEqual([]);
  });

  it("reads the size of a PNG only, and takes any other file as it is", () => {
    expect(
      pictureProblems(
        { src: "/photo.jpg", alt: "A photo", width: 1, height: 1 },
        publicDir,
      ),
    ).toEqual([]);
  });
});
