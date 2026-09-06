/**
 * How a published date or sentence is shaped.
 *
 * Certifications, Experience and Education all print a month and a year, and
 * both the About block and a Highlight are held to one sentence. Those shapes
 * live here once, so two rule modules cannot drift apart on what a date is.
 */

/** The months as the site writes them, in calendar order. */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** A month and a year as a Recruiter reads them, for example "January 2024". */
const MONTH_YEAR = new RegExp(`^(${MONTH_NAMES.join("|")}) [0-9]{4}$`);

/**
 * True when a value is a month and a year exactly as the site prints them.
 *
 * Takes `unknown` on purpose. The types say these fields are required strings;
 * these checks exist to catch content that does not keep that promise.
 */
export function isMonthYear(value: unknown): boolean {
  return typeof value === "string" && MONTH_YEAR.test(value);
}

/**
 * A month and a year as one number that sorts in calendar order, or null when
 * the value is not a month and a year. Comparing two of these is how a date
 * range is checked for running backwards.
 */
export function monthYearIndex(value: unknown): number | null {
  if (!isMonthYear(value)) {
    return null;
  }

  const [month, year] = (value as string).split(" ");
  return Number(year) * 12 + MONTH_NAMES.indexOf(month as (typeof MONTH_NAMES)[number]);
}

/**
 * Sentences in a piece of copy.
 *
 * A full stop only ends a sentence when the text stops there or a capital
 * letter follows, so "e.g. a portal" counts as one sentence, not two.
 */
export function countSentences(text: string): number {
  return (text.match(/[.!?]( +[A-Z]|$)/g) ?? []).length;
}
