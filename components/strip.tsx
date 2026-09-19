"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Bar, type PanelSpreads } from "@/components/bar";
import { Ground, groundRate, groundWidth } from "@/components/ground";
import {
  Illustrations,
  PLACEMENTS,
  anchorOf,
  illustrationRate,
  lagOf,
  placeIllustration,
} from "@/components/illustration";
import { SPREAD_CONTENT } from "@/components/spread";
import type { BarCopy } from "@/content/site";

/**
 * The Strip: the `<main>` the five Panels sit in, and the Bar under it.
 *
 * This is the second of five client components on the site, after the
 * reveal and before the Bar, the Form and the Turnstile widget in it. On a
 * large display the Strip flows with the scroll (ADR-0005): the document is
 * tall, the runway, the Strip sticks to the viewport, and the vertical
 * scroll position is drawn sideways as a transform on the row the Panels
 * sit in, one pixel to one pixel. There is no snap, so a visitor can rest
 * with half of one Spread and half of the next on screen. The layout is
 * CSS in `app/globals.css`; what is written here is what the browser
 * cannot do on its own, in five parts.
 *
 * It sizes the runway and draws the row, and the Ground under it. The
 * runway is as tall as the row's overhang, its width less one screen, plus
 * one screen, so the document scrolls exactly as far as the Strip can
 * move; it is measured again whenever the row's size changes or the
 * window's does. Each frame the row is moved to the drawn position, which
 * catches up with the scroll position by the Glide: an exponential settle
 * over about 0.7s, so the Strip keeps moving for a moment after the
 * visitor stops and reads as catching up rather than jumping. Under
 * reduced motion there is no Glide and the drawn position is the scroll
 * position, so the Strip moves exactly as far as the visitor scrolls. The
 * loop runs only while there is distance to close and wakes on a scroll,
 * so an idle page draws nothing. It is a hand-rolled
 * `requestAnimationFrame` loop and not a library, and the step is
 * `glideStep`, a pure function, tested. The Ground
 * (`components/ground.tsx`) is drawn by the same frame: its row is moved
 * to the drawn position at the Ground's rate, half, so the dots fall
 * behind the cards and the page has depth, and sized by the same layout
 * to the overhang at that rate plus one screen, so there is always ground
 * under the viewport. Under reduced motion the rate is 1 and the Ground
 * moves with the Strip: parallax is motion (ADR-0005). The rate and the
 * width are `groundRate` and `groundWidth`, pure, tested. The
 * Illustrations (`components/illustration.tsx`) are drawn by the same
 * frame too: each is placed by the same layout beside the Spread its row
 * of the table names, once the Spreads have their widths, and moved each
 * frame by a transform against the row's, so that it lags the cards at
 * its rate, 0.85, around its anchor, the drawn position that centres it
 * on screen; at the anchor it sits exactly where the table put it. Under
 * reduced motion the rate is 1 and the lag is nothing. One more observer,
 * with a 10% inset at the sides, marks each as arrived the first time it
 * comes on screen, which is what the stylesheet fades and grows it in on.
 * The placement, the anchor and the lag are `placeIllustration`,
 * `anchorOf` and `lagOf`, pure, tested.
 *
 * It lands. One function puts an element's left edge at the screen's left
 * by scrolling the runway there, clamped to the overhang: smooth, or
 * instant for a visitor who has asked for less motion and when the page
 * opens at a hash, since a page that opens by sliding across four Panels
 * has not opened where the link pointed. A Nav link, a Bar dot, the hash
 * on open and the arrows all land this way, so they cannot disagree. The
 * arrows, on the Bar and the keyboard, move one Spread by the edge rule:
 * forward lands on the first Spread whose left edge is more than a few
 * pixels right of the current position, back on the last whose left edge
 * is more than a few pixels left of it, clamped at both ends. Never one
 * screen: a screen is wider than a narrow Spread and would pass it without
 * ever showing it whole. The rule is `edgeRule`, pure, tested. The keys
 * are taken from wherever focus is, except a box the visitor is typing
 * in, where ← and → move the caret; a sideways trackpad swipe, a wheel
 * event whose horizontal delta is the larger, is mapped onto the runway. A
 * vertical roll, the scrollbar, space, PageDown and Up/Down need no
 * script: the runway is a document and the browser scrolls it.
 *
 * It re-routes. Ctrl+F, Tab, a focus and `:target` do not know about the
 * runway: the browser brings its thing on screen by scrolling the nearest
 * box that can scroll, which is the Strip's own, `overflow: hidden` and
 * not `clip` for exactly this. That scroll moves nothing the visitor can
 * see. One listener on the box's `scroll` event reads how far the browser
 * scrolled it, sets it back to 0, and lands the runway that much further
 * along, smooth, or instant under reduced motion; the Bar, the Nav and the
 * hash follow as they follow any scroll of the runway. Nothing is written
 * per element, and a landing mid-Glide does not fight the loop: the
 * runway's target moves and the loop follows it, as after any landing.
 * The distance is added to the drawn position and not the scroll
 * position, since the drawn one is what the browser measured against; the
 * sum is `reRoute`, pure, tested. It only re-routes forward: what is left
 * of the drawn position sits at a negative offset in the box, where no box
 * can scroll, so a Shift+Tab or a find's previous match to something off
 * the left of the screen scrolls nothing and is not caught.
 *
 * It watches which Spread is nearest the middle. An observer over the
 * Spreads with a root margin that leaves the central tenth of the screen
 * lights the Nav link of the Panel that holds the intersecting Spread,
 * puts that Panel's id in the URL hash, and hands the Spread's place on
 * the Strip to the Bar, which lights that dot; one observer, so the lit
 * link, the lit dot and the hash cannot disagree. The link is found by its
 * href, in the Nav's list, so the Nav stays a server component and the two
 * never have to be told about each other; the "Get in touch" button after
 * the list points into the page too, to Contact, and is never lit. The
 * hash is replaced rather than pushed: moving through a page is not a
 * history of places a visitor went. Home gets no hash at all, so the plain
 * address stays the address of the top of the page. It is the Panel's id
 * and never a Spread's, so an address copied mid-read is short and stays
 * the same across the four Spreads of Work. The same watching says when
 * the Strip first moves: the first Spread seen is where the page opened,
 * and the first other one is the move, after which the Bar's hint is
 * hidden for the session.
 *
 * It draws the Bar (`components/bar.tsx`), after the `<main>`, and answers
 * its two asks, a dot picked and an arrow pressed, by landing.
 *
 * Below the large rule none of the first two parts runs: the runway has no
 * height, the row no transform, and the Panels stack as on any phone site.
 * Which display gets the Strip is read off the layout, the row wider than
 * the box that clips it, so the `large` variant in `app/globals.css` stays
 * the one place the rule lives.
 */

/**
 * How much of the viewport is cut away, on every side, before a Spread
 * counts as nearest the middle. What is left is the central tenth, and the
 * Spread crossing it is the one the visitor is looking at. Cutting every
 * side serves both layouts with one margin: a stacked Spread is as wide as
 * the screen, so only the top and bottom cuts tell; a Spread on the Strip
 * is as tall as the screen, so only the left and right cuts do. It relies
 * on every Spread being taller than the box, which a Spread of a title and
 * a card is on any display; one smaller than the box could never be lit.
 */
const ON_SCREEN_MARGIN = "-45%";

/**
 * Where the session remembers that the Strip has moved, so the hint is not
 * shown again to a visitor who has already moved once and come back.
 */
const MOVED_KEY = "strip-moved";

/** How long the Glide takes to settle, in seconds: about 95% of the way. */
const GLIDE = 0.7;

/**
 * The longest frame the Glide will step by, in seconds. A tab left in the
 * background comes back with one frame minutes long, and stepping by it
 * would jump the Strip onto the target rather than glide it there.
 */
const LONGEST_FRAME = 0.1;

/** Nearer than this, in pixels, and the drawn position is the target. */
const SETTLED = 0.05;

/**
 * How far, in pixels, a position may sit from a Spread's left edge and
 * still count as resting on it. A smooth scroll settles a fraction off
 * where it was sent, and an arrow pressed from there must move to the next
 * Spread, not land on the one already at the screen's left.
 */
export const EDGE_TOLERANCE = 4;

type StripProps = {
  /** The Spreads of each Panel, by title, in Panel order: what the Bar draws. */
  spreads: PanelSpreads[];
  /** The Bar's words. */
  barCopy: BarCopy;
  children: ReactNode;
};

/** What the key guard reads off the element that has focus. */
type Focused = Pick<HTMLElement, "tagName" | "isContentEditable">;

/**
 * True when the focused element is a box the visitor types in, whose arrow
 * keys move its caret and are its own: an input, a textarea or anything
 * contenteditable. Nothing focused, a button, a link or the Strip itself
 * leave the keys to the Strip.
 */
export function isTypingIn(focused: Focused | null): boolean {
  if (focused === null) {
    return false;
  }
  return (
    focused.tagName === "INPUT" ||
    focused.tagName === "TEXTAREA" ||
    focused.isContentEditable
  );
}

/**
 * The edge rule: where an arrow lands from `from`, given the Spreads' left
 * edges in Strip order. Forward is the first edge more than `tolerance`
 * right of the position, back the last more than `tolerance` left of it.
 * With no edge that way the position stays: the Bar has already faded the
 * arrow with nowhere to go, and a key press at the end does nothing.
 */
export function edgeRule(
  edges: number[],
  from: number,
  direction: 1 | -1,
  tolerance = EDGE_TOLERANCE,
): number {
  const ahead =
    direction === 1
      ? edges.find((edge) => edge > from + tolerance)
      : edges.findLast((edge) => edge < from - tolerance);
  return ahead ?? from;
}

/**
 * The Glide step: the drawn position after one frame of `dt` seconds,
 * catching up with the target exponentially so that it has closed about
 * 95% of the distance after `glide` seconds. Close enough is the target,
 * so the loop can stop; a frame longer than a tenth of a second is stepped
 * as a tenth. With no Glide, or for a visitor who has asked for less
 * motion, the drawn position is the target: the Strip is where they
 * scrolled it.
 */
export function glideStep(
  x: number,
  target: number,
  dt: number,
  glide: number,
  reduced: boolean,
): number {
  if (reduced || glide === 0) {
    return target;
  }
  const tau = glide / 3;
  const next = x + (target - x) * (1 - Math.exp(-Math.min(dt, LONGEST_FRAME) / tau));
  return Math.abs(target - next) < SETTLED ? target : next;
}

/**
 * The re-route: where the runway goes when the browser has scrolled the
 * Strip's own box by `scrollLeft` to bring something on screen. The box
 * was scrolled against the row as drawn, so the answer is the drawn
 * position plus that distance, never the scroll position: mid-Glide the
 * two differ, and the thing is on screen at the drawn one. The box
 * scrolled nowhere is the runway where it is.
 */
export function reRoute(drawn: number, scrollLeft: number): number {
  return drawn + scrollLeft;
}

/**
 * The element a key was pressed in: what has focus, or the body when
 * nothing does. Null only for a target that is no element at all.
 */
function targetOf(event: KeyboardEvent): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

/**
 * How much of the viewport is cut away at the sides before an Illustration
 * counts as arrived: a tenth, so a piece fades in once it is well on
 * screen and not as its first pixel crosses the edge.
 */
const ARRIVAL_MARGIN = "0px -10% 0px -10%";

/**
 * The Spreads on the Strip, in reading order: every element the `.spread`
 * rule in `app/globals.css` lays out as one, the Hero included. Read by
 * that class because that rule is what makes an element a Spread, and the
 * Bar's dots are counted the same way, one per Spread.
 */
function spreadsOf(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>(".spread"));
}

/** The Panel a Spread is in: the `<section>` with the id, up from the Spread. */
function panelOf(spread: Element): HTMLElement | null {
  return spread.closest<HTMLElement>("section[id]");
}

/**
 * The Illustrations in the row, in table order: every `<img>` the
 * `.illustration` rule in `app/globals.css` draws as one. Written by
 * `components/illustration.tsx` from the table, one each, in its order,
 * so the piece at an index is the table's row at that index.
 */
function illustrationsOf(row: HTMLElement): HTMLImageElement[] {
  return Array.from(row.querySelectorAll<HTMLImageElement>("img.illustration"));
}

/**
 * The Spread a row of the table names: the nth Spread of the Panel with
 * that id, or undefined for a Spread the page does not have.
 */
function spreadNamed(row: HTMLElement, panel: string, index: number): HTMLElement | undefined {
  return spreadsOf(row).filter((spread) => panelOf(spread)?.id === panel)[index];
}

/**
 * True while the Strip is sideways: the large-display layout, where the
 * row is wider than the box that clips it. Read off the elements rather
 * than a media query, so the one query in `app/globals.css` stays the one
 * place the rule lives.
 */
function isSideways(strip: HTMLElement, row: HTMLElement): boolean {
  return row.offsetWidth > strip.clientWidth;
}

/** Light the Nav link to the Panel with this id, and no other. */
function light(links: HTMLAnchorElement[], id: string): void {
  for (const link of links) {
    if (link.getAttribute("href") === `#${id}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

/** What the flow answers to once it is running: the Bar's two asks. */
type Flow = {
  /** Land the Spread at this index, counted from 0 across the Strip. */
  select: (index: number) => void;
  /** Move one Spread on or back, by the edge rule. */
  step: (direction: 1 | -1) => void;
  /** Stop drawing and unwire everything. */
  stop: () => void;
};

/**
 * Start the flow: size the runway and the Ground, draw the row and the
 * Ground each frame by the Glide, take the arrow keys and a sideways
 * swipe, land Nav links, and land the hash the page opened at. Everything
 * measured is measured again when the row or the window changes size, and
 * below the large rule the runway, the row and the Ground are left as the
 * stylesheet laid them out.
 */
function startFlow(
  runway: HTMLElement,
  strip: HTMLElement,
  row: HTMLElement,
  ground: HTMLElement,
): Flow {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sideways = () => isSideways(strip, row);
  /** How far the row can move: its width less the screen's. */
  const overhang = () => Math.max(0, row.offsetWidth - strip.clientWidth);
  /** The scroll position, as far as the row can follow it. */
  const target = () => Math.min(window.scrollY, overhang());
  /** An element's left edge, measured from the row's own, whatever the row is drawn at. */
  const leftOf = (element: Element) =>
    element.getBoundingClientRect().left - row.getBoundingClientRect().left;

  // Each Illustration placed, with the anchor it lags around: filled by
  // the layout, once the Spreads have their widths, and read by the draw.
  let placed: { piece: HTMLImageElement; anchor: number }[] = [];

  // The drawn position, and the loop that moves it: running while there is
  // distance to close, and woken by a scroll or a layout. The position is
  // read once the runway has its height, so a page reloaded mid-Strip
  // opens where the browser put it rather than gliding there from Home.
  let x = 0;
  let last = 0;
  let frame = 0;
  const draw = () => {
    row.style.transform = `translate3d(${-x}px, 0, 0)`;
    ground.style.transform = `translate3d(${-x * groundRate(reduced.matches)}px, 0, 0)`;
    const rate = illustrationRate(reduced.matches);
    for (const { piece, anchor } of placed) {
      piece.style.transform = `translate3d(${lagOf(x, anchor, rate)}px, 0, 0)`;
    }
  };
  const tick = (now: number) => {
    // A window narrowed mid-glide: the layout has cleared the row, and a
    // frame already asked for must not write it back.
    if (!sideways()) {
      frame = 0;
      return;
    }
    const dt = (now - last) / 1000;
    last = now;
    x = glideStep(x, target(), dt, GLIDE, reduced.matches);
    draw();
    frame = x === target() ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => {
    if (frame === 0 && sideways()) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  // Everything the script wrote, taken back: the runway, the row, the
  // Ground and the Illustrations as the stylesheet laid them out. Below
  // the large rule, and when the flow stops.
  const clear = () => {
    runway.style.height = "";
    row.style.transform = "";
    ground.style.width = "";
    ground.style.transform = "";
    for (const piece of illustrationsOf(row)) {
      unplace(piece);
    }
    placed = [];
  };

  // The runway: the overhang plus one screen, so the document scrolls as
  // far as the row can move and no further. The Ground: the overhang at
  // its rate plus one screen, so there is ground under the viewport at the
  // far end; it is drawn here as well, since a Strip at rest wakes no
  // frame and the Ground's rate may just have changed. Below the large
  // rule, nothing. The Illustrations are placed here as well, since a
  // Spread's width and the vw are what they are placed by.
  const layout = () => {
    if (sideways()) {
      runway.style.height = `${overhang() + strip.clientHeight}px`;
      ground.style.width = `${groundWidth(overhang(), strip.clientWidth, reduced.matches)}px`;
      placed = placeIllustrations(row, strip.clientWidth);
      draw();
      wake();
    } else {
      clear();
    }
  };

  // Every move the script makes is a scroll of the runway, so the Bar, the
  // Nav and the hash follow it as they follow any scroll. Smooth, unless
  // the visitor has asked for less motion or it is the page opening at a
  // hash.
  const scrollRunway = (top: number, instant = false) => {
    window.scrollTo({
      top: Math.min(Math.max(0, top), overhang()),
      behavior: instant || reduced.matches ? "instant" : "smooth",
    });
  };

  // The one landing: the element's left edge at the screen's left.
  const land = (element: Element, instant = false) => {
    if (sideways()) {
      scrollRunway(leftOf(element), instant);
    }
  };

  const select = (index: number) => {
    const spread = spreadsOf(row)[index];
    if (spread !== undefined) {
      land(spread);
    }
  };

  const step = (direction: 1 | -1) => {
    if (sideways()) {
      scrollRunway(edgeRule(spreadsOf(row).map(leftOf), target(), direction));
    }
  };

  /** What a hash names inside the row, or null: a Panel, a Spread, or nothing here. */
  const openedBy = (hash: string): Element | null => {
    const opened = document.getElementById(decodeURIComponent(hash.slice(1)));
    return opened !== null && row.contains(opened) ? opened : null;
  };

  // A sideways swipe on a trackpad: the runway is vertical, so the browser
  // does nothing with it; it is mapped onto the runway by its own distance.
  const onWheel = (event: WheelEvent) => {
    if (!sideways() || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      return;
    }
    window.scrollBy({ top: event.deltaX });
  };

  // The re-route: the browser has scrolled the Strip's box to bring a
  // find match, a focused link or a `:target` on screen, which moves
  // nothing the visitor can see. The distance is read, the box put back,
  // and the runway landed that much past the row as drawn. Putting the
  // box back fires this once more, with nothing to read. The page opening
  // at a hash is the same scroll, handled by hand below so that one
  // landing is instant; by the time this hears of it the box is at 0.
  const onBoxScroll = () => {
    const wanted = strip.scrollLeft;
    if (wanted === 0 || !sideways()) {
      return;
    }
    strip.scrollLeft = 0;
    scrollRunway(reRoute(x, wanted));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // A key held with a modifier is the browser's: Alt+Left is Back. A key
    // pressed in a box the visitor types in is the box's: it moves the caret.
    if (
      !sideways() ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      isTypingIn(targetOf(event))
    ) {
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  // A link into the row, the Nav's or any other: the browser would scroll
  // the Strip's clipped box sideways, which moves nothing the visitor can
  // see. It lands by the runway instead. A click with a modifier or
  // another button is the browser's, as anywhere.
  const onClick = (event: MouseEvent) => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const link =
      event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    if (link === null || !sideways()) {
      return;
    }
    const opened = openedBy(link.hash);
    if (opened !== null) {
      event.preventDefault();
      land(opened);
    }
  };

  layout();
  x = target();
  draw();
  // The arrivals are watched from here, after the first placement, so no
  // piece is seen at the row's corner before it has been put anywhere.
  const arrivals = watchArrivals(illustrationsOf(row));
  const resized = new ResizeObserver(layout);
  resized.observe(row);
  window.addEventListener("resize", layout);
  // The Ground's rate is the visitor's motion setting, so a setting changed
  // mid-visit is a layout: the row's width follows the rate.
  reduced.addEventListener("change", layout);
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);

  // Opening at a hash: the browser has scrolled the Strip's clipped box to
  // the element, which moves nothing the visitor can see; that scroll is
  // undone and the runway landed there instead, instantly, and the drawn
  // position set to it so the page opens there rather than gliding there.
  const opened = openedBy(window.location.hash);
  if (opened !== null && sideways()) {
    strip.scrollLeft = 0;
    land(opened, true);
    x = target();
    draw();
  }
  strip.addEventListener("scroll", onBoxScroll, { passive: true });

  return {
    select,
    step,
    stop: () => {
      cancelAnimationFrame(frame);
      arrivals();
      resized.disconnect();
      window.removeEventListener("resize", layout);
      reduced.removeEventListener("change", layout);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      strip.removeEventListener("scroll", onBoxScroll);
      clear();
    },
  };
}

/** One Illustration placed on the row, and the anchor it lags around. */
type PlacedPiece = {
  piece: HTMLImageElement;
  anchor: number;
};

/**
 * Place every Illustration: each beside the Spread its row of the table
 * names, by that Spread's right edge or its content column's left, at its
 * offset and width in vw and its top, measured against the row's own left
 * so the placement holds whatever the row is drawn at; returns each with
 * its anchor, for the draw. One whose Spread the page does not have is
 * hidden and not returned.
 */
function placeIllustrations(row: HTMLElement, screen: number): PlacedPiece[] {
  const origin = row.getBoundingClientRect().left;
  const vw = screen / 100;
  const placed: PlacedPiece[] = [];

  illustrationsOf(row).forEach((piece, index) => {
    const placement = PLACEMENTS[index];
    const spread =
      placement === undefined ? undefined : spreadNamed(row, placement.panel, placement.spread);
    if (placement === undefined || spread === undefined) {
      piece.style.display = "none";
      return;
    }
    const box = spread.getBoundingClientRect();
    const content = spread.querySelector(`.${SPREAD_CONTENT}`)?.getBoundingClientRect() ?? box;
    const at = placeIllustration(
      placement,
      { after: box.right - origin, box: content.left - origin },
      vw,
    );
    piece.style.display = "";
    piece.style.left = `${at.left}px`;
    piece.style.top = placement.top;
    piece.style.width = `${at.width}px`;
    placed.push({ piece, anchor: anchorOf(at, screen) });
  });

  return placed;
}

/**
 * Take back the five styles the placement and the draw write on a piece,
 * and leave the float's start, which the markup wrote.
 */
function unplace(piece: HTMLImageElement): void {
  piece.style.display = "";
  piece.style.left = "";
  piece.style.top = "";
  piece.style.width = "";
  piece.style.transform = "";
}

/**
 * Mark each Illustration as arrived the first time it is well on screen;
 * returns the unwatching. Once arrived, always arrived: a piece does not
 * fade out again on the way back. A browser with no observer marks them
 * all now: never hidden is better than never shown.
 */
function watchArrivals(pieces: HTMLImageElement[]): () => void {
  const arrive = (piece: HTMLElement) => {
    piece.dataset.arrived = "true";
  };
  if (typeof IntersectionObserver === "undefined") {
    pieces.forEach(arrive);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          arrive(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: ARRIVAL_MARGIN },
  );
  for (const piece of pieces) {
    observer.observe(piece);
  }
  return () => observer.disconnect();
}

/**
 * Watch which Spread is nearest the middle; light its Panel's Nav link,
 * carry the Panel's id in the hash, and say the Spread's place on the
 * Strip; returns the unwatching. A browser with no observer keeps Home lit
 * and says nothing.
 */
function watchSpreads(row: HTMLElement, onScreen: (index: number) => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    return () => {};
  }

  const spreads = spreadsOf(row);
  if (spreads.length === 0) {
    return () => {};
  }
  // The Nav's list's links and not the button after it: that goes to
  // Contact too, and lighting it would say the Panel twice. The Bar's
  // lists hold buttons and no links, so none of them is among these.
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('nav ul a[href^="#"]'),
  );
  const home = panelOf(spreads[0]);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const panel = panelOf(entry.target);
        if (panel === null) {
          continue;
        }
        light(links, panel.id);
        onScreen(spreads.indexOf(entry.target as HTMLElement));

        const hash = panel === home ? "" : `#${panel.id}`;
        if (window.location.hash !== hash) {
          const { pathname, search } = window.location;
          window.history.replaceState(null, "", pathname + search + hash);
        }
      }
    },
    { rootMargin: ON_SCREEN_MARGIN },
  );

  for (const spread of spreads) {
    observer.observe(spread);
  }
  return () => observer.disconnect();
}

/** True when this session has already moved the Strip. A storage that refuses to answer has not. */
function hasMoved(): boolean {
  try {
    return window.sessionStorage.getItem(MOVED_KEY) !== null;
  } catch {
    return false;
  }
}

/** Remember, for the session, that the Strip has moved. A storage that refuses is left alone. */
function rememberMoved(): void {
  try {
    window.sessionStorage.setItem(MOVED_KEY, "true");
  } catch {
    // Nothing to do: the hint is hidden for this page either way.
  }
}

export function Strip({ spreads, barCopy, children }: StripProps) {
  const runway = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const flow = useRef<Flow | null>(null);
  // Where the page opened: the first Spread the observer saw, or none yet.
  const openedAt = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [hintSpent, setHintSpent] = useState(false);

  // The flow starts before the watching below, in effect order, so the
  // first Spread the observer sees is the one the hash landed on and not
  // the Hero the page was drawn at.
  useEffect(() => {
    if (
      runway.current === null ||
      strip.current === null ||
      row.current === null ||
      ground.current === null
    ) {
      return undefined;
    }
    const started = startFlow(runway.current, strip.current, row.current, ground.current);
    flow.current = started;
    return () => {
      started.stop();
      flow.current = null;
    };
  }, []);

  useEffect(() => {
    if (strip.current === null || row.current === null) {
      return undefined;
    }
    const box = strip.current;
    const watched = row.current;
    return watchSpreads(watched, (index) => {
      setCurrent(index);
      // The first Spread seen is where the page opened, and is no move; the
      // session is asked then whether an earlier page of it moved. Any other
      // Spread after that is the move, when the Strip is what moved: a
      // stacked page scrolled on a phone has no Bar and spends no hint.
      if (openedAt.current === null) {
        openedAt.current = index;
        if (hasMoved()) {
          setHintSpent(true);
        }
      } else if (index !== openedAt.current && isSideways(box, watched)) {
        setHintSpent(true);
        rememberMoved();
      }
    });
  }, []);

  const select = (index: number) => {
    flow.current?.select(index);
  };

  const step = (direction: 1 | -1) => {
    flow.current?.step(direction);
  };

  return (
    <>
      {/* The Ground: before the runway, so it is the first thing behind the page. */}
      <Ground rowRef={ground} />

      {/* The runway: a plain block the flow gives a height on a large display, and nothing in the stack. */}
      <div ref={runway}>
        <main
          ref={strip}
          tabIndex={0}
          className="strip flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <div ref={row} className="row flex flex-col">
            {/* The Illustrations first, so they paint under the Panels. */}
            <Illustrations />
            {children}
          </div>
        </main>
      </div>

      <Bar
        spreads={spreads}
        copy={barCopy}
        current={current}
        hintSpent={hintSpent}
        onSelect={select}
        onStep={step}
      />
    </>
  );
}
