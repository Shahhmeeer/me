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
/** The sheet as written, with one kind of line break whatever the checkout wrote. */
const globalStyles = readFileSync(join(repoRoot, "app", "globals.css"), "utf8").replace(
  /\r\n/g,
  "\n",
);
const tokens = colourTokens(globalStyles);

/**
 * What a selector's rule writes under the `large` variant, as text: what the
 * thing is on the Strip. Null when the rule has no such block. The selector
 * is matched as written, at the start of a line, so `.spread` is not read
 * off `.hero.spread` or off a rule that names it as a parent.
 */
function onStrip(selector: string): string | null {
  const literal = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^${literal}\\s*\\{[^{}]*@variant large\\s*\\{([^}]*)\\}`,
    "m",
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
   * The Strip flows and does not snap (ADR-0005): the visitor can rest with
   * half of one Spread and half of the next on screen, so no rule in the
   * sheet may pull the Strip to a stop.
   */
  it("does not snap the Strip to a Spread", () => {
    expect(onStrip(".strip")).not.toMatch(/scroll-snap-type/);
    expect(globalStyles).not.toMatch(/scroll-snap/);
  });

  /**
   * The Strip sticks to the viewport over the runway and clips the row
   * (ADR-0005): the document scrolls, the Strip stays, and the row inside it
   * is what moves. `hidden` and not `clip`, so a focus or a find inside the
   * box still scrolls it and a listener can move the runway there instead.
   */
  it("sticks the Strip to the viewport and clips it", () => {
    const strip = onStrip(".strip");

    expect(strip).toMatch(/position:\s*sticky;/);
    expect(strip).toMatch(/top:\s*0;/);
    expect(strip).toMatch(/overflow:\s*hidden;/);
  });

  /**
   * The width rule (ADR-0005): a Spread is as wide as what it holds,
   * between half a screen and 84rem, with an 8vw gap before the next, and
   * one screen tall. It never shrinks to fit the row, and nothing inside
   * one is laid out to scroll. Half a screen is the floor because a Spread
   * narrower than the central band could never be lit; 84rem is the
   * ceiling because a Case Study card stretched across a 1920px display is
   * a paragraph too wide to read.
   */
  it("sizes a Spread to what it holds, between half a screen and 84rem, with a gap before the next", () => {
    const spread = onStrip(".spread");

    expect(spread, "the .spread rule under the large variant").not.toBeNull();
    expect(spread).toMatch(/width:\s*max-content;/);
    expect(spread).toMatch(/min-width:\s*50vw;/);
    expect(spread).toMatch(/max-width:\s*84rem;/);
    expect(spread).toMatch(/margin-right:\s*8vw;/);
    expect(spread).toMatch(/height:\s*100%;/);
    expect(spread).toMatch(/flex:\s*none;/);
  });

  /**
   * Two Spreads are named as a full screen: the Hero, which the page opens
   * on, and the last Spread, Contact, which it ends on, the ceiling off
   * both since a 1920px screen is wider than 84rem; and the last, with
   * nothing after it, has no gap.
   */
  it("pins the Hero and the last Spread to a full screen, and gives the last no gap", () => {
    const hero = onStrip(".hero");
    const last = onStrip(".panel:last-child > .spread:last-child");

    expect(hero, "the .hero rule under the large variant").not.toBeNull();
    expect(hero).toMatch(/width:\s*100vw;/);
    expect(hero).toMatch(/max-width:\s*none;/);
    expect(last, "the last Spread's rule under the large variant").not.toBeNull();
    expect(last).toMatch(/width:\s*100vw;/);
    expect(last).toMatch(/max-width:\s*none;/);
    expect(last).toMatch(/margin-right:\s*0;/);
  });

  /**
   * The stagger: every other Spread's content is lifted 5vh and the rest
   * dropped, so the row has a skyline. It is a translate on the Spread's
   * content and never on the Spread, whose box the landing and the observer
   * read; it leaves the two full-screen Spreads still, since their columns
   * stand as tall as the frame and a lift would put them under the Nav;
   * and it is written under the large variant, so the stack below it is
   * unchanged.
   */
  it("staggers the content of every other Spread by 5vh, not the Spread, and not the full-screen two", () => {
    const lifted = onStrip(".spread:nth-child(odd) > .content");
    const dropped = onStrip(".spread:nth-child(even) > .content");
    const still = onStrip(
      ".spread.hero > .content,\n.panel:last-child > .spread:last-child > .content",
    );

    expect(lifted, "a rule lifting odd Spreads' content").not.toBeNull();
    expect(lifted).toMatch(/translate:\s*0 -5vh;/);
    expect(dropped, "a rule dropping even Spreads' content").not.toBeNull();
    expect(dropped).toMatch(/translate:\s*0 5vh;/);
    expect(still, "a rule holding the Hero's and the last Spread's content still").not.toBeNull();
    expect(still).toMatch(/translate:\s*none;/);
    expect(onStrip(".spread")).not.toMatch(/translate|transform/);
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
    expect(onStrip(".card") ?? "").not.toMatch(/(^|[^-])width|flex-basis|flex:/);
  });

  /**
   * Every movement lives inside `prefers-reduced-motion: no-preference`, so
   * a visitor who has asked for less gets a page that never moved. The one
   * smooth scroll, a landing on a Spread, is not in the sheet at all:
   * `components/strip.tsx` scrolls the runway and chooses smooth or instant
   * by the same query, so there is no scroll-behavior here to hold.
   */
  it("moves only where the visitor has not asked for less motion", () => {
    expect(globalStyles).not.toMatch(/scroll-behavior/);
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
   * The Disc behind the portrait on Home is the one shape on the page:
   * round, filled Celadon by its token, crisp, with no blur and no fade, so
   * it has an edge for the head to cross; and under the picture, so the
   * head rises out of it.
   */
  it("draws the Disc round, filled Celadon and crisp, under the picture", () => {
    const disc = globalStyles.match(/\.disc\s*\{([^}]*)\}/)?.[1];

    expect(disc, "a .disc rule").toBeDefined();
    expect(disc).toMatch(/border-radius:\s*50%;/);
    expect(disc).toMatch(/background:\s*var\(--portfolio-disc\);/);
    expect(disc).toMatch(/z-index:\s*-1;/);
    expect(disc).not.toMatch(/filter|opacity/);
  });

  /**
   * Nothing on the Strip is blurred: a blurred layer inside the moving row
   * is re-rasterised every frame, which is what made the Blobs jank and why
   * they went (ADR-0005). The pill the Nav and the Bar wear keeps its
   * backdrop blur, since it floats over the Strip and not inside it; so
   * every rule that blurs, by `filter` or `backdrop-filter`, is the pill's.
   * The comments come off first, so a selector is read as written.
   */
  it("blurs nothing but the pill", () => {
    const rules = globalStyles.replace(/\/\*[\s\S]*?\*\//g, "");
    const blurred = [
      ...rules.matchAll(/([^{}]+)\{[^{}]*(?:backdrop-)?filter:\s*blur[^{}]*\}/g),
    ].map(([, selector]) => selector.trim());

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
