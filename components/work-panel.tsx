import type { BlobShape } from "@/components/blob";
import { SpreadPanel } from "@/components/panel";
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
  blobs: BlobShape[];
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
 * The Work Panel: one Spread per Case Study, in content order, then one
 * Spread per four Projects.
 *
 * How the Panel splits is read off the content arrays here and nowhere else:
 * a Case Study added to the content module is a Spread added, a fifth
 * Project is a Spread added, and the counter on every eyebrow moves with
 * either. No content entry names its Spread.
 *
 * The first Spread carries the Panel's heading in its eyebrow, and opens the
 * Case Studies: their heading and the note that says why there is nothing to
 * click (ADR-0001), so both are read before the first card, as they were when
 * the cards were a row. Each Case Study's title is its Spread's large heading,
 * one level under the Case Studies heading; the card beside it is the detail.
 * The Projects Spreads follow, each a grid of up to four cards: the first is
 * headed by the Projects heading with the Projects note under it, and any
 * later one says the heading alone, as plain text, so the outline names the
 * block once and every Project hangs off it. The outline is unchanged from
 * the row: Work, Case Studies, each title, Projects, each name.
 */
export function WorkPanel({
  panel,
  blobs,
  headings,
  caseStudies,
  caseStudiesCopy,
  projects,
  projectsCopy,
}: WorkPanelProps) {
  const projectSpreads = inRunsOf(projects, PROJECTS_PER_SPREAD);
  const count = caseStudies.length + projectSpreads.length;

  return (
    <SpreadPanel panel={panel} blobs={blobs}>
      {caseStudies.map((caseStudy, index) => (
        <Spread
          key={caseStudy.id}
          panel={panel}
          position={index + 1}
          count={count}
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
          panel={panel}
          position={caseStudies.length + index + 1}
          count={count}
          title={headings.projects}
          level={3}
          continues={index > 0}
          note={index === 0 ? projectsCopy.note : undefined}
        >
          <ProjectCards projects={run} copy={projectsCopy} />
        </Spread>
      ))}
    </SpreadPanel>
  );
}
