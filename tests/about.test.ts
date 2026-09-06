import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import { about, contact } from "@/content/site";
import { aboutProblems, findJobSearchPhrases } from "./checks/profile-rules";
import { collectStrings } from "./checks/strings";

describe("About", () => {
  it("is three sentences and signals no job search", () => {
    expect(aboutProblems(about)).toEqual([]);
  });

  it("states where Shahmeer is and which hours he has worked", () => {
    expect(contact.location).toBe("Islamabad, Pakistan");
    expect(contact.timezoneAvailability.toLowerCase()).toContain("est");
  });

  /**
   * Shahmeer is employed. The guard covers the whole content module, not just
   * the About block, because a job-search phrase is just as damaging in a
   * Highlight or a pitch.
   */
  it("says nothing anywhere in the content that reads as job hunting", () => {
    const found = findJobSearchPhrases(collectStrings(content));

    expect(
      found.map(({ phrase, text }) => `"${phrase}" appears in: ${text}`),
    ).toEqual([]);
  });
});
