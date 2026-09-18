import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { Bar, type PanelSpreads } from "@/components/bar";
import { barCopy, panels } from "@/content/site";
import { barCopyProblems } from "./checks/profile-rules";
import { elements, textOf } from "./checks/markup";

/**
 * The Bar as a browser first receives it, handed a Strip of three Panels
 * and six Spreads: one dot per Spread named by its title, in groups a
 * visitor can count, the current one marked, the arrows, and the hint. The
 * page test reads the Bar the page draws from its content; this reads one
 * on its own, for what the page cannot show at first paint: the marker on
 * a later Spread, an arrow disabled at the far end, and the hint hidden.
 */
const spreads: PanelSpreads[] = [
  { panel: panels.home, titles: ["Who", "Credentials"] },
  { panel: panels.work, titles: ["First", "Second", "Third"] },
  { panel: panels.contact, titles: ["Write"] },
];
const titles = spreads.flatMap((group) => group.titles);

function bar({ current = 0, hintShown = true } = {}): string {
  return renderToStaticMarkup(
    <Bar
      spreads={spreads}
      copy={barCopy}
      current={current}
      hintShown={hintShown}
      onSelect={() => {}}
      onStep={() => {}}
    />,
  );
}

/** The dots: every button that is not one of the two arrows. */
function dots(html: string) {
  return elements(html, "button").filter(
    (button) =>
      button.attributes["aria-label"] !== barCopy.previous &&
      button.attributes["aria-label"] !== barCopy.next,
  );
}

function arrow(html: string, name: string) {
  const found = elements(html, "button").find(
    (button) => button.attributes["aria-label"] === name,
  );
  if (found === undefined) {
    throw new Error(`No button named "${name}"`);
  }
  return found;
}

describe("The Bar", () => {
  it("is a labelled nav of its own", () => {
    const [nav, ...more] = elements(bar(), "nav");

    expect(more).toEqual([]);
    expect(nav.attributes["aria-label"]).toBe(barCopy.label);
  });

  /**
   * One dot per Spread, in Strip order, each a button named by the
   * Spread's title, so a screen reader lists where a visitor can go and a
   * pointer hovering one reads which Case Study it is.
   */
  it("draws one button per Spread, in order, named by the Spread's title", () => {
    const found = dots(bar());

    expect(found.map((dot) => dot.attributes["aria-label"])).toEqual(titles);
    for (const dot of found) {
      expect(dot.attributes.type).toBe("button");
    }
  });

  /**
   * The dots are grouped by Panel, one group per Panel with a gap between,
   * so the groups read as the Nav links do: a Recruiter counts the groups
   * and knows how many Panels there are and how deep each one goes.
   */
  it("groups the dots by Panel, one group per Panel", () => {
    const groups = elements(bar(), "ul");

    expect(groups.map((group) => elements(group.inner, "button").length)).toEqual(
      spreads.map((group) => group.titles.length),
    );
  });

  /** The lit dot is the visitor: `aria-current="true"` on it and nowhere else. */
  it("marks the current Spread's dot and no other", () => {
    for (const current of [0, 3, titles.length - 1]) {
      const marked = dots(bar({ current })).flatMap((dot, index) =>
        dot.attributes["aria-current"] === "true" ? [index] : [],
      );

      expect(marked, `current ${current}`).toEqual([current]);
    }
  });

  /**
   * The arrows stay where they are whichever Spread is on screen, so the
   * Bar never changes shape; the one that has nowhere to go is disabled
   * and faded rather than taken away.
   */
  it("disables the previous arrow on the first Spread and the next on the last, and no other time", () => {
    const first = bar({ current: 0 });
    const middle = bar({ current: 2 });
    const last = bar({ current: titles.length - 1 });

    expect(arrow(first, barCopy.previous).attributes.disabled).toBeDefined();
    expect(arrow(first, barCopy.next).attributes.disabled).toBeUndefined();
    expect(arrow(middle, barCopy.previous).attributes.disabled).toBeUndefined();
    expect(arrow(middle, barCopy.next).attributes.disabled).toBeUndefined();
    expect(arrow(last, barCopy.previous).attributes.disabled).toBeUndefined();
    expect(arrow(last, barCopy.next).attributes.disabled).toBeDefined();
  });

  /**
   * The hint is the sentence from the content module, read once: it is a
   * live region switched off, so a screen reader that has already read it
   * in place is not told it again when it goes; and when the Strip has
   * moved it is hidden, from sight and from the accessibility tree alike.
   */
  it("says the hint from the content module, live off, and hides it when told", () => {
    const shown = elements(bar(), "p").find(
      (paragraph) => textOf(paragraph.inner) === barCopy.hint,
    );
    const hidden = elements(bar({ hintShown: false }), "p").find(
      (paragraph) => textOf(paragraph.inner) === barCopy.hint,
    );

    expect(shown?.attributes["aria-live"]).toBe("off");
    expect(shown?.attributes.hidden).toBeUndefined();
    expect(hidden?.attributes.hidden).toBeDefined();
  });
});

/** The words the Bar says: a hint that is one sentence, and names for what it holds. */
describe("the Bar's copy", () => {
  it("names the Bar and both arrows, and hints in one sentence", () => {
    expect(barCopyProblems(barCopy)).toEqual([]);
  });

  it("refuses a hint of two sentences and blank names", () => {
    expect(
      barCopyProblems({ label: " ", previous: "", next: "Next", hint: "Two. Sentences." }),
    ).toHaveLength(3);
  });
});
