import { describe, expect, it } from "vitest";

import { colourSchemes, contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#1d4ed8", "#1d4ed8")).toBeCloseTo(1, 5);
  });

  it("reads three-digit hex the same as six", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
  });

  it("does not care which colour is given first", () => {
    expect(contrastRatio("#565656", "#fcfcfc")).toBeCloseTo(
      contrastRatio("#fcfcfc", "#565656"),
      5,
    );
  });
});

describe("colourSchemes", () => {
  const stylesheet = `
    :root {
      --portfolio-background: #fcfcfc;
      --portfolio-foreground: #141414;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --portfolio-background: #0a0a0a;
      }
    }
  `;

  it("reads the light scheme from the first :root block", () => {
    expect(colourSchemes(stylesheet).light).toEqual({
      "--portfolio-background": "#fcfcfc",
      "--portfolio-foreground": "#141414",
    });
  });

  /** This is what a browser does: the dark block replaces, never resets. */
  it("inherits into the dark scheme what the dark block does not replace", () => {
    expect(colourSchemes(stylesheet).dark).toEqual({
      "--portfolio-background": "#0a0a0a",
      "--portfolio-foreground": "#141414",
    });
  });

  it("does not read a token that is only mentioned in a comment", () => {
    const commented = ":root { /* --portfolio-accent: #000000; */ }";

    expect(colourSchemes(commented).light).toEqual({});
  });
});
