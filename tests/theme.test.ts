import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PICTURE_COLOURS } from "@/app/picture-colours";
import {
  colourTokens,
  contrastProblems,
  frostingProblems,
  liftProblems,
  motionProblems,
  paletteProblems,
} from "./checks/theme";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const globalStyles = readFileSync(join(repoRoot, "app", "globals.css"), "utf8");
const tokens = colourTokens(globalStyles);

describe("Theme", () => {
  /**
   * One dark theme (ADR-0002). A second scheme would double every colour
   * check and every look-by-eye, so the stylesheet is held to one.
   */
  it("declares one colour scheme and no other", () => {
    expect(globalStyles).toContain("color-scheme: dark;");
    expect(globalStyles).not.toContain("prefers-color-scheme");
  });

  /** The look is Shahmeer's palette, so every palette colour is a token. */
  it("builds the tokens from the five palette colours", () => {
    expect(paletteProblems(tokens)).toEqual([]);
  });

  /**
   * Every pair of colours a visitor reads text in, against the WCAG AA
   * threshold for body text. A token edited to a prettier shade fails here
   * rather than on someone's screen.
   */
  it("passes AA for every text and background pair", () => {
    expect(contrastProblems(tokens)).toEqual([]);
  });

  /** Hover is quiet: a border changes colour and nothing lifts. */
  it("moves nothing on hover or focus-within", () => {
    expect(liftProblems(globalStyles)).toEqual([]);
  });

  /** The Nav floats over the Panels, so it is glass: a blur over a translucent surface. */
  it("frosts the Nav with a blur over a translucent surface", () => {
    expect(frostingProblems(globalStyles, tokens)).toEqual([]);
  });

  /**
   * The strip is native scroll, snapped to a Panel (ADR-0003): the browser
   * does the sliding, and the wheel and the keys only ask it to.
   */
  it("snaps the strip to a Panel", () => {
    expect(globalStyles).toMatch(/scroll-snap-type:\s*x mandatory;/);
    expect(globalStyles).toMatch(/scroll-snap-align:\s*start;/);
  });

  /**
   * Every movement, the slide between Panels included, lives inside
   * `prefers-reduced-motion: no-preference`, so a visitor who has asked for
   * less gets a slide that is instant and a page that never moved.
   */
  it("moves only where the visitor has not asked for less motion", () => {
    expect(globalStyles).toMatch(/scroll-behavior:\s*smooth;/);
    expect(motionProblems(globalStyles)).toEqual([]);
  });

  /**
   * The share image and the tab icon carry their own copy of the tokens,
   * because they are drawn without the stylesheet. This holds the copy to
   * the original, token for token.
   */
  it("gives the build-time pictures the same colours as the page", () => {
    const fromStylesheet = Object.fromEntries(
      Object.keys(PICTURE_COLOURS).map((token) => [token, tokens[token]]),
    );

    expect(fromStylesheet).toEqual(PICTURE_COLOURS);
  });
});
