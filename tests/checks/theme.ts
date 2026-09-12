/**
 * Colour contrast, read straight from the design tokens.
 *
 * Colour is declared once, on `:root` in `app/globals.css`, so that is where
 * this check looks. It reads the tokens the way a browser does and measures
 * the pairs a visitor reads text in. The site has one colour scheme (ADR-0002),
 * so there is one set of tokens and nothing to inherit or replace.
 *
 * It measures text only. `--portfolio-border` draws a hairline around a card
 * and a chip; the words carry the meaning and the line is decoration, so it is
 * not held to any threshold and is not listed below. Teal fails AA as text on
 * this ground, so `--portfolio-accent-border` draws borders and shapes and
 * never a word; as the hover border of a card it is held to the lower line
 * threshold instead.
 *
 * The point is that a token edited to a prettier shade fails the build rather
 * than a visitor's eyes. This is deliberately not a CSS parser: it reads the
 * small, hand-written stylesheet this repo keeps, and nothing more.
 */

/** The WCAG AA threshold for text at normal size and weight. */
const AA_NORMAL_TEXT = 4.5;

/** The WCAG AA threshold for a line that marks out a component. */
const AA_NON_TEXT = 3;

/** Every design token, by name, as the value written in the stylesheet. */
export type ColourTokens = Record<string, string>;

/** One pair of token names that meet as text, or a line, on a background. */
export type ColourPair = {
  textToken: string;
  behindToken: string;
};

/**
 * Every pair the page actually puts together. Kept as data rather than left
 * inside the assertion, so a token added later is added here once.
 */
export const READABLE_PAIRS: ColourPair[] = [
  {
    textToken: "--portfolio-foreground",
    behindToken: "--portfolio-background",
  },
  { textToken: "--portfolio-muted", behindToken: "--portfolio-background" },
  { textToken: "--portfolio-accent", behindToken: "--portfolio-background" },
  { textToken: "--portfolio-foreground", behindToken: "--portfolio-surface" },
  { textToken: "--portfolio-muted", behindToken: "--portfolio-surface" },
  { textToken: "--portfolio-accent", behindToken: "--portfolio-surface" },
  { textToken: "--portfolio-on-accent", behindToken: "--portfolio-accent" },
  { textToken: "--portfolio-on-action", behindToken: "--portfolio-action" },
];

/**
 * The lines that mark something out and must be seen: the teal border a card
 * wears on hover, against the card and against the page. Held to the lower,
 * non-text threshold, because a line carries no words.
 */
export const VISIBLE_LINES: ColourPair[] = [
  {
    textToken: "--portfolio-accent-border",
    behindToken: "--portfolio-surface",
  },
  {
    textToken: "--portfolio-accent-border",
    behindToken: "--portfolio-background",
  },
];

/**
 * The body of the brace block that starts at `openIndex`, braces balanced, so
 * a nested block does not end the outer one early.
 */
function braceBlock(css: string, openIndex: number): string {
  let depth = 0;

  for (let index = openIndex; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1;
    } else if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return css.slice(openIndex + 1, index);
      }
    }
  }

  return css.slice(openIndex + 1);
}

/** The first `:root { ... }` body in the given text, or "" when there is none. */
function rootBlock(css: string): string {
  const selectorAt = css.indexOf(":root");
  if (selectorAt === -1) {
    return "";
  }

  return braceBlock(css, css.indexOf("{", selectorAt));
}

/** Every `--name: value` in a block, by name. A commented one does not count. */
function customProperties(block: string): ColourTokens {
  const properties: ColourTokens = {};
  const written = block.replace(/\/\*[\s\S]*?\*\//g, " ");

  for (const [, name, value] of written.matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
  )) {
    properties[name] = value.trim();
  }

  return properties;
}

/** The colour tokens the stylesheet declares on `:root`. */
export function colourTokens(css: string): ColourTokens {
  return customProperties(rootBlock(css));
}

/** The red, green and blue of a hex colour, each from 0 to 1. */
function channels(hex: string): [number, number, number] {
  const digits = hex.replace("#", "");
  const expanded =
    digits.length === 3 || digits.length === 4
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;

  return [0, 2, 4].map(
    (offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255,
  ) as [number, number, number];
}

/** Relative luminance, as WCAG 2 defines it. */
function luminance(hex: string): number {
  const [red, green, blue] = channels(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** How far apart two colours are, from 1 (the same) to 21 (black on white). */
export function contrastRatio(one: string, other: string): number {
  const [darker, lighter] = [luminance(one), luminance(other)].sort(
    (first, second) => first - second,
  );

  return (lighter + 0.05) / (darker + 0.05);
}

/** Every pair in the list that falls short of the threshold. */
function shortfalls(
  tokens: ColourTokens,
  pairs: ColourPair[],
  threshold: number,
): string[] {
  const problems: string[] = [];

  for (const { textToken, behindToken } of pairs) {
    const foreground = tokens[textToken];
    const background = tokens[behindToken];

    if (foreground === undefined || background === undefined) {
      problems.push(`${textToken} on ${behindToken} is not declared`);
      continue;
    }

    const ratio = contrastRatio(foreground, background);
    if (ratio < threshold) {
      problems.push(
        `${textToken} on ${behindToken} is ${ratio.toFixed(2)}:1, below ${threshold}:1`,
      );
    }
  }

  return problems;
}

/**
 * Every readable pair and every visible line that falls short. A missing token
 * is a problem too: a pair that cannot be measured has not been proved to pass.
 */
export function contrastProblems(tokens: ColourTokens): string[] {
  return [
    ...shortfalls(tokens, READABLE_PAIRS, AA_NORMAL_TEXT),
    ...shortfalls(tokens, VISIBLE_LINES, AA_NON_TEXT),
  ];
}

/**
 * Shahmeer's palette, the five colours the whole theme is built from. The
 * source is `public/portfolio-pallete.pdf`, kept on disk and never committed.
 * Every other token is derived from one of these, so if one of them is not a
 * token value the look has drifted.
 */
export const PALETTE = [
  "#1F1E1E",
  "#E3D9DA",
  "#077D7E",
  "#6ED6D4",
  "#DA7A7A",
] as const;

/** Every palette colour that no token carries. */
export function paletteProblems(tokens: ColourTokens): string[] {
  const values = new Set(
    Object.values(tokens).map((value) => value.toLowerCase()),
  );

  return PALETTE.filter((hex) => !values.has(hex.toLowerCase())).map(
    (hex) => `${hex} is in the palette but is not the value of any token`,
  );
}

/**
 * The properties that move an element. `transform` and the three properties
 * that split it out: any of these on hover is a lift by another name.
 */
const MOVING_PROPERTY = /(^|;)\s*(transform|translate|scale|rotate)\s*:\s*([^;]+)/gi;

/**
 * One rule as written: its selector, the declarations it writes itself, and
 * the blocks that enclose it, outermost first. A layer, a media query or a
 * nested `@variant` is a rule like any other, so a declaration is read once,
 * in the rule that wrote it, and the blocks around it say where it applies.
 */
type StyleRule = {
  selector: string;
  declarations: string;
  enclosing: string[];
};

/** True when the rule, or any block enclosing it, satisfies the test. */
function appliesUnder(rule: StyleRule, test: (selector: string) => boolean): boolean {
  return [...rule.enclosing, rule.selector].some(test);
}

/** Every rule in the text, at any nesting depth. */
function styleRules(css: string): StyleRule[] {
  const rules: StyleRule[] = [];

  /** Walks one block, records its rules, and returns its own declarations. */
  function walk(block: string, enclosing: string[]): string {
    let own = "";
    let start = 0;

    for (let index = 0; index < block.length; index += 1) {
      const character = block[index];

      if (character === "{") {
        const selector = block.slice(start, index).trim();
        const body = braceBlock(block, index);
        const declarations = walk(body, [...enclosing, selector]);
        rules.push({ selector, declarations, enclosing });
        index += body.length + 1;
        start = index + 1;
      } else if (character === ";") {
        own += block.slice(start, index + 1);
        start = index + 1;
      }
    }

    return own;
  }

  walk(css.replace(/\/\*[\s\S]*?\*\//g, " "), []);
  return rules;
}

/**
 * True for a selector that applies on hover or focus-within. An at-rule is
 * never one: `@media (hover: hover)` says the visitor has a pointer, not that
 * it is over anything.
 */
function isHoverSelector(selector: string): boolean {
  return !selector.startsWith("@") && /:(hover|focus-within)\b/.test(selector);
}

/**
 * Every `:hover` or `:focus-within` rule that moves what it styles.
 *
 * The rule of the site is that hover is quiet: a border may change colour and
 * nothing may lift, slide or grow. `transform: none` is allowed, because it is
 * how the reveal hands a block over on focus, and switching movement off is
 * not movement. A block nested under a hover rule is hover too.
 */
export function liftProblems(css: string): string[] {
  const problems: string[] = [];

  for (const rule of styleRules(css)) {
    if (!appliesUnder(rule, isHoverSelector)) {
      continue;
    }
    const { selector, declarations } = rule;

    for (const [, , property, value] of declarations.matchAll(MOVING_PROPERTY)) {
      if (value.trim() !== "none") {
        problems.push(
          `${selector} sets ${property}: ${value.trim()}; hover and focus may only recolour`,
        );
      }
    }
  }

  return problems;
}

/**
 * The declarations that move something over time: a transition, an animation,
 * and a smooth scroll. Each is read with its value, because `none` and `auto`
 * are how movement is switched off.
 */
const MOVING_OVER_TIME =
  /(^|;)\s*(transition|animation|scroll-behavior)\s*:\s*([^;]+)/gi;

/** The media query that says a visitor has not asked for less movement. */
const MOTION_WELCOME = /prefers-reduced-motion\s*:\s*no-preference/;

/**
 * Every movement a visitor cannot switch off.
 *
 * The site moves only where motion is welcome: the reveal, the card's border
 * fade, the slide between Panels and, later, the Blobs all live inside
 * `prefers-reduced-motion: no-preference`, so a visitor who has asked for less
 * movement is handed a page that never moved. This holds every transition,
 * animation and smooth scroll to that block; one written outside it would
 * need its own reduce rule to switch it off, and that rule can be forgotten.
 */
export function motionProblems(css: string): string[] {
  const problems: string[] = [];

  for (const rule of styleRules(css)) {
    if (appliesUnder(rule, (part) => MOTION_WELCOME.test(part))) {
      continue;
    }
    const { selector, declarations } = rule;

    for (const [, , property, value] of declarations.matchAll(MOVING_OVER_TIME)) {
      const written = value.trim();
      const moving =
        property.toLowerCase() === "scroll-behavior"
          ? written === "smooth"
          : written !== "none";

      if (moving) {
        problems.push(
          `${selector} sets ${property}: ${written} outside prefers-reduced-motion: no-preference`,
        );
      }
    }
  }

  return problems;
}

/** A colour with an alpha channel below one: `rgb(39 38 38 / 0.72)`. */
const TRANSLUCENT = /\/\s*0?\.\d+\s*\)$/;

/**
 * Problems with the Nav's frosting.
 *
 * The Nav floats over whatever slides under it, so it is painted on a
 * translucent surface with a backdrop blur: the blur is what makes the pill
 * read as glass rather than as a hole in the page. A rule that blurs its
 * backdrop must paint its background from a token, and that token must be
 * translucent, or the blur has nothing to show through.
 */
export function frostingProblems(css: string, tokens: ColourTokens): string[] {
  const frosted = styleRules(css).filter(({ declarations }) =>
    /(^|;)\s*backdrop-filter\s*:\s*blur/.test(declarations),
  );

  if (frosted.length === 0) {
    return ["No rule blurs its backdrop, so nothing on the page is frosted"];
  }

  const problems: string[] = [];

  for (const { selector, declarations } of frosted) {
    const token = declarations.match(/(^|;)\s*background\s*:\s*var\((--[a-z0-9-]+)\)/)?.[2];
    const value = token === undefined ? undefined : tokens[token];

    if (value === undefined) {
      problems.push(`${selector} blurs its backdrop but paints no token behind it`);
    } else if (!TRANSLUCENT.test(value)) {
      problems.push(`${selector} is frosted but ${token} is ${value}, which nothing shows through`);
    }
  }

  return problems;
}
