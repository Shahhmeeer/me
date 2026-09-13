import type { BlobShape } from "@/components/blob";
import { HomePanel } from "@/components/home-panel";
import { Nav } from "@/components/nav";
import { Panel } from "@/components/panel";
import { Strip } from "@/components/strip";
import { CaseStudies } from "@/components/sections/case-studies";
import { ContactBlock } from "@/components/sections/contact";
import { EducationBlock } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Tools } from "@/components/sections/tools";
import {
  about,
  caseStudies,
  caseStudiesCopy,
  certifications,
  contact,
  contactCopy,
  education,
  experience,
  experienceCopy,
  headings,
  links,
  navCopy,
  panels,
  projects,
  projectsCopy,
  skills,
  sketch,
  tools,
} from "@/content/site";

/**
 * The colour behind each of the four Panels beyond Home, picked here where
 * the Panels are composed; Home picks its own in `components/home-panel.tsx`.
 * Each is placed by the screen, not the Panel: a Panel on the Strip is as
 * wide as its row of cards, and a shape placed by its width would sit
 * somewhere along that row rather than under the first screen of it. The
 * one exception per wide Panel is placed by the Panel, so the far end of the
 * row is not bare. No two Panels are washed the same way, so a visitor
 * sliding from one to the next sees the ground change with the heading.
 */
const WORK_BLOBS: BlobShape[] = [
  { colour: "accent-border", top: "-10%", left: "45vw", size: "40vw" },
  { colour: "action", top: "50%", left: "20vw", size: "28vw" },
  { colour: "accent", top: "30%", left: "75%", size: "36vw" },
];

const SKILLS_BLOBS: BlobShape[] = [
  { colour: "accent", top: "-20%", left: "30vw", size: "38vw" },
  { colour: "accent-border", top: "40%", left: "65vw", size: "34vw" },
];

const EXPERIENCE_BLOBS: BlobShape[] = [
  { colour: "action", top: "-15%", left: "60vw", size: "30vw" },
  { colour: "accent-border", top: "45%", left: "30vw", size: "40vw" },
  { colour: "accent", top: "20%", left: "80%", size: "30vw" },
];

const CONTACT_BLOBS: BlobShape[] = [
  { colour: "accent", top: "10%", left: "55vw", size: "40vw" },
  { colour: "accent-border", top: "55%", left: "25vw", size: "32vw" },
];

/**
 * The one page: five Panels under the Nav. They are listed here by hand, in
 * the order `panelOrder` gives the Nav, and `tests/home-page.test.ts` holds
 * the two to the same order. Each Panel is headed by its Nav label, except
 * Home, which is headed by the Headline and is laid out its own way. The
 * blocks inside a Panel are the same components as before, regrouped.
 */
export default function Home() {
  return (
    <>
      <Nav panels={panels} contact={contact} copy={navCopy} />

      <Strip>
        <HomePanel
          panel={panels.home}
          contact={contact}
          links={links}
          about={about}
          sketch={sketch}
          certifications={certifications}
          certificationsHeading={headings.certifications}
        />

        <Panel panel={panels.work} blobs={WORK_BLOBS}>
          <CaseStudies
            heading={headings.caseStudies}
            caseStudies={caseStudies}
            copy={caseStudiesCopy}
          />

          <Projects
            heading={headings.projects}
            projects={projects}
            copy={projectsCopy}
          />
        </Panel>

        <Panel panel={panels.skills} blobs={SKILLS_BLOBS}>
          {/* Two short blocks, one above the other, so Skills is one screen. */}
          <div className="contents large:flex large:flex-col large:gap-block">
            <Skills heading={headings.skills} skills={skills} />

            <Tools heading={headings.tools} tools={tools} />
          </div>
        </Panel>

        <Panel panel={panels.experience} blobs={EXPERIENCE_BLOBS}>
          <Experience experience={experience} copy={experienceCopy} />

          <EducationBlock
            heading={headings.education}
            education={education}
            copy={experienceCopy}
          />
        </Panel>

        <Panel panel={panels.contact} blobs={CONTACT_BLOBS}>
          <ContactBlock contact={contact} links={links} copy={contactCopy} />
        </Panel>
      </Strip>
    </>
  );
}
