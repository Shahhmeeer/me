/**
 * Retints an unDraw SVG to the palette by hex substitution (ADR-0005).
 *
 * Usage: `node scripts/retint.mts <undraw_*.svg>...` writes each piece to
 * `public/images/illustrations/<name>.svg`, the name being the file's own
 * with the `undraw_` prefix and the trailing hash dropped. A new
 * Illustration is a file drop and one run of this; `tests/retint.test.ts`
 * then holds every shipped file equal to its source through the map, so the
 * source goes under `tests/fixtures/undraw/` too.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** A hex colour to the hex colour it becomes, both lower-case. */
export type HexMap = Readonly<Record<string, string>>;

/**
 * The map, in one place. unDraw's purple to Powder Blush; its blacks and
 * slates to Charcoal (the near-black a shade deeper, so a figure's outline
 * still reads darker than a slate garment); its whites and greys to beige
 * tints; its lavender greys to Pale Sky tints. The skin tones (`#ed9da0`,
 * `#9f616a`) are not here, so they are left alone. The palette itself is
 * the tokens in `app/globals.css`; a change there is a change here and a
 * rerun of the script.
 *
 * unDraw's licence (https://undraw.co/license, ADR-0005): free for personal
 * and commercial use with no attribution required; its one restriction,
 * redistributing the pieces as a collection, a portfolio does not do.
 */
export const PALETTE_MAP: HexMap = {
  "#6c63ff": "#e0afa0",
  "#090814": "#3a3b39",
  "#2f2e41": "#50514f",
  "#3f3d56": "#50514f",
  "#535461": "#50514f",
  "#fff": "#fbf6ea",
  "#f2f2f2": "#f7ebcd",
  "#e6e6e6": "#faf0d6",
  "#ccc": "#dccdaa",
  "#b3b3b3": "#c9bd9c",
  "#d0cde1": "#d5e5f3",
  "#d6d6e3": "#d5e5f3",
  "#e8eaf1": "#e3eef8",
  "#dde1eb": "#cfe1f3",
  "#c8cbd8": "#bad7f2",
};

/**
 * The one exception, by name: pink plants looked wrong, so `plants` takes
 * Celadon a shade deeper (so it reads on beige) for the purple instead.
 */
const EXCEPTIONS: Readonly<Record<string, HexMap>> = {
  plants: { "#6c63ff": "#9ad9bb" },
};

/** The eleven Illustrations shipped, in the order issue #104 lists them. */
export const ILLUSTRATIONS = [
  "bug-detected",
  "thumbs-up",
  "random-idea",
  "soda-splash",
  "the-right-time",
  "plants",
  "generating-response",
  "code-deployed",
  "message-sent",
  "mail-sent",
  "working-at-home",
] as const;

/** Where the pieces are served from, under `public`. */
export const ILLUSTRATIONS_DIR = join("images", "illustrations");

/** A 3- or 6-digit hex colour, whatever its case, ending where the hex digits do. */
export const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/gi;

/**
 * The SVG with every colour in the map replaced and everything else as it
 * was. A colour is matched case-insensitively and whole, so `#fff` is not
 * found inside `#fffabc`.
 */
export function retint(svgText: string, map: HexMap): string {
  return svgText.replace(HEX, (hex) => map[hex.toLowerCase()] ?? hex);
}

/** The map for one Illustration: the palette map, its exception laid over if it has one. */
export function mapFor(name: string): HexMap {
  return { ...PALETTE_MAP, ...EXCEPTIONS[name] };
}

/** `undraw_bug-detected_71if.svg`, from any directory, is `bug-detected`. */
export function cleanName(path: string): string {
  return basename(path)
    .replace(/\.svg$/i, "")
    .replace(/^undraw_/, "")
    .replace(/_[0-9a-z]{4}$/, "");
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const sources = process.argv.slice(2);
  if (sources.length === 0) {
    console.error("Usage: node scripts/retint.mts <undraw_*.svg>...");
    process.exit(1);
  }
  const repoRoot = resolve(fileURLToPath(import.meta.url), "..", "..");
  for (const source of sources) {
    const name = cleanName(source);
    const target = join(repoRoot, "public", ILLUSTRATIONS_DIR, `${name}.svg`);
    writeFileSync(target, retint(readFileSync(source, "utf8"), mapFor(name)));
    console.log(`${source} -> ${target}`);
  }
}
