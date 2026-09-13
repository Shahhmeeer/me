import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Spread } from "@/components/spread";
import { panels } from "@/content/site";
import { headingsOf, textOf } from "./checks/markup";

/**
 * One Spread as a browser receives it: the eyebrow, the line, the title and
 * whatever it is handed as its card. The page test reads the Spreads Work is
 * made of; this reads one on its own, for the two things the page cannot
 * show while only Work is made of them: a Panel of one Spread has no
 * counter, and only the first Spread of a Panel carries the Panel's heading.
 */
function spread(position: number, count: number): string {
  return renderToStaticMarkup(
    <Spread panel={panels.skills} position={position} count={count} title="A title" level={3}>
      A card
    </Spread>,
  );
}

/** True when each string appears in the text after the one before it. */
function inOrder(text: string, parts: string[]): boolean {
  let from = 0;
  for (const part of parts) {
    const at = text.indexOf(part, from);
    if (at === -1) {
      return false;
    }
    from = at + part.length;
  }
  return true;
}

describe("A Spread", () => {
  it("opens on its eyebrow, then reads line, title and card", () => {
    const text = textOf(spread(2, 3));

    expect(text.startsWith(`${panels.skills.label} · 02 / 03`)).toBe(true);
    expect(inOrder(text, [panels.skills.line, "A title", "A card"])).toBe(true);
  });

  /** `01 / 01` would say there is somewhere else in the Panel to go. */
  it("counts itself only when its Panel has more than one", () => {
    expect(textOf(spread(1, 1))).not.toMatch(/\d\d \/ \d\d/);
    expect(textOf(spread(1, 2))).toContain("01 / 02");
  });

  it("pads the counter to two digits", () => {
    expect(textOf(spread(7, 12))).toContain("07 / 12");
  });

  /**
   * The Panel's h2 is its first Spread's eyebrow; on every later Spread the
   * eyebrow is plain text, so the outline stays one h2 per Panel and the
   * Panel is labelled by the heading its first Spread carries.
   */
  it("carries the Panel's heading only when it is the first", () => {
    const first = spread(1, 3);
    const later = spread(2, 3);

    expect(headingsOf(first)).toEqual([
      { level: 2, text: panels.skills.label },
      { level: 3, text: "A title" },
    ]);
    expect(first).toContain(`id="${panels.skills.id}-heading"`);
    expect(headingsOf(later)).toEqual([{ level: 3, text: "A title" }]);
  });
});
