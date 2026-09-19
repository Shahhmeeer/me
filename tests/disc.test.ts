import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Disc, type DiscShape } from "@/components/disc";
import { elements, textOf } from "./checks/markup";

/**
 * The Disc as a browser receives it. It is decoration: a screen reader must
 * not meet it, a visitor must not be able to read it, and it is placed where
 * it was asked to be. Its colour, its edge and its drift are CSS, held by
 * `tests/theme.test.ts`.
 */
describe("Disc", () => {
  const disc: DiscShape = { top: "20%", left: "10%", size: "80%" };
  const drawn = renderToStaticMarkup(createElement(Disc, { shape: disc }));

  /** One shape, drawn on its own where it is rendered, with no field around it. */
  it("is one shape, hidden from a screen reader, with no text and no field", () => {
    expect(elements(drawn, "div")).toEqual([]);
    expect(drawn).toMatch(/^<span\b[^>]*aria-hidden="true"[^>]*><\/span>$/);
    expect(textOf(drawn)).toBe("");
  });

  it("is placed where it was asked to be, and coloured by nothing here", () => {
    expect(drawn).toContain(disc.top);
    expect(drawn).toContain(disc.left);
    expect(drawn).toContain(disc.size);
    expect(drawn).not.toContain("--portfolio-");
  });
});
