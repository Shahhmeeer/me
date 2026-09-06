import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { Certifications } from "@/components/sections/certifications";
import { EducationBlock } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Tools } from "@/components/sections/tools";
import {
  about,
  caseStudies,
  caseStudiesCopy,
  certifications,
  contact,
  education,
  experience,
  experienceCopy,
  footerCopy,
  headings,
  links,
  projects,
  projectsCopy,
  skills,
  tools,
} from "@/content/site";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-block px-gutter py-section">
        <Header contact={contact} links={links} />

        <Certifications
          heading={headings.certifications}
          certifications={certifications}
        />

        <About heading={headings.about} sentences={about} contact={contact} />

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

        <Experience
          heading={headings.experience}
          experience={experience}
          copy={experienceCopy}
        />

        <EducationBlock
          heading={headings.education}
          education={education}
          copy={experienceCopy}
        />

        <Skills heading={headings.skills} skills={skills} />

        <Tools heading={headings.tools} tools={tools} />
      </main>

      <Footer contact={contact} links={links} copy={footerCopy} />
    </>
  );
}
