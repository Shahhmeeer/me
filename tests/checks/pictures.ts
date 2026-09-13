/**
 * What makes a Picture fit to ship: the file it names is on disk, at the size
 * it claims, with words for a screen reader.
 *
 * This is the one content check that reads the filesystem. A Picture is a
 * path, and a path is only a promise; a badge renamed or a sketch never copied
 * into `public` renders as a broken image, and a size typed wrong holds the
 * wrong space on the page before it does. Both are caught here rather than on
 * a visitor's screen.
 */

import { existsSync, openSync, readSync, closeSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Picture } from "@/content/site";
import { isBlank } from "./strings";

/** The `public` directory of this repo: where every Picture is served from. */
export const PUBLIC_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

/** The eight bytes every PNG opens with. */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** The colour types a PNG's IHDR chunk may declare. */
export const PNG_COLOUR_TYPE = {
  GREY: 0,
  RGB: 2,
  PALETTE: 3,
  GREY_ALPHA: 4,
  RGBA: 6,
} as const;

/** The colour types that carry an alpha channel. */
const ALPHA_COLOUR_TYPES: number[] = [
  PNG_COLOUR_TYPE.GREY_ALPHA,
  PNG_COLOUR_TYPE.RGBA,
];

/**
 * What a PNG declares in its header, or null for any other file. The IHDR
 * chunk always comes first, so the size and the colour type are at fixed
 * offsets and the whole file need not be read.
 */
function pngHeader(
  path: string,
): { width: number; height: number; colourType: number } | null {
  const header = Buffer.alloc(26);
  const file = openSync(path, "r");
  try {
    readSync(file, header, 0, header.length, 0);
  } finally {
    closeSync(file);
  }

  if (!header.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return null;
  }

  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
    colourType: header.readUInt8(25),
  };
}

/**
 * Whether a Picture is a PNG with an alpha channel: what a cutout drawn over
 * a shape must be, or the shape is hidden behind a white square. False for a
 * file that is missing or is not a PNG. A palette PNG with a transparent
 * entry is not counted; the cutout is expected to be a true RGBA file.
 */
export function pictureHasAlpha(picture: Picture, publicDir: string): boolean {
  const path = join(publicDir, picture.src);
  if (!existsSync(path)) {
    return false;
  }
  const header = pngHeader(path);
  return header !== null && ALPHA_COLOUR_TYPES.includes(header.colourType);
}

/**
 * Problems with one Picture, given the `public` directory it is served from.
 * A file that is not a PNG is taken at the size it claims: only a PNG's
 * header is read.
 */
export function pictureProblems(picture: Picture, publicDir: string): string[] {
  const problems: string[] = [];

  if (isBlank(picture.alt)) {
    problems.push(`Picture ${picture.src} has no alt text.`);
  }

  const path = join(publicDir, picture.src);
  if (!existsSync(path)) {
    problems.push(`Picture ${picture.src} is not on disk under public.`);
    return problems;
  }

  const header = pngHeader(path);
  if (
    header !== null &&
    (header.width !== picture.width || header.height !== picture.height)
  ) {
    problems.push(
      `Picture ${picture.src} is ${header.width}x${header.height} on disk but claims ${picture.width}x${picture.height}.`,
    );
  }

  return problems;
}
