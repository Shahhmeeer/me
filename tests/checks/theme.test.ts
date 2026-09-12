import { describe, expect, it } from "vitest";

import {
  colourTokens,
  contrastProblems,
  contrastRatio,
  driftProblems,
  frostingProblems,
  liftProblems,
  motionProblems,
  paletteProblems,
} from "./theme";

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

describe("contrastProblems", () => {
  it("holds a line to the 3:1 non-text threshold, not the text one", () => {
    const tokens = {
      "--portfolio-background": "#1F1E1E",
      "--portfolio-surface": "#272626",
      "--portfolio-band": "#181717",
      "--portfolio-foreground": "#E3D9DA",
      "--portfolio-muted": "#ABA1A2",
      "--portfolio-accent": "#6ED6D4",
      "--portfolio-accent-border": "#077D7E",
      "--portfolio-on-accent": "#1F1E1E",
      "--portfolio-action": "#DA7A7A",
      "--portfolio-on-action": "#1F1E1E",
    };

    expect(contrastProblems(tokens)).toEqual([]);
    expect(
      contrastProblems({ ...tokens, "--portfolio-surface": "#2A2929" }),
    ).toEqual([
      "--portfolio-accent-border on --portfolio-surface is 2.93:1, below 3:1",
    ]);
  });

  it("measures the button text on the button", () => {
    const problems = contrastProblems({
      "--portfolio-action": "#DA7A7A",
      "--portfolio-on-action": "#E3D9DA",
    });

    expect(problems).toContainEqual(
      expect.stringContaining("--portfolio-on-action on --portfolio-action is"),
    );
  });
});

describe("liftProblems", () => {
  it("does not mistake an at-rule for a hover selector", () => {
    const media = `
      @media (hover:hover) {
        .card { transform: rotate(-1deg); }
      }
    `;

    expect(liftProblems(media)).toEqual([]);
  });
});

describe("frostingProblems", () => {
  const tokens = {
    "--portfolio-surface": "#272626",
    "--portfolio-surface-frosted": "rgb(39 38 38 / 0.72)",
  };

  it("accepts a blur painted on a translucent token", () => {
    const css =
      ".nav { background: var(--portfolio-surface-frosted); backdrop-filter: blur(16px); }";

    expect(frostingProblems(css, tokens)).toEqual([]);
  });

  it("rejects a stylesheet that frosts nothing", () => {
    expect(frostingProblems(".nav { background: red; }", tokens)).toHaveLength(1);
  });

  it("rejects a blur with no token behind it", () => {
    expect(
      frostingProblems(".nav { background: #272626; backdrop-filter: blur(16px); }", tokens),
    ).toHaveLength(1);
  });

  it("rejects a blur behind an opaque token", () => {
    expect(
      frostingProblems(
        ".nav { background: var(--portfolio-surface); backdrop-filter: blur(16px); }",
        tokens,
      ),
    ).toEqual([
      ".nav is frosted but --portfolio-surface is #272626, which nothing shows through",
    ]);
  });

  it("blames the rule, not the layer or media block that holds it", () => {
    const css =
      "@layer components { .nav { background: var(--portfolio-surface-frosted); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); } }";

    expect(frostingProblems(css, tokens)).toEqual([]);
    expect(
      frostingProblems(css.replace("var(--portfolio-surface-frosted)", "#272626"), tokens),
    ).toEqual([".nav blurs its backdrop but paints no token behind it"]);
  });
});

describe("motionProblems", () => {
  it("is quiet when every movement sits inside no-preference", () => {
    const sheltered = `
      @media (prefers-reduced-motion: no-preference) {
        .strip { scroll-behavior: smooth; }
        .card { transition: border-color 200ms ease-out; }
        .blob { animation: drift 30s linear infinite; }
      }
    `;

    expect(motionProblems(sheltered)).toEqual([]);
  });

  it("names a smooth scroll that a visitor cannot switch off", () => {
    const problems = motionProblems(".strip { scroll-behavior: smooth; }");

    expect(problems).toEqual([
      ".strip sets scroll-behavior: smooth outside prefers-reduced-motion: no-preference",
    ]);
  });

  it("names a transition or an animation outside the shelter", () => {
    const moving = `
      .card { transition: border-color 200ms; }
      @layer components { .blob { animation: drift 30s; } }
    `;

    expect(motionProblems(moving)).toHaveLength(2);
  });

  it("allows an instant scroll and switched-off movement anywhere", () => {
    const still = `
      .strip { scroll-behavior: auto; }
      .blob { animation: none; transition: none; }
    `;

    expect(motionProblems(still)).toEqual([]);
  });

  it("reads the shelter from any enclosing block, not just the nearest", () => {
    const nested = `
      @media (prefers-reduced-motion: no-preference) {
        @layer components {
          .strip { @variant large { scroll-behavior: smooth; } }
        }
      }
    `;

    expect(motionProblems(nested)).toEqual([]);
  });

  it("does not take a reduce block for a shelter", () => {
    const reduced = `
      @media (prefers-reduced-motion: reduce) {
        .strip { scroll-behavior: smooth; }
      }
    `;

    expect(motionProblems(reduced)).toHaveLength(1);
  });
});

describe("liftProblems", () => {
  it("reads a hover rule that moves inside a nested variant", () => {
    const nested = ".card:hover { @variant large { transform: scale(1.02); } }";

    expect(liftProblems(nested)).toHaveLength(1);
  });
});

describe("driftProblems", () => {
  const drifting = `
    @keyframes drift {
      from { translate: 0 0; }
      to { translate: 4vw 3vh; }
    }
    .blob { pointer-events: none; }
    @media (prefers-reduced-motion: no-preference) {
      .blob { animation: drift 30s ease-in-out infinite alternate; }
    }
  `;

  it("is quiet when a keyframe moves by translate only, over 20 to 40 seconds", () => {
    expect(driftProblems(drifting)).toEqual([]);
  });

  it("names a drifting thing that a pointer could land on", () => {
    expect(driftProblems(drifting.replace(".blob { pointer-events: none; }", ""))).toHaveLength(1);
  });

  it("reads transform as a move when it only translates", () => {
    const transformed = drifting.replace(
      "to { translate: 4vw 3vh; }",
      "to { transform: translate(4vw, 3vh); }",
    );

    expect(driftProblems(transformed)).toEqual([]);
  });

  it("names a keyframe that does anything but translate", () => {
    const fading = drifting.replace(
      "to { translate: 4vw 3vh; }",
      "to { translate: 4vw 3vh; opacity: 0.5; }",
    );
    const scaling = drifting.replace(
      "to { translate: 4vw 3vh; }",
      "to { transform: translate(4vw, 3vh) scale(1.2); }",
    );

    expect(driftProblems(fading)).toHaveLength(1);
    expect(driftProblems(scaling)).toHaveLength(1);
  });

  it("names a drift that is too quick or too slow", () => {
    expect(driftProblems(drifting.replace("30s", "5s"))).toHaveLength(1);
    expect(driftProblems(drifting.replace("30s", "60s"))).toHaveLength(1);
    expect(driftProblems(drifting.replace("30s", "25000ms"))).toEqual([]);
  });

  it("names an animation whose keyframes are not in the sheet", () => {
    expect(driftProblems(drifting.replace("@keyframes drift", "@keyframes float"))).toHaveLength(1);
  });

  it("names a sheet where nothing drifts", () => {
    expect(driftProblems(".blob { opacity: 0.3; }")).toHaveLength(1);
  });
});
