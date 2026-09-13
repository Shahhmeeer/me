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

/**
 * True when a value is not a string a visitor could read. Every content rule
 * starts here, so it lives beside `collectStrings` rather than being copied
 * into each rule module.
 *
 * Takes `unknown` on purpose. The types say these fields are required strings;
 * these checks exist to catch content that does not keep that promise.
 */
export function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

/**
 * An id a link can land on: lower-case letters, digits and hyphens, with a
 * hyphen only between two runs of the others. A Case Study's and a Role's
 * id is its Spread's element id, and so its address,
 * `#payment-gateway-integrations`, `#scaleable-solutions`; a Project's is
 * kept to the same shape so it can be one. Nothing a browser would escape,
 * nothing a hand would mistype for something else.
 */
const ELEMENT_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Problems with an id that is, or may become, an element id. Shared by the
 * rule modules for the same reason `isBlank` is: one shape, held once.
 */
export function elementIdProblems(kind: string, id: unknown): string[] {
  return typeof id === "string" && ELEMENT_ID.test(id)
    ? []
    : [
        `${kind} id must be lower-case letters, digits and hyphens, but is ${JSON.stringify(id)}.`,
      ];
}
