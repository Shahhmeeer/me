import type { PanelSpreads } from "@/components/bar";
import { ContactPanel, contactSpreadTitles } from "@/components/contact-panel";
import { ExperiencePanel, experienceSpreadTitles } from "@/components/experience-panel";
import { HomePanel, homeSpreadTitles } from "@/components/home-panel";
import { Nav } from "@/components/nav";
import { SkillsPanel, skillsSpreadTitles } from "@/components/skills-panel";
import { Strip } from "@/components/strip";
import { WorkPanel, workSpreadTitles } from "@/components/work-panel";
import {
  about,
  barCopy,
  caseStudies,
  caseStudiesCopy,
  certifications,
  certificationsCopy,
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
 * The Spreads of each Panel, by title, in the same order as the Panels
 * below, for the Bar's dots. Each Panel component says its own from the
 * content it splits its Spreads by, so this list and the Strip cannot
 * disagree on how many Spreads there are; the rendered-page test counts
 * the dots against the content anyway.
 */
const spreads: PanelSpreads[] = [
  { panel: panels.home, titles: homeSpreadTitles(contact, headings) },
  { panel: panels.work, titles: workSpreadTitles(caseStudies, projects, headings) },
  { panel: panels.skills, titles: skillsSpreadTitles(headings) },
  { panel: panels.experience, titles: experienceSpreadTitles(experience) },
  { panel: panels.contact, titles: contactSpreadTitles(contact) },
];

/**
 * The one page: five Panels under the Nav, and the Bar under them. They are
 * listed here by hand, in the order `panelOrder` gives the Nav, and
 * `tests/home-page.test.ts` holds the two to the same order. Each Panel is
 * headed by its Nav label, except Home, which is headed by the Headline.
 * Every Panel is Spreads, split by its own Panel component: the Hero and
 * the certifications; one per Case Study and one for the Projects; one;
 * one per Role with the degree under the last; and one, the address beside
 * the form. The Strip is handed the same Spreads by title, and draws the
 * Bar from them.
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

      <Strip spreads={spreads} barCopy={barCopy}>
        <HomePanel
          panel={panels.home}
          contact={contact}
          links={links}
          about={about}
          cutout={sketchCutout}
          headings={headings}
          certifications={certifications}
          certificationsCopy={certificationsCopy}
        />

        <WorkPanel
          panel={panels.work}
          headings={headings}
          caseStudies={caseStudies}
          caseStudiesCopy={caseStudiesCopy}
          projects={projects}
          projectsCopy={projectsCopy}
        />

        <SkillsPanel
          panel={panels.skills}
          headings={headings}
          skills={skills}
          tools={tools}
        />

        <ExperiencePanel
          panel={panels.experience}
          headings={headings}
          experience={experience}
          education={education}
          copy={experienceCopy}
        />

        <ContactPanel
          panel={panels.contact}
          contact={contact}
          links={links}
          copy={contactCopy}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </Strip>
    </>
  );
}
