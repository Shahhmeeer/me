/**
 * What the site may and may not publish about how to reach Shahmeer.
 *
 * The footer offers an email address and repeats the profile links. Two things
 * are kept off the site on purpose, and both are easy to add back by accident,
 * so both are guarded here rather than remembered.
 */

import { isBlank } from "./strings";

/**
 * A run of digits long enough to dial, allowing the spaces, dashes, dots and
 * brackets a written phone number carries.
 *
 * Seven is the shortest number worth guarding: the site states quantities in
 * digits everywhere ("around 300 questions", "150 bookings"), and a rule that
 * fired on those would be turned off within a week.
 */
const DIALLABLE_RUN = /\+?[0-9][0-9\s()\-.]{5,}[0-9]/g;

/** The digits in a candidate run, with the punctuation dropped. */
function digitCount(run: string): number {
  return (run.match(/[0-9]/g) ?? []).length;
}

/**
 * Every published string that carries something dialable.
 *
 * Shahmeer's phone number appears nowhere on the site: an address a stranger
 * can email is an invitation, a number a stranger can ring at midnight is not.
 */
export function phoneNumberProblems(strings: readonly string[]): string[] {
  const problems: string[] = [];

  for (const text of strings) {
    for (const run of text.match(DIALLABLE_RUN) ?? []) {
      if (digitCount(run) >= 7) {
        problems.push(`A phone number must not be published, but: ${text}`);
      }
    }
  }

  return problems;
}

/** A GitHub URL, and whatever path follows the host. */
const GITHUB_URL = /github\.com\/([^\s"')]*)/gi;

/**
 * Every published link to a GitHub profile.
 *
 * The profile is not linked yet, because its most recently touched repos are
 * forks of sample code and linking it would work against the site. A link to
 * one repo is fine and stays fine: it opens a named piece of work rather than
 * the profile, which is why this counts path segments instead of banning the
 * host outright.
 */
export function gitHubProfileProblems(strings: readonly string[]): string[] {
  const problems: string[] = [];

  for (const text of strings) {
    for (const [url, path] of text.matchAll(GITHUB_URL)) {
      const segments = path.split("/").filter((segment) => segment.length > 0);

      if (segments.length < 2) {
        problems.push(
          `The GitHub profile is not linked from the site yet, but: ${url}`,
        );
      }
    }
  }

  return problems;
}

/**
 * Problems with an email address: something before an at sign, and a dotted
 * host after it. The address is the site's one contact route, so a broken one
 * is a broken site.
 */
export function emailProblems(email: unknown): string[] {
  if (isBlank(email)) {
    return ["The contact email is empty."];
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email as string)
    ? []
    : [`The contact email is not an address: ${JSON.stringify(email)}`];
}
