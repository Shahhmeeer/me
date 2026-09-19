/**
 * Colour contrast, read straight from the design tokens.
 *
 * Colour is declared once, on `:root` in `app/globals.css`, so that is where
 * this check looks. It reads the tokens the way a browser does and measures
 * the pairs a visitor reads text in. The site has one colour scheme (ADR-0006),
 * so there is one set of tokens and nothing to inherit or replace.
 *
 * It measures text only. `--portfolio-border` draws a hairline around a card
 * and a chip; the words carry the meaning and the line is decoration, so it is
 * not held to any threshold and is not listed below. `--portfolio-accent-border`
 * draws the hover border of a card, and as a line it is held to the lower
 * line threshold; the focus ring is drawn in `--portfolio-accent`, which is
 * measured as text. On the light page the two are one colour, Deep Sky, so
 * the line measured here is the ring's colour as well.
 *
 * Every text pair is held to the normal-text line, 4.5:1, whatever size it is
 * drawn at: a caption at 13px is normal text, and the Headline, which could
 * claim the large-text line, passes the stricter one, so there is no size to
 * carry per pair.
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

/**
 * One pair of token names that meet as text, or a line, on a background.
 * A translucent background is laid over `groundToken` before it is measured,
 * because a visitor reads the text on whatever shows through.
 */
export type ColourPair = {
  textToken: string;
  behindToken: string;
  groundToken?: string;
};

/** The pill's text: read on the frosted surface laid over the ground. */
function onThePill(textToken: string): ColourPair {
  return {
    textToken,
    behindToken: "--portfolio-surface-frosted",
    groundToken: "--portfolio-background",
  };
}

/**
 * Every pair the page actually puts together. Kept as data rather than left
 * inside the assertion, so a token added later is added here once.
 *
 * The body and muted inks and the accent sit on the ground, on a card and on
 * the pill: the Nav's links are muted, lit in the accent and turn to the body
 * ink under a pointer, and the Bar's hint is muted. The pill floats over the
 * ground, the darkest thing it ever has under it, since a card is lighter,
 * so that is what it is laid over. The button's label sits on the blush, the
 * tab icon's initials on the accent, and a Tech Tag's name and its year on
 * the chip.
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
  onThePill("--portfolio-foreground"),
  onThePill("--portfolio-muted"),
  onThePill("--portfolio-accent"),
  { textToken: "--portfolio-on-accent", behindToken: "--portfolio-accent" },
  { textToken: "--portfolio-on-action", behindToken: "--portfolio-action" },
  { textToken: "--portfolio-foreground", behindToken: "--portfolio-chip" },
  { textToken: "--portfolio-muted", behindToken: "--portfolio-chip" },
];

/**
 * The lines that mark something out and must be seen: the Deep Sky border a
 * card wears on hover, against the card and against the page. Held to the
 * lower, non-text threshold, because a line carries no words.
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

/** The text with every comment blanked, so a commented-out rule is not read. */
function uncommented(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ");
}

/** Every `--name: value` in a block, by name. A commented one does not count. */
function customProperties(block: string): ColourTokens {
  const properties: ColourTokens = {};

  for (const [, name, value] of uncommented(block).matchAll(
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

/** The red, green and blue of a hex colour, each from 0 to 255. */
function hexChannels(hex: string): [number, number, number] {
  const digits = hex.replace("#", "");
  const expanded =
    digits.length === 3 || digits.length === 4
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;

  return [0, 2, 4].map((offset) =>
    Number.parseInt(expanded.slice(offset, offset + 2), 16),
  ) as [number, number, number];
}

/**
 * A colour as written in the stylesheet, `#rrggbb` or `rgb(r g b / a)`, as
 * its channels from 0 to 255 and its alpha from 0 to 1. Only those two forms
 * are read, because only those two are written.
 */
function parseColour(value: string): { rgb: [number, number, number]; alpha: number } {
  const modern = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)$/i);
  if (modern) {
    const [, red, green, blue, alpha] = modern;
    return {
      rgb: [Number(red), Number(green), Number(blue)],
      alpha: alpha === undefined ? 1 : Number(alpha),
    };
  }

  return { rgb: hexChannels(value), alpha: 1 };
}

/** A colour's channels as `#rrggbb`. */
function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The colour a visitor sees where a translucent colour is laid over an
 * opaque one: each channel weighted by the alpha, as a browser paints it.
 * An opaque colour comes back as itself.
 */
export function compositeColour(over: string, under: string): string {
  const top = parseColour(over);
  const ground = parseColour(under);

  return toHex(
    top.rgb.map(
      (channel, index) => top.alpha * channel + (1 - top.alpha) * ground.rgb[index],
    ) as [number, number, number],
  );
}

/** The red, green and blue of a hex colour, each from 0 to 1. */
function channels(hex: string): [number, number, number] {
  return hexChannels(hex).map((channel) => channel / 255) as [number, number, number];
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

  for (const { textToken, behindToken, groundToken } of pairs) {
    const foreground = tokens[textToken];
    const behind = tokens[behindToken];
    const ground = groundToken === undefined ? undefined : tokens[groundToken];

    if (foreground === undefined || behind === undefined) {
      problems.push(`${textToken} on ${behindToken} is not declared`);
      continue;
    }

    if (groundToken !== undefined && ground === undefined) {
      problems.push(`${behindToken} is laid over ${groundToken}, which is not declared`);
      continue;
    }

    const background = ground === undefined ? behind : compositeColour(behind, ground);
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
 * Shahmeer's palette, the colours the whole theme is built from (ADR-0006):
 * the five he chose, Pearl Beige, Charcoal, Powder Blush, Celadon and Pale
 * Sky, and Deep Sky, Pale Sky deepened until it passes as ink, the one
 * derived colour. Every other token is derived from one of these, so if one
 * of them is not a token value the look has drifted.
 */
export const PALETTE = [
  "#f2e2ba",
  "#50514f",
  "#e0afa0",
  "#baf2d8",
  "#bad7f2",
  "#2f5c85",
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

  walk(uncommented(css), []);
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
 * The one movement hover may make: the Bar's arrows nudge the way they
 * point, by `translate`, this many pixels sideways and no further. It is
 * named here, for the arrows' class and no other, so the rule that holds
 * hover to a colour change stays the rule and this stays the exception.
 */
export const ARROW_NUDGE = {
  /** The class the Bar's arrows wear, in `components/interactive.ts`. */
  className: "arrow",
  reachPx: 2,
};

/**
 * True for a rule written for the arrows and nothing else: one compound
 * selector opening on their class, with pseudo-classes and attributes and
 * no combinator after it. A list is refused, since the second selector
 * could name anything, and so is `.arrow .card:hover`, which names a card.
 */
function isArrowSelector(selector: string): boolean {
  return new RegExp(`^\\.${ARROW_NUDGE.className}(?![\\w-])[^,\\s>+~]*$`).test(selector);
}

/**
 * True for a nudge within reach: `-2px`, `2px 0` or the like, and nothing
 * up or down. The second length, when there is one, must be zero.
 */
function isWithinReach(value: string): boolean {
  const match = value.match(/^(-?\d+(?:\.\d+)?)px(?:\s+0(?:px)?)?$/);
  return match !== null && Math.abs(Number(match[1])) <= ARROW_NUDGE.reachPx;
}

/**
 * Every `:hover` or `:focus-within` rule that moves what it styles.
 *
 * The rule of the site is that hover is quiet: a border may change colour and
 * nothing may lift, slide or grow. `transform: none` is allowed, because it is
 * how the reveal hands a block over on focus, and switching movement off is
 * not movement. A block nested under a hover rule is hover too. The one
 * exception is `ARROW_NUDGE`: the Bar's arrows may translate sideways within
 * their reach, and no other selector may.
 */
export function liftProblems(css: string): string[] {
  const problems: string[] = [];

  for (const rule of styleRules(css)) {
    if (!appliesUnder(rule, isHoverSelector)) {
      continue;
    }
    const { selector, declarations } = rule;

    for (const [, , property, value] of declarations.matchAll(MOVING_PROPERTY)) {
      const written = value.trim();
      if (written === "none") {
        continue;
      }
      if (
        isArrowSelector(selector) &&
        property.toLowerCase() === "translate" &&
        isWithinReach(written)
      ) {
        continue;
      }
      problems.push(
        `${selector} sets ${property}: ${written}; hover and focus may only recolour`,
      );
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
 * True when a declaration `MOVING_OVER_TIME` matched moves something: a
 * smooth scroll, or a transition or animation that is not `none`.
 */
function movesOverTime(property: string, written: string): boolean {
  return property.toLowerCase() === "scroll-behavior"
    ? written === "smooth"
    : written !== "none";
}

/**
 * Every movement a visitor cannot switch off.
 *
 * The site moves only where motion is welcome: the reveal, the card's border
 * fade, the slide between Panels and the Disc's drift all live inside
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

      if (movesOverTime(property, written)) {
        problems.push(
          `${selector} sets ${property}: ${written} outside prefers-reduced-motion: no-preference`,
        );
      }
    }
  }

  return problems;
}

/**
 * Every selector that moves where motion is welcome: the rules inside
 * `prefers-reduced-motion: no-preference` that set a transition, an
 * animation or a smooth scroll, by selector, in order, once each. What
 * `motionProblems` holds is that nothing moves outside the query; this is
 * the other half, for a test to say what must move inside it.
 */
export function welcomeMotion(css: string): string[] {
  const moving: string[] = [];

  for (const rule of styleRules(css)) {
    if (!appliesUnder(rule, (part) => MOTION_WELCOME.test(part))) {
      continue;
    }
    const { selector, declarations } = rule;

    for (const [, , property, value] of declarations.matchAll(MOVING_OVER_TIME)) {
      if (movesOverTime(property, value.trim()) && !moving.includes(selector)) {
        moving.push(selector);
      }
    }
  }

  return moving;
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

/**
 * The drift, as the design fixed it: the Disc wanders from rest along a
 * path that bends once, three stops in all, as far as this by the last stop,
 * and takes this long a cycle each way. The travel is two viewport lengths,
 * so the Disc on a wide screen drifts as far across it as on a narrow one;
 * it is short, so the Disc never leaves the head it is behind and, on a
 * screen up to 2560px wide, never crosses the gutter Home's row clips at;
 * and the cycle is quick enough for the drift to be seen and slow enough
 * for it to read as a background and not an event.
 */
export const DRIFT = {
  /** The class the Disc wears, in `components/disc.tsx`: whose animation is the drift. */
  className: "disc",
  stops: 3,
  travel: { across: "2.8vw", down: "2vh" },
  cycleSeconds: 20,
};

/**
 * True for a rule written for the Disc: one compound selector opening on
 * its class, with pseudo-classes and attributes and no combinator after
 * it, as `isArrowSelector` reads the arrows.
 */
function isDiscSelector(selector: string): boolean {
  return new RegExp(`^\\.${DRIFT.className}(?![\\w-])[^,\\s>+~]*$`).test(selector);
}

/**
 * The compound selector with its attributes and pseudo-classes taken off:
 * `.piece[data-arrived="true"]` reads as `.piece`, the thing itself,
 * whose own rule is where its pointer is switched off.
 */
function baseOf(selector: string): string {
  return selector.replace(/\[[^\]]*\]|::?[a-z-]+(\([^)]*\))?/gi, "");
}

/** `transform: translate(...)`, `translateX(...)` or `translateY(...)`, and nothing else. */
const ONLY_TRANSLATE = /^(\s*translate[XY]?\([^)]*\)\s*)+$/i;

/** The first duration in an `animation` shorthand: `30s` or `30000ms`. */
const DURATION = /(?:^|\s)(\d+(?:\.\d+)?)(ms|s)(?=\s|$)/;

/** Every viewport length in a value: `2.8vw 2vh` reads as the two lengths. */
const VIEWPORT_LENGTHS = /-?\d+(?:\.\d+)?v[wh]\b/g;

/** Every `name: value` declaration in a block, in order. */
function declarationsOf(declarations: string): [string, string][] {
  return [...declarations.matchAll(/(^|;)\s*([a-z-]+)\s*:\s*([^;]+)/gi)].map(
    ([, , property, value]) => [property.toLowerCase(), value.trim()],
  );
}

/**
 * Where a keyframe stop puts its translate, as `across` and `down`: `0 0`
 * reads as rest and `2.8vw 2vh` as the two lengths. Null when the stop does
 * not translate at all, which is rest too: a stop that says nothing leaves
 * the Disc where it was.
 */
function translateOf(declarations: string): { across?: string; down?: string } | null {
  for (const [property, value] of declarationsOf(declarations)) {
    if (property === "translate" || property === "transform") {
      const [across, down] = value.match(VIEWPORT_LENGTHS) ?? [];
      return { across, down };
    }
  }

  return null;
}

/** True for a stop at rest: no translate, or a translate of nothing. */
function isAtRest(declarations: string): boolean {
  const translate = translateOf(declarations);
  return translate === null || (translate.across === undefined && translate.down === undefined);
}

/**
 * Problems with the Disc's drift, and with any other keyframe.
 *
 * The Disc drifts by a CSS keyframe, and the keyframe moves it and does
 * nothing else: translate only, so it is never scaled, faded or recoloured
 * on its way, and the browser can move it on the compositor without a
 * repaint. The path is the one the design fixed (`DRIFT`): from rest,
 * through one bend, to the travel, over the cycle, so the Disc is seen to
 * move and is never seen to hurry. And whatever is animated takes no
 * pointer, so a click on it lands on what is under it. The drift is the
 * animation on the Disc's own rule, and the path is held on the keyframe
 * it names; every other keyframe in the sheet, the Illustrations' float,
 * is held to translate only and a pointerless thing, and to its own path
 * by its own test. That every animation sits inside
 * `prefers-reduced-motion: no-preference` is held by `motionProblems`.
 */
export function driftProblems(css: string): string[] {
  const problems: string[] = [];
  const rules = styleRules(css);
  const keyframes = new Set<string>();
  const stopsOf = new Map<string, StyleRule[]>();
  // The thing a pointerless declaration is for: its own selector, or for
  // one written in a nested at-rule, `@variant large`, the selector
  // enclosing it, since the at-rule says where and not what.
  const pointerless = new Set(
    rules
      .filter(({ declarations }) => /(^|;)\s*pointer-events\s*:\s*none\b/.test(declarations))
      .map((rule) => [...rule.enclosing, rule.selector].findLast((part) => !part.startsWith("@")))
      .filter((selector): selector is string => selector !== undefined),
  );
  /** The keyframes the Disc animates by: the drift. */
  const drifts = new Set<string>();
  for (const rule of rules) {
    for (const [property, value] of declarationsOf(rule.declarations)) {
      if (property === "animation" && value !== "none" && isDiscSelector(rule.selector)) {
        for (const word of value.split(/\s+/)) {
          drifts.add(word);
        }
      }
    }
  }
  if (drifts.size === 0) {
    problems.push(`Nothing animates .${DRIFT.className}, so the Disc does not drift`);
  }

  for (const rule of rules) {
    const name = rule.selector.match(/^@keyframes\s+([a-z0-9_-]+)/i)?.[1];
    if (name !== undefined) {
      keyframes.add(name);
    }

    const frame = rule.enclosing.find((block) => /^@keyframes\b/i.test(block));
    if (frame === undefined) {
      continue;
    }
    stopsOf.set(frame, [...(stopsOf.get(frame) ?? []), rule]);
    for (const [property, value] of declarationsOf(rule.declarations)) {
      const moves =
        property === "translate" ||
        (property === "transform" && ONLY_TRANSLATE.test(value));
      if (!moves) {
        problems.push(
          `${frame} ${rule.selector} sets ${property}: ${value}; a keyframe may only translate`,
        );
      }
    }
  }

  for (const [frame, stops] of stopsOf) {
    if (!drifts.has(frame.replace(/^@keyframes\s+/i, ""))) {
      continue;
    }
    if (stops.length !== DRIFT.stops) {
      problems.push(
        `${frame} has ${stops.length} stops; a drift bends once, so it has ${DRIFT.stops}`,
      );
      continue;
    }

    const [first, , last] = stops;
    if (!isAtRest(first.declarations)) {
      problems.push(`${frame} ${first.selector} does not start from rest`);
    }

    const travel = translateOf(last.declarations);
    if (travel?.across !== DRIFT.travel.across || travel.down !== DRIFT.travel.down) {
      problems.push(
        `${frame} ${last.selector} travels ${travel?.across ?? "0"} by ${travel?.down ?? "0"}; a drift travels ${DRIFT.travel.across} by ${DRIFT.travel.down}`,
      );
    }
  }

  for (const rule of rules) {
    for (const [property, value] of declarationsOf(rule.declarations)) {
      if (property !== "animation" || value === "none") {
        continue;
      }

      const named = [...keyframes].some((candidate) =>
        value.split(/\s+/).includes(candidate),
      );
      if (!named) {
        problems.push(
          `${rule.selector} animates by keyframes that are not in the sheet: ${value}`,
        );
      }

      if (!pointerless.has(rule.selector) && !pointerless.has(baseOf(rule.selector))) {
        problems.push(`${rule.selector} is animated but takes a pointer; it needs pointer-events: none`);
      }

      if (!isDiscSelector(rule.selector)) {
        continue;
      }
      const duration = value.match(DURATION);
      const seconds =
        duration === null
          ? 0
          : Number(duration[1]) / (duration[2] === "ms" ? 1000 : 1);
      if (seconds !== DRIFT.cycleSeconds) {
        problems.push(
          `${rule.selector} drifts over ${seconds}s; a drift cycle is ${DRIFT.cycleSeconds} seconds`,
        );
      }
    }
  }

  return problems;
}

/** Media features that ask what kind of display this is, by name, as written. */
export type DisplayFeatures = Record<string, string>;

/**
 * The display that gets the Strip (ADR-0003): at least this wide, wider than
 * it is tall, and driven by a mouse or a trackpad. Each is a media feature
 * with the value it must have.
 */
export const LARGE_DISPLAY: DisplayFeatures = {
  "min-width": "1280px",
  orientation: "landscape",
  pointer: "fine",
};

/**
 * A `(feature: value)` that asks about the display: its width, which way it
 * is held, or what drives it. Colour and motion preferences are not here;
 * they say nothing about which layout a display gets.
 */
const DISPLAY_FEATURE = /\((min-width|max-width|orientation|pointer|hover)\s*:\s*([^)]+)\)/gi;

/** Every display feature in a media query, by name, spacing dropped. */
function displayFeatures(query: string): DisplayFeatures {
  const features: DisplayFeatures = {};

  for (const [, feature, value] of query.matchAll(DISPLAY_FEATURE)) {
    features[feature.toLowerCase()] = value.trim();
  }

  return features;
}

/**
 * Problems with which display gets the Strip.
 *
 * The rule is written once, as the `large` variant, and everything that
 * changes at it says `large:`; the script reads the layout off the element.
 * So the variant is held to the three conditions, each by name, and no other
 * media query in the sheet may ask about width, orientation or pointer: one
 * that did would be the rule written a second time, free to drift from the
 * first. A width alone cannot tell a 13" laptop from an iPad Pro held
 * sideways, which is why dropping any one of the three is a problem and not
 * a simplification.
 */
export function largeDisplayProblems(css: string): string[] {
  const written = uncommented(css);
  const variant = written.match(/@custom-variant\s+large\s*\(\s*@media\s*([^;]*)\)\s*;/);

  if (variant === null) {
    return ["No `large` variant in the sheet, so nothing says which display gets the Strip"];
  }

  const problems: string[] = [];
  const features = displayFeatures(variant[1]);

  for (const [feature, expected] of Object.entries(LARGE_DISPLAY)) {
    const value = features[feature];

    if (value === undefined) {
      problems.push(`The large variant does not ask about ${feature}; it needs (${feature}: ${expected})`);
    } else if (value !== expected) {
      problems.push(`The large variant asks for (${feature}: ${value}); the rule is (${feature}: ${expected})`);
    }
  }

  const elsewhere = written.replace(variant[0], " ");
  for (const [, feature, value] of elsewhere.matchAll(DISPLAY_FEATURE)) {
    problems.push(
      `(${feature}: ${value.trim()}) is asked outside the large variant; the rule is written there and nowhere else`,
    );
  }

  return problems;
}
