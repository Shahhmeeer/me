import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import { contact, contactCopy, links, profileLinks } from "@/content/site";
import {
  contactFormProblems,
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

  /**
   * The form's every word is said, it posts to this site, its fields have
   * names the route can read, and its failure line names the address.
   */
  it("carries a form with every word said, that fails back to the email address", () => {
    expect(contactFormProblems(contactCopy.form, contact.email)).toEqual([]);
  });

  /** The line is a promise, so it is pinned here: changing it is a decision. */
  it("promises a reply within a day", () => {
    expect(contactCopy.form.success).toBe("Thanks, I reply within a day.");
  });
});

describe("what the site does not publish", () => {
  it("publishes no phone number anywhere", () => {
    expect(phoneNumberProblems(publishedStrings)).toEqual([]);
  });
});
