import { describe, expect, it } from "vitest";

import {
  aboutProblems,
  certificationProblems,
  findJobSearchPhrases,
  mentionsName,
  skillsAndToolsProblems,
} from "./profile-rules";

describe("mentionsName", () => {
  it("finds a name as a whole word", () => {
    expect(mentionsName("Next.js and React", "React")).toBe(true);
    expect(mentionsName("Next.js and React", "Next.js")).toBe(true);
  });

  it("does not find a name buried inside a longer word", () => {
    expect(mentionsName("Reactive programming", "React")).toBe(false);
    expect(mentionsName("JavaScript", "TypeScript")).toBe(false);
  });
});

describe("certificationProblems", () => {
  it("accepts a name with a month and a year", () => {
    expect(
      certificationProblems({ name: "A cert", awarded: "January 2024" }),
    ).toEqual([]);
  });

  it("rejects a year on its own", () => {
    expect(
      certificationProblems({ name: "A cert", awarded: "2024" }),
    ).not.toEqual([]);
  });
});

describe("aboutProblems", () => {
  const good = ["He is one.", "He builds two.", "He is interested in three."];

  it("accepts three one-sentence entries", () => {
    expect(aboutProblems(good)).toEqual([]);
  });

  it("rejects a fourth sentence", () => {
    expect(aboutProblems([...good, "And four."])).not.toEqual([]);
  });

  it("rejects two sentences squeezed into one entry", () => {
    expect(
      aboutProblems(["He is one. He is also one and a half.", good[1], good[2]]),
    ).not.toEqual([]);
  });

  it("rejects job-search phrasing", () => {
    expect(
      aboutProblems([good[0], good[1], "He is open to work right now."]),
    ).not.toEqual([]);
  });
});

describe("findJobSearchPhrases", () => {
  it("catches a phrase planted anywhere in the content", () => {
    expect(
      findJobSearchPhrases(["Currently looking for a role in Salesforce."]),
    ).toHaveLength(1);
  });
});

describe("skillsAndToolsProblems", () => {
  it("accepts verbs on one side and product names on the other", () => {
    expect(skillsAndToolsProblems(["Salesforce development"], ["Apex"])).toEqual(
      [],
    );
  });

  it("rejects a Tech-Tag-only name in either block", () => {
    expect(skillsAndToolsProblems(["React development"], ["Apex"])).not.toEqual(
      [],
    );
    expect(skillsAndToolsProblems(["Salesforce development"], ["Firebase"])).not.toEqual(
      [],
    );
  });

  it("rejects the same item in both blocks", () => {
    expect(skillsAndToolsProblems(["Apex"], ["Apex"])).not.toEqual([]);
  });

  it("rejects an empty block", () => {
    expect(skillsAndToolsProblems([], ["Apex"])).not.toEqual([]);
  });
});
