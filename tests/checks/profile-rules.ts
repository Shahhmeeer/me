/**
 * What makes the Certifications, About, Skills and Tools blocks fit to ship.
 *
 * Each function returns a list of problems in plain words. An empty list means
 * the block is sound. Like the Case Study rules, these read data only: they say
 * nothing about markup, class names or components, so a redesign cannot break
 * them.
 */

import type { Certification, Skill, Tool } from "@/content/site";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

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
 * Phrasing that says Shahmeer is job hunting. He is employed, so none of it may
 * reach the published site.
 */
export const JOB_SEARCH_PHRASES: readonly string[] = [
  "open to work",
  "open to opportunities",
  "open to new opportunities",
  "looking for a role",
  "looking for a new role",
  "looking for work",
  "looking for opportunities",
  "seeking a role",
  "seeking a new role",
  "seeking opportunities",
  "actively seeking",
  "available for hire",
  "job hunting",
  "job seeking",
  "hire me",
];

/** One job-search phrase, and the published string it was found in. */
export type JobSearchMention = {
  phrase: string;
  text: string;
};

/** Every job-search phrase found in the given strings, once per phrase per string. */
export function findJobSearchPhrases(
  strings: readonly string[],
  phrases: readonly string[] = JOB_SEARCH_PHRASES,
): JobSearchMention[] {
  const mentions: JobSearchMention[] = [];

  for (const text of strings) {
    const haystack = text.toLowerCase();
    for (const phrase of phrases) {
      if (haystack.includes(phrase)) {
        mentions.push({ phrase, text });
      }
    }
  }

  return mentions;
}

/** An award date as it is shown, for example "January 2024". */
const AWARD_DATE =
  /^(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{4}$/;

/**
 * Problems with one Certification: a name, and an award date a Recruiter can
 * read as a month and a year.
 */
export function certificationProblems(certification: Certification): string[] {
  const problems: string[] = [];

  if (isBlank(certification.name)) {
    problems.push("Certification has no name.");
  }

  if (!AWARD_DATE.test(certification.awarded ?? "")) {
    problems.push(
      `Certification "${certification.name}" needs an award date like "January 2024", but has ${JSON.stringify(certification.awarded)}.`,
    );
  }

  return problems;
}

/** Sentences in a piece of copy, counted by their end punctuation. */
function countSentences(text: string): number {
  return (text.match(/[.!?]( |$)/g) ?? []).length;
}

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
  }

  problems.push(
    ...findJobSearchPhrases(about).map(
      (mention) => `About says "${mention.phrase}" in: ${mention.text}`,
    ),
  );

  return problems;
}

/**
 * Tools that are Tech Tags only. A Case Study or a Project may name one with
 * its year, because a Tech Tag says "used here, then". Neither the Skills block
 * nor the Tools block may claim one, because those blocks claim present
 * ability.
 */
export const TECH_TAG_ONLY_NAMES: readonly string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Flutter",
  "Firebase",
];

/**
 * Problems with the Skills and Tools blocks together, because their one shared
 * rule joins them: an item belongs to exactly one block. A Skill is a verb, a
 * Tool is a product name, and a Tech-Tag-only name is neither.
 */
export function skillsAndToolsProblems(
  skills: readonly Skill[],
  tools: readonly Tool[],
): string[] {
  const problems: string[] = [];

  if (skills.length === 0) {
    problems.push("The Skills block is empty.");
  }

  if (tools.length === 0) {
    problems.push("The Tools block is empty.");
  }

  const blocks = [
    ["Skills", skills],
    ["Tools", tools],
  ] as const;

  for (const [block, items] of blocks) {
    for (const item of items) {
      if (isBlank(item)) {
        problems.push(`The ${block} block has an empty entry.`);
        continue;
      }

      for (const name of TECH_TAG_ONLY_NAMES) {
        if (mentionsName(item, name)) {
          problems.push(
            `"${name}" is a Tech Tag only, but the ${block} block claims it in: ${item}`,
          );
        }
      }
    }
  }

  const toolNames = new Set(tools.map((tool) => tool.toLowerCase()));
  for (const skill of skills) {
    if (toolNames.has(skill.toLowerCase())) {
      problems.push(`"${skill}" is listed as both a Skill and a Tool.`);
    }
  }

  return problems;
}
