import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import { contact, links, profileLinks } from "@/content/site";
import {
  emailProblems,
  gitHubLinkProblems,
  phoneNumberProblems,
} from "./checks/contact-rules";
import { collectStrings } from "./checks/strings";

const publishedStrings = collectStrings(content);

describe("contact", () => {
  it("publishes an email address, the site's one contact route", () => {
    expect(emailProblems(contact.email)).toEqual([]);
  });

  it("offers LinkedIn, GitHub, Trailhead and the CV, on Home and on Contact alike", () => {
    expect(profileLinks(links).map((link) => link.label)).toEqual([
      links.linkedIn.label,
      links.gitHub.label,
      links.trailhead.label,
      links.cv.label,
    ]);
  });

  it("links the GitHub profile, and every repo it links belongs to it", () => {
    expect(gitHubLinkProblems(links.gitHub, publishedStrings)).toEqual([]);
  });
});

describe("what the site does not publish", () => {
  it("publishes no phone number anywhere", () => {
    expect(phoneNumberProblems(publishedStrings)).toEqual([]);
  });
});
