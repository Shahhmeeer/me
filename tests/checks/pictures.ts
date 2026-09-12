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

/**
 * The width and height a PNG declares in its header, or null for any other
 * file. The IHDR chunk always comes first, so the size is at a fixed offset
 * and the whole file need not be read.
 */
function pngSize(path: string): { width: number; height: number } | null {
  const header = Buffer.alloc(24);
  const file = openSync(path, "r");
  try {
    readSync(file, header, 0, header.length, 0);
  } finally {
    closeSync(file);
  }

  if (!header.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return null;
  }

  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
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

  const size = pngSize(path);
  if (
    size !== null &&
    (size.width !== picture.width || size.height !== picture.height)
  ) {
    problems.push(
      `Picture ${picture.src} is ${size.width}x${size.height} on disk but claims ${picture.width}x${picture.height}.`,
    );
  }

  return problems;
}
