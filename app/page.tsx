import type { BlobShape } from "@/components/blob";
import { ContactPanel } from "@/components/contact-panel";
import { ExperiencePanel } from "@/components/experience-panel";
import { HomePanel } from "@/components/home-panel";
import { Nav } from "@/components/nav";
import { SkillsPanel } from "@/components/skills-panel";
import { Strip } from "@/components/strip";
import { WorkPanel } from "@/components/work-panel";
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
  sketchCutout,
  tools,
} from "@/content/site";

/**
 * The colour behind each of the four Panels beyond Home, picked here where
 * the Panels are composed; Home picks its own in `components/home-panel.tsx`.
 * Work and Experience are rows of Spreads, so their shapes are placed along
 * the Panel, by its width, one to a screen or so, and no Spread is bare;
 * Skills and Contact are one Spread each, one screen, so either measure is
 * the same there. No two Panels are washed the same way, so a visitor
 * sliding from one to the next sees the ground change with the heading.
 */
const WORK_BLOBS: BlobShape[] = [
  { colour: "accent-border", top: "-10%", left: "12%", size: "40vw" },
  { colour: "action", top: "50%", left: "30%", size: "28vw" },
  { colour: "accent", top: "20%", left: "55%", size: "36vw" },
  { colour: "accent-border", top: "45%", left: "80%", size: "34vw" },
];

const SKILLS_BLOBS: BlobShape[] = [
  { colour: "accent", top: "-20%", left: "30vw", size: "38vw" },
  { colour: "accent-border", top: "40%", left: "65vw", size: "34vw" },
];

const EXPERIENCE_BLOBS: BlobShape[] = [
  { colour: "action", top: "-15%", left: "15%", size: "30vw" },
  { colour: "accent-border", top: "45%", left: "38%", size: "40vw" },
  { colour: "accent", top: "20%", left: "78%", size: "30vw" },
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
 * four are Spreads, split by their own Panel components: one per Case
 * Study and one for the Projects; one; one per Role with the degree under
 * the last; and one, the address beside the form.
 *
 * The Turnstile site key is read here, at the page's edge, and handed to
 * the Contact Panel as a prop, so the Form is a function of what it is
 * given and a test can render it with a key and without one. It is public,
 * inlined into the page at build time by its `NEXT_PUBLIC_` prefix, and
 * unset on a preview with no keys, where the widget is then not drawn
 * (ADR-0004).
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
          cutout={sketchCutout}
          certifications={certifications}
          certificationsHeading={headings.certifications}
        />

        <WorkPanel
          panel={panels.work}
          blobs={WORK_BLOBS}
          headings={headings}
          caseStudies={caseStudies}
          caseStudiesCopy={caseStudiesCopy}
          projects={projects}
          projectsCopy={projectsCopy}
        />

        <SkillsPanel
          panel={panels.skills}
          blobs={SKILLS_BLOBS}
          headings={headings}
          skills={skills}
          tools={tools}
        />

        <ExperiencePanel
          panel={panels.experience}
          blobs={EXPERIENCE_BLOBS}
          headings={headings}
          experience={experience}
          education={education}
          copy={experienceCopy}
        />

        <ContactPanel
          panel={panels.contact}
          blobs={CONTACT_BLOBS}
          contact={contact}
          links={links}
          copy={contactCopy}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </Strip>
    </>
  );
}
