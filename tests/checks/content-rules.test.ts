import { describe, expect, it } from "vitest";

import type { CaseStudy, Project } from "@/content/site";
import {
  caseStudyProblems,
  projectProblems,
  techTagProblems,
} from "./content-rules";

const soundCaseStudy: CaseStudy = {
  id: "portal",
  title: "Self-service portal",
  employer: "An employer",
  clientDescriptor: "A mid-size logistics operator",
  problem: "Agents answered the same question by phone all day.",
  action: "Built an Experience Cloud portal.",
  result: "Call volume fell by a third.",
  techTags: [{ name: "Apex", year: 2024 }],
  ownership: { kind: "solo" },
};

const soundProject: Project = {
  id: "tracker",
  name: "Tracker",
  liveUrl: "https://example.com/tracker",
  summary: "A small tracker.",
  techTags: [{ name: "Next.js", year: 2025 }],
  year: 2025,
  ownership: { kind: "solo" },
};

describe("techTagProblems", () => {
  it("passes a four-digit year", () => {
    expect(techTagProblems({ name: "Apex", year: 2024 })).toEqual([]);
  });

  it("catches a year that is not four digits", () => {
    expect(techTagProblems({ name: "Apex", year: 24 })).not.toEqual([]);
  });

  it("catches an empty tag name", () => {
    expect(techTagProblems({ name: "  ", year: 2024 })).not.toEqual([]);
  });
});

describe("caseStudyProblems", () => {
  it("passes a complete Case Study", () => {
    expect(caseStudyProblems(soundCaseStudy)).toEqual([]);
  });

  it("catches an empty Result", () => {
    expect(
      caseStudyProblems({ ...soundCaseStudy, result: "   " }),
    ).not.toEqual([]);
  });

  it("passes team ownership that names the collaborator", () => {
    expect(
      caseStudyProblems({
        ...soundCaseStudy,
        ownership: { kind: "team", note: "With a second developer on data." },
      }),
    ).toEqual([]);
  });

  it("catches team ownership with a blank note", () => {
    expect(
      caseStudyProblems({
        ...soundCaseStudy,
        ownership: { kind: "team", note: "  " },
      }),
    ).not.toEqual([]);
  });

  it("catches an ownership that is neither solo nor team", () => {
    const wrong = {
      ...soundCaseStudy,
      ownership: { kind: "shared" },
    } as unknown as CaseStudy;

    expect(caseStudyProblems(wrong)).not.toEqual([]);
  });

  it("catches a bad year on one of its Tech Tags", () => {
    expect(
      caseStudyProblems({
        ...soundCaseStudy,
        techTags: [{ name: "Apex", year: 202 }],
      }),
    ).not.toEqual([]);
  });
});

describe("projectProblems", () => {
  it("passes a complete Project", () => {
    expect(projectProblems(soundProject)).toEqual([]);
  });

  it("catches a relative link, because a Project must be openable", () => {
    expect(
      projectProblems({ ...soundProject, liveUrl: "/tracker" }),
    ).not.toEqual([]);
  });

  it("catches a link that is not http or https", () => {
    expect(
      projectProblems({ ...soundProject, liveUrl: "ftp://example.com" }),
    ).not.toEqual([]);
  });

  it("catches a Project with no Tech Tag", () => {
    expect(projectProblems({ ...soundProject, techTags: [] })).not.toEqual([]);
  });

  it("catches a bad year on one of its Tech Tags", () => {
    expect(
      projectProblems({
        ...soundProject,
        techTags: [{ name: "Next.js", year: 25 }],
      }),
    ).not.toEqual([]);
  });
});
