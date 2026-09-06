import { describe, expect, it } from "vitest";

import { education, experience, experienceCopy } from "@/content/site";
import {
  educationProblems,
  experienceEntryProblems,
  highlightProblems,
  overlappingRoleProblems,
} from "./checks/experience-rules";

/**
 * The employment history is facts, and a Recruiter checks them against the
 * LinkedIn profile and the CV. They are pinned here so that a silent edit to an
 * employer, a title, a location or a date fails the build.
 */
const EXPECTED_ROLES = [
  {
    employer: "Scaleable Solutions",
    title: "Senior Salesforce Developer",
    location: "Sharjah, UAE",
    remote: true,
    start: "May 2026",
    end: experienceCopy.present,
  },
  {
    employer: "Cloud Consulting Inc",
    title: "Salesforce Developer",
    location: "Atlanta",
    remote: true,
    start: "May 2024",
    end: "April 2026",
  },
  {
    employer: "Prism Solutions",
    title: "Salesforce Developer",
    location: "Lahore",
    remote: false,
    start: "April 2023",
    end: "April 2024",
  },
];

/** Which employer each Highlight belongs to. Credit given to the wrong one is a lie. */
const EXPECTED_HIGHLIGHTS: Record<string, string[]> = {
  "Scaleable Solutions": [],
  "Cloud Consulting Inc": ["ats-portal", "licence-migration", "form-engine"],
  "Prism Solutions": ["storefront"],
};

describe("Experience", () => {
  it("publishes the three roles, newest first", () => {
    expect(
      experience.map(({ employer, title, location, remote, start, end }) => ({
        employer,
        title,
        location,
        remote,
        start,
        end,
      })),
    ).toEqual(EXPECTED_ROLES);
  });

  it.each(experience.map((entry) => [entry.employer, entry] as const))(
    "%s is complete",
    (_employer, entry) => {
      expect(experienceEntryProblems(entry)).toEqual([]);
    },
  );

  it("has no two roles claiming the same months", () => {
    expect(overlappingRoleProblems(experience)).toEqual([]);
  });

  it("nests each Highlight under the employer it was built for", () => {
    const actual = Object.fromEntries(
      experience.map((entry) => [
        entry.employer,
        entry.highlights.map((highlight) => highlight.id),
      ]),
    );

    expect(actual).toEqual(EXPECTED_HIGHLIGHTS);
  });

  it("keeps every Highlight to one line", () => {
    const problems = experience.flatMap((entry) =>
      entry.highlights.flatMap(highlightProblems),
    );

    expect(problems).toEqual([]);
  });
});

describe("Education", () => {
  it("publishes the degree with its dates", () => {
    expect(education).toEqual([
      {
        id: "bsc-computer-science",
        qualification: "BSc Computer Science",
        institution: "University of Lahore",
        start: "February 2019",
        end: "January 2024",
      },
    ]);
  });

  it.each(education.map((entry) => [entry.qualification, entry] as const))(
    "%s is complete",
    (_qualification, entry) => {
      expect(educationProblems(entry)).toEqual([]);
    },
  );
});
