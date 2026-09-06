/**
 * What makes a Case Study or a Project complete enough to ship.
 *
 * Each function returns a list of problems in plain words. An empty list means
 * the item is sound. These rules read data only: they say nothing about
 * markup, class names or components, so a redesign cannot break them.
 */

import type { CaseStudy, Project, TechTag } from "@/content/site";
import { isBlank } from "./strings";

/** True for a plain four-digit year such as 2024. */
function isFourDigitYear(year: unknown): boolean {
  return (
    typeof year === "number" &&
    Number.isInteger(year) &&
    year >= 1000 &&
    year <= 9999
  );
}

/** Problems with one Tech Tag. */
export function techTagProblems(tag: TechTag): string[] {
  const problems: string[] = [];

  if (isBlank(tag.name)) {
    problems.push("Tech Tag has no name.");
  }

  if (!isFourDigitYear(tag.year)) {
    problems.push(
      `Tech Tag "${tag.name}" needs a four-digit year, but has ${JSON.stringify(tag.year)}.`,
    );
  }

  return problems;
}

function techTagListProblems(tags: readonly TechTag[]): string[] {
  return tags.flatMap(techTagProblems);
}

/**
 * Quantity words, so that a Result may carry its number in words.
 * ADR-0001 forbids an exact payment figure, so "six figures a month" is the
 * only honest way to state that volume, and it holds no digit.
 *
 * "One" is deliberately absent. One of a thing is not a measurement, and
 * letting it count would pass a Result that says nothing was measured.
 */
const NUMBER_WORDS =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozens?|hundreds?|thousands?|millions?|half|third|quarter)\b/i;

/** True when a piece of copy states a quantity, in digits or in words. */
function statesANumber(text: string): boolean {
  return /[0-9]/.test(text) || NUMBER_WORDS.test(text);
}

/**
 * An exact money amount: a currency symbol next to digits, or digits next to a
 * money word. ADR-0001 allows a band such as "six figures a month" and forbids
 * the figure behind it, so this rule reads every word of a card rather than
 * only its Result.
 */
const EXACT_MONEY = /[$£€]\s?[0-9]|[0-9][0-9,.]*\s?(k|m|bn|million|billion)\b/i;

/**
 * The two fields the ownership rules read.
 *
 * Widened from the declared type on purpose. The type says solo or team, but
 * these checks exist to catch content that does not keep that promise.
 */
type OwnershipShape = { kind?: unknown; note?: unknown };

function ownershipShape(ownership: unknown): OwnershipShape {
  return (ownership ?? {}) as OwnershipShape;
}

/** Problems with an ownership: it is solo, or it is team and carries a note. */
function ownershipProblems(ownership: unknown): string[] {
  const shape = ownershipShape(ownership);

  if (shape.kind === "solo") {
    return [];
  }

  if (shape.kind === "team") {
    return isBlank(shape.note)
      ? ["Team ownership needs a note naming the collaborator's role."]
      : [];
  }

  return [
    `Ownership must be solo or team, but is ${JSON.stringify(shape.kind)}.`,
  ];
}

/**
 * Ownership on a card that prints its note. Beyond solo-or-team, a solo note
 * is required too, because the card renders it either way and a card that
 * says nothing about who built the thing reads as inflation.
 */
function renderedOwnershipProblems(ownership: unknown): string[] {
  const problems = ownershipProblems(ownership);
  const shape = ownershipShape(ownership);

  if (shape.kind === "solo" && isBlank(shape.note)) {
    problems.push("Solo ownership needs a note, because the card renders it.");
  }

  return problems;
}

/**
 * Problems with one Case Study: a Result that says what changed and states a
 * number, an ownership of solo or team that carries the note the card renders,
 * at least one Tech Tag, sound Tech Tags, and no exact money amount anywhere.
 */
export function caseStudyProblems(caseStudy: CaseStudy): string[] {
  const problems: string[] = [];

  if (isBlank(caseStudy.result)) {
    problems.push("Result is empty.");
  } else if (!statesANumber(caseStudy.result)) {
    problems.push(`Result states no number: ${caseStudy.result}`);
  }

  problems.push(...renderedOwnershipProblems(caseStudy.ownership));

  const tags = caseStudy.techTags ?? [];
  if (tags.length === 0) {
    problems.push("Case Study has no Tech Tag.");
  }

  problems.push(...techTagListProblems(tags));

  for (const text of [
    caseStudy.clientDescriptor,
    caseStudy.problem,
    caseStudy.action,
    caseStudy.result,
  ]) {
    if (typeof text === "string" && EXACT_MONEY.test(text)) {
      problems.push(`An exact money amount must stay a band, but: ${text}`);
    }
  }

  return problems;
}

/**
 * True when the link is a syntactically valid absolute http or https URL. The
 * check never opens the link: no test on this site touches the network.
 */
function isAbsoluteWebUrl(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Problems with one Project: something to open, links that are real absolute
 * URLs, a four-digit year, at least one Tech Tag, sound Tech Tags, and the
 * ownership the card prints.
 *
 * A Project may be openable through its live site or through its public repo.
 * CONTEXT.md asks only that there be something to click, and not every Project
 * has a live URL to give.
 */
export function projectProblems(project: Project): string[] {
  const problems: string[] = [];

  if (isBlank(project.name)) {
    problems.push("Project has no name.");
  }

  if (isBlank(project.summary)) {
    problems.push(`Project "${project.name}" has no summary.`);
  }

  const givenLinks = (
    [
      ["liveUrl", project.liveUrl],
      ["repoUrl", project.repoUrl],
    ] as const
  ).filter(([, url]) => url !== undefined);

  if (givenLinks.length === 0) {
    problems.push(
      "Project has nothing to open. A Project carries a live URL, a repo URL, or both.",
    );
  }

  for (const [field, url] of givenLinks) {
    if (!isAbsoluteWebUrl(url)) {
      problems.push(
        `${field} must be an absolute http or https URL, but is ${JSON.stringify(url)}.`,
      );
    }
  }

  if (!isFourDigitYear(project.year)) {
    problems.push(
      `Project "${project.name}" needs a four-digit year, but has ${JSON.stringify(project.year)}.`,
    );
  }

  const tags = project.techTags ?? [];
  if (tags.length === 0) {
    problems.push("Project has no Tech Tag.");
  }

  problems.push(...techTagListProblems(tags));
  problems.push(...renderedOwnershipProblems(project.ownership));

  return problems;
}

/**
 * Every Tech Tag anywhere in `value`, however deeply it is buried.
 *
 * The rule is that a Tech Tag *anywhere* carries a four-digit year, so this
 * walks the data instead of trusting today's layout: a later ticket may hang
 * Tech Tags off something that does not exist yet.
 *
 * A Tech Tag is recognised by its exact shape, a name and a year and nothing
 * else. Matching on those two keys alone would swallow a Project, which also
 * carries a name and a year.
 */
export function collectTechTags(value: unknown): TechTag[] {
  const found: TechTag[] = [];
  const visited = new Set<object>();

  const walk = (current: unknown): void => {
    if (current === null || typeof current !== "object") {
      return;
    }

    if (visited.has(current)) {
      return;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }

    const keys = Object.keys(current);
    if (keys.length === 2 && keys.includes("name") && keys.includes("year")) {
      found.push(current as TechTag);
      return;
    }

    Object.values(current).forEach(walk);
  };

  walk(value);
  return found;
}
