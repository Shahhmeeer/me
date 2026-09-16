/**
 * What the repo says about the environment the contact route runs in.
 *
 * The route reads its keys from `process.env`, and nothing else in the repo
 * knows their names: not `.env.example`, which a fresh clone copies, not the
 * README, which says what to set, and not the wizard, which sets it. Each of
 * them can drift from the code on its own, so the names are read off the
 * source here and the files are held to them.
 */

/** `process.env.NAME`, as the route and the page read a variable. */
const ENV_READ = /process\.env\.([A-Z][A-Z0-9_]*)/g;

/** A line of an env file: `NAME=value`, or `NAME=` for a name with no value. */
const ENV_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

/**
 * Every variable name a source file reads from the environment, once each,
 * in the order first read.
 */
export function envNamesReadBy(source: string): string[] {
  return [...new Set([...source.matchAll(ENV_READ)].map((match) => match[1]))];
}

/**
 * The entries of an env file, comments and blank lines dropped. A line
 * that is neither is kept as a problem for the caller to name.
 */
export function envEntries(
  text: string,
): { name: string; value: string }[] {
  const entries: { name: string; value: string }[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const match = ENV_LINE.exec(trimmed);
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
      problems.push(
        `.env.example lists ${entry.name}, which nothing reads.`,
      );
    }
    if (entry.value.trim() !== "") {
      problems.push(
        `.env.example must give ${entry.name} no value, but gives one.`,
      );
    }
  }

  return problems;
}
