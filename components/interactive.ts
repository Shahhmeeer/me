/**
 * How anything a pointer or a keyboard can reach is drawn.
 *
 * There are eight kinds of interactive element on this page: the one filled
 * contact button, a link drawn in the accent colour, a link that must not
 * shout, the one title that is a link, a Nav link, a box a visitor types
 * in, and the Bar's two kinds of button, a dot and an arrow. Each is
 * defined once here, so a link added later cannot be the one with a weaker
 * focus outline or a different hover.
 *
 * Every focus style is `focus-visible` rather than `focus`: a mouse click must
 * not leave a ring behind it, and a keyboard must always leave one. Every
 * moving style is written behind `motion-safe:`, so a visitor who has asked
 * for less movement gets none. Anything added here must keep both rules; they
 * are the reason this file exists rather than a class string on each element.
 *
 * Cards are not here: a card is `.card` in app/globals.css, because the test
 * that holds hover to a colour change reads that file. No link is a card.
 * The Bar's dot mark and arrow are drawn here but move there, as `.dot-mark`
 * and `.arrow`, for the same reason: the theme test reads what moves, and a
 * `motion-safe:` utility is out of its sight.
 */

/**
 * The outline every focusable element wears when a keyboard reaches it: an
 * Deep Sky line, with a ring in the ground colour between it and the element,
 * so the ring reads on the page, on a card and on the blush button alike.
 */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-2 focus-visible:ring-background";

/**
 * The single filled button: the one obvious way to make contact. Disabled,
 * while the Form's Message is on its way, it fades a step further than
 * hover does and takes no pointer, so a second click has nowhere to land.
 */
export const PRIMARY_ACTION = `${FOCUS_RING} rounded-full bg-action px-5 py-2.5 text-body font-medium text-on-action motion-safe:transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`;

/** A link the page is offering: the Project links, the verify link on Home. */
export const ACCENT_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-accent underline-offset-4 hover:underline`;

/** A link that sits beside louder things: the profile links at both ends. */
export const QUIET_LINK = `${FOCUS_RING} rounded-xs text-body font-medium text-muted underline-offset-4 motion-safe:transition-colors hover:text-foreground hover:underline`;

/**
 * The one title that is a link: the email address on the Contact Spread,
 * set large by the Spread and drawn in Deep Sky, as every link the page offers
 * is, with the underline on hover the rest have. It sets no size, because
 * the title's is the Spread's to set.
 */
export const TITLE_LINK = `${FOCUS_RING} rounded-xs text-accent underline-offset-8 hover:underline`;

/**
 * A box a visitor types in: the three fields of the contact form. A step
 * darker than the card it sits in, so it reads as a well and not as a
 * second card; a hairline border that turns Deep Sky on hover as a card's
 * does, and the ring every focusable thing wears when a keyboard reaches
 * it. Nothing moves.
 */
export const TEXT_FIELD = `${FOCUS_RING} w-full rounded-xl border border-border bg-background px-4 py-3 text-body text-foreground placeholder:text-muted motion-safe:transition-colors hover:border-accent-border`;

/**
 * A Nav link: quiet until it is the Panel on screen, then lit in Deep Sky. The
 * observer sets `aria-current="page"` on the lit one, and the style reads
 * that attribute, so the state and the look cannot disagree. Roomy on a
 * phone, `px-3 py-2`, so a thumb has a whole link to land on and the five
 * sit apart; a step tighter on a large display, where a pointer is fine and
 * the pill has the button beside the list.
 */
export const NAV_LINK = `${FOCUS_RING} rounded-full px-3 py-2 text-caption font-medium text-muted motion-safe:transition-colors hover:text-foreground aria-[current=page]:text-accent large:py-1.5 large:text-body`;

/**
 * A dot on the Bar: one Spread, as a button a pointer can pick. The button
 * is a row as tall as a line, so it is something a pointer can land on; the
 * mark inside it is the dot a visitor sees, in `DOT_MARK`. The observer
 * sets `aria-current="true"` on the current one, and the mark reads that
 * off its button, so the lit dot and the state cannot disagree.
 */
export const DOT = `${FOCUS_RING} group flex h-6 items-center rounded-full px-1`;

/**
 * The mark inside a dot: a small circle in the muted colour, brighter under
 * a pointer, and on the current Spread a short bar drawn in Deep Sky, the colour
 * of the lit Nav link, so a visitor reads the two as one state. The width
 * and the colour are transitioned by the `.dot-mark` rule in
 * `app/globals.css`, where the theme test reads it, so the lit dot
 * stretches into its bar and slides as the next one takes over.
 */
export const DOT_MARK =
  "dot-mark block h-1.5 w-1.5 rounded-full bg-muted group-hover:bg-foreground group-aria-[current=true]:w-5 group-aria-[current=true]:bg-accent";

/**
 * An arrow on the Bar: a round button the height of a dot's row, quiet
 * until hovered. Disabled, at either end of the Strip, it fades and takes
 * no pointer rather than leaving, so the Bar keeps its shape and a visitor
 * reads that there is nowhere further to go. Under a pointer it nudges 2px
 * the way it points, by the `.arrow` rules in `app/globals.css`: the one
 * movement hover makes on the site, and the lift check there allows it
 * for this class alone.
 */
export const ARROW = `${FOCUS_RING} arrow flex h-6 w-6 items-center justify-center rounded-full text-body text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted`;
