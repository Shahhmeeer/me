import { describe, expect, it } from "vitest";

import {
  colourTokens,
  compositeColour,
  contrastProblems,
  contrastRatio,
  driftProblems,
  frostingProblems,
  largeDisplayProblems,
  liftProblems,
  motionProblems,
  paletteProblems,
  welcomeMotion,
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
        color-scheme: light;
        --portfolio-background: #f2e2ba;
        --portfolio-foreground: #33342f;
      }
    `;

    expect(colourTokens(stylesheet)).toEqual({
      "--portfolio-background": "#f2e2ba",
      "--portfolio-foreground": "#33342f",
    });
  });

  it("does not read a token that is only mentioned in a comment", () => {
    const commented = ":root { /* --portfolio-accent: #000000; */ }";

    expect(colourTokens(commented)).toEqual({});
  });
});

/**
 * The light tokens as `app/globals.css` declares them (ADR-0006): the six
 * palette colours and the inks derived for them, one fixture for every
 * colour check below.
 */
const LIGHT_TOKENS = {
  "--portfolio-background": "#f2e2ba",
  "--portfolio-surface": "#f9f1dc",
  "--portfolio-surface-frosted": "rgb(249 241 220 / 0.72)",
  "--portfolio-foreground": "#33342f",
  "--portfolio-muted": "#50514f",
  "--portfolio-accent": "#2f5c85",
  "--portfolio-accent-border": "#2f5c85",
  "--portfolio-on-accent": "#f2e2ba",
  "--portfolio-action": "#e0afa0",
  "--portfolio-on-action": "#33342f",
  "--portfolio-chip": "#bad7f2",
  "--portfolio-disc": "#baf2d8",
};

describe("paletteProblems", () => {
  it("is quiet when every palette colour is a token value", () => {
    expect(paletteProblems(LIGHT_TOKENS)).toEqual([]);
  });

  it("does not care about the case of the hex digits", () => {
    expect(
      paletteProblems({ ...LIGHT_TOKENS, "--portfolio-action": "#E0AFA0" }),
    ).toEqual([]);
  });

  it("names a palette colour that no token carries", () => {
    const withoutBlush = Object.fromEntries(
      Object.entries(LIGHT_TOKENS).filter(([name]) => name !== "--portfolio-action"),
    );

    const problems = paletteProblems(withoutBlush);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("#e0afa0");
  });

  /** Deep Sky is derived, not chosen, and it is held to a token all the same. */
  it("holds Deep Sky, the derived ink, to a token beside the five chosen colours", () => {
    const withoutDeepSky = {
      ...LIGHT_TOKENS,
      "--portfolio-accent": "#1f4468",
      "--portfolio-accent-border": "#1f4468",
    };

    expect(paletteProblems(withoutDeepSky)).toEqual([
      "#2f5c85 is in the palette but is not the value of any token",
    ]);
  });
});

describe("liftProblems", () => {
  it("is quiet when hover and focus-within only recolour", () => {
    const quiet = `
      .card { transform: rotate(-1deg); }
      .card:hover, .card:focus-within { border-color: #2f5c85; }
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

describe("compositeColour", () => {
  it("lays a translucent colour over an opaque one", () => {
    expect(compositeColour("rgb(0 0 0 / 0.5)", "#ffffff")).toBe("#808080");
    expect(compositeColour("rgb(255 255 255 / 0.25)", "#000000")).toBe("#404040");
  });

  it("leaves an opaque colour as it is", () => {
    expect(compositeColour("#123456", "#ffffff")).toBe("#123456");
    expect(compositeColour("rgb(18 52 86 / 1)", "#ffffff")).toBe("#123456");
  });
});

describe("contrastProblems", () => {
  it("is quiet for the light tokens", () => {
    expect(contrastProblems(LIGHT_TOKENS)).toEqual([]);
  });

  it("holds a line to the 3:1 non-text threshold, not the text one", () => {
    const paleLine = {
      ...LIGHT_TOKENS,
      "--portfolio-accent-border": "#7fa3c4",
    };

    const problems = contrastProblems(paleLine);

    expect(problems).toHaveLength(2);
    for (const problem of problems) {
      expect(problem).toContain("--portfolio-accent-border on");
      expect(problem).toContain("below 3:1");
    }
  });

  it("measures the button text on the button", () => {
    const problems = contrastProblems({
      ...LIGHT_TOKENS,
      "--portfolio-on-action": "#50514f",
    });

    expect(problems).toEqual([
      "--portfolio-on-action on --portfolio-action is 4.11:1, below 4.5:1",
    ]);
  });

  it("measures the chip's text and its year on the chip", () => {
    const problems = contrastProblems({
      ...LIGHT_TOKENS,
      "--portfolio-chip": "#2f5c85",
    });

    expect(problems).toEqual([
      expect.stringContaining("--portfolio-foreground on --portfolio-chip is"),
      expect.stringContaining("--portfolio-muted on --portfolio-chip is"),
    ]);
  });

  /**
   * The pill is translucent, so its text is read on the pill laid over the
   * ground, the darkest thing it floats over: a card under it is lighter.
   */
  it("measures the pill's text on the frosted surface laid over the ground", () => {
    const inkyPill = {
      ...LIGHT_TOKENS,
      "--portfolio-surface-frosted": "rgb(51 52 47 / 0.6)",
    };

    const problems = contrastProblems(inkyPill);

    expect(problems).toEqual([
      expect.stringContaining("--portfolio-foreground on --portfolio-surface-frosted is"),
      expect.stringContaining("--portfolio-muted on --portfolio-surface-frosted is"),
      expect.stringContaining("--portfolio-accent on --portfolio-surface-frosted is"),
    ]);
  });

  it("cannot measure a translucent surface with no ground under it", () => {
    const { "--portfolio-background": ground, ...noGround } = LIGHT_TOKENS;

    expect(ground).toBeDefined();
    expect(contrastProblems(noGround)).toContainEqual(
      "--portfolio-surface-frosted is laid over --portfolio-background, which is not declared",
    );
  });
});

describe("liftProblems", () => {
  /**
   * The one movement hover may make: the Bar's arrows nudge the way they
   * point, two pixels and no further, and only they may.
   */
  it("allows the Bar's arrows to nudge sideways on hover, within reach", () => {
    const nudged = `
      .arrow[data-direction="back"]:hover:not(:disabled) { translate: -2px 0; }
      .arrow[data-direction="on"]:hover:not(:disabled) { translate: 2px; }
    `;

    expect(liftProblems(nudged)).toEqual([]);
  });

  it("holds the arrows' nudge to its reach, and to sideways", () => {
    expect(liftProblems(".arrow:hover { translate: 3px 0; }")).toHaveLength(1);
    expect(liftProblems(".arrow:hover { translate: 0 -2px; }")).toHaveLength(1);
    expect(liftProblems(".arrow:hover { transform: translateX(2px); }")).toHaveLength(1);
  });

  it("lets nothing but the arrows nudge", () => {
    expect(liftProblems(".dot:hover { translate: 2px 0; }")).toHaveLength(1);
    expect(liftProblems(".arrow:hover, .card:hover { translate: 2px 0; }")).toHaveLength(1);
    expect(liftProblems(".arrows:hover { translate: 2px 0; }")).toHaveLength(1);
    expect(liftProblems(".arrow .card:hover { translate: 2px 0; }")).toHaveLength(1);
    expect(liftProblems(".arrow>.card:hover { translate: 2px 0; }")).toHaveLength(1);
  });

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
    "--portfolio-surface": "#f9f1dc",
    "--portfolio-surface-frosted": "rgb(249 241 220 / 0.72)",
  };

  it("accepts a blur painted on a translucent token", () => {
    const css =
      ".pill { background: var(--portfolio-surface-frosted); backdrop-filter: blur(16px); }";

    expect(frostingProblems(css, tokens)).toEqual([]);
  });

  it("rejects a stylesheet that frosts nothing", () => {
    expect(frostingProblems(".pill { background: red; }", tokens)).toHaveLength(1);
  });

  it("rejects a blur with no token behind it", () => {
    expect(
      frostingProblems(".pill { background: #f9f1dc; backdrop-filter: blur(16px); }", tokens),
    ).toHaveLength(1);
  });

  it("rejects a blur behind an opaque token", () => {
    expect(
      frostingProblems(
        ".pill { background: var(--portfolio-surface); backdrop-filter: blur(16px); }",
        tokens,
      ),
    ).toEqual([
      ".pill is frosted but --portfolio-surface is #f9f1dc, which nothing shows through",
    ]);
  });

  it("blames the rule, not the layer or media block that holds it", () => {
    const css =
      "@layer components { .pill { background: var(--portfolio-surface-frosted); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); } }";

    expect(frostingProblems(css, tokens)).toEqual([]);
    expect(
      frostingProblems(css.replace("var(--portfolio-surface-frosted)", "#f9f1dc"), tokens),
    ).toEqual([".pill blurs its backdrop but paints no token behind it"]);
  });
});

describe("welcomeMotion", () => {
  it("lists what moves inside no-preference, by selector, once each", () => {
    const sheltered = `
      @media (prefers-reduced-motion: no-preference) {
        .strip { scroll-behavior: smooth; }
        .card { transition: border-color 200ms ease-out; }
        @layer components {
          .disc { animation: drift 30s linear infinite; }
          .disc { animation-delay: 1s; }
        }
        .still { opacity: 0; }
      }
      .outside { transition: opacity 200ms; }
    `;

    expect(welcomeMotion(sheltered)).toEqual([".strip", ".card", ".disc"]);
  });

  it("leaves out movement switched off", () => {
    const off = `
      @media (prefers-reduced-motion: no-preference) {
        .card { transition: none; }
        .strip { scroll-behavior: auto; }
      }
    `;

    expect(welcomeMotion(off)).toEqual([]);
  });
});

describe("motionProblems", () => {
  it("is quiet when every movement sits inside no-preference", () => {
    const sheltered = `
      @media (prefers-reduced-motion: no-preference) {
        .strip { scroll-behavior: smooth; }
        .card { transition: border-color 200ms ease-out; }
        .disc { animation: drift 30s linear infinite; }
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
      @layer components { .disc { animation: drift 30s; } }
    `;

    expect(motionProblems(moving)).toHaveLength(2);
  });

  it("allows an instant scroll and switched-off movement anywhere", () => {
    const still = `
      .strip { scroll-behavior: auto; }
      .disc { animation: none; transition: none; }
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
      50% { translate: 1.8vw 0.4vh; }
      to { translate: 2.8vw 2vh; }
    }
    .disc { pointer-events: none; }
    @media (prefers-reduced-motion: no-preference) {
      .disc { animation: drift 20s ease-in-out infinite alternate; }
    }
  `;

  it("is quiet when a three-stop keyframe translates 2.8vw by 2vh over a 20 second cycle", () => {
    expect(driftProblems(drifting)).toEqual([]);
  });

  it("names a drifting thing that a pointer could land on", () => {
    expect(driftProblems(drifting.replace(".disc { pointer-events: none; }", ""))).toHaveLength(1);
  });

  it("reads transform as a move when it only translates", () => {
    const transformed = drifting.replace(
      "to { translate: 2.8vw 2vh; }",
      "to { transform: translate(2.8vw, 2vh); }",
    );

    expect(driftProblems(transformed)).toEqual([]);
  });

  it("names a keyframe that does anything but translate", () => {
    const fading = drifting.replace(
      "to { translate: 2.8vw 2vh; }",
      "to { translate: 2.8vw 2vh; opacity: 0.5; }",
    );
    const scaling = drifting.replace(
      "to { translate: 2.8vw 2vh; }",
      "to { transform: translate(2.8vw, 2vh) scale(1.2); }",
    );

    expect(driftProblems(fading)).toHaveLength(1);
    expect(driftProblems(scaling)).toHaveLength(1);
  });

  it("names a keyframe with two stops, or four, where the path bends once", () => {
    const straight = drifting.replace("50% { translate: 1.8vw 0.4vh; }", "");
    const wandering = drifting.replace(
      "50% { translate: 1.8vw 0.4vh; }",
      "33% { translate: 1vw 0.2vh; } 66% { translate: 1.8vw 0.4vh; }",
    );

    expect(driftProblems(straight)).toHaveLength(1);
    expect(driftProblems(wandering)).toHaveLength(1);
  });

  it("names a keyframe whose last stop is not the travel", () => {
    expect(driftProblems(drifting.replace("2.8vw 2vh", "1vw 0.5vh"))).toHaveLength(1);
    expect(driftProblems(drifting.replace("2.8vw 2vh", "2.8vw"))).toHaveLength(1);
  });

  it("names a keyframe that does not start from rest", () => {
    expect(driftProblems(drifting.replace("from { translate: 0 0; }", "from { translate: 2vw 0; }"))).toHaveLength(1);
  });

  it("names a drift whose cycle is not 20 seconds", () => {
    expect(driftProblems(drifting.replace("20s", "5s"))).toHaveLength(1);
    expect(driftProblems(drifting.replace("20s", "32s"))).toHaveLength(1);
    expect(driftProblems(drifting.replace("20s", "20000ms"))).toEqual([]);
  });

  it("names an animation whose keyframes are not in the sheet", () => {
    expect(driftProblems(drifting.replace("@keyframes drift", "@keyframes float"))).toHaveLength(1);
  });

  it("names a sheet where nothing drifts", () => {
    expect(driftProblems(".disc { opacity: 0.3; }")).toHaveLength(1);
  });

  /** The path, the cycle and the bend are the Disc's; another keyframe is held to translate only and to a pointerless thing. */
  it("holds only the Disc's keyframe to the path, and another to translate only on a pointerless thing", () => {
    const floating = `${drifting}
      @keyframes float { from { translate: 0 -5px; } to { translate: 0 7px; } }
      .piece { pointer-events: none; }
      @media (prefers-reduced-motion: no-preference) {
        .piece[data-arrived="true"] { animation: float 7s ease-in-out infinite alternate; }
      }
    `;

    expect(driftProblems(floating)).toEqual([]);
    expect(driftProblems(floating.replace("translate: 0 7px;", "translate: 0 7px; scale: 1.1;"))).toHaveLength(1);
    expect(driftProblems(floating.replace(".piece { pointer-events: none; }", ""))).toHaveLength(1);
  });

  /** A pointer switched off under `@variant large` is switched off for the thing the variant is written in. */
  it("reads a pointer switched off inside a nested variant as the thing's own", () => {
    const nested = drifting.replace(
      ".disc { pointer-events: none; }",
      ".disc { @variant large { pointer-events: none; } }",
    );

    expect(driftProblems(nested)).toEqual([]);
  });
});

describe("largeDisplayProblems", () => {
  const written =
    "@custom-variant large (@media (min-width: 1280px) and (orientation: landscape) and (pointer: fine));";

  it("is quiet when the variant names 1280px, landscape and a fine pointer", () => {
    expect(largeDisplayProblems(written)).toEqual([]);
  });

  it("does not care about the order of the conditions or the spacing", () => {
    const reordered =
      "@custom-variant large (@media (pointer:fine) and (min-width:1280px) and (orientation:landscape));";

    expect(largeDisplayProblems(reordered)).toEqual([]);
  });

  it("names a sheet with no large variant", () => {
    expect(largeDisplayProblems(".strip { height: 100svh; }")).toHaveLength(1);
  });

  it("names a width other than 1280px", () => {
    const problems = largeDisplayProblems(written.replace("1280px", "1024px"));

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("1024px");
  });

  it("names each condition that is dropped", () => {
    const noWidth = written.replace("(min-width: 1280px) and ", "");
    const noOrientation = written.replace(" and (orientation: landscape)", "");
    const noPointer = written.replace(" and (pointer: fine)", "");

    expect(largeDisplayProblems(noWidth)).toHaveLength(1);
    expect(largeDisplayProblems(noOrientation)).toHaveLength(1);
    expect(largeDisplayProblems(noPointer)).toHaveLength(1);
    expect(largeDisplayProblems("@custom-variant large (@media (pointer: fine));")).toHaveLength(2);
  });

  it("names a rule elsewhere that asks about width, orientation or pointer", () => {
    const restated = `
      ${written}
      @media (min-width: 1280px) { .card { width: 36rem; } }
      @media (prefers-reduced-motion: no-preference) { .strip { scroll-behavior: smooth; } }
    `;

    const problems = largeDisplayProblems(restated);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("min-width: 1280px");
  });

  it("does not read a variant that is only mentioned in a comment", () => {
    const commented = `
      /* @custom-variant large (@media (min-width: 1024px)); */
      ${written}
    `;

    expect(largeDisplayProblems(commented)).toEqual([]);
  });
});
