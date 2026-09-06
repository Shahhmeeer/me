import { About } from "@/components/sections/about";
import { CaseStudies } from "@/components/sections/case-studies";
import { Certifications } from "@/components/sections/certifications";
import { Header } from "@/components/sections/header";
import { Skills } from "@/components/sections/skills";
import { Tools } from "@/components/sections/tools";
import {
  about,
  caseStudies,
  caseStudiesNote,
  certifications,
  contact,
  headings,
  links,
  skills,
  tools,
} from "@/content/site";

export default function Home() {
  return (
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
        note={caseStudiesNote}
      />

      <Skills heading={headings.skills} skills={skills} />

      <Tools heading={headings.tools} tools={tools} />
    </main>
  );
}
