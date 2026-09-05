import { describe, expect, it } from "vitest";

import { collectStrings } from "./strings";

describe("collectStrings", () => {
  it("returns a bare string", () => {
    expect(collectStrings("Acme")).toEqual(["Acme"]);
  });

  it("reaches strings nested in arrays and objects", () => {
    const value = {
      title: "Portal",
      tags: [{ name: "Apex", year: 2024 }],
      nested: { deep: { deeper: ["found me"] } },
    };

    const strings = collectStrings(value);

    expect(strings).toContain("Portal");
    expect(strings).toContain("Apex");
    expect(strings).toContain("found me");
  });

  it("reaches object keys, because a name can hide in one", () => {
    expect(collectStrings({ acmeCorp: 1 })).toContain("acmeCorp");
  });

  it("ignores numbers, booleans, null and undefined", () => {
    expect(collectStrings([1, true, null, undefined])).toEqual([]);
  });

  it("survives a value that points back at itself", () => {
    const value: Record<string, unknown> = { name: "loop" };
    value.self = value;

    expect(collectStrings(value)).toContain("loop");
  });
});
