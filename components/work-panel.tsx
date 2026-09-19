import { Panel } from "@/components/panel";
import { CaseStudyCard } from "@/components/sections/case-studies";
import { ProjectCards } from "@/components/sections/projects";
import { Spread } from "@/components/spread";
import type {
  BlockHeadings,
  CaseStudiesCopy,
  CaseStudy,
  ContentPanel,
  Project,
  ProjectsCopy,
} from "@/content/site";

type WorkPanelProps = {
  panel: ContentPanel;
  headings: Pick<BlockHeadings, "caseStudies" | "projects">;
  caseStudies: CaseStudy[];
  caseStudiesCopy: CaseStudiesCopy;
  projects: Project[];
  projectsCopy: ProjectsCopy;
};

/**
 * How many Projects share a Spread: a grid of two by two, which is what
 * fits a card column at 1280 by 720 with every card whole. A fifth Project
 * opens a second Projects Spread on its own.
 */
const PROJECTS_PER_SPREAD = 4;

/** The list cut into runs of `size`, the last run shorter where it must be. */
function inRunsOf<T>(items: T[], size: number): T[][] {
  const runs: T[][] = [];
  for (let from = 0; from < items.length; from += size) {
    runs.push(items.slice(from, from + size));
  }
  return runs;
}

/**
 * Work's Spreads, by title, for the Bar's dots: each Case Study's title,
 * then the Projects heading once per run of four. Cut by the same rule the
 * Panel below renders by, so a Case Study added or a fifth Project is a dot
 * added too. A second run's dot is numbered, `Projects 2`, and then so is
 * the first: two buttons with one name would leave a screen reader unable
 * to say which is which, and the Spread itself says the heading again.
 */
export function workSpreadTitles(
  caseStudies: Pick<CaseStudy, "title">[],
  projects: Project[],
  headings: Pick<BlockHeadings, "projects">,
): string[] {
  const runs = inRunsOf(projects, PROJECTS_PER_SPREAD);

  return [
    ...caseStudies.map((caseStudy) => caseStudy.title),
    ...runs.map((_, index) =>
      runs.length > 1 ? `${headings.projects} ${index + 1}` : headings.projects,
    ),
  ];
}

/**
 * The Work Panel: one Spread per Case Study, in content order, then one
 * Spread per four Projects.
 *
 * How the Panel splits is read off the content arrays here and nowhere else:
 * a Case Study added to the content module is a Spread added, and a fifth
 * Project is a Spread added. No content entry names its Spread.
 *
 * The first Spread heads the Panel, its label and its line, and opens the
 * Case Studies: their heading and the note that says why there is nothing to
 * click (ADR-0001), so all four are read before the first card and none of
 * them again. Each Case Study's title is its Spread's large heading,
 * one level under the Case Studies heading; the card beside it is the detail.
 * The Projects Spreads follow, each a grid of up to four cards: the first is
 * headed by the Projects heading with the Projects note under it, and any
 * later one says the heading alone, as plain text, so the outline names the
 * block once and every Project hangs off it. The outline is unchanged from
 * the row: Work, Case Studies, each title, Projects, each name.
 *
 * Each Case Study Spread carries the Case Study's id, and the first Projects
 * Spread the Projects id from the content module, so a link to one lands on
 * it (`#payment-gateway-integrations`, `#projects`). A later Projects Spread
 * carries none: one id, one element.
 */
export function WorkPanel({
  panel,
  headings,
  caseStudies,
  caseStudiesCopy,
  projects,
  projectsCopy,
}: WorkPanelProps) {
  const projectSpreads = inRunsOf(projects, PROJECTS_PER_SPREAD);

  return (
    <Panel panel={panel}>
      {caseStudies.map((caseStudy, index) => (
        <Spread
          key={caseStudy.id}
          heads={index === 0 ? panel : undefined}
          id={caseStudy.id}
          opens={
            index === 0
              ? { heading: headings.caseStudies, note: caseStudiesCopy.note }
              : undefined
          }
          title={caseStudy.title}
          level={4}
        >
          <CaseStudyCard caseStudy={caseStudy} copy={caseStudiesCopy} />
        </Spread>
      ))}

      {projectSpreads.map((run, index) => (
        <Spread
          key={run[0].id}
          id={index === 0 ? projectsCopy.id : undefined}
          title={headings.projects}
          level={3}
          continues={index > 0}
          note={index === 0 ? projectsCopy.note : undefined}
        >
          <ProjectCards projects={run} copy={projectsCopy} />
        </Spread>
      ))}
    </Panel>
  );
}
