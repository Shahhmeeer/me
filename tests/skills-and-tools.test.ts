import { describe, expect, it } from "vitest";

import { skills, tools } from "@/content/site";
import { skillsAndToolsProblems } from "./checks/profile-rules";

/** Verbs. What Shahmeer does. */
const EXPECTED_SKILLS = [
  "Salesforce development",
  "Experience Cloud portal development",
  "Third-party and payment integration",
  "Sales Cloud and Service Cloud implementation",
  "CI/CD delivery and release management",
  "Production support and root-cause analysis",
];

/** Product names. What a Recruiter's keyword search looks for. */
const EXPECTED_TOOLS = [
  "Apex",
  "LWC",
  "Flows",
  "CPQ",
  "Custom Metadata Types",
  "Salesforce CLI",
  "Stripe",
  "GoCardless",
  "Braintree",
  "Zoom",
  "REST APIs",
  "JavaScript",
  "GitLab CI/CD",
];

describe("Skills and Tools", () => {
  it("lists every Skill the spec asks for", () => {
    expect(skills).toEqual(EXPECTED_SKILLS);
  });

  it("lists every Tool the spec asks for", () => {
    expect(tools).toEqual(EXPECTED_TOOLS);
  });

  it("keeps the two blocks sound and free of Tech-Tag-only names", () => {
    expect(skillsAndToolsProblems(skills, tools)).toEqual([]);
  });
});
