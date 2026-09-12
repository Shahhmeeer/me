import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { about, contact, experience, sketch } from "@/content/site";
import { pictureProblems } from "./checks/pictures";
import { aboutProblems } from "./checks/profile-rules";
import { monthYearIndex } from "./checks/prose";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/** The year the earliest Role began, read off the same page the About is on. */
function earliestRoleYear(): number {
  const earliest = Math.min(
    ...experience.map((entry) => monthYearIndex(entry.start) ?? Infinity),
  );
  return Math.floor(earliest / 12);
}

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
   * The first sentence dates the Salesforce work from the year the earliest
   * Role began, rather than counting years, so it can never disagree with the
   * Role dates on the same page. A count, in digits or in words, is what it
   * must not say.
   */
  it("dates the work from the earliest Role's year and counts no years", () => {
    expect(about[0]).toContain(`since ${earliestRoleYear()}`);
    expect(about[0]).not.toMatch(
      /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?/i,
    );
  });

  it("states where Shahmeer is and which hours he has worked", () => {
    expect(contact.location).toBe("Islamabad, Pakistan");
    expect(contact.timezoneAvailability.toLowerCase()).toContain("est");
  });
});

describe("Sketch", () => {
  /**
   * The pencil sketch is the one picture of Shahmeer on the site. It is a file
   * under `public`, so it is checked to be there, and its alt text names him,
   * because a screen reader is the only way some visitors meet the picture.
   */
  it("is on disk and its alt text names Shahmeer", () => {
    expect(pictureProblems(sketch, publicDir)).toEqual([]);
    expect(sketch.alt).toContain(contact.name);
  });
});
