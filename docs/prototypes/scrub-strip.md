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

## Open questions for the next round

- **Q15** (parked): Ctrl+F and Tab. The trick: listen to the Strip's
  `scroll` event, read the `scrollLeft` the browser wanted, zero it, and
  move the runway there instead. Do it, or accept losing Ctrl+F?
- **Q18** (new): with Spreads of varied width, what do the Bar's arrows and
  ←/→ move by: one Spread (land on its left edge), or one screen?
- **Q19** (new): centre a Spread's content horizontally as well as
  vertically, or keep it left-aligned inside the Spread's box?
- **Q20** (new): one Blob field on the body. Fixed colours throughout, or
  colours that drift with position so the ground still changes, slowly?
- **Q21** (new): per-Spread widths. Which Spreads are narrower than a
  screen, which are a screen, does the Hero stay a full screen?
- **Q10** (revisit): GSAP or not, after the jank diagnosis.

## Next steps

1. Fresh session: `git checkout proto/scrub-strip`, `npm run dev`, look at
   C with the centring fix.
2. Diagnose the jank against the list above; move the Blobs to the body in
   the prototype while doing so, since it is both a wanted change and a
   suspect.
3. Run the next grill round (Q15, Q18–Q21, Q10).
4. `/to-spec`, `/to-tickets`, implement on a `feat/` branch cut from
   `origin/main`, with the new ADR superseding 0003. Leave this branch as
   the primary source and link it from the implementation issue.
