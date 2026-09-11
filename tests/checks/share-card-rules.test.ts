import { describe, expect, it } from "vitest";

import type { Contact, ShareCard } from "@/content/site";
import { canonicalUrlProblems, shareCardProblems } from "./share-card-rules";

const contact: Contact = {
  name: "Shahmeer Asim",
  headline: "Salesforce Developer",
  pitch: "A pitch.",
  email: "someone@example.com",
  callToAction: "Get in touch",
  location: "Somewhere",
  timezoneAvailability: "Some hours",
};

const sound: ShareCard = {
  url: "https://example.com",
  title: "Shahmeer Asim, Salesforce Developer",
  description: "A pitch.",
  imageAlt: "Shahmeer Asim, Salesforce Developer",
};

describe("shareCardProblems", () => {
  it("accepts a card that names Shahmeer and the Headline", () => {
    expect(shareCardProblems(sound, contact)).toEqual([]);
  });

  it("rejects a title without the name", () => {
    const problems = shareCardProblems(
      { ...sound, title: "Salesforce Developer" },
      contact,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Shahmeer Asim");
  });

  it("rejects a title without the Headline", () => {
    const problems = shareCardProblems(
      { ...sound, title: "Shahmeer Asim" },
      contact,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Salesforce Developer");
  });

  it("rejects a blank title, description or alt text", () => {
    expect(shareCardProblems({ ...sound, title: " " }, contact)).toHaveLength(1);
    expect(
      shareCardProblems({ ...sound, description: "" }, contact),
    ).toHaveLength(1);
    expect(shareCardProblems({ ...sound, imageAlt: "" }, contact)).toHaveLength(
      1,
    );
  });
});

describe("canonicalUrlProblems", () => {
  it("accepts a bare https origin", () => {
    expect(canonicalUrlProblems("https://shahmeerasim.me")).toEqual([]);
  });

  it("rejects http, a trailing slash, a path and a relative URL", () => {
    expect(canonicalUrlProblems("http://shahmeerasim.me")).toHaveLength(1);
    expect(canonicalUrlProblems("https://shahmeerasim.me/")).toHaveLength(1);
    expect(canonicalUrlProblems("https://shahmeerasim.me/about")).toHaveLength(1);
    expect(canonicalUrlProblems("/")).toHaveLength(1);
  });
});
