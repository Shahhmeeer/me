/**
 * The single content module.
 *
 * Every word, number, link, date and tag the site publishes lives here. No
 * component may hardcode copy. The vocabulary follows CONTEXT.md exactly, and
 * the confidentiality rules in docs/adr/0001-no-client-names-screenshots-or-code.md
 * apply to every string below: employers may be named, end clients never are.
 */

/** The line at the top of the home page that states who Shahmeer is. */
export type Headline = string;

/** A Tool named on one Case Study or Project card, with the year it was used. */
export type TechTag = {
  name: string;
  year: number;
};

/** The outcome line of a Case Study: what changed for the business. */
export type Result = string;

/** Whether the work was done alone or with others. */
export type Ownership =
  | { kind: "solo"; note?: string }
  | { kind: "team"; note: string };

/** One piece of past work with nothing to click, because it lives in a client org. */
export type CaseStudy = {
  id: string;
  title: string;
  employer: string;
  /**
   * The employer's end client, by industry and scale only. Never a name.
   * Named "descriptor" because CONTEXT.md reserves Client for a visitor who
   * would pay for freelance work.
   */
  clientDescriptor: string;
  problem: string;
  /** What Shahmeer did. */
  action: string;
  result: Result;
  techTags: TechTag[];
  ownership: Ownership;
};

/** A thing Shahmeer built that a visitor can open. */
export type Project = {
  id: string;
  name: string;
  liveUrl: string;
  repoUrl?: string;
  summary: string;
  techTags: TechTag[];
  year: number;
  ownership: Ownership;
};

/** A one-line piece of real work that did not earn a full Case Study. */
export type Highlight = {
  id: string;
  line: string;
};

/** Something Shahmeer does. A verb phrase, not a product. */
export type Skill = string;

/** A product, language or platform Shahmeer works with. */
export type Tool = string;

export type Certification = {
  name: string;
  /** The award date as it is shown, for example "January 2024". */
  awarded: string;
};

export type ExperienceEntry = {
  id: string;
  employer: string;
  title: string;
  location: string;
  remote: boolean;
  start: string;
  /** The end date as it is shown, for example "April 2026" or "Present". */
  end: string;
  highlights: Highlight[];
};

/** One outbound link, with the label a visitor reads. */
export type SiteLink = {
  label: string;
  href: string;
  /** True when the link leaves this site and must open in a new tab. */
  external: boolean;
};

export type Contact = {
  name: string;
  headline: Headline;
  /** The one-line pitch under the Headline. */
  pitch: string;
  email: string;
  /** The label on the single contact button. */
  callToAction: string;
  location: string;
  /** Timezone availability in words, not an IANA zone. */
  timezoneAvailability: string;
};

export type Links = {
  linkedIn: SiteLink;
  trailhead: SiteLink;
  cv: SiteLink;
};

export const contact: Contact = {
  name: "Shahmeer Asim",
  headline: "Salesforce Developer",
  pitch:
    "I build Experience Cloud portals and payment integrations on Salesforce, and I take them all the way to production.",
  email: "shahmeerasim1999@gmail.com",
  callToAction: "Get in touch",
  location: "Islamabad, Pakistan",
  timezoneAvailability: "Has worked EST hours",
};

export const links: Links = {
  linkedIn: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shahmeer-ghilzai/",
    external: true,
  },
  trailhead: {
    label: "Trailhead",
    href: "https://www.salesforce.com/trailblazer/shahmeer1999",
    external: true,
  },
  cv: {
    label: "Download CV",
    href: "/Shahmeer_Asim_Resume.pdf",
    external: false,
  },
};

/** The three sentences of the About block. Populated in the About ticket. */
export const about: string[] = [];

export const certifications: Certification[] = [];

export const caseStudies: CaseStudy[] = [];

export const projects: Project[] = [];

export const skills: Skill[] = [];

export const tools: Tool[] = [];

export const experience: ExperienceEntry[] = [];
