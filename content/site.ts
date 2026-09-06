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

/** The heading a visitor reads at the top of each block below the Header. */
export type BlockHeadings = {
  certifications: string;
  about: string;
  caseStudies: string;
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

export const projects: Project[] = [];

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

export const experience: ExperienceEntry[] = [];
