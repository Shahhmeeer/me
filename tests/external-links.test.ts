import { describe, expect, it } from "vitest";

import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";

/**
 * Every link that leaves this site wears these attributes, so the rule is
 * checked once here rather than component by component.
 */
describe("a link that leaves this site", () => {
  it("opens in a new tab, so the site is not left behind", () => {
    expect(EXTERNAL_LINK_ATTRIBUTES.target).toBe("_blank");
  });

  it("cuts the new tab off from the page that opened it", () => {
    expect(EXTERNAL_LINK_ATTRIBUTES.rel.split(/\s+/)).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
  });
});
