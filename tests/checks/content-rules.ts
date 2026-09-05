/**
 * What makes a Case Study or a Project complete enough to ship.
 *
 * Each function returns a list of problems in plain words. An empty list means
 * the item is sound. These rules read data only: they say nothing about
 * markup, class names or components, so a redesign cannot break them.
 */

import type { CaseStudy, Project, TechTag } from "@/content/site";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

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
 * Takes `unknown` on purpose. The type says solo or team, but this check
 * exists to catch content that does not keep that promise.
 */
function ownershipProblems(ownership: unknown): string[] {
  const shape = (ownership ?? {}) as { kind?: unknown; note?: unknown };

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
 * Problems with one Case Study: a Result that says what changed, an ownership
 * of solo or team, a collaborator note whenever it is team, and sound Tech
 * Tags.
 */
export function caseStudyProblems(caseStudy: CaseStudy): string[] {
  const problems: string[] = [];

  if (isBlank(caseStudy.result)) {
    problems.push("Result is empty.");
  }

  problems.push(...ownershipProblems(caseStudy.ownership));
  problems.push(...techTagListProblems(caseStudy.techTags ?? []));

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
 * Problems with one Project: a link a visitor can actually open, at least one
 * Tech Tag, and sound Tech Tags.
 */
export function projectProblems(project: Project): string[] {
  const problems: string[] = [];

  if (!isAbsoluteWebUrl(project.liveUrl)) {
    problems.push(
      `liveUrl must be an absolute http or https URL, but is ${JSON.stringify(project.liveUrl)}.`,
    );
  }

  const tags = project.techTags ?? [];
  if (tags.length === 0) {
    problems.push("Project has no Tech Tag.");
  }

  problems.push(...techTagListProblems(tags));

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
