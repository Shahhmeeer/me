import { describe, expect, it } from "vitest";

import type { ContactForm } from "@/content/site";
import {
  contactFormProblems,
  emailProblems,
  gitHubLinkProblems,
  phoneNumberProblems,
} from "./contact-rules";

const profile = {
  label: "GitHub",
  href: "https://github.com/Shahhmeeer",
  external: true,
};

describe("phoneNumberProblems", () => {
  it("catches a number a stranger could dial", () => {
    expect(phoneNumberProblems(["Call +92 300 1234567"])).toHaveLength(1);
    expect(phoneNumberProblems(["0300-1234567"])).toHaveLength(1);
    expect(phoneNumberProblems(["(042) 111 222 333"])).toHaveLength(1);
  });

  it("leaves the quantities the site states alone", () => {
    expect(
      phoneNumberProblems([
        "around 300 questions long",
        "150 bookings between them",
        "February 2019 to January 2024",
        "shahmeerasim1999@gmail.com",
      ]),
    ).toEqual([]);
  });
});

describe("gitHubLinkProblems", () => {
  it("accepts the profile and the repos under it", () => {
    expect(
      gitHubLinkProblems(profile, [
        "https://github.com/Shahhmeeer",
        "https://github.com/Shahhmeeer/masoodia-website",
      ]),
    ).toEqual([]);
  });

  it("rejects a profile link that is not one account", () => {
    expect(
      gitHubLinkProblems({ ...profile, href: "https://github.com/" }, []),
    ).toHaveLength(1);
    expect(
      gitHubLinkProblems(
        { ...profile, href: "https://github.com/Shahhmeeer/me" },
        [],
      ),
    ).toHaveLength(1);
    expect(
      gitHubLinkProblems(
        { ...profile, href: "http://github.com/Shahhmeeer" },
        [],
      ),
    ).toHaveLength(1);
  });

  it("rejects a second copy of the profile that is not the link itself", () => {
    expect(
      gitHubLinkProblems(profile, ["https://github.com/Shahhmeeer/"]),
    ).toHaveLength(1);
    expect(
      gitHubLinkProblems(profile, ["http://github.com/Shahhmeeer/me"]),
    ).toHaveLength(1);
  });

  it("reads the login the way GitHub does, without case", () => {
    expect(
      gitHubLinkProblems(profile, ["https://github.com/shahhmeeer/me"]),
    ).toEqual([]);
  });

  it("rejects a repo that belongs to someone else", () => {
    expect(
      gitHubLinkProblems(profile, [
        "https://github.com/trailheadapps/apex-recipes",
      ]),
    ).toHaveLength(1);
    expect(
      gitHubLinkProblems(profile, ["https://github.com/Shahhmeeer2/me"]),
    ).toHaveLength(1);
  });
});

describe("emailProblems", () => {
  it("accepts an address", () => {
    expect(emailProblems("shahmeerasim1999@gmail.com")).toEqual([]);
  });

  it("rejects anything that is not one", () => {
    expect(emailProblems("shahmeerasim1999")).not.toEqual([]);
    expect(emailProblems("")).not.toEqual([]);
  });
});

const email = "shahmeerasim1999@gmail.com";

const form: ContactForm = {
  action: "/api/contact",
  fields: {
    name: { name: "name", label: "Name", placeholder: "Your name" },
    email: { name: "email", label: "Email", placeholder: "you@example.com" },
    message: { name: "message", label: "Message", placeholder: "Say hello" },
  },
  honeypot: { name: "website", label: "Website" },
  submit: "Send",
  success: "Thanks, I reply within a day.",
  failure: `That did not send. Email me instead at ${email}.`,
};

describe("contactFormProblems", () => {
  it("accepts a form with every word said and a path to post to", () => {
    expect(contactFormProblems(form, email)).toEqual([]);
  });

  it("catches a blank word anywhere on the form", () => {
    expect(contactFormProblems({ ...form, submit: " " }, email)).toHaveLength(1);
    expect(
      contactFormProblems(
        { ...form, fields: { ...form.fields, name: { ...form.fields.name, label: "" } } },
        email,
      ),
    ).toHaveLength(1);
    expect(
      contactFormProblems({ ...form, honeypot: { ...form.honeypot, label: "" } }, email),
    ).toHaveLength(1);
  });

  it("catches a path that is not on this site", () => {
    expect(contactFormProblems({ ...form, action: "api/contact" }, email)).toHaveLength(1);
    expect(
      contactFormProblems({ ...form, action: "https://example.com/contact" }, email),
    ).toHaveLength(1);
  });

  it("catches two fields posted under one name, the honeypot included", () => {
    expect(
      contactFormProblems(
        { ...form, honeypot: { ...form.honeypot, name: "email" } },
        email,
      ),
    ).toHaveLength(1);
  });

  it("catches a field name a form could not post", () => {
    expect(
      contactFormProblems(
        { ...form, honeypot: { ...form.honeypot, name: "Web site" } },
        email,
      ),
    ).toHaveLength(1);
  });

  it("catches a failure line that does not name the email address", () => {
    expect(
      contactFormProblems({ ...form, failure: "That did not send." }, email),
    ).toHaveLength(1);
  });
});
