import { describe, expect, it } from "vitest";

import {
  FORBIDDEN_NAMES_ENV_VAR,
  findForbiddenMentions,
  guardReadiness,
  isContinuousIntegration,
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
      environment: { [FORBIDDEN_NAMES_ENV_VAR]: "Acme,Globex" },
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
      environment: { [FORBIDDEN_NAMES_ENV_VAR]: "  " },
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

describe("isContinuousIntegration", () => {
  it("is true on a build server", () => {
    expect(isContinuousIntegration({ CI: "true" })).toBe(true);
    expect(isContinuousIntegration({ CI: "1" })).toBe(true);
  });

  it("is false on a developer machine", () => {
    expect(isContinuousIntegration({})).toBe(false);
    expect(isContinuousIntegration({ CI: "" })).toBe(false);
    expect(isContinuousIntegration({ CI: "false" })).toBe(false);
  });
});

describe("guardReadiness", () => {
  it("is ready whenever a list was supplied", () => {
    expect(guardReadiness("environment", true)).toBe("ready");
    expect(guardReadiness("file", false)).toBe("ready");
  });

  it("fails on a build server when no list was supplied", () => {
    // The deliberately failing fixture for the loudest rule: a missing list is
    // never silently a pass.
    expect(guardReadiness("none", true)).toBe("fail");
  });

  it("only warns on a developer machine when no list was supplied", () => {
    expect(guardReadiness("none", false)).toBe("warn");
  });
});
