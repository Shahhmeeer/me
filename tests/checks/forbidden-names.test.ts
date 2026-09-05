import { describe, expect, it } from "vitest";

import {
  ENVIRONMENT_VARIABLE,
  findForbiddenMentions,
  loadForbiddenNames,
  parseNameList,
} from "./forbidden-names";

describe("parseNameList", () => {
  it("splits on both commas and newlines, and trims", () => {
    expect(parseNameList("Acme Corp, Globex\n  Initech  ")).toEqual([
      "Acme Corp",
      "Globex",
      "Initech",
    ]);
  });

  it("drops blank lines and comment lines", () => {
    expect(parseNameList("# a comment\n\nAcme\n")).toEqual(["Acme"]);
  });

  it("returns nothing for an empty list", () => {
    expect(parseNameList("   \n # only comments \n")).toEqual([]);
  });
});

describe("loadForbiddenNames", () => {
  it("prefers the environment variable", () => {
    const list = loadForbiddenNames({
      environment: { [ENVIRONMENT_VARIABLE]: "Acme,Globex" },
      readLocalFile: () => "Initech",
    });

    expect(list).toEqual({ names: ["Acme", "Globex"], source: "environment" });
  });

  it("falls back to the gitignored local file", () => {
    const list = loadForbiddenNames({
      environment: {},
      readLocalFile: () => "Initech",
    });

    expect(list).toEqual({ names: ["Initech"], source: "file" });
  });

  it("reports no source when neither holds a name", () => {
    const list = loadForbiddenNames({
      environment: { [ENVIRONMENT_VARIABLE]: "  " },
      readLocalFile: () => null,
    });

    expect(list).toEqual({ names: [], source: "none" });
  });
});

describe("findForbiddenMentions", () => {
  it("finds nothing in clean text", () => {
    expect(
      findForbiddenMentions(["a large logistics operator"], ["Acme Corp"]),
    ).toEqual([]);
  });

  it("catches a deliberately planted name whatever its case", () => {
    const mentions = findForbiddenMentions(
      ["Built the portal for ACME corp last year"],
      ["Acme Corp"],
    );

    expect(mentions).toHaveLength(1);
    expect(mentions[0].name).toBe("Acme Corp");
  });

  it("catches a name glued inside a longer word", () => {
    expect(findForbiddenMentions(["globex-portal"], ["Globex"])).toHaveLength(1);
  });

  it("reports every offending name once per string", () => {
    const mentions = findForbiddenMentions(
      ["Acme and Globex", "Acme again"],
      ["Acme", "Globex"],
    );

    expect(mentions).toHaveLength(3);
  });
});
