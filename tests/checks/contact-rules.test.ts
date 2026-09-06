import { describe, expect, it } from "vitest";

import {
  emailProblems,
  gitHubProfileProblems,
  phoneNumberProblems,
} from "./contact-rules";

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

describe("gitHubProfileProblems", () => {
  it("catches a link to the profile", () => {
    expect(
      gitHubProfileProblems(["https://github.com/Shahhmeeer"]),
    ).toHaveLength(1);
    expect(
      gitHubProfileProblems(["https://github.com/Shahhmeeer/"]),
    ).toHaveLength(1);
  });

  it("allows a link to one repo, which opens a named piece of work", () => {
    expect(
      gitHubProfileProblems(["https://github.com/Shahhmeeer/masoodia-website"]),
    ).toEqual([]);
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
