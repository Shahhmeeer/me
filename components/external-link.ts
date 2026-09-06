/**
 * The attributes every link that leaves this site wears.
 *
 * `target` opens the other site in a new tab, so a visitor never loses this
 * page. `rel` cuts that new tab off from this one: `noopener` denies the
 * opened page a handle on this window, `noreferrer` keeps this address to
 * itself.
 *
 * One definition, so a link added later cannot be less safe than the last one.
 */
export const EXTERNAL_LINK_ATTRIBUTES = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
