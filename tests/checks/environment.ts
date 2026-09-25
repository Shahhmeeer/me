/**
 * What the repo says about the environment the contact route runs in.
 *
 * The route reads its keys from `process.env`, and nothing else in the repo
 * knows their names: not `.env.example`, which a fresh clone copies, not the
 * setup doc, which says what to set, and not the wizard, which sets it. Each of
 * them can drift from the code on its own, so the names are read off the
 * source here and the files are held to them.
 */

/** `process.env.NAME`, as the route and the page read a variable. */
const ENV_READ = /process\.env\.([A-Z][A-Z0-9_]*)/g;

/** A line of an env file: `NAME=value`, or `NAME=` for a name with no value. */
const ENV_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

/** One line of an env file: the name, and whatever follows the `=`. */
export type EnvEntry = { name: string; value: string };

/**
 * Every variable name a source file reads from the environment, once each,
 * in the order first read.
 */
export function envNamesReadBy(source: string): string[] {
  return [...new Set([...source.matchAll(ENV_READ)].map((match) => match[1]))];
}

/**
 * The entries of an env file. Comments, blank lines and anything else that
 * is not `NAME=value` are dropped: the file is held to what it declares.
 */
export function envEntries(text: string): EnvEntry[] {
  const entries: EnvEntry[] = [];

  for (const line of text.split(/\r?\n/)) {
    const match = ENV_LINE.exec(line.trim());
    if (match) {
      entries.push({ name: match[1], value: match[2] });
    }
  }

  return entries;
}

/**
 * Problems with `.env.example`: it names every variable in `names`, names
 * nothing else, and gives no name a value, because it is committed and a
 * value in it is a secret in the repo.
 */
export function envExampleProblems(
  text: string,
  names: readonly string[],
): string[] {
  const problems: string[] = [];
  const entries = envEntries(text);
  const listed = entries.map((entry) => entry.name);

  for (const name of names) {
    if (!listed.includes(name)) {
      problems.push(`.env.example must list ${name}, and does not.`);
    }
  }
  for (const entry of entries) {
    if (!names.includes(entry.name)) {
      problems.push(`.env.example lists ${entry.name}, which nothing reads.`);
    }
    if (entry.value.trim() !== "") {
      problems.push(
        `.env.example must give ${entry.name} no value, but gives one.`,
      );
    }
  }

  return problems;
}

/**
 * A `.gitignore` pattern as a regular expression over a file name at the
 * repo root: `*` is any run of characters, `?` is one, a leading `/` only
 * anchors what is anchored already, and everything else is itself.
 */
function ignorePattern(pattern: string): RegExp {
  const escaped = pattern
    .replace(/^\//, "")
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll("*", "[^/]*")
    .replaceAll("?", "[^/]");

  return new RegExp(`^${escaped}$`);
}

/**
 * Whether git, reading these `.gitignore` rules, ignores a file at the repo
 * root. The rules are read as git reads them: comments and blank lines
 * skipped, a leading `!` un-ignoring, the last rule that matches winning.
 * Only a root-level file name is answered, which is all `.env.local` and
 * `.env.example` are; git itself is not run, because the checks run in a
 * build that need not have it.
 */
export function ignoredAtRoot(gitignore: string, fileName: string): boolean {
  let ignored = false;

  for (const raw of gitignore.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const negated = line.startsWith("!");
    const pattern = negated ? line.slice(1) : line;
    if (pattern.endsWith("/") || pattern.slice(1).includes("/")) {
      continue; // a directory, or a path below the root: never this file
    }
    if (ignorePattern(pattern).test(fileName)) {
      ignored = !negated;
    }
  }

  return ignored;
}
