/**
 * How anything a pointer or a keyboard can reach is drawn.
 *
 * There are six kinds of interactive element on this page: the one filled
 * contact button, a link drawn in the accent colour, a link that must not
 * shout, the one title that is a link, a Nav link, and a box a visitor
 * types in. Each is defined once here, so a link added later cannot be the
 * one with a weaker focus outline or a different hover.
 *
 * Every focus style is `focus-visible` rather than `focus`: a mouse click must
 * not leave a ring behind it, and a keyboard must always leave one. Every
 * moving style is written behind `motion-safe:`, so a visitor who has asked
 * for less movement gets none. Anything added here must keep both rules; they
 * are the reason this file exists rather than a class string on each element.
 *
 * Cards are not here: a card is `.card` in app/globals.css, because the test
 * that holds hover to a colour change reads that file. No link is a card.
 */

/**
 * The outline every focusable element wears when a keyboard reaches it: an
 * aqua line, with a ring in the background colour between it and the element,
 * so the ring reads on the page, on a card and on the coral button alike.
 */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-2 focus-visible:ring-background";

/**
 * The single filled button: the one obvious way to make contact. Disabled,
 * while the Form's Message is on its way, it fades a step further than
 * hover does and takes no pointer, so a second click has nowhere to land.
 */
export const PRIMARY_ACTION = `${FOCUS_RING} rounded-full bg-action px-5 py-2.5 text-body font-medium text-on-action motion-safe:transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`;

/** A link the page is offering: the Project links. */
export const ACCENT_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-accent underline-offset-4 hover:underline`;

/** A link that sits beside louder things: the profile links at both ends. */
export const QUIET_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-muted underline-offset-4 motion-safe:transition-colors hover:text-foreground hover:underline`;

/**
 * The one title that is a link: the email address on the Contact Spread,
 * set large by the Spread and drawn in aqua, as every link the page offers
 * is, with the underline on hover the rest have. It sets no size, because
 * the title's is the Spread's to set.
 */
export const TITLE_LINK = `${FOCUS_RING} rounded-xs text-accent underline-offset-8 hover:underline`;

/**
 * A box a visitor types in: the three fields of the contact form. A step
 * darker than the card it sits in, so it reads as a well and not as a
 * second card; a hairline border that turns teal on hover as a card's
 * does, and the ring every focusable thing wears when a keyboard reaches
 * it. Nothing moves.
 */
export const TEXT_FIELD = `${FOCUS_RING} w-full rounded-xl border border-border bg-background px-4 py-3 text-body text-foreground placeholder:text-muted motion-safe:transition-colors hover:border-accent-border`;

/**
 * A Nav link: quiet until it is the Panel on screen, then lit in aqua. The
 * observer sets `aria-current="page"` on the lit one, and the style reads
 * that attribute, so the state and the look cannot disagree. Tight on a phone
 * so the five fit across 360px; roomier where there is room.
 */
export const NAV_LINK = `${FOCUS_RING} rounded-full px-2 py-1.5 text-caption font-medium text-muted motion-safe:transition-colors hover:text-foreground aria-[current=page]:text-accent sm:px-3 large:text-body`;
