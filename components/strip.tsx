"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The Strip: the `<main>` the five Panels sit in.
 *
 * This is the second of three client components on the site, after the
 * reveal and before the Form, and it does three small things the browser
 * cannot do on its own. Everything else
 * about the Strip is CSS in `app/globals.css` and native scroll (ADR-0003): a
 * Nav link, the Tab key and a hash in the address all move it without a line
 * of script, and what is written here only asks the browser to scroll.
 *
 * It watches which Panel is on screen. When one crosses the middle of the
 * viewport it lights that Panel's Nav link and puts the Panel's id in the
 * URL hash. The link is found by its href, in the Nav's list, so the Nav
 * stays a server component and the two never have to be told about each
 * other; the "Get in touch" button after the list points into the page
 * too, to Contact, and is never lit. The hash is
 * replaced rather than pushed: moving through a page is not a history of
 * places a visitor went. Home gets no hash at all, so the plain address stays
 * the address of the top of the page and a visitor who never scrolled shares
 * it as it was. It is the Panel's id and never a Spread's, whichever Spread
 * of the Panel is on screen, so an address copied mid-read is short and
 * stays the same across the four Spreads of Work; a page opened at a
 * Spread's hash is written back to its Panel's as soon as it is watched.
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
 * How much of the viewport is cut away, on every side, before a Panel counts
 * as on screen. What is left is a box in the middle, and the Panel crossing
 * it is the one the visitor is looking at. Cutting every side serves both
 * layouts with one margin: a stacked Panel is as wide as the screen, so only
 * the top and bottom cuts tell; a Panel on the Strip is as tall as the
 * screen, so only the left and right cuts do. Counting by how much of a Panel
 * is visible would not do: the Work Panel is never all on screen at once. It
 * relies on every Panel being at least a screen tall, or wide, which
 * `components/panel.tsx` guarantees; a Panel smaller than the box could never
 * be lit.
 */
const ON_SCREEN_MARGIN = "-45%";

/**
 * How long, after the Strip is moved by the wheel, further wheel events are
 * taken for the same roll. A wheel reports a roll as many events, and a
 * trackpad keeps reporting after the fingers have lifted; one roll is one
 * screen, not one screen per event.
 */
const ONE_ROLL_MS = 700;

type StripProps = {
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

/** The Panels on the Strip, in reading order. */
function panelsOf(strip: HTMLElement): HTMLElement[] {
  return Array.from(strip.querySelectorAll<HTMLElement>(":scope > section[id]"));
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
 * Watch which Panel is on screen, light its Nav link and carry its id in the
 * hash; returns the unwatching. A browser with no observer keeps Home lit.
 */
function watchPanels(strip: HTMLElement): () => void {
  if (typeof IntersectionObserver === "undefined") {
    return () => {};
  }

  const panels = panelsOf(strip);
  // The list's links and not the button after it: that goes to Contact
  // too, and lighting it would say the Panel twice.
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('nav ul a[href^="#"]'),
  );
  const [home] = panels;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const { id } = entry.target;
        light(links, id);

        const hash = entry.target === home ? "" : `#${id}`;
        if (window.location.hash !== hash) {
          const { pathname, search } = window.location;
          window.history.replaceState(null, "", pathname + search + hash);
        }
      }
    },
    { rootMargin: ON_SCREEN_MARGIN },
  );

  for (const panel of panels) {
    observer.observe(panel);
  }
  return () => observer.disconnect();
}

export function Strip({ children }: StripProps) {
  const strip = useRef<HTMLElement>(null);

  useEffect(() => {
    if (strip.current !== null) {
      landOnHash(strip.current);
    }
  }, []);

  useEffect(() => {
    return strip.current === null ? undefined : takeWheelAndKeys(strip.current);
  }, []);

  useEffect(() => {
    return strip.current === null ? undefined : watchPanels(strip.current);
  }, []);

  return (
    <main
      ref={strip}
      tabIndex={0}
      className="strip flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </main>
  );
}
