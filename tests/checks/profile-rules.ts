/**
 * What makes the Certifications, their copy, About, Skills and Tools fit to ship.
 *
 * Each function returns a list of problems in plain words. An empty list means
 * the block is sound. Like the Case Study rules, these read data only: they say
 * nothing about markup, class names or components, so a redesign cannot break
 * them.
 */

import type {
  Certification,
  CertificationsCopy,
  Skill,
  Tool,
} from "@/content/site";
import { countSentences, isMonthYear } from "./prose";
import { isBlank } from "./strings";

function isWordCharacter(character: string): boolean {
  return /[A-Za-z0-9]/.test(character);
}

/**
 * True when `name` appears in `text` as a whole word. A boundary is anything
 * that is not a letter or a digit, so "Next.js" is found inside "Next.js and
 * React", but "React" is not found inside "Reactive".
 *
 * Written as a scan rather than a built regex because the names carry regex
 * punctuation of their own: "Next.js", "CI/CD".
 */
export function mentionsName(text: string, name: string): boolean {
  const haystack = text.toLowerCase();
  const needle = name.toLowerCase();

  for (
    let index = haystack.indexOf(needle);
    index !== -1;
    index = haystack.indexOf(needle, index + 1)
  ) {
    const before = index === 0 ? "" : haystack[index - 1];
    const after = haystack[index + needle.length] ?? "";

    if (!isWordCharacter(before) && !isWordCharacter(after)) {
      return true;
    }
  }

  return false;
}

/**
 * Problems with one Certification: a name, and an award date a Recruiter can
 * read as a month and a year.
 */
export function certificationProblems(certification: Certification): string[] {
  const problems: string[] = [];

  if (isBlank(certification.name)) {
    problems.push("Certification has no name.");
  }

  if (!isMonthYear(certification.awarded)) {
    problems.push(
      `Certification "${certification.name}" needs an award date like "January 2024", but has ${JSON.stringify(certification.awarded)}.`,
    );
  }

  return problems;
}

/**
 * Problems with the words beside the certifications: a line that is one
 * sentence, and a verify link with a label that leaves the site over https,
 * because only Salesforce's own page can vouch for a credential.
 */
export function certificationsCopyProblems(copy: CertificationsCopy): string[] {
  const problems: string[] = [];

  if (isBlank(copy.line)) {
    problems.push("The certifications line is empty.");
  } else {
    const count = countSentences(copy.line.trim());
    if (count !== 1) {
      problems.push(
        `The certifications line holds one sentence, but "${copy.line}" holds ${count}.`,
      );
    }
  }

  if (isBlank(copy.verify.label)) {
    problems.push("The verify link has no label.");
  }

  if (typeof copy.verify.href !== "string" || !copy.verify.href.startsWith("https://")) {
    problems.push(
      `The verify link must open Salesforce's page over https, but: ${JSON.stringify(copy.verify.href)}`,
    );
  }

  if (copy.verify.external !== true) {
    problems.push("The verify link leaves the site, so it must say so.");
  }

  return problems;
}

/**
 * Phrasing that says Shahmeer is job hunting. He is employed, so none of it may
 * reach the About block.
 */
const JOB_SEARCH_PHRASES: readonly string[] = [
  "open to work",
  "open to opportunities",
  "looking for a role",
  "looking for work",
  "seeking a role",
  "available for hire",
];

/**
 * Problems with the About block: three sentences, one per entry, and nothing
 * that signals a job search.
 */
export function aboutProblems(about: readonly string[]): string[] {
  const problems: string[] = [];

  if (about.length !== 3) {
    problems.push(
      `About must be three sentences, but has ${about.length} of them.`,
    );
  }

  for (const sentence of about) {
    if (isBlank(sentence)) {
      problems.push("An About sentence is empty.");
      continue;
    }

    const count = countSentences(sentence.trim());
    if (count !== 1) {
      problems.push(
        `Each About entry holds one sentence, but "${sentence}" holds ${count}.`,
      );
    }

    const haystack = sentence.toLowerCase();
    for (const phrase of JOB_SEARCH_PHRASES) {
      if (haystack.includes(phrase)) {
        problems.push(`About says "${phrase}" in: ${sentence}`);
      }
    }
  }

  return problems;
}

/**
 * Tools that are Tech Tags only, because Shahmeer would not want to be
 * questioned on them today. A Case Study or a Project may name one with its
 * year, because a Tech Tag says "used here, then". Neither the Skills block nor
 * the Tools block may claim one, because those blocks claim present ability.
 *
 * This is a judgement about today, not a permanent ban. When one of these
 * becomes interview-ready, take it off this list and add it to its block.
 */
export const TECH_TAG_ONLY_NAMES: readonly string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Flutter",
  "Firebase",
];

/**
 * Every Tech-Tag-only name that the Skills or Tools block claims. The two
 * blocks are checked together because they share the one rule that keeps both
 * lists honest.
 */
export function techTagOnlyProblems(
  skills: readonly Skill[],
  tools: readonly Tool[],
): string[] {
  const blocks = [
    ["Skills", skills],
    ["Tools", tools],
  ] as const;

  const problems: string[] = [];

  for (const [block, items] of blocks) {
    for (const item of items) {
      for (const name of TECH_TAG_ONLY_NAMES) {
        if (mentionsName(item, name)) {
          problems.push(
            `"${name}" is a Tech Tag only, but the ${block} block claims it in: ${item}`,
          );
        }
      }
    }
  }

  return problems;
}
