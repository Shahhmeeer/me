import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Blob, type BlobShape } from "@/components/blob";
import { elements, textOf } from "./checks/markup";

/**
 * The Blob as a browser receives it. It is decoration: a screen reader must
 * not meet it, a visitor must not be able to read it, and each shape asked
 * for is drawn in the colour asked for. Its drift is CSS, held by
 * `tests/theme.test.ts`.
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
