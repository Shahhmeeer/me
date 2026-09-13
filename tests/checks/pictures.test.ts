import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PNG_COLOUR_TYPE, pictureHasAlpha, pictureProblems } from "./pictures";

const { RGB, PALETTE, GREY_ALPHA, RGBA } = PNG_COLOUR_TYPE;

/**
 * A PNG header for the given size: the eight-byte signature, then IHDR with
 * its bit depth and colour type.
 */
function png(width: number, height: number, colourType: number = PALETTE): Buffer {
  const header = Buffer.alloc(26);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header);
  header.writeUInt32BE(13, 8);
  header.write("IHDR", 12, "ascii");
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  header.writeUInt8(8, 24);
  header.writeUInt8(colourType, 25);
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

describe("pictureHasAlpha", () => {
  const publicDir = mkdtempSync(join(tmpdir(), "pictures-alpha-"));
  writeFileSync(join(publicDir, "rgba.png"), png(1, 1, RGBA));
  writeFileSync(join(publicDir, "grey-alpha.png"), png(1, 1, GREY_ALPHA));
  writeFileSync(join(publicDir, "rgb.png"), png(1, 1, RGB));
  writeFileSync(join(publicDir, "palette.png"), png(1, 1, PALETTE));
  writeFileSync(join(publicDir, "photo.jpg"), Buffer.from("not a png"));

  const picture = { src: "", alt: "A picture", width: 1, height: 1 };

  it("is true for a PNG whose colour type carries an alpha channel", () => {
    expect(pictureHasAlpha({ ...picture, src: "/rgba.png" }, publicDir)).toBe(true);
    expect(pictureHasAlpha({ ...picture, src: "/grey-alpha.png" }, publicDir)).toBe(true);
  });

  it("is false for a PNG drawn without one", () => {
    expect(pictureHasAlpha({ ...picture, src: "/rgb.png" }, publicDir)).toBe(false);
    expect(pictureHasAlpha({ ...picture, src: "/palette.png" }, publicDir)).toBe(false);
  });

  it("is false for anything that is not a PNG on disk", () => {
    expect(pictureHasAlpha({ ...picture, src: "/photo.jpg" }, publicDir)).toBe(false);
    expect(pictureHasAlpha({ ...picture, src: "/missing.png" }, publicDir)).toBe(false);
  });
});
