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
import { afterId, afterTitle, elements, headingsOf, textOf } from "./checks/markup";

/**
 * The Work Panel as a browser receives it, handed more Projects than the
 * content module has today. The page test reads Work with the two Projects
 * that exist, one Spread of them; this reads what happens when a fifth is
 * added: a second Projects Spread opens on its own, and nothing about the
 * Panel is written to make it so.
 */
const five: Project[] = Array.from({ length: 5 }, (_, index) => ({
  ...projects[0],
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
}));

const html = renderToStaticMarkup(
  <WorkPanel
    panel={panels.work}
    headings={headings}
    caseStudies={caseStudies}
    caseStudiesCopy={caseStudiesCopy}
    projects={five}
    projectsCopy={projectsCopy}
  />,
);

/** The two Projects Spreads, each what follows its saying of the heading. */
const projectSpreads = afterTitle(html, headings.projects);

describe("Work, given five Projects", () => {
  /**
   * Four to a Spread, so a Recruiter sees everything that can be opened at
   * once, and the fifth opens a Spread of its own rather than a fifth card
   * squeezed in or cut off.
   */
  it("lays them out as two Projects Spreads, four cards and then one", () => {
    expect(projectSpreads.map((spread) => elements(spread, "article").length)).toEqual([4, 1]);
    expect(textOf(projectSpreads[1])).toContain(five[4].name);
  });

  /**
   * The Panel's label and its line are read once, on the first Spread, and
   * neither Projects Spread says them or counts itself: a visitor sliding
   * through Work reads "Work" once, then the Case Studies and the Projects.
   */
  it("reads its label and line once, and counts nothing", () => {
    const text = textOf(html);

    expect(text.startsWith(panels.work.label)).toBe(true);
    expect(text.split(panels.work.label)).toHaveLength(2);
    expect(text.split(panels.work.line)).toHaveLength(2);
    expect(text).not.toMatch(/\d\d \/ \d\d/);
  });

  /**
   * The first Projects Spread opens the block: the heading and the note that
   * says these are public. The second says the heading again, so a visitor
   * landing on it knows what the cards are, and not the note; and it says it
   * as plain text, so the outline reads Projects once with every name under it.
   */
  it("heads both Spreads Projects, notes the first only, and names the block once in the outline", () => {
    expect(projectSpreads).toHaveLength(2);
    expect(textOf(html).split(projectsCopy.note)).toHaveLength(2);
    expect(textOf(projectSpreads[0])).toContain(projectsCopy.note);

    expect(headingsOf(html).map((heading) => heading.text)).toEqual([
      panels.work.label,
      headings.caseStudies,
      ...caseStudies.map((caseStudy) => caseStudy.title),
      headings.projects,
      ...five.map((project) => project.name),
    ]);
  });

  /**
   * A link to the Projects lands on the first of their Spreads: the id is
   * written once, on that Spread, so what is read after it opens on that
   * Spread's title; the second carries none, so two elements never share
   * it.
   */
  it("writes the Projects id on the first Projects Spread only", () => {
    const after = afterId(html, projectsCopy.id);

    expect(after).toHaveLength(1);
    expect(textOf(after[0]).startsWith(headings.projects)).toBe(true);
  });
});
