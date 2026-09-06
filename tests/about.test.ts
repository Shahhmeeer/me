import { describe, expect, it } from "vitest";

import { about, contact } from "@/content/site";
import { aboutProblems } from "./checks/profile-rules";

describe("About", () => {
  /**
   * Shahmeer is employed, so the three sentences must never read as a job
   * search. That is checked here rather than left to a proofread.
   */
  it("is three sentences and signals no job search", () => {
    expect(aboutProblems(about)).toEqual([]);
  });

  it("states where Shahmeer is and which hours he has worked", () => {
    expect(contact.location).toBe("Islamabad, Pakistan");
    expect(contact.timezoneAvailability.toLowerCase()).toContain("est");
  });
});
