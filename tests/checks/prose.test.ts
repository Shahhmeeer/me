import { describe, expect, it } from "vitest";

import { countSentences, isMonthYear, monthYearIndex } from "./prose";

describe("isMonthYear", () => {
  it("accepts a month and a year", () => {
    expect(isMonthYear("January 2024")).toBe(true);
    expect(isMonthYear("September 1999")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isMonthYear("2024")).toBe(false);
    expect(isMonthYear("Jan 2024")).toBe(false);
    expect(isMonthYear("January")).toBe(false);
    expect(isMonthYear("January 2024 ")).toBe(false);
    expect(isMonthYear(undefined)).toBe(false);
  });
});

describe("monthYearIndex", () => {
  it("sorts in calendar order across a year boundary", () => {
    const december = monthYearIndex("December 2023")!;
    const january = monthYearIndex("January 2024")!;

    expect(december).toBeLessThan(january);
  });

  it("sorts months inside one year", () => {
    expect(monthYearIndex("April 2024")!).toBeLessThan(
      monthYearIndex("May 2024")!,
    );
  });

  it("gives the same month the same number", () => {
    expect(monthYearIndex("May 2026")).toBe(monthYearIndex("May 2026"));
  });

  it("returns null for anything that is not a month and a year", () => {
    expect(monthYearIndex("Present")).toBeNull();
    expect(monthYearIndex("2024")).toBeNull();
  });
});

describe("countSentences", () => {
  it("counts one sentence", () => {
    expect(countSentences("He builds portals.")).toBe(1);
  });

  it("counts two", () => {
    expect(countSentences("He builds portals. He ships them.")).toBe(2);
  });

  it("does not split an abbreviation", () => {
    expect(countSentences("He builds portals, e.g. a booking portal.")).toBe(1);
  });
});
