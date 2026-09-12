/**
 * What the site may and may not publish about how to reach Shahmeer.
 *
 * The footer offers an email address and repeats the profile links. A phone
 * number is kept off the site on purpose and is easy to add back by accident,
 * so it is guarded here rather than remembered. The GitHub links are guarded
 * because a wrong one quietly points a visitor at work that is not Shahmeer's.
 */

import type { SiteLink } from "@/content/site";
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
    // One problem per string, not per run. The reader is being sent to a
    // string to rewrite it, and being sent there twice tells them nothing new.
    const dialable = (text.match(DIALLABLE_RUN) ?? []).some(
      (run) => digitCount(run) >= 7,
    );

    if (dialable) {
      problems.push(`A phone number must not be published, but: ${text}`);
    }
  }

  return problems;
}

/** A GitHub URL, and whatever path follows the host. */
const GITHUB_URL = /https?:\/\/github\.com\/([^\s"')]*)/gi;

/** The segments of a URL path, with the empty one a trailing slash leaves dropped. */
function pathSegments(path: string): string[] {
  return path.split("/").filter((segment) => segment.length > 0);
}

/** True when the two GitHub logins name the same account: GitHub ignores case. */
function sameLogin(a: string | undefined, b: string | undefined): boolean {
  return (
    a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase()
  );
}

/**
 * Problems with the GitHub links the site publishes.
 *
 * The profile is linked from the Header and the footer, so an Engineer who
 * follows it lands on Shahmeer's own repos. Two things keep it worth linking:
 * the link must open the profile itself, one account over https and nothing
 * after it, and every other GitHub URL on the site must be a repo under that
 * account. A repo that belongs to someone else is not proof of anything
 * Shahmeer did.
 */
export function gitHubLinkProblems(
  profile: SiteLink,
  strings: readonly string[],
): string[] {
  const problems: string[] = [];
  const [login, ...deeper] = pathSegments(
    profile.href.replace(/^https:\/\/github\.com\//, ""),
  );

  if (
    !profile.href.startsWith("https://github.com/") ||
    login === undefined ||
    deeper.length > 0
  ) {
    problems.push(
      `The GitHub link must open one account over https, but: ${profile.href}`,
    );
  }

  for (const text of strings) {
    for (const [url, path] of text.matchAll(GITHUB_URL)) {
      if (url === profile.href) {
        continue;
      }

      const [owner, repo] = pathSegments(path);

      if (
        !url.startsWith("https://") ||
        !sameLogin(owner, login) ||
        repo === undefined
      ) {
        problems.push(
          `A GitHub link must be a repo under the profile ${profile.href}, but: ${url}`,
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
