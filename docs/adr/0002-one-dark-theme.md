# The site has one dark theme

The site is drawn in one colour scheme, dark, built from Shahmeer's own palette:
`#1F1E1E` ground, `#E3D9DA` text, teal `#077D7E` and aqua `#6ED6D4` accents, and
coral `#DA7A7A` for the one button. There is no light scheme, no toggle, and no
`prefers-color-scheme` block; `color-scheme: dark` is declared once.

The trade is a visitor's light preference for one signature look and half the
states to test. A second scheme doubles every contrast pair, every picture drawn
at build time, and every look-by-eye, and a portfolio read once by a Recruiter
gains nothing from matching their editor. So `tests/theme.test.ts` fails the
build if the stylesheet grows a second scheme.

Teal fails WCAG AA as text on this ground (3.4:1), so aqua carries every
text-level accent and teal draws borders and shapes only. The check decided
that, not taste; if the palette changes, the check decides again.
