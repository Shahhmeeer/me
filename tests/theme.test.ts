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
  welcomeMotion,
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
   * One light theme (ADR-0006). A second scheme would double every colour
   * check and every look-by-eye, so the stylesheet is held to one; the dark
   * scheme behind a toggle that #94 wants takes this guard off on purpose.
   */
  it("declares one colour scheme, light, and no other", () => {
    expect(globalStyles).toContain("color-scheme: light;");
    expect(globalStyles).not.toContain("prefers-color-scheme");
  });

  /**
   * The look is Shahmeer's palette, so every palette colour is a token: the
   * five he chose and Deep Sky, the ink derived from Pale Sky.
   */
  it("builds the tokens from the six palette colours", () => {
    expect(paletteProblems(tokens)).toEqual([]);
  });

  /**
   * Every pair of colours a visitor reads text in, against the WCAG AA
   * threshold for body text, and the Deep Sky line on the ground and on a
   * card at the line threshold. A token edited to a prettier shade fails
   * here rather than on someone's screen.
   */
  it("passes AA for every text and background pair, and 3:1 for every visible line", () => {
    expect(contrastProblems(tokens)).toEqual([]);
  });

  /**
   * The five pastels have their homes (ADR-0006): the ground is Pearl Beige,
   * the button Powder Blush, the Disc Celadon, the chip Pale Sky, and Deep
   * Sky is the accent as ink and as line, the one place the sky is drawn
   * dark. Charcoal is the muted ink, not the body ink, which is deeper.
   */
  it("gives each palette colour its home", () => {
    expect(tokens["--portfolio-background"]).toBe("#f2e2ba");
    expect(tokens["--portfolio-muted"]).toBe("#50514f");
    expect(tokens["--portfolio-action"]).toBe("#e0afa0");
    expect(tokens["--portfolio-disc"]).toBe("#baf2d8");
    expect(tokens["--portfolio-chip"]).toBe("#bad7f2");
    expect(tokens["--portfolio-accent"]).toBe("#2f5c85");
    expect(tokens["--portfolio-accent-border"]).toBe("#2f5c85");
    expect(tokens["--portfolio-foreground"]).toBe("#33342f");
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
   * The five micro-interactions, each a transition written inside the same
   * query: the lit dot stretching, the arrows' nudge, the reveal that
   * brings the title and then the card, the Tech Tag's border, and the
   * hint's fade. Held by selector, so one rewritten as a
   * utility, which the check above cannot read, or dropped, fails here;
   * that none of them moves outside the query is held above.
   */
  it("makes the five micro-interactions where motion is welcome", () => {
    const moving = welcomeMotion(globalStyles);

    for (const selector of [".dot-mark", ".arrow", ".reveal", ".tech-tag", ".hint"]) {
      expect(moving, selector).toContain(selector);
    }
  });

  /**
   * The arrows nudge on hover, the way they point and not when disabled:
   * the one movement hover makes, and the lift check above says only they
   * may. The lit dot is drawn wider, so a transition of its width is what
   * stretches it; the check reads the transition, and this reads the width.
   */
  it("nudges the Bar's arrows on hover and stretches the lit dot", () => {
    expect(globalStyles).toMatch(/\.arrow\[data-direction="back"\]:hover:not\(:disabled\)\s*\{[^}]*translate:\s*-2px 0;/);
    expect(globalStyles).toMatch(/\.arrow\[data-direction="on"\]:hover:not\(:disabled\)\s*\{[^}]*translate:\s*2px 0;/);
    expect(globalStyles).toMatch(/\.dot-mark\s*\{[^}]*transition:[^;]*\bwidth\b/);
  });

  /**
   * A Tech Tag is a chip filled Pale Sky, and its border turns Deep Sky
   * under a pointer, as a card's does, and nothing else about it changes:
   * the lift check holds the rest.
   */
  it("fills a Tech Tag Pale Sky and turns its border Deep Sky on hover", () => {
    const chip = globalStyles.match(/\.tech-tag\s*\{([^}]*)\}/)?.[1];
    const hover = globalStyles.match(/\.tech-tag:hover\s*\{([^}]*)\}/)?.[1];

    expect(chip, "a .tech-tag rule").toBeDefined();
    expect(chip).toContain("background: var(--portfolio-chip);");
    expect(hover, "a .tech-tag:hover rule").toBeDefined();
    expect(hover?.trim()).toBe("border-color: var(--portfolio-accent-border);");
  });

  /**
   * The hint fades rather than vanishing: its display is transitioned as a
   * discrete step, so it goes from sight and the accessibility tree when
   * the fade ends and not before, and at once where motion is not welcome.
   */
  it("fades the hint out, then takes it from the page", () => {
    const spent = globalStyles.match(/\.hint\[data-spent="true"\]\s*\{([^}]*)\}/)?.[1];

    expect(spent, "a .hint[data-spent] rule").toBeDefined();
    expect(spent).toMatch(/display:\s*none;/);
    expect(spent).toMatch(/opacity:\s*0;/);
    expect(globalStyles).toMatch(/\.hint\s*\{[^}]*transition:[^;]*display[^;]*allow-discrete/);
  });

  /**
   * The card fades and rises 8px as its Spread arrives, and the title a
   * beat earlier: the same reveal, the card's delayed.
   */
  it("brings the title first and the card a beat later, rising 8px", () => {
    expect(globalStyles).toMatch(/\.reveal\s*\{[^}]*transform:\s*translateY\(0\.5rem\);/);
    expect(globalStyles).toMatch(/\.reveal-later\s*\{[^}]*transition-delay:\s*\d+ms;/);
  });

  /**
   * The Disc drifts by a keyframe that moves it and does nothing else, along
   * the one short path the design fixed: from rest, bending once, 2.8vw by
   * 2vh in a 20 second cycle, far enough to be seen to move and never so far
   * that it leaves the head it is there for. It takes no pointer: a click on
   * it lands on whatever is under it. That the drift is still under reduced
   * motion is held above, with every other movement.
   */
  it("drifts the Disc along the fixed path, by translate only, and lets a pointer through", () => {
    expect(driftProblems(globalStyles)).toEqual([]);
  });

  /**
   * The Disc behind the portrait on Home is the one shape on the page: a
   * circle filled Celadon by its token, crisp, with no blur and no fade, so it
   * has an edge for the head to cross; and under the picture, so the head
   * rises out of it.
   */
  it("draws the Disc as a crisp Celadon circle under the picture", () => {
    const disc = globalStyles.match(/\.disc\s*\{([^}]*)\}/)?.[1];

    expect(disc, "a .disc rule").toBeDefined();
    expect(disc).toMatch(/border-radius:\s*50%;/);
    expect(disc).toMatch(/background:\s*var\(--portfolio-disc\);/);
    expect(disc).toMatch(/z-index:\s*-1;/);
    expect(disc).not.toMatch(/filter|opacity/);
  });

  /**
   * Nothing on the Strip is blurred (ADR-0005): a blurred layer inside the
   * moving row is re-rasterised every frame, which is what made the Blobs
   * jank and why they went. The pill the Nav and the Bar wear keeps its
   * backdrop blur, since it floats over the Strip and not inside it; so
   * every blur in the sheet is the pill's.
   */
  it("blurs nothing but the pill", () => {
    const rules = globalStyles.replace(/\/\*[\s\S]*?\*\//g, "");
    const blurred = [...rules.matchAll(/([^{}]+)\{[^{}]*\bfilter:\s*blur[^{}]*\}/g)].map(
      ([, selector]) => selector.trim(),
    );

    expect(blurred).toEqual([".pill"]);
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
