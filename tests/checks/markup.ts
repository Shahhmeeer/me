/**
 * Reading the rendered page the way a visitor's browser does.
 *
 * The home page is rendered to static HTML in a test and these readers pull
 * out the few things that test asserts on: which elements are there, in what
 * order, and what their attributes and headings say. They read the small,
 * server-rendered markup this site produces and nothing more. This is
 * deliberately not an HTML parser: the page nests no element inside another of
 * the same name, and these readers are written for that page.
 *
 * Nothing here knows about components or class names. A redesign that keeps
 * the same landmarks, ids and headings passes without a change.
 */

/** The attributes on one opening tag, by name. A bare attribute is "". */
export type Attributes = Record<string, string>;

/** One element as it appears in the page: its attributes and its inner HTML. */
export type PageElement = {
  attributes: Attributes;
  inner: string;
};

/** One heading in reading order: its level, and its text with the tags stripped. */
export type Heading = {
  level: number;
  text: string;
};

/** The `name="value"` and bare `name` attributes written in one opening tag. */
function attributes(tag: string): Attributes {
  const found: Attributes = {};

  for (const [, name, value] of tag.matchAll(
    /([a-zA-Z-]+)(?:="([^"]*)")?/g,
  )) {
    found[name] = value ?? "";
  }

  return found;
}

/**
 * The text a visitor reads inside a piece of HTML: the tags stripped and the
 * entities React writes turned back into characters.
 */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The text as React writes it into HTML: the inverse of `textOf`, for finding
 * a sentence from the content module inside the page's markup.
 */
function htmlOf(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** The text as a pattern that matches it and nothing else. */
function literal(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every `<tag ...>...</tag>` in the HTML, in document order. Assumes no such
 * element sits inside another of the same name, which holds for the page.
 */
export function elements(html: string, tag: string): PageElement[] {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g");

  return [...html.matchAll(pattern)].map(([, tagAttributes, inner]) => ({
    attributes: attributes(tagAttributes),
    inner,
  }));
}

/**
 * Every `<img>` in the HTML, in document order, as its attributes. An image
 * has no inner HTML and no closing tag, so it is read on its own rather than
 * by `elements`.
 */
export function images(html: string): Attributes[] {
  return [...html.matchAll(/<img\b([^>]*?)\/?>/g)].map(([, tagAttributes]) =>
    attributes(tagAttributes),
  );
}

/**
 * Every element id written in the HTML, in document order, with repeats
 * kept: a hash in the address lands on an id, and two elements with one id
 * would leave the browser to pick.
 */
export function idsOf(html: string): string[] {
  return [...html.matchAll(/<[a-zA-Z][^>]*?\sid="([^"]*)"/g)].map(([, id]) => id);
}

/**
 * What follows the opening tag carrying this id, once per element that
 * carries it: the HTML a hash naming the id lands at the head of. One entry
 * is the landing; none is a dead link; two is a browser left to pick.
 */
export function afterId(html: string, id: string): string[] {
  const opening = new RegExp(`<[a-zA-Z][^>]*?\\sid="${literal(id)}"[^>]*>`, "g");

  return [...html.matchAll(opening)].map(
    (match) => html.slice((match.index ?? 0) + match[0].length),
  );
}

/** True when each string appears in the text after the one before it. */
export function inOrder(text: string, parts: string[]): boolean {
  let from = 0;
  for (const part of parts) {
    const at = text.indexOf(part, from);
    if (at === -1) {
      return false;
    }
    from = at + part.length;
  }
  return true;
}

/**
 * One Spread of a Panel, as read: its eyebrow, and the HTML after its line,
 * up to the next Spread's line.
 */
export type Spread = {
  eyebrow: string;
  after: string;
};

/**
 * The `NN / NN` counter of a Spread, zero-padded to two digits. Written
 * here rather than imported from the component, so a test reads what a
 * visitor sees and not what the code says it draws.
 */
export function counter(position: number, count: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(position)} / ${pad(count)}`;
}

/**
 * The Spreads of one Panel, read from the Panel's inner HTML. Every Spread
 * opens with its eyebrow, the Panel's label and, where the Panel has more
 * than one Spread, its position as `NN / NN`, and says the Panel's line
 * under it as a paragraph; so the text before each saying of the line ends
 * with an eyebrow, and what follows the line, up to the next saying of it,
 * is the Spread's own and then the next Spread's eyebrow, which is words
 * and no card, so a card counted after a line is that Spread's. A Panel of
 * one Spread, or one still on the row layout, says its label and its line
 * once and is one Spread here.
 */
export function spreadsOf(
  inner: string,
  panel: { label: string; line: string },
): Spread[] {
  const eyebrow = new RegExp(`${literal(panel.label)}( · \\d\\d / \\d\\d)?$`);
  const line = new RegExp(`<p\\b[^>]*>${literal(htmlOf(panel.line))}</p>`);
  const segments = inner.split(line);

  return segments.slice(1).map((body, index) => {
    const before = textOf(segments[index]);

    return { eyebrow: before.match(eyebrow)?.[0] ?? before, after: body };
  });
}

/** Every heading in the HTML, in reading order. */
export function headingsOf(html: string): Heading[] {
  return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map(
    ([, level, inner]) => ({ level: Number(level), text: textOf(inner) }),
  );
}

/**
 * Problems with the heading outline: exactly one `<h1>`, and no heading more
 * than one level deeper than the one before it. A search engine and a screen
 * reader both read the page as this outline, so a skipped level is a hole in
 * the document.
 */
export function outlineProblems(found: Heading[]): string[] {
  const problems: string[] = [];
  const topLevel = found.filter((heading) => heading.level === 1);

  if (topLevel.length !== 1) {
    problems.push(
      `The page must have one <h1>, but has ${topLevel.length}: ${topLevel.map((heading) => heading.text).join(", ")}`,
    );
  }

  found.forEach((heading, index) => {
    const previous = found[index - 1];
    const deepestAllowed = previous === undefined ? 1 : previous.level + 1;

    if (heading.level > deepestAllowed) {
      problems.push(
        `"${heading.text}" is an <h${heading.level}> after an <h${previous?.level ?? 0}>, skipping a level`,
      );
    }
  });

  return problems;
}
