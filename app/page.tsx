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

        <Panel id={panels.work.id} heading={panels.work.label}>
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

        <Panel id={panels.skills.id} heading={panels.skills.label}>
          <Skills heading={headings.skills} skills={skills} />

          <Tools heading={headings.tools} tools={tools} />
        </Panel>

        <Panel id={panels.experience.id} heading={panels.experience.label}>
          <Experience experience={experience} copy={experienceCopy} />

          <EducationBlock
            heading={headings.education}
            education={education}
            copy={experienceCopy}
          />
        </Panel>

        <Panel id={panels.contact.id} heading={panels.contact.label}>
          <ContactBlock contact={contact} links={links} copy={contactCopy} />
        </Panel>
      </Strip>
    </>
  );
}
