import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  READABLE_PAIRS,
  colourSchemes,
  contrastProblems,
  contrastRatio,
} from "./checks/contrast";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const globalStyles = readFileSync(join(repoRoot, "app", "globals.css"), "utf8");

describe("contrast ratio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#1d4ed8", "#1d4ed8")).toBeCloseTo(1, 5);
  });

  it("reads three-digit hex the same as six", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
  });
});

describe("colour tokens", () => {
  const schemes = colourSchemes(globalStyles);

  it("reads a light and a dark value for every token", () => {
    for (const [token] of READABLE_PAIRS.flatMap(({ text, behind }) => [
      [text],
      [behind],
    ])) {
      expect(schemes.light[token], `light ${token}`).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(schemes.dark[token], `dark ${token}`).toMatch(/^#[0-9a-f]{3,8}$/i);
    }
  });

  it("does not read the dark scheme as the light one", () => {
    expect(schemes.dark["--portfolio-background"]).not.toBe(
      schemes.light["--portfolio-background"],
    );
  });
});

describe("Colour contrast", () => {
  /**
   * Every pair of colours a visitor reads text in, in both colour schemes,
   * against the WCAG AA threshold for body text. A token edited to a prettier
   * shade fails here rather than on someone's screen.
   */
  it("passes AA in both colour schemes", () => {
    expect(contrastProblems(colourSchemes(globalStyles))).toEqual([]);
  });
});
