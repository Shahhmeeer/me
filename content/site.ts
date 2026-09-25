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
  /**
   * Its Spread's element id, and so its address: `#payment-gateway-integrations`
   * lands on it. Lower-case letters, digits and hyphens, which
   * `caseStudyProblems` holds it to.
   */
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

/**
 * A thing Shahmeer built that a visitor can open.
 *
 * Both links are optional one at a time, never together: a Project is openable
 * through its live site or through its public repo, and `projectProblems`
 * fails the build when a card offers neither.
 */
export type Project = {
  /**
   * Keys the card, and is kept to the shape of an element id, lower-case
   * letters, digits and hyphens, so a link could land on one; the Projects
   * Spread itself is landed on by `ProjectsCopy.id`.
   */
  id: string;
  name: string;
  /** The running site, where there is one. */
  liveUrl?: string;
  /** The public repo, where there is one. */
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

/**
 * A picture the site serves from `public`, with the words a screen reader
 * says in its place.
 *
 * The size is the file's own, in pixels, so the browser can hold the space
 * before the picture arrives; `tests/checks/pictures.ts` reads the file and
 * fails the build if the file is missing or the size written here is not the
 * size on disk.
 */
export type Picture = {
  /** The path under `public`, from the root: "/images/Me.png". */
  src: string;
  /** What a screen reader says. Never empty: a picture here is never decoration. */
  alt: string;
  width: number;
  height: number;
};

export type Certification = {
  name: string;
  /** The award date as it is shown, for example "January 2024". */
  awarded: string;
  /** The Salesforce badge for it, shown large on its card on Home's second Spread. */
  logo: Picture;
};

/**
 * When something started and when it ended.
 *
 * Experience and Education both carry one, and a Recruiter reads both for
 * gaps, so the pair is named rather than left as two loose strings that have
 * to be kept in step by hand in every rule and every component that draws them.
 */
export type DateRange = {
  start: string;
  /** The end date as it is shown, for example "April 2026" or "Present". */
  end: string;
};

/**
 * The degree, kept apart from Experience because it is not a role. A Recruiter
 * checking for gaps reads both, so it carries the same month-and-year dates.
 */
export type Education = DateRange & {
  id: string;
  /** The qualification as it is awarded, for example "BSc Computer Science". */
  qualification: string;
  institution: string;
};

export type ExperienceEntry = DateRange & {
  id: string;
  employer: string;
  title: string;
  location: string;
  remote: boolean;
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
  /** The short line above the Headline, so a visitor knows whose site this is. */
  greeting: string;
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
  /**
   * The profile, not a repo. An Engineer follows it to check the work is
   * real, so what they land on matters as much as the link: the profile is
   * kept clean by hand, and `gitHubLinkProblems` keeps every repo the site
   * links under it.
   */
  gitHub: SiteLink;
  trailhead: SiteLink;
  cv: SiteLink;
};

export const contact: Contact = {
  name: "M. Shahmeer Khan",
  greeting: "Hey, I'm Shahmeer",
  headline: "Senior Salesforce Developer",
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
  gitHub: {
    label: "GitHub",
    href: "https://github.com/Shahhmeeer",
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

/**
 * What the site says about itself when a link to it is shared or indexed.
 *
 * Read by the root layout for the document title, the description, the
 * canonical URL and the Open Graph and Twitter cards, and by the share image
 * for the words it draws. Every URL on the card is composed from `url`, so it
 * is the one bare https origin the site lives at.
 */
export type ShareCard = {
  /** The live origin, https, no trailing slash. */
  url: string;
  /** The document title, and the title on a shared link. */
  title: string;
  /** The one sentence under the title on a shared link. */
  description: string;
  /** What a screen reader says for the share image. */
  imageAlt: string;
};

/** The name and the Headline, as one line: the title of the site itself. */
const siteTitle = `${contact.name}, ${contact.headline}`;

export const shareCard: ShareCard = {
  url: "https://www.shahmeerasim.me",
  title: siteTitle,
  description: contact.pitch,
  imageAlt: siteTitle,
};

/**
 * The four links that stand for Shahmeer somewhere else, in the order a
 * visitor wants them: a Recruiter reaches for LinkedIn first, an Engineer for
 * GitHub, and Trailhead and the CV come after both.
 *
 * The Home Panel offers them at the top and the Contact Panel repeats them at
 * the end. One definition, so the two lists cannot drift apart and a link
 * added later appears in both.
 */
export function profileLinks(links: Links): SiteLink[] {
  return [links.linkedIn, links.gitHub, links.trailhead, links.cv];
}

/**
 * One Panel, as the Nav names it.
 *
 * The id is the anchor: the Nav links to it, the URL hash carries it, and the
 * rendered-page test reads it. The label is the word on the Nav link and, for
 * every Panel but Home, the Panel's own heading. Home's heading is the
 * Headline, because the first big line a Recruiter reads must say who
 * Shahmeer is, not where they are.
 */
export type Panel = {
  id: string;
  label: string;
};

/**
 * A Panel beyond Home: its label as the heading, one line under it that
 * says what the Panel holds, and the content beside the two. The line is
 * short because on a large display it is said at caption size under the
 * eyebrow of the Panel's first Spread; a sentence is plenty.
 */
export type ContentPanel = Panel & {
  line: string;
};

export type Panels = {
  home: Panel;
  work: ContentPanel;
  skills: ContentPanel;
  experience: ContentPanel;
  contact: ContentPanel;
};

export const panels: Panels = {
  home: { id: "home", label: "Home" },
  work: {
    id: "work",
    label: "Work",
    line: "Case Studies from private client orgs, the best of the work, then Projects you can open. The CV under Contact has the rest.",
  },
  skills: {
    id: "skills",
    label: "Skills",
    line: "What I do, and what I work with: nothing I could not stand behind in detail.",
  },
  experience: {
    id: "experience",
    label: "Experience",
    line: "Every Role since 2023, with the work done at each, and the degree before them.",
  },
  contact: {
    id: "contact",
    label: "Contact",
    line: "One email away. The profiles and the CV are here too.",
  },
};

/** The words the Nav publishes on its own behalf. */
export type NavCopy = {
  /** What a screen reader calls the Nav, so it is not just "navigation". */
  label: string;
};

export const navCopy: NavCopy = {
  label: "Panels",
};

/** The words the Bar publishes on its own behalf. */
export type BarCopy = {
  /** What a screen reader calls the Bar, so it is not a second "navigation". */
  label: string;
  /** The name of the arrow that moves one Spread back. */
  previous: string;
  /** The name of the arrow that moves one Spread on. */
  next: string;
  /**
   * The one sentence over the Bar that says how to move, for a visitor who
   * has never met a sideways site. Shown until the Strip first moves, then
   * gone for the session; one sentence, held to it by the content checks,
   * because it is read once and then never again.
   */
  hint: string;
};

export const barCopy: BarCopy = {
  label: "Spreads",
  previous: "Previous Spread",
  next: "Next Spread",
  hint: "Roll the wheel, press ← or →, or pick a dot to move across the site.",
};

/**
 * The five Panels in the order a visitor meets them: the strongest work
 * first, then what he does, then the history, then how to reach him. The Nav
 * reads this list, through `navPanels`; the page lists its Panels by hand,
 * and the rendered-page test holds the two to the same order.
 */
export function panelOrder(panels: Panels): Panel[] {
  return [
    panels.home,
    panels.work,
    panels.skills,
    panels.experience,
    panels.contact,
  ];
}

/**
 * The Panels the Nav links by name, in Panel order: every one but Contact,
 * which the Nav's "Get in touch" button goes to instead, so the pill does
 * not offer two ways to the same place.
 */
export function navPanels(panels: Panels): Panel[] {
  return panelOrder(panels).filter((panel) => panel.id !== panels.contact.id);
}

/**
 * The heading a visitor reads at the top of each block inside a Panel. The
 * Panels themselves are headed by their Nav label, in `panels`.
 */
export type BlockHeadings = {
  certifications: string;
  caseStudies: string;
  projects: string;
  education: string;
  skills: string;
  tools: string;
};

/**
 * Skills and Tools carry separate headings on purpose. CONTEXT.md keeps them
 * apart: a Skill is something Shahmeer does, a Tool is a product he works with.
 */
export const headings: BlockHeadings = {
  certifications: "Certifications",
  caseStudies: "Case Studies",
  projects: "Projects",
  education: "Education",
  skills: "What I do",
  tools: "What I work with",
};

/**
 * The three sentences of the About block: who he is, what he builds, and what
 * he is interested in.
 *
 * Shahmeer is employed. Nothing here may read as a job search, and the content
 * checks fail the build if it does.
 */
export const about: string[] = [
  "I am a Senior Salesforce Developer who has been building on Salesforce since 2023, across Sales Cloud, Service Cloud and Experience Cloud.",
  "I build customer-facing portals and payment integrations, and I carry them through release and production support rather than handing them over at the code review.",
  "The work I find most interesting is integration: making a Salesforce org agree with a system that was never designed to talk to it.",
];

/**
 * The pencil sketch of Shahmeer, drawn background and all: the Share Card's
 * picture, as a paper card. The page shows the cutout below instead. The alt
 * text names him, because for some visitors the words are the picture.
 */
export const sketch: Picture = {
  src: "/images/Me.png",
  alt: `A pencil sketch of ${contact.name}`,
  width: 1374,
  height: 1440,
};

/**
 * The same sketch with the paper cut away: a transparent PNG at the sketch's
 * own size, for the portrait that rises above a disc on the Home Panel. The
 * Share Card keeps the paper sketch above; this one is for the page.
 */
export const sketchCutout: Picture = {
  src: "/images/me-cutout.png",
  alt: `A pencil sketch of ${contact.name}, cut out from its paper`,
  width: 1374,
  height: 1440,
};

/**
 * The three certifications, each with its Salesforce badge. The badge's alt
 * text repeats the name, so a screen reader hears what the badge is for and
 * not "image".
 */
export const certifications: Certification[] = [
  {
    name: "Salesforce Certified Administrator",
    awarded: "January 2024",
    logo: {
      src: "/images/SF_Certified_Platform_Admin.png",
      alt: "Salesforce Certified Administrator badge",
      width: 1893,
      height: 1855,
    },
  },
  {
    name: "Salesforce Certified Platform Developer I",
    awarded: "February 2024",
    logo: {
      src: "/images/SF_Certified_Platform_DeveloperI.png",
      alt: "Salesforce Certified Platform Developer I badge",
      width: 1892,
      height: 1855,
    },
  },
  {
    name: "Salesforce Certified Platform App Builder",
    awarded: "June 2024",
    logo: {
      src: "/images/SF_Certified_Platform_App_Builder.png",
      alt: "Salesforce Certified Platform App Builder badge",
      width: 1893,
      height: 1855,
    },
  },
];

/** The words the certifications Spread publishes on its own behalf. */
export type CertificationsCopy = {
  /**
   * The one line under the Certifications heading. A sentence, held to one
   * by the content checks, because on the Strip it is said at caption size
   * beside three cards that are the point.
   */
  line: string;
  /**
   * The link to Salesforce's credential verification page, printed with
   * `contact.email` beside it: the page asks for an email address, and a
   * Recruiter who has the address has nothing to hunt for. It leaves the
   * site, so it opens in a new tab like every outside link.
   */
  verify: SiteLink;
};

export const certificationsCopy: CertificationsCopy = {
  line: "Three Salesforce credentials, each one checkable against my email address.",
  verify: {
    label: "Verify on Trailhead",
    href: "https://trailhead.salesforce.com/credentials/verification",
    external: true,
  },
};

/** The words the Case Studies block publishes on its own behalf. */
export type CaseStudiesCopy = {
  /**
   * Why a Case Study has nothing to click. The absence is a decision, not an
   * empty space, and ADR-0001 asks that it be said out loud.
   */
  note: string;
  /** The label in front of the Result line, so an Engineer can find it. */
  resultLabel: string;
};

export const caseStudiesCopy: CaseStudiesCopy = {
  note: "This work lives inside private client orgs, so there is nothing here to open. Employers are named; their end clients are described by industry and scale only.",
  resultLabel: "Result.",
};

/**
 * The three proof cards, and the reason the site exists.
 *
 * ADR-0001 governs every string below absolutely: no end-client name, no org
 * screenshot, no client code. Payment volume is a band, never a figure. The
 * year on each Tech Tag is the year of the engagement it was used on.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: "questionnaire-portal",
    title: "Questionnaire Portal",
    employer: "Cloud Consulting Inc",
    clientDescriptor:
      "A multi-tenant client across healthcare, legal and automotive, with about 10 portal users split between questionnaire admins and response users",
    problem:
      "A questionnaire of around 300 questions had to be answered by people outside the Salesforce org, across more than one sitting, while the admins who wrote it and the users who answered it needed different access to the same records.",
    action:
      "Built an Experience Cloud LWR portal with guest access and email one-time-password login, autosave on every answer so a part-finished questionnaire survives a closed tab, and role separation between questionnaire admins and response users.",
    result:
      "About 10 users file roughly 10 submissions a day through the portal, each one around 300 questions long, and no answer is lost to a dropped session.",
    techTags: [
      { name: "Experience Cloud (LWR)", year: 2025 },
      { name: "LWC", year: 2025 },
      { name: "Apex", year: 2025 },
    ],
    ownership: { kind: "solo", note: "Built solo, alongside a UI designer." },
  },
  {
    id: "payment-gateway-integrations",
    title: "Payment Gateway Integrations",
    employer: "Prism Solutions",
    clientDescriptor: "A healthcare client with thousands of customers",
    problem:
      "A healthcare client with thousands of customers collected payment through three separate providers, and none of the scheduling, billing or reconciliation sat against the Salesforce records it belonged to.",
    action:
      "Integrated GoCardless, Stripe and Braintree into Salesforce, covering automated payment scheduling, manual billing for one-off charges, tokenized processing so no raw card data lands in the org, and reconciliation back to the customer record.",
    result:
      "Three gateways now carry a six figure monthly payment volume for a client with thousands of customers, with billing scheduled, payments tokenized and reconciliation automated inside Salesforce.",
    techTags: [
      { name: "Stripe", year: 2023 },
      { name: "GoCardless", year: 2023 },
      { name: "Braintree", year: 2023 },
      { name: "Apex", year: 2023 },
      { name: "REST APIs", year: 2023 },
    ],
    ownership: {
      kind: "solo",
      note: "Built solo, from integration design through to production support.",
    },
  },
  {
    id: "scheduling-portal",
    title: "Scheduling portal with Zoom",
    employer: "Cloud Consulting Inc",
    clientDescriptor:
      "A multi-tenant client across healthcare, legal, automotive and construction, running one booking portal for 5 separate accounts",
    problem:
      "The portal needed Calendly-equivalent booking inside Salesforce: appointments raised against the record they belong to, calendars kept in sync, times shown in the customer's own timezone, and each account setting its own rules.",
    action:
      "Built the booking engine covering creation, rescheduling and cancellation, calendar sync, timezone conversion, a Zoom meeting on every booking, and per-account admin configuration so one portal serves many accounts.",
    result:
      "Five accounts book through the portal, 150 bookings between them, each one created, rescheduled, cancelled, calendar-synced, timezone-converted and given its Zoom meeting inside Salesforce, with no separate scheduling tool to keep in step.",
    techTags: [
      { name: "Experience Cloud", year: 2025 },
      { name: "Apex", year: 2025 },
      { name: "LWC", year: 2025 },
      { name: "Zoom", year: 2025 },
      { name: "REST APIs", year: 2025 },
    ],
    ownership: {
      kind: "team",
      note: "Built with one other developer. Shahmeer owned the booking engine: scheduling, rescheduling, cancellation, timezone conversion and the Zoom integration.",
    },
  },
];

/** The words the Projects block publishes on its own behalf. */
export type ProjectsCopy = {
  /**
   * The id the Projects Spread carries as its element id, so a link can land
   * on the Projects, `#projects`, the way one lands on a Case Study by the
   * Case Study's own id. The Projects have a heading and no one item to
   * name them, so the block is named here. Held to lower-case letters,
   * digits and hyphens, as every id a link lands on is.
   */
  id: string;
  /** What a Project is, said next to Case Studies that have nothing to click. */
  note: string;
  /** The label on the link to the running site. */
  liveLabel: string;
  /** The label on the link to the public repo. */
  repoLabel: string;
};

export const projectsCopy: ProjectsCopy = {
  id: "projects",
  note: "These are public, so open them. Each card carries the year the work was done.",
  liveLabel: "Visit site",
  repoLabel: "View source",
};

/**
 * One link on a Project card.
 *
 * `accessibleLabel` exists because the visible labels repeat from card to
 * card. A screen reader reading the links on their own would otherwise hear
 * "View source" twice and learn nothing about which Project it opens.
 */
export type ProjectLink = SiteLink & {
  accessibleLabel: string;
};

/**
 * The links one Project offers, in the order a visitor wants them: the running
 * site first, the source second. A Project carries one or both and never
 * neither, which `projectProblems` enforces.
 *
 * This sits beside the copy rather than inside the component, because which
 * link a Project offers and what it is called are both content decisions.
 */
export function projectLinks(
  project: Project,
  copy: ProjectsCopy,
): ProjectLink[] {
  return [
    { label: copy.liveLabel, href: project.liveUrl },
    { label: copy.repoLabel, href: project.repoUrl },
  ]
    .filter(
      (link): link is { label: string; href: string } =>
        link.href !== undefined,
    )
    .map((link) => ({
      ...link,
      external: true,
      accessibleLabel: `${link.label}: ${project.name}`,
    }));
}

/**
 * The two Projects. Unlike a Case Study, each one has something a visitor can
 * open, which is why the block exists at all.
 *
 * The year on the card and on every Tech Tag is the year the work was done, so
 * that nothing here reads as current daily work. Flutter and Firebase are
 * named here and nowhere else: TECH_TAG_ONLY_NAMES in
 * tests/checks/profile-rules.ts keeps them out of the Skills and Tools blocks.
 */
export const projects: Project[] = [
  {
    id: "masoodia",
    name: "Masoodia",
    liveUrl: "https://www.masoodia.com/",
    repoUrl: "https://github.com/Shahhmeeer/masoodia-website",
    summary:
      "A website for a small business working in coal export, event management, solar and biomass.",
    techTags: [{ name: "JavaScript", year: 2024 }],
    year: 2024,
    ownership: {
      kind: "solo",
      note: "Built solo: the front end, the build and the Vercel deployment.",
    },
  },
  {
    id: "plant-ecommerce-app",
    name: "Plant e-commerce app",
    repoUrl: "https://github.com/Shahhmeeer/final-year-project",
    summary:
      "A Flutter and Firebase mobile app for buying plants, built as a final year project.",
    techTags: [
      { name: "Flutter", year: 2024 },
      { name: "Firebase", year: 2024 },
    ],
    year: 2024,
    ownership: {
      kind: "solo",
      note: "Built solo as a final year project.",
    },
  },
];

/**
 * Verbs. Each one is something Shahmeer would be happy to be questioned on in
 * an interview today.
 */
export const skills: Skill[] = [
  "Salesforce development",
  "Experience Cloud portal development",
  "Third-party and payment integration",
  "Sales Cloud and Service Cloud implementation",
  "CI/CD delivery and release management",
  "Production support and root-cause analysis",
];

/**
 * Product names, because a Recruiter searches for these. The same interview
 * rule applies. Names that fail it are Tech Tags only and are listed in
 * tests/checks/profile-rules.ts, which fails the build if one appears here.
 */
export const tools: Tool[] = [
  "Apex",
  "LWC",
  "Flows",
  "CPQ",
  "Custom Metadata Types",
  "Salesforce CLI",
  "Stripe",
  "GoCardless",
  "Braintree",
  "Zoom",
  "REST APIs",
  "JavaScript",
  "GitLab CI/CD",
];

/**
 * The words a date range is printed with. Education takes only these, because
 * a degree has no employer to be remote from.
 */
export type DateRangeCopy = {
  /**
   * Between the start date and the end date. A word rather than a dash,
   * because a screen reader reads "May 2024 to April 2026" and makes nothing
   * of an en dash.
   */
  dateSeparator: string;
  /** The end date of a role that has not ended. */
  present: string;
};

/** The words the Experience Panel publishes on its own behalf. */
export type ExperienceCopy = DateRangeCopy & {
  /** Said next to the location when the role is worked remotely. */
  remoteLabel: string;
};

export const experienceCopy: ExperienceCopy = {
  remoteLabel: "Remote",
  dateSeparator: " to ",
  present: "Present",
};

/**
 * The employment history, newest first, and the Highlights hanging off it.
 *
 * A Recruiter reads this block to check the dates line up, so the dates are
 * the point: every one is a month and a year, the roles hand over month to
 * month, and `overlappingRoleProblems` fails the build if two ever claim the
 * same months.
 *
 * A Highlight is real work that did not earn a full Case Study, and it belongs
 * to the employer it was done for. ADR-0001 governs every line: employers are
 * named, their end clients never are.
 */
export const experience: ExperienceEntry[] = [
  {
    id: "scaleable-solutions",
    employer: "Scaleable Solutions",
    title: "Senior Salesforce Developer",
    location: "Sharjah, UAE",
    remote: true,
    start: "May 2026",
    end: experienceCopy.present,
    highlights: [
      {
        id: "headless-registration",
        line: "Replaced the standard Experience Cloud registration with the Headless Identity APIs, so the client's own front end runs its own business logic, with an email verification code and a business-domain check the standard flow does not offer.",
      },
      {
        id: "gitlab-pipeline",
        line: "Maintained the GitLab CI/CD pipeline that validates every merge request, runs the Apex tests and deploys to sandbox, UAT and production on merge, including the move from API version 66 to 68.",
      },
      {
        id: "production-support",
        line: "Cleared seven to eight production tickets a week, from SOQL governor limits to page layout fixes, using Dynamic Forms to make fields required for people but not for API users where a validation rule would have blocked both.",
      },
    ],
  },
  {
    id: "cloud-consulting-inc",
    employer: "Cloud Consulting Inc",
    title: "Salesforce Developer",
    location: "Atlanta",
    remote: true,
    start: "May 2024",
    end: "April 2026",
    highlights: [
      {
        id: "ats-portal",
        line: "Built a multi-tenant ATS portal serving three companies, carrying around 25 jobs and around 100 candidates.",
      },
      {
        id: "licence-migration",
        line: "Moved low-frequency users off full Salesforce licences onto Experience Cloud at materially lower cost, with the security model preserved.",
      },
      {
        id: "form-engine",
        line: "Built a metadata-driven form engine on Custom Metadata Types and LWC, completed but not released.",
      },
    ],
  },
  {
    id: "prism-solutions",
    employer: "Prism Solutions",
    title: "Salesforce Developer",
    location: "Lahore",
    remote: false,
    start: "April 2023",
    end: "April 2024",
    highlights: [
      {
        id: "storefront",
        line: "Moved a herbal products retailer's custom storefront onto Experience Cloud with guest access, so 33 customers could order without a Salesforce licence each.",
      },
      {
        id: "storefront-back-end",
        line: "Built the Salesforce back end behind it, holding 67 products, orders and customers, with Service Cloud and queue-based case routing for support.",
      },
    ],
  },
];

/** The degree. One entry, because there is one. */
export const education: Education[] = [
  {
    id: "bsc-computer-science",
    qualification: "BSc Computer Science",
    institution: "University of Lahore",
    start: "February 2019",
    end: "January 2024",
  },
];

/**
 * One field of the contact form: the name it is posted under, which the
 * route reads, and the label and placeholder a visitor reads.
 */
export type FormField = {
  name: string;
  label: string;
  placeholder: string;
};

/**
 * What the route can find wrong with one field, and the Form says beside
 * its box: nothing in it, too little, too much, or an address that is not
 * one. The route names the problem by these keys, so the Form's words and
 * the route's checks cannot drift apart.
 */
export type FieldProblemWords = {
  missing: string;
  "too-short": string;
  "too-long": string;
  "not-an-email": string;
};

/**
 * The Form, every word of it (ADR-0004). The Form posts to
 * `action`; the route there reads the fields by these names, so the two
 * cannot drift apart. The Honeypot is a field a human never sees, hidden
 * from sight and from a screen reader, and named the way a bot expects a
 * field to be named so it fills it in; the route drops any Message that
 * did. The success and failure lines are said only after a post, never at
 * first paint; the failure line names the email address, so a visitor whose
 * message did not send still has a way to write.
 */
export type ContactFormCopy = {
  /** The path the Form posts to. */
  action: string;
  fields: {
    name: FormField;
    email: FormField;
    message: FormField;
  };
  /** No placeholder: nobody is invited to fill it. */
  honeypot: Pick<FormField, "name" | "label">;
  /** The label on the Send button. */
  submit: string;
  /** The label on the Send button while the Message is on its way. */
  sending: string;
  /** Said in place of the Form once the Message has been sent. */
  success: string;
  /** Said under the Form when it could not be sent. Names the email address. */
  failure: string;
  /** Said beside the one box the route refused the Message for. */
  problems: FieldProblemWords;
};

/**
 * How a Message from the Form reaches Shahmeer (ADR-0004): the address it
 * is sent from, on the site's own domain so that Gmail does not file it as
 * spam, and its subject. It goes to `contact.email`, and the visitor's own
 * address is its Reply-To, which the route sets and no word here names.
 */
export type ContactMail = {
  /** A sender on `shahmeerasim.me`, the domain verified with Resend. */
  from: string;
  subject: string;
};

export const contactMail: ContactMail = {
  from: "Shahmeer's portfolio <contact@shahmeerasim.me>",
  subject: "A message from the portfolio",
};

/** The words the Contact Panel publishes on its own behalf. */
export type ContactCopy = {
  form: ContactFormCopy;
  /** The small line at the very end of the page. */
  copyright: string;
};

export const contactCopy: ContactCopy = {
  form: {
    action: "/api/contact",
    fields: {
      name: { name: "name", label: "Name", placeholder: "Your name" },
      email: { name: "email", label: "Email", placeholder: "you@example.com" },
      message: {
        name: "message",
        label: "Message",
        placeholder: "What would you like to talk about?",
      },
    },
    honeypot: { name: "website", label: "Website" },
    submit: "Send",
    sending: "Sending…",
    success: "Thanks, I reply within a day.",
    failure: `That did not send. Email me instead at ${contact.email}.`,
    problems: {
      missing: "This is needed.",
      "too-short": "A little more, please.",
      "too-long": "That is too long for the box.",
      "not-an-email": "That is not an email address.",
    },
  },
  /**
   * The year is read when the module loads, which for a static site is at
   * build time. The site is rebuilt on every merge, so it never falls far
   * behind, and a year typed by hand would fall further.
   */
  copyright: `© ${new Date().getFullYear()} ${contact.name}`,
};
