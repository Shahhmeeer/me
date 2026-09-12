import { Nav } from "@/components/nav";
import { Panel } from "@/components/panel";
import { PanelObserver } from "@/components/panel-observer";
import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { Certifications } from "@/components/sections/certifications";
import { ContactBlock } from "@/components/sections/contact";
import { EducationBlock } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Pitch } from "@/components/sections/pitch";
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
  tools,
} from "@/content/site";

/**
 * The one page: five Panels in the order `panelOrder` gives, under the Nav.
 * Each Panel is headed by its Nav label, except Home, which is headed by the
 * Headline. The blocks inside a Panel are the same components as before,
 * regrouped; `tests/home-page.test.ts` reads the result as a browser does.
 */
export default function Home() {
  return (
    <>
      <Nav panels={panels} contact={contact} copy={navCopy} />

      <PanelObserver>
        <Panel
          id={panels.home.id}
          heading={contact.headline}
          isHeadline
          above={contact.greeting}
        >
          <Pitch contact={contact} links={links} />

          <About sentences={about} contact={contact} />

          <Certifications
            heading={headings.certifications}
            certifications={certifications}
          />
        </Panel>

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
      </PanelObserver>
    </>
  );
}
