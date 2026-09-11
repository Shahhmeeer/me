import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PICTURE_COLOURS } from "@/app/picture-colours";
import { colourSchemes, contrastProblems } from "./checks/contrast";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const globalStyles = readFileSync(join(repoRoot, "app", "globals.css"), "utf8");

describe("Colour contrast", () => {
  /**
   * Every pair of colours a visitor reads text in, in both colour schemes,
   * against the WCAG AA threshold for body text. A token edited to a prettier
   * shade fails here rather than on someone's screen.
   */
  it("passes AA in both colour schemes", () => {
    expect(contrastProblems(colourSchemes(globalStyles))).toEqual([]);
  });

  /**
   * The share image and the tab icon carry their own copy of the light
   * tokens, because they are drawn without the stylesheet. This holds the
   * copy to the original, token for token.
   */
  it("gives the build-time pictures the same light colours as the page", () => {
    const { light } = colourSchemes(globalStyles);
    const fromStylesheet = Object.fromEntries(
      Object.keys(PICTURE_COLOURS).map((token) => [token, light[token]]),
    );

    expect(fromStylesheet).toEqual(PICTURE_COLOURS);
  });
});
