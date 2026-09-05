import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import { collectTechTags, techTagProblems } from "./checks/content-rules";

/**
 * Tech Tags hang off Case Studies and Projects today, but the rule is that
 * every Tech Tag *anywhere* carries a four-digit year. So this walks the whole
 * content module instead of the two collections that happen to hold tags now.
 */
describe("Tech Tag integrity", () => {
  it("gives every Tech Tag anywhere in the content a four-digit year", () => {
    const problems = collectTechTags(content).flatMap(techTagProblems);

    expect(problems).toEqual([]);
  });

  it("rejects a deliberately broken Tech Tag hung anywhere", () => {
    const planted = { somethingNew: [{ tags: [{ name: "Flow", year: 24 }] }] };

    expect(collectTechTags(planted).flatMap(techTagProblems)).not.toEqual([]);
  });
});
