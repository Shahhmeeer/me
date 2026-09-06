import { describe, expect, it } from "vitest";

import { certifications } from "@/content/site";
import { certificationProblems } from "./checks/profile-rules";

/**
 * The Recruiter's first filter. The three certifications are facts, so they are
 * pinned here: a silent edit to a name or a date fails the build.
 */
const EXPECTED = [
  { name: "Salesforce Certified Administrator", awarded: "January 2024" },
  { name: "Salesforce Certified Platform Developer I", awarded: "February 2024" },
  { name: "Salesforce Certified Platform App Builder", awarded: "June 2024" },
];

describe("Certifications", () => {
  it("publishes the three certifications with their award dates", () => {
    expect(certifications).toEqual(EXPECTED);
  });

  it.each(certifications.map((c) => [c.name, c] as const))(
    "%s is complete",
    (_name, certification) => {
      expect(certificationProblems(certification)).toEqual([]);
    },
  );
});
