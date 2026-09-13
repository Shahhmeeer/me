# Panels sit side by side on large displays

On a display 1280px or wider that is wider than it is tall and driven by a
mouse or trackpad, the five Panels sit side by side on the Strip as a row of
Spreads, and the visitor slides between them: a wheel roll, an arrow key or
the bottom bar's arrows move it one Spread, and a Nav link or a hash in the
address lands it on a Panel or a Spread. Anything else, a phone, a tablet
held either way, a narrow window, stacks the Panels top to bottom and the
site scrolls the way every phone site does.

The trade is a Recruiter's habit of skimming downwards for a site that reads as
a set of screens rather than one long document. A vertical page is what they
expect; a sideways one says "this person builds things people enjoy using",
which is the site's job, and the habit is met three ways. A vertical wheel roll
moves the Strip, so the gesture a Recruiter makes anyway still moves them
through the site. Every Panel has a hash and the lit Nav link names the one on
screen, so a link to `#work` lands there and a screen reader reads the same
five sections in the same order. And nothing below the rule changes: a phone
and a tablet get the stack.

The rule is written by pointer as well as width because a width alone cannot
tell a tablet from a laptop: a 13" laptop is 1280px wide and an iPad Pro held
sideways is 1366px. A tablet has no wheel and no arrow keys, so a Strip on it
has nothing to drive it. An iPad with a trackpad attached reports a fine
pointer and gets the Strip, and has the trackpad to drive it. The earlier
rule, 1024px and landscape, gave the Strip to every sideways tablet and set
the box every screen had to fit to 1024 by 768; the box is now 1280 by 720.

The Strip is native scroll, snapped to a Spread with `scroll-snap-type: x
mandatory`, and not a script that animates a transform. Native scroll is what
lets a Nav link, the Tab key, a focused element and a hash in the address all
land on a Spread with nothing written for each, keeps every Panel's text in the
document for Ctrl+F, and keeps the slide smooth or instant by the visitor's
own `prefers-reduced-motion`. The one script maps a vertical wheel roll and
the arrow keys onto a scroll of one Spread; it moves a Spread and not the
wheel's own distance because a mandatory snap returns a smaller scroll to
where it began. Which display gets the Strip is written once, as the `large`
variant in `app/globals.css`, and read off the element in script, so the rule
cannot drift between the two.

Every Spread is exactly one screen. Nothing scrolls up or down inside one, and
nothing on it is clipped: a Panel with more to show than fits a screen is
split into more Spreads, one Case Study or one Role to each, rather than
grown sideways into a row the snap cannot land on. The first cut of the Strip
did grow Panels sideways, and a wheel roll then stopped mid-card, with a
sticky heading column painted over the card's left edge; that is why the
count of Spreads, not the width of a Panel, is what grows with the content.
