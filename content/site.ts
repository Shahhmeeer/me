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

/**
 * A thing Shahmeer built that a visitor can open.
 *
 * Both links are optional one at a time, never together: a Project is openable
 * through its live site or through its public repo, and `projectProblems`
 * fails the build when a card offers neither.
 */
export type Project = {
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

export type Certification = {
  name: string;
  /** The award date as it is shown, for example "January 2024". */
  awarded: string;
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

/**
 * The three links that stand for Shahmeer somewhere else, in the order a
 * visitor wants them.
 *
 * The Header offers them at the top and the footer repeats them at the bottom.
 * One definition, so the two lists cannot drift apart and a link added later
 * appears in both.
 */
export function profileLinks(links: Links): SiteLink[] {
  return [links.linkedIn, links.trailhead, links.cv];
}

/** The heading a visitor reads at the top of each block below the Header. */
export type BlockHeadings = {
  certifications: string;
  about: string;
  caseStudies: string;
  projects: string;
  experience: string;
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
  about: "About",
  caseStudies: "Case Studies",
  projects: "Projects",
  experience: "Experience",
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
  "I am a Salesforce Developer with three years of delivery experience across Sales Cloud, Service Cloud and Experience Cloud.",
  "I build customer-facing portals and payment integrations, and I carry them through release and production support rather than handing them over at the code review.",
  "The work I find most interesting is integration: making a Salesforce org agree with a system that was never designed to talk to it.",
];

export const certifications: Certification[] = [
  { name: "Salesforce Certified Administrator", awarded: "January 2024" },
  {
    name: "Salesforce Certified Platform Developer I",
    awarded: "February 2024",
  },
  {
    name: "Salesforce Certified Platform App Builder",
    awarded: "June 2024",
  },
];

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
  /** What a Project is, said next to Case Studies that have nothing to click. */
  note: string;
  /** The label on the link to the running site. */
  liveLabel: string;
  /** The label on the link to the public repo. */
  repoLabel: string;
};

export const projectsCopy: ProjectsCopy = {
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

/** The words the Experience block publishes on its own behalf. */
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
    highlights: [],
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
        line: "Built an Experience Cloud storefront with Service Cloud behind it and queue-based case routing.",
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

/** The words the footer publishes on its own behalf. */
export type FooterCopy = {
  heading: string;
  /** Said above the email address, so the address is not left unlabelled. */
  emailLabel: string;
};

export const footerCopy: FooterCopy = {
  heading: "Contact",
  emailLabel: "Email",
};
