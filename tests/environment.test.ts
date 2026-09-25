/**
 * The environment the contact route runs in, as the repo documents it: the
 * names the route reads are the names `.env.example` lists, docs/setup.md
 * says to set, and the wizard sets; the file the wizard writes is never
 * committed; and the wizard is a script bash can read.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  envExampleProblems,
  envNamesReadBy,
  ignoredAtRoot,
} from "./checks/environment";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readAtRoot = (path: string): string =>
  readFileSync(join(ROOT, path), "utf8");

/** The path docs/setup.md points a reader at, relative to the repo root. */
const WIZARD = "docs/agents/keys-wizard.sh";

/** The names the route and the page read: the route's two secrets and the Form's site key. */
const names = [
  ...envNamesReadBy(readAtRoot("app/api/contact/handler.ts")),
  ...envNamesReadBy(readAtRoot("app/page.tsx")),
];

describe("the contact route's environment", () => {
  it("is three names: the two secrets and the public site key", () => {
    expect(names).toHaveLength(3);
    expect(names).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  });

  it("is listed in .env.example, every name and no value", () => {
    expect(envExampleProblems(readAtRoot(".env.example"), names)).toEqual([]);
  });

  it("is written to .env.local, which git ignores, while .env.example is committed", () => {
    const gitignore = readAtRoot(".gitignore");
    expect(ignoredAtRoot(gitignore, ".env.local")).toBe(true);
    expect(ignoredAtRoot(gitignore, ".env.example")).toBe(false);
  });

  it("is named in docs/setup.md, which points at the wizard", () => {
    const setup = readAtRoot("docs/setup.md");
    for (const name of names) {
      expect(setup).toContain(name);
    }
    expect(setup).toContain(WIZARD);
  });
});

describe("the keys wizard", () => {
  it("lives with the agent docs and names the three variables", () => {
    expect(existsSync(join(ROOT, WIZARD))).toBe(true);
    const script = readAtRoot(WIZARD);
    for (const name of names) {
      expect(script).toContain(name);
    }
  });

  /** `bash -n` parses without running: a wizard that opens browsers is never run here. */
  it("is a script bash can read", () => {
    expect(() =>
      execFileSync("bash", ["-n", WIZARD], { cwd: ROOT, stdio: "pipe" }),
    ).not.toThrow();
  });
});
