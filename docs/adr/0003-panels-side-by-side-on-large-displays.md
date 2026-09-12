# Panels sit side by side on large displays

On a display 1024px or wider that is wider than it is tall, the five Panels sit
side by side on the Strip and the visitor slides between them: a wheel roll or
an arrow key moves it a screen at a time, and a Nav link or a hash in the
address lands it on a Panel. Below that, and on any display held upright, the
Panels stack top to bottom and the site scrolls the way every phone site does.

The trade is a Recruiter's habit of skimming downwards for a site that reads as
a set of screens rather than one long document. A vertical page is what they
expect; a sideways one says "this person builds things people enjoy using",
which is the site's job, and the habit is met three ways. A vertical wheel roll
moves the Strip, so the gesture a Recruiter makes anyway still moves them
through the site. Every Panel has a hash and the lit Nav link names the one on
screen, so a link to `#work` lands there and a screen reader reads the same
five sections in the same order. And nothing below the breakpoint changes: a
phone, and a tablet held upright, get the stack.

The Strip is native scroll, snapped to a Panel with `scroll-snap-type: x
mandatory`, and not a script that animates a transform. Native scroll is what
lets a Nav link, the Tab key, a focused element and a hash in the address all
land on a Panel with nothing written for each, keeps every Panel's text in the
document for Ctrl+F, and keeps the slide smooth or instant by the visitor's
own `prefers-reduced-motion`. The one script maps a vertical wheel roll and
the arrow keys onto a scroll of one screen; it moves a screen and not the
wheel's own distance because a mandatory snap returns a smaller scroll to
where it began. Which display gets the Strip is written once, as the `large`
variant in `app/globals.css`, and read off the element in script, so the rule
cannot drift between the two.

Nothing scrolls up or down inside a Panel. A Panel grows sideways to fit its
content and what is taller than the screen is clipped, so the Strip has one
direction and a wheel roll always means the same thing.
