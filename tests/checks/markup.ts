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
