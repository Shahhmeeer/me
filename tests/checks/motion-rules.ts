/**
 * The guard on movement.
 *
 * A visitor who has asked their system for less movement must get none, and
 * that promise is only as good as the last class somebody typed. So this check
 * reads the source rather than the running page: every moving Tailwind utility
 * must be written behind `motion-safe:`, and every moving declaration in the
 * stylesheet must sit inside a `prefers-reduced-motion` block.
 *
 * The functions here are pure. The test supplies the files.
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";

/** The Tailwind variant that means "only when movement is welcome". */
export const MOTION_GUARD = "motion-safe";

/** The directories whose components draw the page. */
export const SOURCE_DIRECTORIES = ["app", "components"];

const MOVING_UTILITY = /^(transition|animate|duration|ease)(-|$)/;

/** Text with its comments taken out, so a mention is not read as a class. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

/**
 * Every moving utility written without the guard.
 *
 * A class is judged by its segments rather than its order, so the guard counts
 * whether it is written before or after any other variant on the class.
 */
export function unguardedMotionUtilities(source: string): string[] {
  const words = withoutComments(source).match(/[A-Za-z0-9:_-]+/g) ?? [];

  return words.filter((word) => {
    const segments = word.split(":");
    const utility = segments[segments.length - 1];

    return (
      MOVING_UTILITY.test(utility) && !segments.includes(MOTION_GUARD)
    );
  });
}

/** Stylesheet text with every `prefers-reduced-motion` block taken out. */
function withoutReducedMotionBlocks(css: string): string {
  let remaining = css.replace(/\/\*[\s\S]*?\*\//g, " ");

  for (;;) {
    const queryAt = remaining.indexOf("prefers-reduced-motion");
    if (queryAt === -1) {
      return remaining;
    }

    const openAt = remaining.indexOf("{", queryAt);
    if (openAt === -1) {
      return remaining.slice(0, queryAt);
    }

    let depth = 0;
    let closeAt = remaining.length;
    for (let index = openAt; index < remaining.length; index += 1) {
      if (remaining[index] === "{") {
        depth += 1;
      } else if (remaining[index] === "}") {
        depth -= 1;
        if (depth === 0) {
          closeAt = index;
          break;
        }
      }
    }

    remaining =
      remaining.slice(0, queryAt) + " " + remaining.slice(closeAt + 1);
  }
}

/** Every moving declaration written outside a `prefers-reduced-motion` block. */
export function unguardedMotionDeclarations(css: string): string[] {
  return (
    withoutReducedMotionBlocks(css).match(
      /\b(?:transition|animation)[a-z-]*\s*:[^;{}]*;/g,
    ) ?? []
  ).map((declaration) => declaration.replace(/\s+/g, " ").trim());
}

/** Every component file under the source directories. */
export function sourceFiles(repoRoot: string): string[] {
  return SOURCE_DIRECTORIES.flatMap((directory) =>
    readdirSync(join(repoRoot, directory), {
      recursive: true,
      withFileTypes: true,
    })
      .filter(
        (entry) => entry.isFile() && /\.tsx?$/.test(entry.name),
      )
      .map((entry) => join(entry.parentPath, entry.name)),
  );
}
