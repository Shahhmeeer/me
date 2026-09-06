import { describe, expect, it } from "vitest";

import {
  educationProblems,
  experienceEntryProblems,
  highlightProblems,
  overlappingRoleProblems,
  PRESENT,
} from "./experience-rules";

const role = {
  id: "a-role",
  employer: "An employer",
  title: "Salesforce Developer",
  location: "Lahore",
  remote: false,
  start: "April 2023",
  end: "April 2024",
  highlights: [{ id: "a-highlight", line: "Built a thing that worked." }],
};

describe("highlightProblems", () => {
  it("accepts one sentence of real work", () => {
    expect(highlightProblems(role.highlights[0])).toEqual([]);
  });

  it("rejects a Highlight that runs to two sentences", () => {
    expect(
      highlightProblems({
        id: "long",
        line: "Built a thing. Then built another thing.",
      }),
    ).not.toEqual([]);
  });

  it("rejects an empty Highlight", () => {
    expect(highlightProblems({ id: "empty", line: "  " })).not.toEqual([]);
  });
});

describe("experienceEntryProblems", () => {
  it("accepts a complete role", () => {
    expect(experienceEntryProblems(role)).toEqual([]);
  });

  it("accepts a role that is still running", () => {
    expect(
      experienceEntryProblems({ ...role, start: "May 2026", end: PRESENT }),
    ).toEqual([]);
  });

  it("accepts a role with no Highlight, because a role can be new", () => {
    expect(experienceEntryProblems({ ...role, highlights: [] })).toEqual([]);
  });

  it("rejects a year without its month", () => {
    expect(experienceEntryProblems({ ...role, start: "2023" })).not.toEqual([]);
  });

  it("rejects a role that ends before it starts", () => {
    expect(
      experienceEntryProblems({ ...role, start: "April 2024", end: "April 2023" }),
    ).not.toEqual([]);
  });

  it("rejects a role with no employer", () => {
    expect(experienceEntryProblems({ ...role, employer: "" })).not.toEqual([]);
  });

  it("reports a broken Highlight through the role", () => {
    expect(
      experienceEntryProblems({
        ...role,
        highlights: [{ id: "empty", line: "" }],
      }),
    ).not.toEqual([]);
  });
});

describe("educationProblems", () => {
  const education = {
    id: "a-degree",
    qualification: "BSc Computer Science",
    institution: "A university",
    start: "February 2019",
    end: "January 2024",
  };

  it("accepts a complete entry", () => {
    expect(educationProblems(education)).toEqual([]);
  });

  it("rejects a degree that is still running, because a degree ends", () => {
    expect(educationProblems({ ...education, end: PRESENT })).not.toEqual([]);
  });

  it("rejects a missing institution", () => {
    expect(educationProblems({ ...education, institution: "" })).not.toEqual([]);
  });
});

describe("overlappingRoleProblems", () => {
  const earlier = { ...role, id: "earlier", start: "April 2023", end: "April 2024" };
  const later = { ...role, id: "later", start: "May 2024", end: "April 2026" };

  it("accepts roles that hand over month to month", () => {
    expect(overlappingRoleProblems([earlier, later])).toEqual([]);
  });

  it("reports two roles claiming the same months", () => {
    expect(
      overlappingRoleProblems([earlier, { ...later, start: "January 2024" }]),
    ).toHaveLength(1);
  });

  it("reports a running role that reaches back over a finished one", () => {
    expect(
      overlappingRoleProblems([later, { ...role, id: "now", start: "January 2026", end: PRESENT }]),
    ).toHaveLength(1);
  });
});
