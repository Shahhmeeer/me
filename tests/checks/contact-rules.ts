/**
 * What the site may and may not publish about how to reach Shahmeer.
 *
 * The Contact Panel offers an email address, a form, and repeats the profile
 * links. A phone number is kept off the site on purpose and is easy to add
 * back by accident, so it is guarded here rather than remembered. The GitHub
 * links are guarded because a wrong one quietly points a visitor at work that
 * is not Shahmeer's. The form's words are guarded because a blank label is a
 * field a screen reader cannot name, and a failure line that forgets the
 * address leaves a visitor with no way to write.
 */

import type { ContactFormCopy, SiteLink } from "@/content/site";
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
 * The profile is linked from Home and from Contact, so an Engineer who
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

/**
 * A name a form posts a field under: what the route reads it by. Letters,
 * digits, hyphens and underscores, so it survives a form-encoded body and
 * a JSON one alike, and so a hand cannot mistype it for another.
 */
const FIELD_NAME = /^[a-zA-Z0-9_-]+$/;

/**
 * Problems with the contact form's words (ADR-0004): every label, placeholder
 * and line said, the words for a refused field included; the path it posts
 * to on this site, so the route in this repo answers it; the four fields,
 * the honeypot included, posted under four distinct names the route can
 * read; the sending label different from the Send label, because it is what
 * tells a visitor the click landed; and the failure line naming the email
 * address, because a visitor reading it has just been told the form did not
 * work, and the address is what is left.
 */
export function contactFormProblems(form: ContactFormCopy, email: string): string[] {
  const problems: string[] = [];
  const fields = [...Object.values(form.fields), form.honeypot];
  const words: Record<string, unknown> = {
    submit: form.submit,
    sending: form.sending,
    success: form.success,
    failure: form.failure,
    ...Object.fromEntries(
      Object.entries(form.problems).map(([key, value]) => [
        `${key} problem`,
        value,
      ]),
    ),
    ...Object.fromEntries(
      fields.flatMap((field) =>
        Object.entries(field).map(([key, value]) => [`${field.name} ${key}`, value]),
      ),
    ),
  };

  for (const [name, word] of Object.entries(words)) {
    if (isBlank(word)) {
      problems.push(`The form's ${name} is blank.`);
    }
  }

  if (isBlank(form.action) || !form.action.startsWith("/")) {
    problems.push(
      `The form must post to a path on this site, but posts to ${JSON.stringify(form.action)}.`,
    );
  }

  for (const field of fields) {
    if (!FIELD_NAME.test(field.name)) {
      problems.push(
        `A field name must be letters, digits, hyphens and underscores, but is ${JSON.stringify(field.name)}.`,
      );
    }
  }

  const names = fields.map((field) => field.name);
  if (new Set(names).size !== names.length) {
    problems.push(`Two fields post under one name: ${names.join(", ")}.`);
  }

  if (!isBlank(form.sending) && form.sending.trim() === form.submit.trim()) {
    problems.push(
      `The sending label must differ from the Send label, but both are ${JSON.stringify(form.submit)}.`,
    );
  }

  if (!isBlank(form.failure) && !form.failure.includes(email)) {
    problems.push(`The failure line must name ${email}, but: ${form.failure}`);
  }

  return problems;
}
