import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// The script is `retint.mts`, spelt `.mjs` here as TypeScript asks for.
import {
  HEX,
  ILLUSTRATIONS,
  ILLUSTRATIONS_DIR,
  PALETTE_MAP,
  cleanName,
  mapFor,
  retint,
} from "@/scripts/retint.mjs";
import { PUBLIC_DIR } from "./checks/pictures";

/**
 * The sources are the raw unDraw files, kept as this test's fixtures and
 * nowhere under `public`: CI checks out one commit with no tags, so the
 * prototype tag they came from is not there to read.
 */
const FIXTURES_DIR = join(import.meta.dirname, "fixtures", "undraw");

/**
 * The Illustrations are unDraw pieces retinted to the palette by hex
 * substitution (ADR-0005). The substitution is one pure function on text,
 * and the eleven committed files are held equal to their sources through
 * it, so a hand edit to a shipped file, or a drift in the map, is caught.
 */
describe("retint", () => {
  const map = { "#6c63ff": "#e0afa0", "#fff": "#fbf6ea" };

  it("replaces every mapped hex, whatever its case", () => {
    const svg = '<svg><path fill="#6c63ff"/><path fill="#6C63FF"/><rect fill="#FFF"/></svg>';
    expect(retint(svg, map)).toBe(
      '<svg><path fill="#e0afa0"/><path fill="#e0afa0"/><rect fill="#fbf6ea"/></svg>',
    );
  });

  it("leaves an unmapped colour alone", () => {
    const svg = '<svg><path fill="#ed9da0"/><path fill="#123456"/><path fill="#fffabc"/></svg>';
    expect(retint(svg, map)).toBe(svg);
  });

  it("changes nothing but the hex values, so the SVG stays the SVG it was", () => {
    const source = readFileSync(join(FIXTURES_DIR, "undraw_thumbs-up_f300.svg"), "utf8");
    const out = retint(source, PALETTE_MAP);
    const shape = (text: string) => text.replace(HEX, "#");
    expect(shape(out)).toBe(shape(source));
    expect(out.startsWith("<svg")).toBe(true);
    expect(out.trimEnd().endsWith("</svg>")).toBe(true);
  });

  it("is a function of its input alone", () => {
    const svg = '<svg><path fill="#6c63ff"/></svg>';
    expect(retint(svg, map)).toBe(retint(svg, map));
    expect(retint(svg, {})).toBe(svg);
  });
});

describe("mapFor", () => {
  /**
   * Pink plants looked wrong; `plants` takes a deeper Celadon for the purple
   * and the rest of the map as is.
   */
  it("gives plants Celadon where every other piece gets Powder Blush", () => {
    expect(mapFor("plants")["#6c63ff"]).toBe("#9ad9bb");
    expect(mapFor("thumbs-up")["#6c63ff"]).toBe("#e0afa0");
    expect(mapFor("thumbs-up")).toEqual(PALETTE_MAP);
    expect(mapFor("plants")).toEqual({ ...PALETTE_MAP, "#6c63ff": "#9ad9bb" });
  });
});

describe("cleanName", () => {
  it("drops the undraw_ prefix and the hash", () => {
    expect(cleanName("undraw_bug-detected_71if.svg")).toBe("bug-detected");
    expect(cleanName("undraw_the-right-time_n3ys.svg")).toBe("the-right-time");
    expect(cleanName("/some/where/undraw_plants_md5c.svg")).toBe("plants");
  });
});

describe("the Illustration files", () => {
  const shipped = join(PUBLIC_DIR, ILLUSTRATIONS_DIR);

  it("are the eleven, under clean names", () => {
    expect(ILLUSTRATIONS).toEqual([
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
    ]);
    expect(readdirSync(shipped).sort()).toEqual(
      ILLUSTRATIONS.map((name) => `${name}.svg`).sort(),
    );
  });

  it.each(ILLUSTRATIONS)("%s is its source through the map", (name) => {
    const [fixture] = readdirSync(FIXTURES_DIR).filter((file) => cleanName(file) === name);
    expect(fixture, `a fixture for ${name}`).toBeDefined();
    const source = readFileSync(join(FIXTURES_DIR, fixture), "utf8");
    const committed = readFileSync(join(shipped, `${name}.svg`), "utf8");
    expect(committed).toBe(retint(source, mapFor(name)));
  });

  /**
   * The raw files are unDraw's, not the palette's, so none is served; and
   * `casual-browsing` was retinted in the prototype but never placed, so it
   * is not carried, not even as a source.
   */
  it("ship no raw unDraw file and no casual-browsing", () => {
    const everything = readdirSync(PUBLIC_DIR, { recursive: true }).map(String);
    expect(everything.filter((file) => /undraw_/i.test(file))).toEqual([]);
    expect(everything.filter((file) => /casual-browsing/i.test(file))).toEqual([]);
    expect(existsSync(join(FIXTURES_DIR, "undraw_casual-browsing_c09r.svg"))).toBe(false);
  });
});
