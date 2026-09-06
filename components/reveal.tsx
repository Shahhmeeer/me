"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * One block, arriving.
 *
 * This is the only client component on the site. It watches its own wrapper
 * with an intersection observer and marks it arrived the first time any of it
 * reaches the viewport; the fade and the rise are CSS, in `app/globals.css`.
 * Splitting it that way is what keeps every other component on the server:
 * they render markup, and this one does nothing but set an attribute.
 *
 * Nothing here decides whether the page moves. The stylesheet hides a block
 * only under `prefers-reduced-motion: no-preference`, so a visitor who has
 * asked for less movement reads a page that was never hidden. The observer
 * still runs and still sets the attribute; with no rule to switch off, it
 * changes nothing.
 */

/**
 * How far up from the bottom edge a block must come before it counts as
 * arrived. A small margin, so the fade starts as the block is being looked at
 * rather than after it has been read.
 */
const ARRIVAL_MARGIN = "0px 0px -10% 0px";

type RevealProps = {
  children: ReactNode;
};

export function Reveal({ children }: RevealProps) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wrapper.current;
    if (node === null) {
      return;
    }

    // A browser with no observer gets the block outright. Never hidden is
    // always better than never shown.
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          // Once arrived, always arrived: a block does not fade out again on
          // the way back up.
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: ARRIVAL_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="reveal">
      {children}
    </div>
  );
}
