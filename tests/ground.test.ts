import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { GROUND_RATE, Ground, groundRate, groundWidth } from "@/components/ground";
import { textOf } from "./checks/markup";

/**
 * The Ground as a browser receives it, and the two things the Strip decides
 * about it without a browser: how fast it moves and how wide it is drawn.
 * It is decoration: a screen reader must not meet it and it holds nothing to
 * read. Its dots, its ink and that it is not drawn below the large rule are
 * CSS, held by `tests/theme.test.ts`.
 */
describe("Ground", () => {
  const drawn = renderToStaticMarkup(createElement(Ground));

  /**
   * One fixed layer, hidden, holding one row for the loop to move, and no
   * text. The markup is read whole: `elements` reads no div inside a div.
   */
  it("is one hidden layer holding one empty row and no text", () => {
    expect(drawn).toMatch(/^<div\b[^>]*aria-hidden="true"[^>]*><div><\/div><\/div>$/);
    expect(textOf(drawn)).toBe("");
  });

  it("is coloured and sized by nothing here", () => {
    expect(drawn).not.toContain("--portfolio-");
    expect(drawn).not.toContain("style=");
  });
});

describe("groundRate", () => {
  /** Half the Strip's speed: the depth the Blobs gave, with nothing to blur (ADR-0005). */
  it("is half the Strip's rate", () => {
    expect(GROUND_RATE).toBe(0.5);
    expect(groundRate(false)).toBe(GROUND_RATE);
  });

  /** Parallax is motion, so under reduced motion the Ground moves with the Strip. */
  it("is the Strip's rate under reduced motion", () => {
    expect(groundRate(true)).toBe(1);
  });
});

describe("groundWidth", () => {
  /** The overhang at the Ground's rate plus one screen, so there is always ground under the viewport. */
  it("is the overhang at the Ground's rate plus one screen", () => {
    expect(groundWidth(4000, 1280, false)).toBe(4000 * GROUND_RATE + 1280);
  });

  /** Moving with the Strip, it must be as wide as the Strip. */
  it("is the whole Strip under reduced motion", () => {
    expect(groundWidth(4000, 1280, true)).toBe(5280);
  });

  it("is one screen when the Strip has nowhere to go", () => {
    expect(groundWidth(0, 1280, false)).toBe(1280);
  });
});
