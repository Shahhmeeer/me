import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Eyebrow, Spread } from "@/components/spread";
import { panels } from "@/content/site";
import { elements, headingsOf, idsOf, inOrder, textOf } from "./checks/markup";

/**
 * One Spread as a browser receives it: the Panel's heading and line where
 * it heads the Panel, then the title and whatever it is handed as its
 * card. The page test reads the Spreads Work is made of; this reads one on
 * its own, for what the page cannot show while only Work is made of them:
 * that a Spread heading its Panel reads the heading and the line before
 * its title and one that does not opens on its title; for a Spread that
 * continues the one before it, which says its title again but not as a
 * heading again; and for the id a Spread carries so a link can land on it.
 */
function spread({
  heads = false,
  continues = false,
  id,
  underTitle,
  foot,
}: {
  heads?: boolean;
  continues?: boolean;
  id?: string;
  underTitle?: string;
  foot?: string;
} = {}): string {
  return renderToStaticMarkup(
    <Spread
      heads={heads ? panels.skills : undefined}
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
  it("heading its Panel, reads the label, then line, title and card", () => {
    const text = textOf(spread({ heads: true }));

    expect(text.startsWith(panels.skills.label)).toBe(true);
    expect(inOrder(text, [panels.skills.line, "A title", "A card"])).toBe(true);
  });

  /**
   * A Spread after its Panel's first opens on its title: the Panel was
   * named once, on the first, and a Strip that flows has nothing to count.
   */
  it("not heading its Panel, opens on its title and says neither label nor line", () => {
    const text = textOf(spread());

    expect(text.startsWith("A title")).toBe(true);
    expect(text).not.toContain(panels.skills.label);
    expect(text).not.toContain(panels.skills.line);
  });

  it("never counts itself", () => {
    expect(textOf(spread({ heads: true }))).not.toMatch(/\d\d \/ \d\d/);
    expect(textOf(spread())).not.toMatch(/\d\d \/ \d\d/);
  });

  /**
   * What a Spread is handed to go under its title is read there, after the
   * title and before the card: the Skills list under "What I do", with the
   * Tools in the card beside it.
   */
  it("reads what it is handed under its title before the card", () => {
    const text = textOf(spread({ heads: true, underTitle: "Under the title" }));

    expect(inOrder(text, ["A title", "Under the title", "A card"])).toBe(true);
  });

  /**
   * What a Spread is handed as its foot is read last, after the card: the
   * copyright line on Contact, which closes the page under everything on
   * it however the Spread is laid out.
   */
  it("reads what it is handed as its foot after the card", () => {
    const text = textOf(spread({ heads: true, foot: "The foot" }));

    expect(inOrder(text, ["A title", "A card", "The foot"])).toBe(true);
    expect(text.endsWith("The foot")).toBe(true);
  });

  /**
   * The Panel's h2 is the Spread that heads it, so the outline stays one
   * h2 per Panel and the Panel is labelled by the heading its first Spread
   * carries; a later Spread adds only its own title to the outline.
   */
  it("carries the Panel's heading only when it heads the Panel", () => {
    const first = spread({ heads: true });
    const later = spread();

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
    const continued = spread({ continues: true });

    expect(textOf(continued).startsWith("A title")).toBe(true);
    expect(inOrder(textOf(continued), ["A title", "A card"])).toBe(true);
    expect(headingsOf(continued)).toEqual([]);
  });

  /**
   * A Spread given an id carries it as its element id, so `#that-id` in the
   * address lands on it the way `#skills` lands on the Panel; one given none
   * writes none, so the Panel's heading id is the only id a first Spread
   * adds to the page and a later one adds nothing.
   */
  it("carries the id it is given, and only that", () => {
    expect(idsOf(spread({ id: "an-item" }))).toEqual(["an-item"]);
    expect(idsOf(spread())).toEqual([]);
    expect(idsOf(spread({ heads: true, id: "an-item" }))).toEqual([
      "an-item",
      `${panels.skills.id}-heading`,
    ]);
  });
});

/**
 * Home's second Spread, the certifications, is a Spread of a Panel headed
 * by the Hero: it heads nothing, so it opens on its title, an h2, the one
 * level under the Headline.
 */
describe("A Spread of Home", () => {
  const html = renderToStaticMarkup(
    <Spread title="Certifications" level={2}>
      A card
    </Spread>,
  );

  it("opens on its title, with no empty line before it", () => {
    const text = textOf(html);

    expect(text.startsWith("Certifications")).toBe(true);
    expect(inOrder(text, ["Certifications", "A card"])).toBe(true);
    expect(elements(html, "p").filter((p) => textOf(p.inner) === "")).toEqual([]);
  });

  it("sets its title as an h2 when told to", () => {
    expect(headingsOf(html)).toEqual([{ level: 2, text: "Certifications" }]);
  });
});

/**
 * The eyebrow on its own, for a Spread that lays itself out: the Hero
 * says `Home` as plain text, since Home's heading is the Headline, and
 * nothing after it.
 */
describe("An Eyebrow", () => {
  it("reads the Panel's label, as plain text, and nothing else", () => {
    const html = renderToStaticMarkup(<Eyebrow panel={panels.home} />);

    expect(textOf(html)).toBe(panels.home.label);
    expect(headingsOf(html)).toEqual([]);
  });
});
