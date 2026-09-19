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
 * a Role added to the content module is a Spread added. No content entry
 * names its Spread.
 *
 * The first Spread heads the Panel, its label and its line, read once.
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
  headings,
  experience,
  education,
  copy,
}: ExperiencePanelProps) {
  const last = experience.length - 1;

  return (
    <Panel panel={panel}>
      {experience.map((entry, index) => (
        <Spread
          key={entry.id}
          heads={index === 0 ? panel : undefined}
          id={entry.id}
          title={entry.title}
          level={3}
        >
          <div className="flex flex-col gap-block">
            <RoleCard entry={entry} copy={copy} />
            {index === last ? (
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
