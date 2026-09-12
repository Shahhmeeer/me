import { describe, expect, it } from "vitest";

import {
  colourTokens,
  contrastRatio,
  liftProblems,
  paletteProblems,
} from "./contrast";

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

describe("colourTokens", () => {
  it("reads every token from the first :root block", () => {
    const stylesheet = `
      :root {
        color-scheme: dark;
        --portfolio-background: #1f1e1e;
        --portfolio-foreground: #e3d9da;
      }
    `;

    expect(colourTokens(stylesheet)).toEqual({
      "--portfolio-background": "#1f1e1e",
      "--portfolio-foreground": "#e3d9da",
    });
  });

  it("does not read a token that is only mentioned in a comment", () => {
    const commented = ":root { /* --portfolio-accent: #000000; */ }";

    expect(colourTokens(commented)).toEqual({});
  });
});

describe("paletteProblems", () => {
  const onPalette = {
    "--portfolio-background": "#1F1E1E",
    "--portfolio-foreground": "#E3D9DA",
    "--portfolio-accent-border": "#077D7E",
    "--portfolio-accent": "#6ED6D4",
    "--portfolio-action": "#DA7A7A",
  };

  it("is quiet when every palette colour is a token value", () => {
    expect(paletteProblems(onPalette)).toEqual([]);
  });

  it("does not care about the case of the hex digits", () => {
    expect(
      paletteProblems({ ...onPalette, "--portfolio-action": "#da7a7a" }),
    ).toEqual([]);
  });

  it("names a palette colour that no token carries", () => {
    const withoutCoral = Object.fromEntries(
      Object.entries(onPalette).filter(([name]) => name !== "--portfolio-action"),
    );

    const problems = paletteProblems(withoutCoral);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("#DA7A7A");
  });
});

describe("liftProblems", () => {
  it("is quiet when hover and focus-within only recolour", () => {
    const quiet = `
      .card { transform: rotate(-1deg); }
      .card:hover, .card:focus-within { border-color: #077D7E; }
    `;

    expect(liftProblems(quiet)).toEqual([]);
  });

  it("names a hover rule that moves the element", () => {
    const lifted = ".card:hover { transform: translateY(-2px); }";

    const problems = liftProblems(lifted);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(".card:hover");
  });

  it("catches a focus-within rule that scales", () => {
    expect(liftProblems(".card:focus-within { scale: 1.02; }")).toHaveLength(1);
  });

  it("allows a hover rule that switches movement off", () => {
    expect(liftProblems(".reveal:focus-within { transform: none; }")).toEqual(
      [],
    );
  });

  it("reads a rule nested inside a media query", () => {
    const nested = `
      @media (hover: hover) {
        .card:hover { transform: scale(1.02); }
      }
    `;

    expect(liftProblems(nested)).toHaveLength(1);
  });
});
