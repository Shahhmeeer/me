import { describe, expect, it } from "vitest";

import { certifications, certificationsCopy } from "@/content/site";
import { PUBLIC_DIR, pictureProblems } from "./checks/pictures";
import {
  certificationProblems,
  certificationsCopyProblems,
} from "./checks/profile-rules";

/**
 * The Recruiter's first filter. The three certifications are facts, so they are
 * pinned here: a silent edit to a name, a date or a badge fails the build.
 */
const EXPECTED = [
  {
    name: "Salesforce Certified Administrator",
    awarded: "January 2024",
    logo: "/images/SF_Certified_Platform_Admin.png",
  },
  {
    name: "Salesforce Certified Platform Developer I",
    awarded: "February 2024",
    logo: "/images/SF_Certified_Platform_DeveloperI.png",
  },
  {
    name: "Salesforce Certified Platform App Builder",
    awarded: "June 2024",
    logo: "/images/SF_Certified_Platform_App_Builder.png",
  },
];

describe("Certifications", () => {
  it("publishes the three certifications with their award dates and badges", () => {
    expect(
      certifications.map(({ name, awarded, logo }) => ({
        name,
        awarded,
        logo: logo.src,
      })),
    ).toEqual(EXPECTED);
  });

  it.each(certifications.map((c) => [c.name, c] as const))(
    "%s is complete",
    (_name, certification) => {
      expect(certificationProblems(certification)).toEqual([]);
    },
  );

  /**
   * The badge is a file under `public`, and a path is only a promise. Each
   * one is on disk at the size the content claims, with words for a screen
   * reader that name the certification.
   */
  it.each(certifications.map((c) => [c.name, c] as const))(
    "%s has its badge on disk",
    (_name, certification) => {
      expect(pictureProblems(certification.logo, PUBLIC_DIR)).toEqual([]);
      expect(certification.logo.alt).toContain(certification.name);
    },
  );
});

/**
 * The words the certifications Spread says beside the badges: one line
 * under the heading, and the link a Recruiter checks the credentials by.
 */
describe("the certifications copy", () => {
  it("says one line and links the verification page, off the site", () => {
    expect(certificationsCopyProblems(certificationsCopy)).toEqual([]);
  });

  /**
   * The link opens Salesforce's own verification page, where a visitor types
   * the email address printed beside it: no other page can vouch for a
   * credential, so the address is pinned here and changing it is a decision.
   */
  it("verifies on Trailhead, by Salesforce's credential verification page", () => {
    expect(certificationsCopy.verify.label).toBe("Verify on Trailhead");
    expect(certificationsCopy.verify.href).toBe(
      "https://trailhead.salesforce.com/credentials/verification",
    );
    expect(certificationsCopy.verify.external).toBe(true);
  });

  it("refuses a line of two sentences, a blank label, or a link kept on the site", () => {
    expect(
      certificationsCopyProblems({
        line: "Two sentences. Not one.",
        verify: { label: " ", href: "/credentials", external: false },
      }),
    ).toHaveLength(4);
  });
});
