/**
 * Flattening arbitrary content into plain text.
 *
 * The confidentiality guard must not depend on the shape of the content
 * module, because that shape keeps growing. So it walks whatever it is given
 * and returns every string it can reach.
 */

/**
 * Every string reachable from `value`, including object keys, because a client
 * name can hide in a key as easily as in a sentence. Numbers, booleans, null
 * and undefined carry no name and are skipped. A value that points back at
 * itself is visited once.
 */
export function collectStrings(value: unknown): string[] {
  const found: string[] = [];
  const visited = new Set<object>();

  const walk = (current: unknown): void => {
    if (typeof current === "string") {
      found.push(current);
      return;
    }

    if (current === null || typeof current !== "object") {
      return;
    }

    if (visited.has(current)) {
      return;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }

    for (const [key, nested] of Object.entries(current)) {
      found.push(key);
      walk(nested);
    }
  };

  walk(value);
  return found;
}
