import { describe, expect, it } from "vitest";

import { caseStudies, type CaseStudy } from "@/content/site";
import { caseStudyProblems } from "./checks/content-rules";

describe("Case Study integrity", () => {
  it.each(caseStudies.map((caseStudy) => [caseStudy.id, caseStudy] as const))(
    "%s is complete",
    (_id, caseStudy) => {
      expect(caseStudyProblems(caseStudy)).toEqual([]);
    },
  );

  it("rejects a deliberately incomplete Case Study", () => {
    const incomplete = {
      id: "broken",
      title: "Broken",
      employer: "An employer",
      clientDescriptor: "A mid-size logistics operator",
      problem: "Something hurt.",
      action: "Something was built.",
      result: "",
      techTags: [],
      ownership: { kind: "team" },
    } as unknown as CaseStudy;

    expect(caseStudyProblems(incomplete).length).toBeGreaterThan(1);
  });
});
