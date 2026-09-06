import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import { contact, links, profileLinks } from "@/content/site";
import {
  emailProblems,
  gitHubProfileProblems,
  phoneNumberProblems,
} from "./checks/contact-rules";
import { collectStrings } from "./checks/strings";

const publishedStrings = collectStrings(content);

describe("contact", () => {
  it("publishes an email address, the site's one contact route", () => {
    expect(emailProblems(contact.email)).toEqual([]);
  });

  it("offers LinkedIn, Trailhead and the CV, in the Header and the footer alike", () => {
    expect(profileLinks(links).map((link) => link.label)).toEqual([
      links.linkedIn.label,
      links.trailhead.label,
      links.cv.label,
    ]);
  });
});

describe("what the site does not publish", () => {
  it("publishes no phone number anywhere", () => {
    expect(phoneNumberProblems(publishedStrings)).toEqual([]);
  });

  it("links no GitHub profile, though a Project may link its own repo", () => {
    expect(gitHubProfileProblems(publishedStrings)).toEqual([]);
  });
});
