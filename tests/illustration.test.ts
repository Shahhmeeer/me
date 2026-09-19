import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import {
  ILLUSTRATION_RATE,
  Illustrations,
  PLACEMENTS,
  anchorOf,
  illustrationRate,
  lagOf,
  placeIllustration,
  srcOf,
} from "@/components/illustration";
import { caseStudies, experience, panels, projects } from "@/content/site";
// The script is `retint.mts`, spelt `.mjs` here as TypeScript asks for.
import { ILLUSTRATIONS } from "@/scripts/retint.mjs";
import { images, textOf } from "./checks/markup";
import { PUBLIC_DIR } from "./checks/pictures";

/**
 * The Illustrations as a browser receives them, the table they are placed
 * by, and the four things the Strip decides about them without a browser:
 * how fast they move, where each is placed beside its Spread, the anchor it
 * lags around, and how far it lags. Each is a function of the numbers it
 * is handed; the loop and the arrival observer are checked by looking.
 * Their CSS is held by `tests/theme.test.ts`.
 */

describe("illustrationRate", () => {
  /** A little slower than the cards, so the cards read as in front of a world (ADR-0005). */
  it("is 0.85 of the Strip's rate", () => {
    expect(ILLUSTRATION_RATE).toBe(0.85);
    expect(illustrationRate(false)).toBe(ILLUSTRATION_RATE);
  });

  /** Parallax is motion, so under reduced motion an Illustration moves with the Strip. */
  it("is the Strip's rate under reduced motion", () => {
    expect(illustrationRate(true)).toBe(1);
  });
});

describe("placeIllustration", () => {
  /** A 1280px screen: one vw is 12.8px. */
  const VW = 12.8;
  /** A Spread from 1000 to 1900 on the row, whose content column starts at 1100. */
  const edges = { after: 1900, box: 1100 };

  it("puts a piece placed after its Spread at the Spread's right edge plus its offset, at its width in vw", () => {
    const placed = placeIllustration({ edge: "after", offsetVw: -2, widthVw: 12 }, edges, VW);

    expect(placed).toEqual({ left: 1900 - 2 * VW, width: 12 * VW });
  });

  it("puts a piece placed by the box at the content column's left edge plus its offset", () => {
    const placed = placeIllustration({ edge: "box", offsetVw: -14, widthVw: 16 }, edges, VW);

    expect(placed).toEqual({ left: 1100 - 14 * VW, width: 16 * VW });
  });
});

describe("anchorOf", () => {
  /** A piece at 1900, 100 wide, on a 1280 screen: centred when the row is drawn at 1950 - 640. */
  it("is the drawn position at which the piece is centred on screen", () => {
    expect(anchorOf({ left: 1900, width: 100 }, 1280)).toBe(1310);
  });
});

describe("lagOf", () => {
  /** At its anchor a piece sits where it was placed; 1000px on, it has fallen 150px behind the cards. */
  it("is how far the piece trails the cards from its anchor, at one less the rate", () => {
    expect(lagOf(1310, 1310, 0.85)).toBe(0);
    expect(lagOf(2310, 1310, 0.85)).toBeCloseTo(150);
    expect(lagOf(310, 1310, 0.85)).toBeCloseTo(-150);
  });

  it("is nothing at rate 1, so the piece moves with the Strip", () => {
    expect(lagOf(2310, 1310, 1)).toBe(0);
  });
});

describe("Illustrations", () => {
  const drawn = renderToStaticMarkup(createElement(Illustrations));
  const found = images(drawn);

  /** Eleven pictures, one per row of the table, in its order, and no text. */
  it("draws one Illustration per placement, in table order, from the illustrations folder", () => {
    expect(found.map((image) => image.src)).toEqual(PLACEMENTS.map(({ name }) => srcOf(name)));
    expect(found.every((image) => image.src.startsWith("/images/illustrations/"))).toBe(true);
    expect(textOf(drawn)).toBe("");
  });

  /** Decoration: a screen reader passes each by, and none can be dragged off the page. */
  it("gives each an empty alt and no drag", () => {
    for (const image of found) {
      expect(image.alt).toBe("");
      expect(image.draggable).toBe("false");
      expect(image.loading).toBeUndefined();
    }
  });

  /** The float starts are staggered: each piece starts its cycle at a different point. */
  it("staggers when each piece's float starts", () => {
    const starts = found.map((image) => image.style);

    expect(new Set(starts).size).toBe(found.length);
    expect(starts[0]).toMatch(/--illustration-start:\s*(-?0|0)s/);
  });
});

describe("PLACEMENTS", () => {
  it("is the eleven pieces the retint script writes, each on disk", () => {
    const names = PLACEMENTS.map(({ name }) => name);

    expect([...names].sort()).toEqual([...ILLUSTRATIONS].sort());
    for (const name of names) {
      expect(existsSync(join(PUBLIC_DIR, srcOf(name))), name).toBe(true);
    }
  });

  /** Each row names a Spread the page has: a Panel by id, and a Spread it holds. */
  it("names a Spread the page has", () => {
    const spreadsOf: Record<string, number> = {
      [panels.home.id]: 2,
      [panels.work.id]: caseStudies.length + Math.ceil(projects.length / 4),
      [panels.skills.id]: 1,
      [panels.experience.id]: experience.length,
      [panels.contact.id]: 1,
    };

    for (const { panel, spread, name } of PLACEMENTS) {
      expect(spreadsOf[panel], name).toBeGreaterThan(spread);
    }
  });

  /** Nothing in the gap before Contact: anything there runs behind the email address. */
  it("places nothing after the last Role", () => {
    const afterLastRole = PLACEMENTS.filter(
      ({ panel, spread, edge }) =>
        panel === panels.experience.id && edge === "after" && spread === experience.length - 1,
    );

    expect(afterLastRole).toEqual([]);
  });

  /** The Hero's portrait is its illustration: nothing is placed on it, only after it. */
  it("places nothing on the Hero", () => {
    const onHero = PLACEMENTS.filter(
      ({ panel, spread, edge }) => panel === panels.home.id && spread === 0 && edge === "box",
    );

    expect(onHero).toEqual([]);
  });
});
