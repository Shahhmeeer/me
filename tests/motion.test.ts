import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  sourceFiles,
  unguardedMotionDeclarations,
  unguardedMotionUtilities,
} from "./checks/motion-rules";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const globalStyles = readFileSync(join(repoRoot, "app", "globals.css"), "utf8");

describe("unguardedMotionUtilities", () => {
  it("reports a bare motion utility", () => {
    expect(unguardedMotionUtilities('className="transition-colors"')).toEqual([
      "transition-colors",
    ]);
  });

  it("accepts one behind motion-safe", () => {
    expect(
      unguardedMotionUtilities('className="motion-safe:transition-colors"'),
    ).toEqual([]);
  });

  it("ignores the word in a comment", () => {
    expect(
      unguardedMotionUtilities("/* the transition-colors of a link */"),
    ).toEqual([]);
  });
});

describe("unguardedMotionDeclarations", () => {
  it("reports a transition outside the reduced-motion guard", () => {
    expect(unguardedMotionDeclarations(".a { transition: opacity 1s; }")).toEqual(
      ["transition: opacity 1s;"],
    );
  });

  it("accepts one inside it", () => {
    const css = `@media (prefers-reduced-motion: no-preference) {
      .a { transition: opacity 1s; }
    }`;
    expect(unguardedMotionDeclarations(css)).toEqual([]);
  });
});

describe("Motion", () => {
  /**
   * A visitor who has asked for less movement must get none. Every moving
   * utility in a component is written behind `motion-safe:`, and every moving
   * declaration in the stylesheet sits inside the reduced-motion guard, so a
   * fade added later cannot reach them.
   */
  it("is guarded everywhere it is written", () => {
    for (const file of sourceFiles(repoRoot)) {
      expect(
        unguardedMotionUtilities(readFileSync(file, "utf8")),
        file,
      ).toEqual([]);
    }

    expect(unguardedMotionDeclarations(globalStyles)).toEqual([]);
  });
});
