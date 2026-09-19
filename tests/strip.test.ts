import { describe, expect, it } from "vitest";

import { EDGE_TOLERANCE, edgeRule, glideStep, isTypingIn, reRoute } from "@/components/strip";

/**
 * The four things the Strip decides without a browser (ADR-0005): where an
 * arrow lands, how far the Glide moves in one frame, where a scroll of the
 * Strip's own box is re-routed to, and whether a key press is the Strip's
 * to take. Each is a function of the numbers it is handed, so a test hands
 * it those and nothing of the browser; the rAF loop, the observer and the
 * listeners that call them are checked by looking.
 */

/**
 * The left edges of four Spreads on a 1280px screen, each one screen wide
 * except the third, which is narrow: the case an arrow that moved one
 * screen would pass without ever showing it whole.
 */
const EDGES = [0, 1280, 2560, 3080];

describe("edgeRule", () => {
  it("lands forward on the first edge right of the position and back on the last edge left of it", () => {
    expect(edgeRule(EDGES, 1500, 1)).toBe(2560);
    expect(edgeRule(EDGES, 1500, -1)).toBe(1280);
  });

  /** Resting on an edge, forward is the next one and back the one before: never the edge already at the screen's left. */
  it("moves off an edge it is resting on, both ways", () => {
    expect(edgeRule(EDGES, 1280, 1)).toBe(2560);
    expect(edgeRule(EDGES, 1280, -1)).toBe(0);
  });

  /** A landing settles a pixel or so off the edge; that is resting on it, not past it. */
  it("treats a position within a few pixels of an edge as resting on it", () => {
    expect(edgeRule(EDGES, 1280 + EDGE_TOLERANCE, 1)).toBe(2560);
    expect(edgeRule(EDGES, 1280 - EDGE_TOLERANCE, -1)).toBe(0);
    expect(edgeRule(EDGES, 1280 + EDGE_TOLERANCE + 1, -1)).toBe(1280);
  });

  it("lands on a narrow Spread rather than moving one screen past it", () => {
    expect(edgeRule(EDGES, 2560, 1)).toBe(3080);
    expect(edgeRule(EDGES, 3080, -1)).toBe(2560);
  });

  it("clamps at both ends", () => {
    expect(edgeRule(EDGES, 0, -1)).toBe(0);
    expect(edgeRule(EDGES, 3080, 1)).toBe(3080);
    expect(edgeRule(EDGES, 3200, 1)).toBe(3200);
    expect(edgeRule([], 500, 1)).toBe(500);
  });
});

describe("glideStep", () => {
  /** With no Glide, the Strip is where the visitor scrolled it, every frame. */
  it("returns the target for a glide of 0 and under reduced motion", () => {
    expect(glideStep(0, 800, 0.016, 0, false)).toBe(800);
    expect(glideStep(0, 800, 0.016, 0.7, true)).toBe(800);
  });

  it("moves toward the target and not onto it in one frame", () => {
    const next = glideStep(0, 800, 0.016, 0.7, false);

    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(800);
    expect(glideStep(800, 0, 0.016, 0.7, false)).toBeLessThan(800);
  });

  /** About 95% of the way after the Glide's own time of frames: 0.7s reads as "catches up", not "drags". */
  it("settles about 95% of the way in the glide's time", () => {
    const frame = 1 / 60;
    let x = 0;
    for (let elapsed = 0; elapsed < 0.7; elapsed += frame) {
      x = glideStep(x, 1000, frame, 0.7, false);
    }

    expect(x).toBeGreaterThan(940);
    expect(x).toBeLessThan(960);
  });

  it("settles onto the target once within a twentieth of a pixel", () => {
    expect(glideStep(799.98, 800, 0.016, 0.7, false)).toBe(800);
  });

  /** A tab left in the background comes back with one long frame; it must not jump. */
  it("clamps a large frame time to a tenth of a second", () => {
    expect(glideStep(0, 800, 5, 0.7, false)).toBe(glideStep(0, 800, 0.1, 0.7, false));
    expect(glideStep(0, 800, 5, 0.7, false)).toBeLessThan(800);
  });
});

/**
 * The re-route (#102): Ctrl+F, Tab, a focus and `:target` scroll the
 * Strip's own box, which moves nothing the visitor can see; the distance
 * the browser scrolled it is where the runway goes instead. The browser
 * measured that distance against the row as drawn, so the runway is sent
 * to the drawn position plus it, and never to the scroll position: mid-Glide
 * the two differ, and the match is on screen at the drawn one.
 */
describe("reRoute", () => {
  it("sends the runway the distance the box was scrolled past the drawn position", () => {
    expect(reRoute(1000, 640)).toBe(1640);
    expect(reRoute(0, 3200)).toBe(3200);
  });

  /** The box scrolled nowhere is a scroll event that means nothing: the runway stays. */
  it("leaves the runway where it is for a scroll of nothing", () => {
    expect(reRoute(1000, 0)).toBe(1000);
  });
});

/**
 * The Strip's arrow keys and where they are pressed. The Strip takes ← and
 * → from wherever focus is, except a box the visitor is typing in: there
 * the keys move the caret, and a typo fixed in Message must not slide the
 * Form away. The guard is a function of what it reads off the focused
 * element, so a test hands it that and nothing of the browser.
 */

/** An element as the guard sees it. */
function focused(tagName: string, isContentEditable = false) {
  return { tagName, isContentEditable };
}

describe("isTypingIn", () => {
  it("yields the keys to a text input and a textarea", () => {
    expect(isTypingIn(focused("INPUT"))).toBe(true);
    expect(isTypingIn(focused("TEXTAREA"))).toBe(true);
  });

  it("yields the keys to anything contenteditable", () => {
    expect(isTypingIn(focused("DIV", true))).toBe(true);
  });

  /** A press with nothing focused reaches the body; a target that is no element is null. */
  it("keeps the keys on a button, a link, the Strip and nothing focused", () => {
    expect(isTypingIn(focused("BUTTON"))).toBe(false);
    expect(isTypingIn(focused("A"))).toBe(false);
    expect(isTypingIn(focused("MAIN"))).toBe(false);
    expect(isTypingIn(focused("BODY"))).toBe(false);
    expect(isTypingIn(null)).toBe(false);
  });
});
