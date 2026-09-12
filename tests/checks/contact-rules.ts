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

/** The path segments of a GitHub URL, with the empty ones a trailing slash leaves dropped. */
function gitHubPath(url: string): string[] {
  const match = /github\.com\/([^\s"')]*)/i.exec(url);

  return (match?.[1] ?? "").split("/").filter((segment) => segment.length > 0);
}

/**
 * Problems with the GitHub links the site publishes.
 *
 * The profile is linked from the Header and the footer, now that its most
 * recently touched repos are Shahmeer's own work rather than forks of sample
 * code. Two things keep it worth linking: the link must open the profile
 * itself, one account and nothing after it, and every other GitHub URL on the
 * site must be a repo under that account. A repo that belongs to someone else
 * is not proof of anything Shahmeer did.
 */
export function gitHubLinkProblems(
  profile: SiteLink,
  strings: readonly string[],
): string[] {
  const problems: string[] = [];
  const account = gitHubPath(profile.href);

  if (!profile.href.startsWith("https://github.com/") || account.length !== 1) {
    problems.push(
      `The GitHub link must open one account over https, but: ${profile.href}`,
    );
  }

  for (const text of strings) {
    for (const [url] of text.matchAll(GITHUB_URL)) {
      const [owner] = gitHubPath(url);

      if (owner !== account[0]) {
        problems.push(
          `A GitHub link must belong to the profile ${profile.href}, but: ${url}`,
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
