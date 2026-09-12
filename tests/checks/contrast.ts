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
 * not held to a text threshold and is not listed below. `--portfolio-accent-
 * border` is the same: teal fails AA as text on this ground, so it draws
 * borders and shapes and never a word.
 *
 * The point is that a token edited to a prettier shade fails the build rather
 * than a visitor's eyes. This is deliberately not a CSS parser: it reads the
 * small, hand-written stylesheet this repo keeps, and nothing more.
 */

/** The WCAG AA threshold for text at normal size and weight. */
const AA_NORMAL_TEXT = 4.5;

/** Every design token, by name, as the value written in the stylesheet. */
export type ColourTokens = Record<string, string>;

/** One pair of token names that meet as text on a background. */
export type ReadablePair = {
  textToken: string;
  behindToken: string;
};

/**
 * Every pair the page actually puts together. Kept as data rather than left
 * inside the assertion, so a token added later is added here once.
 */
export const READABLE_PAIRS: ReadablePair[] = [
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

/**
 * Every readable pair that falls short. A missing token is a problem too: a
 * pair that cannot be measured has not been proved to pass.
 */
export function contrastProblems(tokens: ColourTokens): string[] {
  const problems: string[] = [];

  for (const { textToken, behindToken } of READABLE_PAIRS) {
    const foreground = tokens[textToken];
    const background = tokens[behindToken];

    if (foreground === undefined || background === undefined) {
      problems.push(`${textToken} on ${behindToken} is not declared`);
      continue;
    }

    const ratio = contrastRatio(foreground, background);
    if (ratio < AA_NORMAL_TEXT) {
      problems.push(
        `${textToken} on ${behindToken} is ${ratio.toFixed(2)}:1, below ${AA_NORMAL_TEXT}:1`,
      );
    }
  }

  return problems;
}

/**
 * Shahmeer's palette, from `public/portfolio-pallete.pdf`: the five colours
 * the whole theme is built from. Every other token is derived from one of
 * these, so if one of them is not a token value the look has drifted.
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

/** Every `selector { body }` in the text, at any nesting depth. */
function styleRules(css: string): { selector: string; body: string }[] {
  const written = css.replace(/\/\*[\s\S]*?\*\//g, " ");
  const rules: { selector: string; body: string }[] = [];
  let selectorStart = 0;

  for (let index = 0; index < written.length; index += 1) {
    const character = written[index];

    if (character === "{") {
      const body = braceBlock(written, index);
      rules.push({ selector: written.slice(selectorStart, index).trim(), body });
      selectorStart = index + 1;
    } else if (character === "}" || character === ";") {
      selectorStart = index + 1;
    }
  }

  return rules;
}

/**
 * Every `:hover` or `:focus-within` rule that moves what it styles.
 *
 * The rule of the site is that hover is quiet: a border may change colour and
 * nothing may lift, slide or grow. `transform: none` is allowed, because it is
 * how the reveal hands a block over on focus, and switching movement off is
 * not movement.
 */
export function liftProblems(css: string): string[] {
  const problems: string[] = [];

  for (const { selector, body } of styleRules(css)) {
    if (!/:(hover|focus-within)\b/.test(selector)) {
      continue;
    }

    for (const [, , property, value] of body.matchAll(MOVING_PROPERTY)) {
      if (value.trim() !== "none") {
        problems.push(
          `${selector} sets ${property}: ${value.trim()}; hover and focus may only recolour`,
        );
      }
    }
  }

  return problems;
}
