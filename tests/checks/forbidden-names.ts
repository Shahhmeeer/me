/**
 * The forbidden client-name list, and the search that uses it.
 *
 * This repo is public. Committing the list would publish the very names it
 * guards, so the list arrives from outside the repo: an environment variable
 * in CI, a gitignored file for a developer working locally.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The environment variable that carries the list in CI. */
export const ENVIRONMENT_VARIABLE = "FORBIDDEN_CLIENT_NAMES";

/** The gitignored file a developer may keep at the repo root instead. */
export const LOCAL_FILE = ".forbidden-client-names";

export type NameListSource = "environment" | "file" | "none";

export type ForbiddenNameList = {
  names: string[];
  /** Where the names came from. "none" means the guard cannot run. */
  source: NameListSource;
};

/** One forbidden name, and the published string it was found in. */
export type ForbiddenMention = {
  name: string;
  text: string;
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Names split from raw text. Commas and newlines both separate, blank entries
 * are dropped, and a line starting with "#" is a comment.
 */
export function parseNameList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && !entry.startsWith("#"));
}

/** True when the checks are running on a build server. */
export function isContinuousIntegration(
  environment: Record<string, string | undefined> = process.env,
): boolean {
  const value = environment.CI;
  return value !== undefined && value !== "" && value !== "false";
}

function readLocalFileFromDisk(): string | null {
  try {
    return readFileSync(join(repoRoot, LOCAL_FILE), "utf8");
  } catch {
    return null;
  }
}

/**
 * The list, from the environment variable first and the gitignored file
 * second. A source of "none" means no list was supplied; the caller decides
 * whether that is a warning or a failure.
 */
export function loadForbiddenNames(
  options: {
    environment?: Record<string, string | undefined>;
    readLocalFile?: () => string | null;
  } = {},
): ForbiddenNameList {
  const environment = options.environment ?? process.env;
  const readLocalFile = options.readLocalFile ?? readLocalFileFromDisk;

  const fromEnvironment = parseNameList(environment[ENVIRONMENT_VARIABLE] ?? "");
  if (fromEnvironment.length > 0) {
    return { names: fromEnvironment, source: "environment" };
  }

  const fromFile = parseNameList(readLocalFile() ?? "");
  if (fromFile.length > 0) {
    return { names: fromFile, source: "file" };
  }

  return { names: [], source: "none" };
}

/**
 * Every forbidden name found in the given strings, once per name per string.
 * The search is case-insensitive and does not respect word boundaries, so
 * "globex-portal" is caught. A guard should shout too often, never too little.
 */
export function findForbiddenMentions(
  strings: readonly string[],
  names: readonly string[],
): ForbiddenMention[] {
  const mentions: ForbiddenMention[] = [];

  for (const text of strings) {
    const haystack = text.toLowerCase();
    for (const name of names) {
      if (haystack.includes(name.toLowerCase())) {
        mentions.push({ name, text });
      }
    }
  }

  return mentions;
}
