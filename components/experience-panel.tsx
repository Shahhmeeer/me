import type { BlobShape } from "@/components/blob";
import { Panel } from "@/components/panel";
import { EducationBlock } from "@/components/sections/education";
import { RoleCard } from "@/components/sections/experience";
import { Spread } from "@/components/spread";
import type {
  BlockHeadings,
  ContentPanel,
  Education,
  ExperienceCopy,
  ExperienceEntry,
} from "@/content/site";

type ExperiencePanelProps = {
  panel: ContentPanel;
  blobs: BlobShape[];
  headings: Pick<BlockHeadings, "education">;
  experience: ExperienceEntry[];
  education: Education[];
  copy: ExperienceCopy;
};

/**
 * Experience's Spreads, by title, for the Bar's dots: one per Role, newest
 * first as the content module lists them, each named by the Role's title.
 */
export function experienceSpreadTitles(experience: Pick<ExperienceEntry, "title">[]): string[] {
  return experience.map((entry) => entry.title);
}

/**
 * The Experience Panel: one Spread per Role, newest first, in the order the
 * content module lists them, so a Recruiter reads what was done at each job
 * rather than a list of titles.
 *
 * How the Panel splits is read off the content array here and nowhere else:
 * a Role added to the content module is a Spread added, and the counter on
 * every eyebrow moves with it. No content entry names its Spread.
 *
 * Each Role's title is its Spread's large heading, one level under the
 * Panel; the card beside it holds the employer, the place, the dates and
 * the Highlights. The degree renders under the last Role's card, headed
 * "Education" as before, so the history reads unbroken back to 2019 on the
 * last Spread; it is not a Role and gets no Spread of its own. The outline
 * is unchanged from the row: Experience, each title, Education.
 *
 * Each Role Spread carries the Role's id, so a link to one lands on it
 * (`#scaleable-solutions`).
 */
export function ExperiencePanel({
  panel,
  blobs,
  headings,
  experience,
  education,
  copy,
}: ExperiencePanelProps) {
  const count = experience.length;

  return (
    <Panel panel={panel} blobs={blobs}>
      {experience.map((entry, index) => (
        <Spread
          key={entry.id}
          panel={panel}
          position={index + 1}
          count={count}
          id={entry.id}
          title={entry.title}
          level={3}
        >
          <div className="flex flex-col gap-block">
            <RoleCard entry={entry} copy={copy} />
            {index === count - 1 ? (
              <EducationBlock
                heading={headings.education}
                education={education}
                copy={copy}
              />
            ) : null}
          </div>
        </Spread>
      ))}
    </Panel>
  );
}
