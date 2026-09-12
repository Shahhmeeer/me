import { describe, expect, it } from "vitest";

import {
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
