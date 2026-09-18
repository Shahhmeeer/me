import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Eyebrow, Spread } from "@/components/spread";
import { panels } from "@/content/site";
import { elements, headingsOf, idsOf, inOrder, textOf } from "./checks/markup";

/**
 * One Spread as a browser receives it: the eyebrow, the line, the title and
 * whatever it is handed as its card. The page test reads the Spreads Work is
 * made of; this reads one on its own, for the two things the page cannot
 * show while only Work is made of them: a Panel of one Spread has no
 * counter, and only the first Spread of a Panel carries the Panel's heading;
 * for a Spread that continues the one before it, which says its title
 * again but not as a heading again; and for the id a Spread carries so a
 * link can land on it.
 */
function spread(
  position: number,
  count: number,
  {
    continues = false,
    id,
    underTitle,
    foot,
  }: { continues?: boolean; id?: string; underTitle?: string; foot?: string } = {},
): string {
  return renderToStaticMarkup(
    <Spread
      panel={panels.skills}
      position={position}
      count={count}
      id={id}
      title="A title"
      level={3}
      continues={continues}
      underTitle={underTitle}
      foot={foot}
    >
      A card
    </Spread>,
  );
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
   * What a Spread is handed to go under its title is read there, after the
   * title and before the card: the Skills list under "What I do", with the
   * Tools in the card beside it.
   */
  it("reads what it is handed under its title before the card", () => {
    const text = textOf(spread(1, 1, { underTitle: "Under the title" }));

    expect(inOrder(text, ["A title", "Under the title", "A card"])).toBe(true);
  });

  /**
   * What a Spread is handed as its foot is read last, after the card: the
   * copyright line on Contact, which closes the page under everything on
   * it however the Spread is laid out.
   */
  it("reads what it is handed as its foot after the card", () => {
    const text = textOf(spread(1, 1, { foot: "The foot" }));

    expect(inOrder(text, ["A title", "A card", "The foot"])).toBe(true);
    expect(text.endsWith("The foot")).toBe(true);
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

  /**
   * A second Spread of Projects says "Projects" again, so a visitor landing
   * on it knows what the cards are, but as plain text: the outline names
   * the block once, and the Project names under both Spreads hang off it.
   */
  it("says its title again, and not as a heading, when it continues the Spread before", () => {
    const continued = spread(2, 3, { continues: true });

    expect(textOf(continued)).toContain("A title");
    expect(inOrder(textOf(continued), [panels.skills.line, "A title", "A card"])).toBe(true);
    expect(headingsOf(continued)).toEqual([]);
  });

  /**
   * A Spread given an id carries it as its element id, so `#that-id` in the
   * address lands on it the way `#skills` lands on the Panel; one given none
   * writes none, so the Panel's heading id is the only id a first Spread
   * adds to the page and a later one adds nothing.
   */
  it("carries the id it is given, and only that", () => {
    expect(idsOf(spread(2, 3, { id: "an-item" }))).toEqual(["an-item"]);
    expect(idsOf(spread(2, 3))).toEqual([]);
    expect(idsOf(spread(1, 3, { id: "an-item" }))).toEqual([
      "an-item",
      `${panels.skills.id}-heading`,
    ]);
  });
});

/**
 * Home's second Spread, the certifications, is a Spread of a Panel that has
 * no line: Home is headed by the Headline and says nothing under its
 * eyebrow. The title there is an h2, the one level under the Headline.
 */
describe("A Spread of Home", () => {
  const html = renderToStaticMarkup(
    <Spread panel={panels.home} position={2} count={2} title="Certifications" level={2}>
      A card
    </Spread>,
  );

  it("reads its eyebrow, then the title straight after, with no line between", () => {
    const text = textOf(html);

    expect(text.startsWith(`${panels.home.label} · 02 / 02Certifications`)).toBe(true);
    expect(inOrder(text, ["Certifications", "A card"])).toBe(true);
    expect(elements(html, "p").filter((p) => textOf(p.inner) === "")).toEqual([]);
  });

  it("sets its title as an h2 when told to", () => {
    expect(headingsOf(html)).toEqual([{ level: 2, text: "Certifications" }]);
  });
});

/**
 * The eyebrow on its own, for a Spread that lays itself out: the Hero
 * says `Home · 01 / 02` the way the certifications Spread beside it says
 * `02 / 02`, and as plain text, since Home's heading is the Headline.
 */
describe("An Eyebrow", () => {
  it("reads the Panel's label and the counter, as plain text", () => {
    const html = renderToStaticMarkup(
      <Eyebrow panel={panels.home} position={1} count={2} />,
    );

    expect(textOf(html)).toBe(`${panels.home.label} · 01 / 02`);
    expect(headingsOf(html)).toEqual([]);
  });

  it("counts itself only when its Panel has more than one Spread", () => {
    expect(
      textOf(renderToStaticMarkup(<Eyebrow panel={panels.home} position={1} count={1} />)),
    ).toBe(panels.home.label);
  });
});
