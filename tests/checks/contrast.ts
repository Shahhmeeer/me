/**
 * Colour contrast, read straight from the design tokens.
 *
 * Colour is declared once per colour scheme in `app/globals.css`, so that is
 * where this check looks. It reads the tokens the way a browser does — the
 * dark scheme is the light one with some values replaced — and measures the
 * pairs a visitor reads text in.
 *
 * It measures text only. `--portfolio-border` draws a hairline between rows
 * and around a chip; the words carry the meaning and the line is decoration,
 * so it is not held to a text threshold and is not listed below.
 *
 * The point is that a token edited to a prettier shade fails the build rather
 * than a visitor's eyes. This is deliberately not a CSS parser: it reads the
 * small, hand-written stylesheet this repo keeps, and nothing more.
 */

/** The WCAG AA threshold for text at normal size and weight. */
const AA_NORMAL_TEXT = 4.5;

/** One colour scheme: every design token, by name, as a hex string. */
export type ColourTokens = Record<string, string>;

export type ColourSchemes = {
  light: ColourTokens;
  dark: ColourTokens;
};

/** One pair of token names that meet as text on a background. */
export type ReadablePair = {
  textToken: string;
  behindToken: string;
};

/**
 * Every pair the page actually puts together. Kept as data rather than left
 * inside the assertion, so a token added later is added here once and measured
 * in both schemes for free.
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

/**
 * The two colour schemes the stylesheet declares.
 *
 * The dark scheme starts as a copy of the light one, because that is what a
 * browser sees: the dark block replaces some tokens and inherits the rest.
 */
export function colourSchemes(css: string): ColourSchemes {
  const light = customProperties(rootBlock(css));

  const darkAt = css.indexOf("prefers-color-scheme: dark");
  const darkMedia =
    darkAt === -1 ? "" : braceBlock(css, css.indexOf("{", darkAt));

  return {
    light,
    dark: { ...light, ...customProperties(rootBlock(darkMedia)) },
  };
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
 * Every readable pair that falls short, in both schemes. A missing token is a
 * problem too: a pair that cannot be measured has not been proved to pass.
 */
export function contrastProblems(schemes: ColourSchemes): string[] {
  const problems: string[] = [];

  for (const [scheme, tokens] of Object.entries(schemes)) {
    for (const { textToken, behindToken } of READABLE_PAIRS) {
      const foreground = tokens[textToken];
      const background = tokens[behindToken];

      if (foreground === undefined || background === undefined) {
        problems.push(
          `${scheme}: ${textToken} on ${behindToken} is not declared`,
        );
        continue;
      }

      const ratio = contrastRatio(foreground, background);
      if (ratio < AA_NORMAL_TEXT) {
        problems.push(
          `${scheme}: ${textToken} on ${behindToken} is ${ratio.toFixed(2)}:1, below ${AA_NORMAL_TEXT}:1`,
        );
      }
    }
  }

  return problems;
}
