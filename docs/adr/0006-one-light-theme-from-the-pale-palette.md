---
status: accepted
supersedes: ADR-0002
---

# The site has one light theme, built from the pale palette

The site is drawn in one colour scheme, light, from the palette Shahmeer
chose during the Strip redesign: Pearl Beige `#f2e2ba` for the ground,
Charcoal `#50514f`, Powder Blush `#e0afa0`, Celadon `#baf2d8` and Pale Sky
`#bad7f2`. The dark theme of ADR-0002 is retired, not kept beside it: there
is still one scheme, no `prefers-color-scheme` block, and `color-scheme:
light` declared once, so the Share Card and the tab icon, drawn at build
time from a copy of the tokens, are the page a shared link opens.

Four of the five colours are pale, and on a pale page a pale colour is a
fill, never an ink or a line: Pale Sky on Pearl Beige is 1.2:1, Celadon
1.03:1. So the palette gains one derived colour, Deep Sky `#2f5c85`, Pale
Sky deepened until it passes AA on the ground (5.5:1) and on a card (6.2:1);
it is the lit link, the focus ring and the hover border, and the only place
the sky is drawn as ink. The five pastels have these homes: Pearl Beige the
ground; Powder Blush the one button; Celadon the Disc and one Illustration;
Pale Sky the Tech Tag chip's fill and the sky tints inside the Illustrations.
The theme test holds every palette colour to a token, which is why Pale Sky
needed a home on the page and not only in the drawings.

Charcoal is not the body ink. At Geist's regular weight on a warm ground,
Charcoal (6.2:1) read faint at 16px and fainter at 13px, and the muted
text under it (5.0:1) fainter still, though both pass AA on paper. The body
ink is a deeper charcoal, `#33342f` (9.8:1), and Charcoal itself is the
muted ink, so both steps got darker and the step between them stayed. The
button's label wears the body ink too: Charcoal on Powder Blush is 4.1:1,
short of AA at body size, and darkening the blush makes a dark label worse;
the deeper ink on the blush is 6.5:1. Weight is not decided here: a weight
change is one line and reversible, and is looked at on the implementation
branch. The check decided the inks, not taste, as it did for teal in
ADR-0002; the check now covers every text token on the light page at its
own size, and fails the build if one slips.

Shadows are lightened and the frosted pill is beige at 72%, because a
shadow black enough for a dark page reads as dirt on a pale one.

One thing is deliberately left open. ADR-0002 ruled out a second scheme
and a toggle for good; this ADR does not. A dark scheme behind a toggle is
a wanted follow-up, tracked as issue #94, and nothing here should stop
it. Until that spec exists the theme test still fails the build on a
second scheme, so the light palette cannot drift into two half-schemes by
accident; the toggle's spec removes that guard when it adds the toggle on
purpose.
