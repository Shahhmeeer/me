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
 * The Work Panel: one Spread per Case Study, in content order, then one
 * Spread for the Projects.
 *
 * How the Panel splits is read off the content arrays here and nowhere else:
 * a Case Study added to the content module is a Spread added, and the
 * counter on every eyebrow moves with it. No content entry names its Spread.
 *
 * The first Spread carries the Panel's heading in its eyebrow, and opens the
 * Case Studies: their heading and the note that says why there is nothing to
 * click (ADR-0001), so both are read before the first card, as they were when
 * the cards were a row. Each Case Study's title is its Spread's large heading,
 * one level under the Case Studies heading; the card beside it is the detail.
 * The last Spread is headed by the Projects heading, with the Projects note
 * under it, and holds every Project card on the one screen. The outline is
 * unchanged from the row: Work, Case Studies, each title, Projects, each name.
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
  const count = caseStudies.length + 1;

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

      <Spread
        panel={panel}
        position={count}
        count={count}
        title={headings.projects}
        level={3}
        note={projectsCopy.note}
      >
        <ProjectCards projects={projects} copy={projectsCopy} />
      </Spread>
    </SpreadPanel>
  );
}
