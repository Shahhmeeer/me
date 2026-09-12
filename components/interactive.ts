/**
 * How anything a pointer or a keyboard can reach is drawn.
 *
 * There are five kinds of interactive element on this page: the one filled
 * contact button, a link drawn in the accent colour, a link that must not
 * shout, a link drawn as a card, and a Nav link. Each is defined once here,
 * so a link added later cannot be the one with a weaker focus outline or a
 * different hover.
 *
 * Every focus style is `focus-visible` rather than `focus`: a mouse click must
 * not leave a ring behind it, and a keyboard must always leave one. Every
 * moving style is written behind `motion-safe:`, so a visitor who has asked
 * for less movement gets none. Anything added here must keep both rules; they
 * are the reason this file exists rather than a class string on each element.
 *
 * Cards are not here: a card is `.card` in app/globals.css, because the test
 * that holds hover to a colour change reads that file. The one link that is
 * a card borrows that class and adds only the focus ring.
 */

/**
 * The outline every focusable element wears when a keyboard reaches it: an
 * aqua line, with a ring in the background colour between it and the element,
 * so the ring reads on the page, on a card and on the coral button alike.
 */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-2 focus-visible:ring-background";

/** The single filled button: the one obvious way to make contact. */
export const PRIMARY_ACTION = `${FOCUS_RING} rounded-full bg-action px-5 py-2.5 text-body font-medium text-on-action motion-safe:transition-opacity hover:opacity-90`;

/** A link the page is offering: the Project links, and the email address. */
export const ACCENT_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-accent underline-offset-4 hover:underline`;

/** A link that sits beside louder things: the profile links at both ends. */
export const QUIET_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-muted underline-offset-4 motion-safe:transition-colors hover:text-foreground hover:underline`;

/**
 * A link a thumb can hit: the whole card is the target, for the Contact
 * Panel, where a Recruiter on a phone taps and one at a desk clicks. Its
 * hover is the card's own, the border turning teal; the ring is the one
 * every link wears. On the Strip it is narrower than a Case Study, because
 * it holds a line and not a story; the line is the lead size, the largest at
 * which the email address fits on one line of it. The line sits at the foot
 * of the card, so two targets side by side, one with a label over its line
 * and one without, still read as one row.
 */
export const TARGET_LINK = `${FOCUS_RING} card flex flex-col justify-end gap-1 p-gutter text-lead font-semibold tracking-tight text-foreground large:w-80`;

/**
 * A Nav link: quiet until it is the Panel on screen, then lit in aqua. The
 * observer sets `aria-current="page"` on the lit one, and the style reads
 * that attribute, so the state and the look cannot disagree. Tight on a phone
 * so the five fit across 360px; roomier where there is room.
 */
export const NAV_LINK = `${FOCUS_RING} rounded-full px-2 py-1.5 text-caption font-medium text-muted motion-safe:transition-colors hover:text-foreground aria-[current=page]:text-accent sm:px-3 large:text-body`;
