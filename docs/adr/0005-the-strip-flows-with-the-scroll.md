---
status: accepted
supersedes: ADR-0003
---

# The Strip flows with the scroll instead of snapping to a Spread

On a large display (ADR-0003's rule: 1280px or wider, landscape, a fine
pointer; unchanged) the Panels still sit side by side on the Strip, but the
Strip no longer snaps one Spread per wheel roll. The document is tall, the
Strip sticks to the viewport, and the vertical scroll position is drawn
sideways as a transform: one pixel of scroll is one pixel of Strip. There is
no snap. A visitor can rest with half of one Spread and half of the next on
screen, and the Strip catches up with them for about 0.7s after they stop,
the Glide. A Spread is as wide as what it holds, between half a screen and
84rem, with an 8vw gap before the next; the Hero and Contact are pinned to a
full screen, because the page opens on the one and ends on the other.

The trade is everything native scroll gave for free, listed in ADR-0003, for
a Strip that reads as one landscape rather than a deck of slides, which was
the ask: the snapped Strip read as PowerPoint. Each free thing is bought back
by hand, and the price was measured in the prototype
(`docs/prototypes/scrub-strip.md` on `proto/scrub-strip`, tag
`proto/scrub-strip-fifth-look`):

- The scrollbar, wheel, trackpad, space, PageDown, Up/Down and screen readers
  come free again because the runway is a tall document the browser scrolls
  itself. A sideways trackpad swipe is mapped onto it.
- Ctrl+F, Tab, focus and `:target` still scroll the Strip's own box, which
  is `overflow: hidden`; one listener on that box's `scroll` event reads the
  distance the browser wanted, zeroes it, and moves the runway there
  instead, so the match or the focused link is on screen and the Bar, Nav
  and hash agree with it. That listener is the whole answer to ADR-0003's
  "nothing written for each".
- A Nav link, a Bar dot, a hash and an arrow all land the same way: the
  Spread's left edge at the screen's left, by a smooth scroll of the runway
  (instant under reduced motion, and when the page opens at a hash). An
  arrow, on the Bar or the keyboard, moves one Spread by the edge rule:
  forward lands on the first Spread whose left edge is right of the current
  position, back on the last whose left edge is left of it. It does not
  move one screen, because a screen is wider than a narrow Spread and would
  pass it without ever showing it whole.
- The lit Nav link, the lit Bar dot and the hash follow the Spread nearest
  the middle of the screen, since there is no Spread "on screen" once the
  Strip can rest anywhere.

The motion is a hand-rolled `requestAnimationFrame` loop: an exponential
catch-up toward the scroll position, settling in about 0.7s. It is not GSAP.
The prototype was janky at first and the instinct was to blame the loop;
the cause was the Blobs, blurred layers re-rasterised every frame, and with
them gone the loop ran at 0 long frames a second at the second look.
GSAP runs the same arithmetic in the same kind of loop and could not have
fixed that, so it is a dependency the repo does not need. The Blobs are
dropped; the depth they gave is now the Ground and the Illustrations, both
plain transforms with nothing to blur.

The Illustrations are unDraw pieces, retinted to the palette by hex
substitution and committed as plain SVG files served through `<img>` with
an empty `alt`: not inlined, since eleven drawings of paths do not belong
in the React tree, and not `next/image`, which does nothing for an SVG.
unDraw's licence is free for personal and commercial use with no
attribution required; its one restriction, redistributing the pieces as a
collection, a portfolio does not do.

Less motion means less motion, literally: under `prefers-reduced-motion`
the Strip moves exactly as far as the visitor scrolls, with no Glide, and
nothing on it moves at any other rate: the Illustrations do not lag, grow or
float, and the Ground moves with the Strip. Parallax is motion, so it goes
with the rest.

Two non-constraints, so nobody reads them as decided here. The Panels are
whatever CONTEXT.md lists under Panel, in that order; this ADR does not name
them, so a Panel added, merged or reordered later (issue #93) does not
reopen it. And a
vertical route beside the Strip (`/something`) is neither planned nor
prevented: nothing here assumes the Strip is the only page.

Below the large rule nothing changes: the Panels stack and the site scrolls
the way every phone site does.
