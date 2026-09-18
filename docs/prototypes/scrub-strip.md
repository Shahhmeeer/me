# The Strip that flows: grill notes and prototype handover

Written 2026-09-18, on branch `proto/scrub-strip` (cut from `origin/main` at
`c3e65f2`). Read this before continuing the work in a fresh session. The
prototype code is `components/prototype-scrub-strip.tsx`, the `PROTOTYPE`
block at the foot of `app/globals.css`, and one import swap in
`app/page.tsx`. All of it is throwaway: it stays on this branch and never
reaches `main`. What reaches `main` is a spec and tickets written from the
decisions below, then a proper implementation.

## The ask

The Strip today snaps one Spread per wheel roll (`scroll-snap-type: x
mandatory` plus `scrollBy` one screen, ADR-0003), and reads as a PowerPoint
deck. Shahmeer wants it to read like the home page of
<https://sms.playstation.com/>: one continuous sideways landscape that the
visitor's scroll drags along.

## What that site actually does (read from its bundles, not guessed)

- The document is *tall*. The browser scrolls it vertically like any page, so
  scrollbar, wheel, trackpad, space, PageDown and screen readers work for
  free.
- Nine scenes sit in one wide row. A GSAP timeline translates the row by
  `x: -(rowWidth - viewportWidth)` with a linear ease; on every scroll event
  the timeline's playhead is tweened toward `scrollFraction * duration` with
  an easeOut over ~1s. That catch-up is the "feel".
- No snapping. You can rest anywhere, mid-scene.
- Scenes are different widths. Line drawings draw themselves, quotes fade
  in, images enter with an x offset, all on the same timeline: parallax on
  top of the scrub.
- Phones get a plain vertical page with reveal-on-scroll.
- There is an intro animation before scrolling takes over.

Generic name: a **scroll-scrubbed horizontal track** ("horizontal
scrollytelling", "pinned horizontal scroll").

## Decisions settled in the grill

| # | Decision | Answer |
|---|---|---|
| Q1 | Mechanic | True scrub, no snap: the Strip can rest with half of one Spread and half of the next on screen. |
| Q2 | What drives it | Tall runway: the document is tall, the Strip sticks to the viewport, vertical scroll position is translated into a sideways transform. Not a smoothed native horizontal scroller. |
| Q3 | Glide and less motion | ~0.6–0.8s easeOut catch-up (a touch tighter than the reference). Reduced motion: still the Strip, 1:1, no Glide. |
| Q5 | Bar | Kept: dots lit by the Spread nearest the middle, arrows move the Strip, hint unchanged. |
| Q6 | Depth | Blobs move at a slower rate than the content. Nothing else new; the time-based reveal stays. |
| Q7 | Intro | None. |
| Q8 | Small displays | Unchanged: the stack, no scrub, nothing below the `large` rule changes. |
| Q9 | Future vertical pages | Out of scope. Nav links stay anchors into the Strip; nothing built now should stop a `/something` route later. Note it in the ADR as a non-constraint. |
| Q10 | Library | Hand-rolled rAF lerp first, proven or disproven by the prototype. See "Jank" below: now leaning GSAP, but the reason matters. |
| Q11 | Runway height | 1px of scroll = 1px sideways. |
| Q12 | Sideways trackpad swipe | Mapped onto the runway. |
| Q13 | Arrow keys | Left/Right kept, moving one Spread (or one screen; see open Q18). Up/Down, space, PageDown come free. |
| Q14 | Landing on a Panel | Glide via native smooth scroll of the runway, instant under reduced motion; opening the page at a hash stays instant. |
| Q16 | Hash while moving | Unchanged: Panel id of the nearest Spread, Home writes none, replaced not pushed. |
| Q17 | Prototype | Built: three variants on `/` behind `?variant=`, with glide-length and Blob-rate knobs. |

## Glossary changes already made (CONTEXT.md, on this branch)

- **Spread**: "one screen-wide *stretch* of the Strip", no longer a stop.
- **Strip**: flows rather than snaps, moves as far as the visitor scrolls,
  goes on for a moment after: the Glide.
- **Glide**: new term. The catch-up after scrolling stops. The one part of
  the Strip that is motion rather than layout, so reduced motion drops it.
- **Bar**: lit dot is the Spread *nearest the middle*; an arrow moves the
  Strip one Spread.

ADR-0003 will need superseding by a new ADR once the implementation is
specified; it is hard to reverse, surprising without context, and a real
trade-off (native snap's free hash/Tab/Ctrl+F versus a scrubbed transform).

## The prototype

`npm run dev`, then on a display 1280px+ wide:

- `/?variant=A`: the Strip as shipped (baseline).
- `/?variant=B`: scrub, Spreads one screen each.
- `/?variant=C`: scrub, Spreads as wide as their content, 8vw gap between.

Yellow box bottom-left: variant switch (Shift+←/→), glide knob 0.3–1.2s,
Blob-rate knob 0–1. On B and C, Ctrl+F and Tab do *not* bring things into
view (Q15, parked). The Bar arrows and ←/→ move one *screen*, not one Spread.

## First look (2026-09-18, Shahmeer, Chrome on Windows)

**C wins over B.** Varied widths with gaps read as one landscape; one-screen
tiles still read as slides. That settles Q4 in principle: Spreads will be
sized to content. What "sized to content" means per Spread (Hero, Work's
cards, Skills' two columns) is design work for the spec.

Three problems seen:

1. **Content sits at the top of the screen.** The shipped Spread grid is
   `items-start` with `h-full`, which was fine when a Spread was a designed
   one-screen composition but leaves the bottom half bare on C. Fixed in
   the prototype after the first look: `.proto-flow .spread > div` is
   centred vertically, and `.proto-flow .card` centres what it holds.
   Whether content should also centre *horizontally* within a Spread is an
   open question (Q19).

2. **The motion is janky.** Shahmeer's instinct is to switch to GSAP. See
   "Jank" below before doing that.

3. **Each Panel has its own Blobs**, so crossing a Panel boundary announces
   "new section", which is the opposite of seamless. Wanted: one Blob field
   behind the whole Strip, on the body, not per Panel. Note the trade this
   gives up, from the comment in `app/page.tsx`: "No two Panels are washed
   the same way, so a visitor sliding from one to the next sees the ground
   change with the heading." A middle path exists: one field whose colours
   drift as the Strip moves. Open question Q20.

## Jank: what to check before blaming the lerp

The lerp itself (`x += (target - x) * (1 - exp(-dt / tau))` in a rAF loop)
is the same arithmetic GSAP's ScrollSmoother runs. Switching libraries does
not change what the GPU has to paint each frame. Suspects, in the order to
test with the DevTools Performance panel:

1. **One composited layer ten-plus screens wide.** `.proto-row` is
   `will-change: transform` and ~15,000px wide on C. Chrome tiles it and
   rasterises tiles as they come into view; fast scrolling shows that as
   stutter or checkerboard. Fix candidates: `contain: paint` on each Panel,
   `content-visibility: auto` on off-screen Panels, or transforming the
   Panels individually instead of one row.
2. **`backdrop-filter: blur(16px)` on the Nav and the Bar** (`.pill`,
   `app/globals.css` ~line 181) over a layer that moves every frame. A
   backdrop filter re-samples what is under it each frame; over a moving
   transform that is a full-viewport blur at 60fps. Test by removing it.
3. **`filter: blur(64px)` Blobs inside the moving layer**, each with its own
   drift animation *and* the prototype's parallax `transform`. Moving the
   Blobs to the body (problem 3 above) takes them out of the moving layer
   and likely helps here too.
4. **Double smoothing.** Chrome animates `scrollY` itself on a wheel roll,
   and the lerp smooths that again. Test with `scroll-behavior: auto` on
   `html` and with the glide knob at 0.3s.
5. Per-frame layout reads: already removed (Panel positions are cached in
   `layout()`).

**GSAP and older machines** (Shahmeer's question): GSAP core is ~30KB
gzipped and its ticker is one `requestAnimationFrame` loop, the same as the
hand-rolled one; ScrollTrigger and ScrollSmoother are free since 2025. It
does not cost an old laptop anything the hand-rolled loop doesn't. Five
generations back (2019-ish Intel with integrated graphics) handles
transform-only compositing fine; what it does *not* handle is large
backdrop filters and big blurred layers being re-rasterised, and GSAP
cannot fix those. So: diagnose first. If the hand-rolled loop is still
rough after the suspects above are dealt with, GSAP is the right call and
the ADR should say why; if it is smooth, GSAP is a dependency the repo
doesn't need.

## Second round: the suspects as switches (2026-09-18, later session)

The prototype now carries the diagnosis instead of leaving it to the
Performance panel. On B and C the yellow box has, on top of the variant
switch:

| Knob | What it does | Suspect |
|---|---|---|
| glide 0–1.2s | 0 is 1:1: no lerp at all, so what is left is Chrome's own wheel smoothing plus paint cost | 4 |
| blob rate 0–1 | 0 pins the Blobs to the screen, 1 pins them to the Strip | — |
| Blobs on the body | **on by default.** One fixed field behind the whole Strip (`.proto-field`), Blobs every 55vw along a row `maxX × rate + 100vw` wide, moved as one at the Blob rate; the Panels' own fields are hidden. Off restores the per-Panel fields with their parallax | 3, and problem 3 |
| pill backdrop blur | off removes `backdrop-filter` from the Nav and the Bar | 2 |
| contain: paint per Panel | each Panel clips its own paint, so an off-screen one paints nothing | 1 |
| one layer per Panel | the transform is set on each `section[id]` instead of `.proto-row`; the row loses `will-change` | 1 |
| frame meter | frames over 22ms per second, and the worst frame, read off the rAF loop | — |

The meter counts every frame, moving or resting, so a number at rest is
the cost of the drifting blurs alone; a number only while scrolling is the
cost of the move.

**How to test.** On C, scroll at the speed that felt bad, watch the meter,
then change one switch at a time and scroll the same way:

1. Baseline: everything at default (body Blobs on). If it is already
   smooth, problem 3's fix was also the jank's fix; note it and stop.
2. Blobs on the body off → on. Isolates suspect 3.
3. Backdrop blur off. Isolates suspect 2. If this is the one, the fix in
   the spec is a pill without the blur *while the Strip moves* (a class
   toggled on wheel, cleared when the Glide settles), or a pill without
   the blur at all.
4. `contain: paint` on, then one layer per Panel on. Isolates suspect 1;
   checkerboarding on a fast scroll says the same thing.
5. Glide to 0. If 1:1 is *also* rough, the lerp was never the problem and
   GSAP would not help; if 1:1 is smooth and any Glide is rough, the
   double smoothing is real and the fix is a shorter Glide or reading
   wheel deltas instead of `scrollY`.

Write what each switch did into the "First look" style below, then
answer Q10.

**Results (second look, 2026-09-18, Shahmeer, Chrome on Windows):**
smooth and "awesome" at the defaults: `0` long frames/s, worst 5-20ms
across Work, Skills and Experience; one reading of `3`/s, worst 65ms at
glide 1.0s. Caveat found afterwards: a CSS ordering bug (`display: none`
written after the large rule's `display: block`, same specificity) meant
the body Blob field never drew, and the per-Panel fields were hidden by
the switch, so the smooth page had **no Blobs at all** bar the Disc.
That is the answer to suspect 3 by accident: take the blurred layers
out and the hand-rolled loop is smooth. Suspects 1, 2 and 4 were never
needed. Shahmeer chose to drop the Blobs rather than bring them back.

**Q10 settled: hand-rolled rAF lerp, no GSAP.** The ADR should say the
jank was the Blobs' blur, not the loop.

## Third round (2026-09-18, same evening)

Decisions from the second look, all in the prototype behind switches:

| # | Decision | Answer |
|---|---|---|
| Q6 (revised) | Depth | The Blobs are gone; nothing blurred moves. The Disc behind the portrait stays for now (Q24). Q20 is moot. |
| Q22 (new) | Counters | ` · 02 / 04` goes: it counts stops and there are none. The Panel's label, line and block heading are read once, on its first Spread; every later Spread is its title and its card. CSS-only in the prototype (`.proto-no-counters`); the real change is in `components/spread.tsx` and the Hero's `Eyebrow`. |
| Q23 (new) | Palette | Shahmeer's light palette: Pearl Beige `#f2e2ba`, Charcoal `#50514f`, Powder Blush `#e0afa0`, Celadon `#baf2d8`, Pale Sky `#bad7f2`. Mapped over the tokens as `.proto-light`; see the mapping note in `app/globals.css`. |

Palette caveats to settle before the spec (ADR-0002 will need superseding
too):

- Four of the five are pale. On a pale page they cannot be text or a
  border (Pale Sky on Pearl Beige is 1.2:1). The prototype deepens the sky
  to `#2f5c85` for the lit link, the focus ring and the hover border. Is a
  derived ink acceptable, or should the accent text be Charcoal and the
  pastels fills only?
- Charcoal on Powder Blush (the one button) is 4.1:1: AA for large or bold
  text, not for body text. Make the button's label bold, or accept.
- Celadon has one home, the Disc. Where else, if anywhere? Candidate: a
  tint on one kind of card (Projects) so the Work Panel has two surfaces.
- The shadows are lightened; the frosted pill is beige at 72%.

Ideas for the empty space above and below the content, each a switch:

- **stagger**: every other Spread lifted 5vh, the rest dropped, so the
  row has a skyline instead of a line of cards at one height.
- **ground**: a dot grid or a line grid on a fixed layer under everything,
  moved at a slower rate (knob) than the content. A tiled gradient is
  cheap to composite, which the Blobs were not, so this is the depth Q6
  wanted at no frame cost.

## Third look (2026-09-18, later): "really, really good"

Palette, counters gone, stagger on, dot grid at 0.5: all approved and now
the defaults. Asked for next: a few illustrations for the gaps, grounds
that read more premium than dots and lines, and a think about the empty
space on large and small displays (illustrations, geometry, bigger cards,
bigger type).

## Fourth round (same evening)

- **Illustrations.** Four unDraw SVGs Shahmeer dropped in `public/images/`
  (`random-idea`, `generating-response`, `soda-splash`, `working-at-home`),
  retinted to the palette by hex substitution into `public/images/proto/`
  (unDraw purple `#6c63ff` to Powder Blush, its slates to Charcoal, its
  greys to beige and sky tints). Placed by the script beside a Spread
  (`ART` in the component): the idea after Work's first Spread, the
  response after Skills, working-at-home after the last Role, the can at
  the left of Contact. Each fades and grows in once as it arrives, floats
  a few pixels over seven seconds, and lags the cards at `artRate`
  (0.85) so it reads as further away. unDraw is fills, not strokes, so
  the reference site's "line draws itself" is not available with these;
  that would need line art.
- **Grounds**, all as masks over one ink so one drawing serves both
  palettes: dot grid, line grid, plus grid (drafting crosses), blueprint
  (minor 24px, major 120px), diagonal hatch, contour waves, paper grain
  (fractal noise; meant for rate 0). Plus a vignette switch that composes
  with any of them.
- **Type a step up** switch: every size in the scale one step larger on
  the Strip, for the "bigger fonts" option. Cards grow with their text.
- **Q26** (new): the empty space, the honest answer. On C the content is
  ~40vh tall and centred, so ~30vh above and below is bare on every
  screen, and a 1440p screen shows more beige, not more content. Options
  in the prototype: stagger (approved), ground, illustrations, type up.
  Not in the prototype: making the card column taller by design (more
  per card: a screenshot, a diagram), which is content work, and the
  stack below the large rule, which is unchanged and has no such gap.

## Fourth look (2026-09-18, late): the illustrations, first placement

Type a step up: on, and kept on. Seen in three screenshots:

1. **The Contact pair is broken.** `working-at-home` (placed after the last
   Role, 24vw wide) runs 22vw into the Contact Spread and sits over the
   email address and the links; the can (at 3vw from Contact's left edge)
   sits over the Contact eyebrow and title, because Contact's content is
   centred at `max-w-6xl` and its left column starts well inside the
   Spread, not at its edge. "All jacked up on the text."
2. **Wanted: illustrations *behind* the content, not over it.** Shahmeer's
   reasoning: the cards and text are the UI layer, the illustrations are
   the world behind it; overlap is then depth, not collision. In the
   prototype that is `z-index` under the Spreads (the `.proto-art` layer
   goes before `children` in the row, or gets `z-index: -1` inside the
   row's stacking context, which the Panels' `isolate` will respect), and
   the lag rate then reads as parallax against the cards in front.
3. **Scatter more, evenly.** One next to Payment Gateway, then nothing
   until Experience; Projects and What I do have none. Wanted: one near
   every Spread or so, so they read as intentional and the gaps are
   filled. "Give it some more life": funky is welcome.

Eight more unDraw pieces are in `public/images/` (not yet retinted; the
retint is a hex substitution, see the fourth round): `bug-detected`,
`casual-browsing`, `code-deployed`, `mail-sent`, `message-sent`, `plants`,
`the-right-time`, `thumbs-up`. Use a few, not all. Obvious homes:
`the-right-time` by the Scheduling portal, `plants` by the Plant
e-commerce card, `casual-browsing` by Masoodia, `code-deployed` and
`bug-detected` by the Roles (CI/CD, production tickets), `mail-sent` or
`message-sent` by Contact, `thumbs-up` by the certifications. More funky
ones may follow.

## Fifth round (2026-09-18, late): behind the content, and scattered

Built from the fourth look, not yet seen:

- **Behind.** The `.proto-art` images are rendered before the Panels in
  `.proto-row`, and the row is `isolation: isolate` with the art at
  `z-index: -1`, so every drawing paints under the Panels (which are
  `isolate` at index auto) and over the page and the ground. A drawing
  that runs under a card is now depth; the lag rate reads as parallax
  against the cards in front.
- **Contact.** A new edge, `box`, measures the Spread's *content* box
  (`spread.firstElementChild`, the centred `max-w-6xl` column) instead of
  the Spread's frame. `mail-sent` sits 14vw left of that box, 16vw wide,
  so it lives in Contact's left margin with 2vw tucked under the title
  column's edge. The can moved to the Payment Gateway gap.
  `working-at-home` is 16vw (was 24), so it ends 7vw past the gap, inside
  Contact's margin at 1920 and behind the frame at 1280.
- **Scattered.** Ten pieces, one near every Spread but the Hero (its
  portrait is its illustration): thumbs-up after the certifications;
  random-idea after Questionnaire; the can after Payment Gateway;
  the-right-time after Scheduling; plants after Projects;
  generating-response after Skills; code-deployed, bug-detected and
  working-at-home after the three Roles; mail-sent at Contact. Not used:
  `casual-browsing`, `message-sent` (retinted and in
  `public/images/proto/`, ready if wanted).
- **Retint.** Same hex map as the fourth round, plus `#f2f2f2` to a beige
  tint `#f7ebcd`, `#b3b3b3` to `#c9bd9c`, `#d0cde1` to the sky tint.
  unDraw's skin tone `#ed9da0` is left alone, as before. One exception:
  `plants` takes `#9ad9bb` (Celadon a shade deeper, so it reads on beige)
  in place of the purple, not Powder Blush; pink plants looked wrong, and
  it gives Celadon a second home beside the Disc (a Q23 caveat).

## Fifth look (2026-09-18, late): "everything else is really good"

Approved as built, with one fix: the pieces at Contact sat behind the
email address and the links, and that did not read as depth. Fixed:
Contact has one illustration, `working-at-home`, 12vw, placed from the
content box's left edge at `top: 78%`, in the bare band under the links
and above the copyright line, so nothing is behind the address.
`mail-sent` moved to the gap after the second Role, `bug-detected` to
the third. Ten pieces still; `casual-browsing` and `message-sent` unused.

Next: Shahmeer picks the ground, then the grill round on the open
questions below.

## Open questions for the next round

- **Q24** (new): the Disc. Keep it as the one shape on the page, in
  Celadon, or drop it with the Blobs?
- **Q25** (new): the empty space. Stagger, ground pattern, both, neither;
  or art per Spread (the reference site's line drawings), which is a
  content job and a later phase.


- **Q15** (parked): Ctrl+F and Tab. The trick: listen to the Strip's
  `scroll` event, read the `scrollLeft` the browser wanted, zero it, and
  move the runway there instead. Do it, or accept losing Ctrl+F?
- **Q18** (new): with Spreads of varied width, what do the Bar's arrows and
  ←/→ move by: one Spread (land on its left edge), or one screen?
- **Q19** (new): centre a Spread's content horizontally as well as
  vertically, or keep it left-aligned inside the Spread's box?
- ~~**Q20**~~: moot, the Blobs are gone.
- **Q21** (new): per-Spread widths. Which Spreads are narrower than a
  screen, which are a screen, does the Hero stay a full screen?
- ~~**Q10** (revisit)~~: settled at the second look, hand-rolled.

## Next steps

1. ~~Fresh session: look at C with the centring fix.~~ Done with the
   switches: the Blobs are on the body by default, and each suspect is a
   switch. `git checkout proto/scrub-strip`, `npm run dev`, `/?variant=C`.
2. ~~Second-round test.~~ Done: smooth, Blobs dropped, Q10 settled.
3. ~~Third round look.~~ Approved; all defaults now.
4. ~~Fourth round look.~~ Type up stays; illustrations need the second
   placement (fourth look above).
5. ~~Next session: illustrations behind the content, retint the eight new
   pieces, place one near most Spreads, fix Contact.~~ Done (fifth
   round). Next: Shahmeer looks, and picks the ground.
6. Run the next grill round (Q15, Q18, Q19, Q21, Q23–Q26).
7. `/to-spec`, `/to-tickets`, implement on a `feat/` branch cut from
   `origin/main`, with the new ADR superseding 0003. Leave this branch as
   the primary source and link it from the implementation issue.
