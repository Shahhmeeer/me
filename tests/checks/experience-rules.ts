/**
 * What makes the Experience block and the Education entry fit to ship.
 *
 * A Recruiter reads this block to check the dates line up, so a date that is
 * malformed or that runs backwards is a failure, not a typo. Like the other
 * rule modules these read data only: they say nothing about markup, class
 * names or components, so a redesign cannot break them.
 */

import type { Education, ExperienceEntry, Highlight } from "@/content/site";
import { countSentences, isMonthYear, monthYearIndex } from "./prose";
import { isBlank } from "./strings";

/** The end date the site prints for a role that has not ended. */
export const PRESENT = "Present";

/**
 * Problems with a start and an end date: both are printed as a month and a
 * year, and the end does not come before the start.
 *
 * `allowPresent` is given only to a role, because a role can still be running.
 * A finished degree cannot, so Education is checked without it.
 */
function dateRangeProblems(
  subject: string,
  start: unknown,
  end: unknown,
  allowPresent: boolean,
): string[] {
  const problems: string[] = [];

  if (!isMonthYear(start)) {
    problems.push(
      `${subject} needs a start date like "May 2024", but has ${JSON.stringify(start)}.`,
    );
  }

  const endIsPresent = allowPresent && end === PRESENT;
  if (!endIsPresent && !isMonthYear(end)) {
    const allowed = allowPresent ? `"April 2026" or "${PRESENT}"` : '"April 2026"';
    problems.push(
      `${subject} needs an end date like ${allowed}, but has ${JSON.stringify(end)}.`,
    );
  }

  const from = monthYearIndex(start);
  const to = monthYearIndex(end);
  if (from !== null && to !== null && to < from) {
    problems.push(`${subject} ends before it starts: ${start} to ${end}.`);
  }

  return problems;
}

/**
 * Problems with one Highlight: an id to key it by, and one sentence of real
 * work. One sentence is the whole point of a Highlight — work that earns a
 * paragraph earns a Case Study instead.
 */
export function highlightProblems(highlight: Highlight): string[] {
  const problems: string[] = [];

  if (isBlank(highlight.id)) {
    problems.push("Highlight has no id.");
  }

  if (isBlank(highlight.line)) {
    problems.push(`Highlight "${highlight.id}" is empty.`);
    return problems;
  }

  const count = countSentences(highlight.line.trim());
  if (count !== 1) {
    problems.push(
      `A Highlight is one line, but "${highlight.line}" holds ${count} sentences.`,
    );
  }

  return problems;
}

/**
 * Problems with one role: the employer, title and location a Recruiter matches
 * against, a date range that reads forwards, and sound Highlights.
 *
 * Remote status is a boolean, so it cannot be malformed and is not checked. A
 * role with no Highlight is allowed: a role can be too new to have one.
 */
export function experienceEntryProblems(entry: ExperienceEntry): string[] {
  const problems: string[] = [];

  const named: [string, unknown][] = [
    ["employer", entry.employer],
    ["title", entry.title],
    ["location", entry.location],
  ];

  for (const [field, value] of named) {
    if (isBlank(value)) {
      problems.push(`Role "${entry.id}" has no ${field}.`);
    }
  }

  problems.push(
    ...dateRangeProblems(`Role "${entry.id}"`, entry.start, entry.end, true),
  );

  problems.push(...(entry.highlights ?? []).flatMap(highlightProblems));

  return problems;
}

/** Problems with the Education entry: a qualification, a school, and dates. */
export function educationProblems(education: Education): string[] {
  const problems: string[] = [];

  const named: [string, unknown][] = [
    ["qualification", education.qualification],
    ["institution", education.institution],
  ];

  for (const [field, value] of named) {
    if (isBlank(value)) {
      problems.push(`Education has no ${field}.`);
    }
  }

  problems.push(
    ...dateRangeProblems("Education", education.start, education.end, false),
  );

  return problems;
}

/**
 * Every role whose dates overlap another's, reported once per pair.
 *
 * A Recruiter reads this block for gaps and overlaps, so two roles claiming
 * the same months is the one history error worth failing the build over.
 * A role still running is treated as ending far in the future.
 */
export function overlappingRoleProblems(
  entries: readonly ExperienceEntry[],
): string[] {
  const problems: string[] = [];
  const spans = entries.map((entry) => ({
    entry,
    from: monthYearIndex(entry.start),
    to: entry.end === PRESENT ? Infinity : monthYearIndex(entry.end),
  }));

  for (let i = 0; i < spans.length; i += 1) {
    for (let j = i + 1; j < spans.length; j += 1) {
      const a = spans[i];
      const b = spans[j];

      if (a.from === null || a.to === null || b.from === null || b.to === null) {
        continue;
      }

      // Touching months are fine: one role ending in April and the next
      // starting in May is a handover, not an overlap.
      if (a.from < b.to && b.from < a.to) {
        problems.push(
          `Roles "${a.entry.id}" and "${b.entry.id}" claim the same months.`,
        );
      }
    }
  }

  return problems;
}
