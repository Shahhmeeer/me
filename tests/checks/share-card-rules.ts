/**
 * What makes the Share Card fit to ship.
 *
 * A shared link is the site's first impression in a chat window or a search
 * result, and it is read without the page. So the card must name Shahmeer and
 * the Headline on its own, and every URL on it must point at the one live
 * origin, because a card that points at a preview deploy is a broken link the
 * moment that preview is gone.
 */

import type { Contact, ShareCard } from "@/content/site";
import { mentionsName } from "./profile-rules";
import { isBlank } from "./strings";

/** Every way the card fails to stand for the site on its own. */
export function shareCardProblems(card: ShareCard, contact: Contact): string[] {
  const problems: string[] = [];

  if (isBlank(card.title)) {
    problems.push("The Share Card title is blank.");
  } else {
    if (!mentionsName(card.title, contact.name)) {
      problems.push(`The Share Card title must name ${contact.name}: ${card.title}`);
    }
    if (!mentionsName(card.title, contact.headline)) {
      problems.push(
        `The Share Card title must carry the Headline "${contact.headline}": ${card.title}`,
      );
    }
  }

  if (isBlank(card.description)) {
    problems.push("The Share Card description is blank.");
  }

  if (isBlank(card.imageAlt)) {
    problems.push("The Share Card image needs alt text.");
  }

  problems.push(...canonicalUrlProblems(card.url));

  return problems;
}

/**
 * The canonical URL is an https origin and nothing more: no path, no query, no
 * trailing slash. Next.js composes every other URL on the card from it, so a
 * stray path here would be repeated on all of them.
 */
export function canonicalUrlProblems(url: string): string[] {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [`The canonical URL is not an absolute URL: ${url}`];
  }

  const problems: string[] = [];

  if (parsed.protocol !== "https:") {
    problems.push(`The canonical URL must be https: ${url}`);
  }
  if (parsed.origin !== url) {
    problems.push(`The canonical URL must be a bare origin, no path or slash: ${url}`);
  }

  return problems;
}
