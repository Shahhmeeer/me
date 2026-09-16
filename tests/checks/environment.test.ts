import { describe, expect, it } from "vitest";

import { envEntries, envExampleProblems, envNamesReadBy } from "./environment";

describe("envNamesReadBy", () => {
  it("reads every name a source reads from process.env, once each, in order", () => {
    const source = `
      const a = process.env.RESEND_API_KEY;
      const b = process.env.TURNSTILE_SECRET_KEY ?? process.env.RESEND_API_KEY;
      const c = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    `;
    expect(envNamesReadBy(source)).toEqual([
      "RESEND_API_KEY",
      "TURNSTILE_SECRET_KEY",
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    ]);
  });

  it("reads none from a source that reads none", () => {
    expect(envNamesReadBy("const env = process.env;")).toEqual([]);
  });
});

describe("envEntries", () => {
  it("reads NAME=value lines and drops comments and blank lines", () => {
    expect(envEntries("# a comment\n\nA=1\nB=\r\n  C=three words  \n")).toEqual([
      { name: "A", value: "1" },
      { name: "B", value: "" },
      { name: "C", value: "three words" },
    ]);
  });
});

describe("envExampleProblems", () => {
  const names = ["RESEND_API_KEY", "TURNSTILE_SECRET_KEY"];

  it("accepts a file naming every variable with no value", () => {
    expect(
      envExampleProblems(
        "# the keys\nRESEND_API_KEY=\nTURNSTILE_SECRET_KEY=\n",
        names,
      ),
    ).toEqual([]);
  });

  it("rejects a file missing a name", () => {
    expect(envExampleProblems("RESEND_API_KEY=\n", names)).not.toEqual([]);
  });

  it("rejects a name nothing reads", () => {
    expect(
      envExampleProblems(
        "RESEND_API_KEY=\nTURNSTILE_SECRET_KEY=\nOLD_KEY=\n",
        names,
      ),
    ).not.toEqual([]);
  });

  it("rejects a value, because the file is committed", () => {
    expect(
      envExampleProblems(
        "RESEND_API_KEY=re_123\nTURNSTILE_SECRET_KEY=\n",
        names,
      ),
    ).not.toEqual([]);
  });
});
