"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The `<main>` the five Panels sit in, watching which one is on screen.
 *
 * This is the second client component on the site, after the reveal. It
 * observes every Panel, and when one crosses the middle of the viewport it
 * lights that Panel's Nav link and puts the Panel's id in the URL hash. The
 * link is found by its href, so the Nav stays a server component and the two
 * never have to be told about each other. The hash is replaced rather than
 * pushed: moving down a page is not a history of places a visitor went.
 *
 * Opening the page with a hash needs nothing from here. The browser scrolls
 * to the anchor on its own, and the observer's first report lights the link
 * for wherever that landed.
 *
 * The strip handlers, the wheel and the arrow keys, land in this component
 * when the strip does. That is why it owns the `<main>` and not just an
 * effect: they need the element.
 */

/**
 * How much of the viewport, top and bottom, is cut away before a Panel
 * counts as on screen. What is left is a band across the middle, and the
 * Panel crossing that band is the one the visitor is looking at. Counting by
 * how much of a Panel is visible would not do: the Work Panel on a phone is
 * never all on screen at once.
 */
const ON_SCREEN_MARGIN = "-45% 0px -45% 0px";

type PanelObserverProps = {
  children: ReactNode;
};

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

export function PanelObserver({ children }: PanelObserverProps) {
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = main.current;
    if (node === null || typeof IntersectionObserver === "undefined") {
      return;
    }

    const panels = Array.from(
      node.querySelectorAll<HTMLElement>(":scope > section[id]"),
    );
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]'),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const { id } = entry.target;
          light(links, id);
          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
          }
        }
      },
      { rootMargin: ON_SCREEN_MARGIN },
    );

    for (const panel of panels) {
      observer.observe(panel);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={main} className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
