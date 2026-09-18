import { describe, expect, it } from "vitest";

import { about, contact, experience, sketch, sketchCutout } from "@/content/site";
import { PUBLIC_DIR, pictureHasAlpha, pictureProblems } from "./checks/pictures";
import { aboutProblems } from "./checks/profile-rules";
import { monthYearIndex } from "./checks/prose";

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
   * The pencil sketch is the Share Card's picture of Shahmeer. It is a file
   * under `public`, so it is checked to be there, and its alt text names him,
   * because a screen reader is the only way some visitors meet the picture.
   */
  it("is on disk and its alt text names Shahmeer", () => {
    expect(pictureProblems(sketch, PUBLIC_DIR)).toEqual([]);
    expect(sketch.alt).toContain(contact.name);
  });
});

describe("Sketch cutout", () => {
  /**
   * The same drawing with the paper taken away, for the portrait that sits on
   * a disc. It has to be the sketch's own size, so nothing about the face is
   * lost in the cut, and it has to carry an alpha channel, or the disc behind
   * it would be painted over by a white square. The path is lower case and
   * hyphenated, so the URL never needs a space escaped.
   */
  it("is a transparent PNG at the sketch's size, under a URL-clean name", () => {
    expect(pictureProblems(sketchCutout, PUBLIC_DIR)).toEqual([]);
    expect(pictureHasAlpha(sketchCutout, PUBLIC_DIR)).toBe(true);
    expect([sketchCutout.width, sketchCutout.height]).toEqual([
      sketch.width,
      sketch.height,
    ]);
    expect(sketchCutout.src).toMatch(/^\/images\/[a-z0-9-]+\.png$/);
  });

  it("names Shahmeer in its alt text", () => {
    expect(sketchCutout.alt).toContain(contact.name);
  });
});
