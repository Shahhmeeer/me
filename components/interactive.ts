/**
 * How anything a pointer or a keyboard can reach is drawn.
 *
 * There are three kinds of interactive element on this page: the one filled
 * contact button, a link drawn in the accent colour, and a link that must not
 * shout. Each is defined once here, so a link added later cannot be the one
 * with a weaker focus outline or a different hover.
 *
 * Every focus style is `focus-visible` rather than `focus`: a mouse click must
 * not leave a ring behind it, and a keyboard must always leave one. Every
 * moving style is written behind `motion-safe:`, so a visitor who has asked
 * for less movement gets none. Anything added here must keep both rules; they
 * are the reason this file exists rather than a class string on each element.
 */

/** The outline every focusable element wears when a keyboard reaches it. */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** The single filled button: the one obvious way to make contact. */
export const PRIMARY_ACTION = `${FOCUS_RING} rounded-full bg-accent px-5 py-2.5 text-body font-medium text-on-accent motion-safe:transition-opacity hover:opacity-90`;

/** A link the page is offering: the Project links, and the email address. */
export const ACCENT_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-accent underline-offset-4 hover:underline`;

/** A link that sits beside louder things: the profile links at both ends. */
export const QUIET_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-muted underline-offset-4 motion-safe:transition-colors hover:text-foreground hover:underline`;
