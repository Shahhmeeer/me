import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { WorkPanel } from "@/components/work-panel";
import {
  caseStudies,
  caseStudiesCopy,
  headings,
  panels,
  type Project,
  projects,
  projectsCopy,
} from "@/content/site";
import { elements, headingsOf, spreadsOf, textOf } from "./checks/markup";

/**
 * The Work Panel as a browser receives it, handed more Projects than the
 * content module has today. The page test reads Work with the two Projects
 * that exist, one Spread of them; this reads what happens when a fifth is
 * added: a second Projects Spread opens on its own, counted among Work's,
 * and nothing about the Panel is written to make it so.
 */
const five: Project[] = Array.from({ length: 5 }, (_, index) => ({
  ...projects[0],
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
}));

const html = renderToStaticMarkup(
  <WorkPanel
    panel={panels.work}
    blobs={[]}
    headings={headings}
    caseStudies={caseStudies}
    caseStudiesCopy={caseStudiesCopy}
    projects={five}
    projectsCopy={projectsCopy}
  />,
);

const spreads = spreadsOf(html, panels.work);
const projectSpreads = spreads.slice(caseStudies.length);

/** `NN / NN`, zero-padded, as the page test writes it. */
function counter(position: number, count: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(position)} / ${pad(count)}`;
}

describe("Work, given five Projects", () => {
  /**
   * Four to a Spread, so a Recruiter sees everything that can be opened at
   * once, and the fifth opens a Spread of its own rather than a fifth card
   * squeezed in or cut off.
   */
  it("lays them out as two Projects Spreads, four cards and then one", () => {
    expect(
      projectSpreads.map((spread) => elements(spread.inner, "article").length),
    ).toEqual([4, 1]);
    expect(textOf(projectSpreads[1].inner)).toContain(five[4].name);
  });

  /** The second Projects Spread is one of Work's, so the total on every eyebrow rises. */
  it("counts one more Spread on every eyebrow", () => {
    const count = caseStudies.length + 2;

    expect(spreads.map((spread) => spread.eyebrow)).toEqual(
      Array.from({ length: count }, (_, index) =>
        `${panels.work.label} · ${counter(index + 1, count)}`,
      ),
    );
  });

  /**
   * The first Projects Spread opens the block: the heading and the note that
   * says these are public. The second says the heading again, so a visitor
   * landing on it knows what the cards are, and not the note; and it says it
   * as plain text, so the outline reads Projects once with every name under it.
   */
  it("heads both Spreads Projects, notes the first only, and names the block once in the outline", () => {
    for (const spread of projectSpreads) {
      expect(textOf(spread.inner)).toContain(headings.projects);
    }
    expect(textOf(html).split(projectsCopy.note)).toHaveLength(2);
    expect(textOf(projectSpreads[0].inner)).toContain(projectsCopy.note);

    expect(headingsOf(html).map((heading) => heading.text)).toEqual([
      panels.work.label,
      headings.caseStudies,
      ...caseStudies.map((caseStudy) => caseStudy.title),
      headings.projects,
      ...five.map((project) => project.name),
    ]);
  });
});
