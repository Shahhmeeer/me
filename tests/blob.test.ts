import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Blob, type BlobShape, Disc } from "@/components/blob";
import { elements, textOf } from "./checks/markup";

/**
 * The Blob as a browser receives it. It is decoration: a screen reader must
 * not meet it, a visitor must not be able to read it, and each shape asked
 * for is drawn in the colour asked for. Its drift is CSS, held by
 * `tests/theme.test.ts`; so is what makes the disc a disc.
 */
const shapes: BlobShape[] = [
  { colour: "accent", top: "10%", left: "20%", size: "30vw" },
  { colour: "action", top: "60%", left: "70%", size: "24vw" },
];
const html = renderToStaticMarkup(createElement(Blob, { shapes }));

describe("Blob", () => {
  it("is hidden from a screen reader and carries no text", () => {
    const [field, ...more] = elements(html, "div");

    expect(more).toEqual([]);
    expect(field.attributes["aria-hidden"]).toBe("true");
    expect(textOf(html)).toBe("");
  });

  it("draws one shape per shape asked for, in its colour and place", () => {
    for (const shape of shapes) {
      expect(html).toContain(`--portfolio-${shape.colour}`);
      expect(html).toContain(shape.top);
      expect(html).toContain(shape.left);
      expect(html).toContain(shape.size);
    }
  });
});

describe("Disc", () => {
  const disc: BlobShape = { colour: "accent-border", top: "20%", left: "10%", size: "80%" };
  const drawn = renderToStaticMarkup(createElement(Disc, { shape: disc }));

  /** One shape, drawn on its own where it is rendered, with no field around it. */
  it("is one shape, hidden from a screen reader, with no text and no field", () => {
    expect(elements(drawn, "div")).toEqual([]);
    expect(drawn).toMatch(/^<span\b[^>]*aria-hidden="true"[^>]*><\/span>$/);
    expect(textOf(drawn)).toBe("");
  });

  it("is drawn in its colour and place, first in its cycle", () => {
    expect(drawn).toContain(`--portfolio-${disc.colour}`);
    expect(drawn).toContain(disc.top);
    expect(drawn).toContain(disc.left);
    expect(drawn).toContain(disc.size);
    expect(drawn).toContain("--blob-delay:0s");
  });
});
