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

/**
 * What a selector's rule writes under the `large` variant, as text: what the
 * thing is on the Strip. Null when the rule has no such block. The selector
 * is a class name, so the one character to escape is its dot.
 */
function onStrip(selector: string): string | null {
  const pattern = new RegExp(
    `${selector.replace(".", "\\.")}\\s*\\{[^{}]*@variant large\\s*\\{([^}]*)\\}`,
  );
  return globalStyles.match(pattern)?.[1] ?? null;
}

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

  /** The Nav and the Bar float over the Strip, so their pill is glass: a blur over a translucent surface. */
  it("frosts the pill with a blur over a translucent surface", () => {
    expect(frostingProblems(globalStyles, tokens)).toEqual([]);
  });

  /**
   * The Strip is native scroll, snapped to a Spread (ADR-0003): the browser
   * does the sliding, and the wheel and the keys only ask it to.
   */
  it("snaps the Strip to a Spread", () => {
    expect(onStrip(".strip")).toMatch(/scroll-snap-type:\s*x mandatory;/);
    expect(onStrip(".spread")).toMatch(/scroll-snap-align:\s*start;/);
  });

  /**
   * A Spread is exactly one screen on the Strip, wide and tall (ADR-0003):
   * a wheel roll moves one screen, so one screen has to be one Spread, and
   * nothing inside one is laid out to scroll. It never shrinks to fit the
   * row, or the row would fit the screen and the snap would land nowhere.
   */
  it("holds a Spread to one screen on the Strip", () => {
    const spread = onStrip(".spread");

    expect(spread, "the .spread rule under the large variant").not.toBeNull();
    expect(spread).toMatch(/width:\s*100vw;/);
    expect(spread).toMatch(/height:\s*100%;/);
    expect(spread).toMatch(/flex:\s*none;/);
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
    const row = onStrip(".strip");

    expect(row, "the .strip rule under the large variant").not.toBeNull();
    expect(row).toMatch(/height:\s*100svh;/);
    expect(row).toMatch(/flex:\s*none;/);
  });

  /**
   * A card holds no width of its own on the Strip: its Spread's card column
   * is the width, and a grid of cards shares it (ADR-0003). The row layout
   * held every card to a fixed width, so a row of them grew its Panel
   * sideways to fit, and the snap then landed mid-card; a width written
   * here again would be that row coming back.
   */
  it("gives a card no width of its own on the Strip", () => {
    expect(onStrip(".card"), "a .card rule under the large variant").toBeNull();
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
   * The Blobs drift by a keyframe that moves them and does nothing else,
   * along the one path the design fixed: from rest, bending once, 14vw by
   * 10vh in a 20 second cycle, far and quick enough to be seen to move and
   * slow enough to read as a background and not an event. They take no
   * pointer: a click on one lands on whatever is under it. That the drift
   * is still under reduced motion is held above, with every other movement.
   */
  it("drifts the Blobs along the fixed path, by translate only, and lets a pointer through", () => {
    expect(driftProblems(globalStyles)).toEqual([]);
  });

  /**
   * A Blob is faded to a wash: bright enough to be seen drifting, dim enough
   * that the words over it still read. The number is the design's; the
   * contrast pairs above are what hold the words.
   */
  it("fades a Blob to 0.34", () => {
    expect(globalStyles).toMatch(/\.blob\s*\{[^}]*opacity:\s*0\.34;/);
  });

  /**
   * The disc behind the portrait on Home is a Blob drawn crisp: the same
   * shape and the same drift, with the blur and the fade taken off so it
   * reads as a disc the head rises out of, and going only part of the way
   * along the path, so it stays behind the head it is there for.
   */
  it("draws the disc as a Blob with a crisp edge that drifts part of the way", () => {
    const disc = globalStyles.match(/\.disc\s*\{([^}]*)\}/)?.[1];

    expect(disc, "a .disc rule").toBeDefined();
    expect(disc).toMatch(/filter:\s*none;/);
    expect(disc).toMatch(/background:\s*var\(--blob-colour\);/);
    expect(disc).toMatch(/opacity:\s*1;/);

    const reach = Number(disc?.match(/--blob-reach:\s*([\d.]+);/)?.[1]);
    expect(reach).toBeGreaterThan(0);
    expect(reach).toBeLessThan(1);
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
