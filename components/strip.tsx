"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Bar, type PanelSpreads } from "@/components/bar";
import type { BarCopy } from "@/content/site";

/**
 * The Strip: the `<main>` the five Panels sit in, and the Bar under it.
 *
 * This is the second of five client components on the site, after the
 * reveal and before the Bar, the Form and the Turnstile widget in it, and
 * it does three small things the browser cannot do on its own. Everything
 * else about the Strip is CSS in `app/globals.css` and native scroll
 * (ADR-0003): a Nav link, the Tab key and a hash in the address all move
 * it without a line of script, and what is written here only asks the
 * browser to scroll.
 *
 * It watches which Spread is on screen. When one crosses the middle of the
 * viewport it lights the Nav link of the Panel that holds it, puts that
 * Panel's id in the URL hash, and hands the Spread's place on the Strip to
 * the Bar, which lights that dot; one observer, so the lit link, the lit
 * dot and the hash cannot disagree. The link is found by its href, in the
 * Nav's list, so the Nav stays a server component and the two never have
 * to be told about each other; the "Get in touch" button after the list
 * points into the page too, to Contact, and is never lit. The hash is
 * replaced rather than pushed: moving through a page is not a history of
 * places a visitor went. Home gets no hash at all, so the plain address stays
 * the address of the top of the page and a visitor who never scrolled shares
 * it as it was. It is the Panel's id and never a Spread's, whichever Spread
 * of the Panel is on screen, so an address copied mid-read is short and
 * stays the same across the four Spreads of Work; a page opened at a
 * Spread's hash is written back to its Panel's as soon as it is watched.
 * The same watching says when the Strip first moves: the first Spread seen
 * is where the page opened, and the first other one is the move, after
 * which the Bar's hint is hidden for the session.
 *
 * It draws the Bar (`components/bar.tsx`), after the `<main>`, and answers
 * its two asks: a dot picked lands on that Spread, and an arrow moves one
 * screen, both by native scroll, so a dot is a Nav link that names a
 * Spread. It is drawn here and not in the page so the one observer can
 * hand it what it sees; the page hands the Strip the Spreads to draw it
 * from, by title, as each Panel component says them.
 *
 * It turns the wheel sideways. On a large display the Strip scrolls sideways
 * and the document does not scroll at all, so a wheel rolled the way every
 * wheel is rolled would do nothing. A vertical roll moves the Strip one
 * screen the way it points, and one screen is one Spread; a sideways swipe
 * is left to the browser, which already scrolls the Strip with it. The move
 * is a screen and not the wheel's own distance because the Strip snaps to a
 * Spread: a smaller scroll is snapped straight back to where it began.
 *
 * It takes the arrow keys. Left and right move one screen, from wherever
 * focus is: a visitor who has just arrived has nothing focused, and a press
 * should still move. The Strip is focusable too, so a Tab can land on the
 * thing the keys move. The one place the keys are not taken is a box the
 * visitor is typing in, an input, a textarea or anything contenteditable:
 * there ← and → move the caret, and a typo fixed in Message must not slide
 * the Form away. On the Send button, or anywhere else, they move the Strip.
 *
 * Opening the page with a hash lands on that Panel, or that Spread, by the
 * browser's own anchor scroll: a Spread carries its item's id
 * (`components/spread.tsx`), so `#payment-gateway-integrations` lands on
 * that Case Study as `#work` lands on the Panel. The one thing added is to
 * land instantly: Firefox honours the smooth slide on that first scroll
 * too, and a page that opens by sliding across four Panels has not opened
 * where the link pointed.
 */

/**
 * How much of the viewport is cut away, on every side, before a Spread counts
 * as on screen. What is left is a box in the middle, and the Spread crossing
 * it is the one the visitor is looking at. Cutting every side serves both
 * layouts with one margin: a stacked Spread is as wide as the screen, so only
 * the top and bottom cuts tell; a Spread on the Strip is as tall as the
 * screen, so only the left and right cuts do. Counting by how much of a
 * Spread is visible would not do: two Spreads share the screen mid-slide.
 * It relies on every Spread being taller than the box, which a Spread of a
 * title and a card is on any display; one smaller than the box could never
 * be lit.
 */
const ON_SCREEN_MARGIN = "-45%";

/**
 * Where the session remembers that the Strip has moved, so the hint is not
 * shown again to a visitor who has already moved once and come back.
 */
const MOVED_KEY = "strip-moved";

/**
 * How long, after the Strip is moved by the wheel, further wheel events are
 * taken for the same roll. A wheel reports a roll as many events, and a
 * trackpad keeps reporting after the fingers have lifted; one roll is one
 * screen, not one screen per event.
 */
const ONE_ROLL_MS = 700;

type StripProps = {
  /** The Spreads of each Panel, by title, in Panel order: what the Bar draws. */
  spreads: PanelSpreads[];
  /** The Bar's words. */
  bar: BarCopy;
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
 * The element a key was pressed in: what has focus, or the body when
 * nothing does. Null only for a target that is no element at all.
 */
function targetOf(event: KeyboardEvent): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

/**
 * The Spreads on the Strip, in reading order: every element the `.spread`
 * rule in `app/globals.css` makes a snap point, the Hero included. Read by
 * that class because that rule is what makes an element a stop, and the
 * Bar's dots are counted the same way, one per stop.
 */
function spreadsOf(strip: HTMLElement): HTMLElement[] {
  return Array.from(strip.querySelectorAll<HTMLElement>(".spread"));
}

/** The Panel a Spread is in: the `<section>` with the id, up from the Spread. */
function panelOf(spread: Element): HTMLElement | null {
  return spread.closest<HTMLElement>("section[id]");
}

/**
 * True while the Strip scrolls sideways: the large-display layout. Read off
 * the element rather than a media query, so the one query in
 * `app/globals.css` stays the one place the rule lives.
 */
function isSideways(strip: HTMLElement): boolean {
  return strip.scrollWidth > strip.clientWidth;
}

/** Move the Strip one screen, one Spread, in the given direction, by native scroll. */
function moveScreens(strip: HTMLElement, direction: 1 | -1): void {
  strip.scrollBy({ left: direction * strip.clientWidth });
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

/**
 * Land on whatever the address names inside the Strip, instantly: a Panel
 * or a Spread, which are both snap points at their start, or an id inside
 * one, which lands the snap on the Spread that holds it. Only the Strip
 * needs it: the stacked page has no smooth scroll to cut short, and a
 * visitor who has already scrolled it should not be pulled back.
 */
function landOnHash(strip: HTMLElement): void {
  if (!isSideways(strip)) {
    return;
  }

  const opened = document.getElementById(window.location.hash.slice(1));
  if (opened !== null && strip.contains(opened)) {
    opened.scrollIntoView({ behavior: "instant", block: "start", inline: "start" });
  }
}

/** Wire the wheel and the arrow keys to the Strip; returns the unwiring. */
function takeWheelAndKeys(strip: HTMLElement): () => void {
  let rolledAt = Number.NEGATIVE_INFINITY;

  const onWheel = (event: WheelEvent) => {
    if (!isSideways(strip) || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }
    if (event.timeStamp - rolledAt < ONE_ROLL_MS) {
      return;
    }
    rolledAt = event.timeStamp;
    moveScreens(strip, event.deltaY > 0 ? 1 : -1);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // A key held with a modifier is the browser's: Alt+Left is Back. A key
    // pressed in a box the visitor types in is the box's: it moves the caret.
    if (
      !isSideways(strip) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      isTypingIn(targetOf(event))
    ) {
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveScreens(strip, event.key === "ArrowRight" ? 1 : -1);
    }
  };

  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
  };
}

/**
 * Watch which Spread is on screen; light its Panel's Nav link, carry the
 * Panel's id in the hash, and say the Spread's place on the Strip; returns
 * the unwatching. A browser with no observer keeps Home lit and says
 * nothing.
 */
function watchSpreads(strip: HTMLElement, onScreen: (index: number) => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    return () => {};
  }

  const spreads = spreadsOf(strip);
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

export function Strip({ spreads, bar, children }: StripProps) {
  const strip = useRef<HTMLElement>(null);
  // Where the page opened: the first Spread the observer saw, or none yet.
  const openedAt = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [hintShown, setHintShown] = useState(true);

  useEffect(() => {
    if (strip.current !== null) {
      landOnHash(strip.current);
    }
  }, []);

  useEffect(() => {
    return strip.current === null ? undefined : takeWheelAndKeys(strip.current);
  }, []);

  useEffect(() => {
    if (strip.current === null) {
      return undefined;
    }
    return watchSpreads(strip.current, (index) => {
      setCurrent(index);
      // The first Spread seen is where the page opened, and is no move; the
      // session is asked then whether an earlier page of it moved. Any other
      // Spread after that is the move.
      if (openedAt.current === null) {
        openedAt.current = index;
        if (hasMoved()) {
          setHintShown(false);
        }
      } else if (index !== openedAt.current) {
        setHintShown(false);
        rememberMoved();
      }
    });
  }, []);

  const select = useCallback((index: number) => {
    const spread = strip.current === null ? undefined : spreadsOf(strip.current)[index];
    spread?.scrollIntoView({ block: "nearest", inline: "start" });
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    if (strip.current !== null) {
      moveScreens(strip.current, direction);
    }
  }, []);

  return (
    <>
      <main
        ref={strip}
        tabIndex={0}
        className="strip flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </main>

      <Bar
        spreads={spreads}
        copy={bar}
        current={current}
        hintShown={hintShown}
        onSelect={select}
        onStep={step}
      />
    </>
  );
}
