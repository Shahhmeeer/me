import { describe, expect, it } from "vitest";

import { about, contact } from "@/content/site";
import { aboutProblems } from "./checks/profile-rules";

describe("Headline", () => {
  /**
   * The Headline is the one line that says who Shahmeer is, and the Share
   * Card title is built from it, so a change here is a change to both.
   */
  it('is "Senior Salesforce Developer"', () => {
    expect(contact.headline).toBe("Senior Salesforce Developer");
  });
});

describe("About", () => {
  /**
   * Shahmeer is employed, so the three sentences must never read as a job
   * search. That is checked here rather than left to a proofread.
   */
  it("is three sentences and signals no job search", () => {
    expect(aboutProblems(about)).toEqual([]);
  });

  /**
   * The first sentence dates the Salesforce work from its start rather than
   * counting years, so it agrees with the Role dates on the same page for as
   * long as the start date stands.
   */
  it('dates the work "since 2023" and counts no years', () => {
    expect(about[0]).toContain("since 2023");
    expect(about[0]).not.toMatch(/\d\s*years/i);
  });

  it("states where Shahmeer is and which hours he has worked", () => {
    expect(contact.location).toBe("Islamabad, Pakistan");
    expect(contact.timezoneAvailability.toLowerCase()).toContain("est");
  });
});
