import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PICTURE_COLOURS } from "@/app/picture-colours";
import {
  colourTokens,
  contrastProblems,
  driftProblems,
  frostingProblems,
  largeDisplayProblems,
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
   * The Strip is native scroll, snapped to a Spread (ADR-0003): the browser
   * does the sliding, and the wheel and the keys only ask it to.
   */
  it("snaps the Strip to a Spread", () => {
    const row = globalStyles.match(/\.strip\s*\{\s*@variant large\s*\{([^}]*)\}/);
    const spread = globalStyles.match(/\.spread\s*\{\s*@variant large\s*\{([^}]*)\}/);

    expect(row?.[1]).toMatch(/scroll-snap-type:\s*x mandatory;/);
    expect(spread?.[1]).toMatch(/scroll-snap-align:\s*start;/);
  });

  /**
   * A Spread is exactly one screen on the Strip, wide and tall (ADR-0003):
   * a wheel roll moves one screen, so one screen has to be one Spread, and
   * nothing inside one is laid out to scroll. It never shrinks to fit the
   * row, or the row would fit the screen and the snap would land nowhere.
   */
  it("holds a Spread to one screen on the Strip", () => {
    const spread = globalStyles.match(/\.spread\s*\{\s*@variant large\s*\{([^}]*)\}/);

    expect(spread, "the .spread rule under the large variant").not.toBeNull();
    expect(spread?.[1]).toMatch(/width:\s*100vw;/);
    expect(spread?.[1]).toMatch(/height:\s*100%;/);
    expect(spread?.[1]).toMatch(/flex:\s*none;/);
  });

  /**
   * Which display gets the Strip is written once, as the `large` variant
   * (ADR-0003): at least 1280px wide, wider than tall, and driven by a mouse
   * or a trackpad. A width alone cannot tell a laptop from a tablet held
   * sideways, and a tablet has nothing to drive a Strip with, so each of the
   * three is held, and no other rule may ask the question again.
   */
  it("hands the Strip to a wide, landscape display with a fine pointer, and decides it once", () => {
    expect(largeDisplayProblems(globalStyles)).toEqual([]);
  });

  /**
   * On a large display the Strip is one screen tall, so the document never
   * scrolls up and down (ADR-0003). The height alone did not hold it: the
   * stacked page's `flex-1` won over it and the Strip stood as tall as its
   * tallest Panel (#41). The comment above `.strip` says why `flex: none` is
   * what takes it back.
   */
  it("holds the Strip to one screen tall on a large display", () => {
    const row = globalStyles.match(/\.strip\s*\{\s*@variant large\s*\{([^}]*)\}/);

    expect(row, "the .strip rule under the large variant").not.toBeNull();
    expect(row?.[1]).toMatch(/height:\s*100svh;/);
    expect(row?.[1]).toMatch(/flex:\s*none;/);
  });

  /**
   * On the Strip a card is a fixed width and never shrinks, so a row of them
   * grows its Panel sideways to fit and nothing is ever laid out downwards to
   * scroll (ADR-0003). It is in the sheet and not a utility because a card
   * has three homes, and the width is what makes them one row.
   */
  it("holds a card to a fixed width on the Strip", () => {
    const onStrip = globalStyles.match(/\.card\s*\{[^{}]*@variant large\s*\{([^}]*)\}/);

    expect(onStrip, "the .card rule under the large variant").not.toBeNull();
    expect(onStrip?.[1]).toMatch(/width:\s*\d+(\.\d+)?rem;/);
    expect(onStrip?.[1]).toMatch(/flex:\s*none;/);
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
   * The Blobs drift by a keyframe that moves them and does nothing else, slowly
   * enough to read as a background and not an event, and they take no
   * pointer: a click on one lands on whatever is under it. That the drift is
   * still under reduced motion is held above, with every other movement.
   */
  it("drifts the Blobs by translate only, slowly, and lets a pointer through", () => {
    expect(driftProblems(globalStyles)).toEqual([]);
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
