"use client";

import { ARROW, DOT, DOT_MARK } from "@/components/interactive";
import type { BarCopy, Panel } from "@/content/site";

/**
 * The Spreads of one Panel, as the Bar names them: the Panel, and one title
 * per Spread in Strip order. Each Panel component says its own, from the
 * same content arrays it splits its Spreads by, so a Spread added is a dot
 * added and the two cannot disagree; `app/page.tsx` lists the five in Panel
 * order and hands them to the Strip.
 */
export type PanelSpreads = {
  panel: Panel;
  /** One per Spread: what its dot is named, and what a pointer over it reads. */
  titles: string[];
};

type BarProps = {
  spreads: PanelSpreads[];
  copy: BarCopy;
  /** Which Spread is on screen, counted from 0 across the whole Strip. */
  current: number;
  /** True until the Strip first moves in this session. */
  hintShown: boolean;
  /** Land on the Spread at this index, counted the same way. */
  onSelect: (index: number) => void;
  /** Move one Spread on or back. */
  onStep: (direction: 1 | -1) => void;
};

/**
 * The Bar: what says where on the Strip a visitor is and gives them a
 * visible way to move (CONTEXT.md).
 *
 * A second frosted pill, floating bottom-centre over the Strip as the Nav
 * floats over its top. In it, in reading order: the arrow back, one dot per
 * Spread, and the arrow on. The dots are grouped by Panel, one list per
 * Panel with a gap between the lists, so the five groups read as the five
 * Nav links and a Recruiter can count them; each dot is a button named by
 * its Spread's title, so a screen reader lists where a visitor can go and a
 * pointer over a dot reads which Case Study it is. The current Spread's dot
 * carries `aria-current="true"` and is drawn as a short bar in aqua, the
 * colour of the lit Nav link. The two arrows never leave: the one with
 * nowhere to go is disabled and faded, so the Bar keeps its shape.
 *
 * After the arrow on, past a hairline, the hint: one sentence from the
 * content module on how to move, for a visitor who has never met a
 * sideways site. It sits in the pill and not over it, so the Bar is one
 * row and the room a Spread keeps for it at its foot is the pill's height
 * and no more. It is a live region switched off, so a screen reader that
 * has already read it in place is not told it again, and once the Strip
 * has moved it is hidden with the `hidden` attribute, from sight and from
 * the accessibility tree, for the rest of the session, and the pill closes
 * up. The Strip says when; the Bar only draws it.
 *
 * Nothing here decides where the visitor is. The Strip in
 * `components/strip.tsx` watches the Spreads with the observer that lights
 * the Nav, and hands the Bar the index it saw, so the lit link, the lit dot
 * and the hash cannot disagree; a dot or an arrow pressed asks the Strip to
 * scroll, natively, as everything else that moves it does (ADR-0003). The
 * Bar is one of the site's five client components for those two handlers
 * and nothing else: it renders on the server like the rest, with Home's
 * first dot lit and the arrow back disabled, which is where a page opens.
 *
 * It is drawn only where the Strip is: `hidden` below the `large` variant
 * from `app/globals.css`, the one place that says which display gets the
 * Strip, so on a stacked display it is not there for a pointer, a Tab or a
 * screen reader. Every Spread's frame keeps the Bar's height clear at its
 * foot, `pb-bar` in `components/spread.tsx`, so the pill never sits over a
 * card. No motion yet: the stretch of the lit dot, the arrows' nudge and
 * the hint's fade are the next ticket's.
 */
export function Bar({ spreads, copy, current, hintShown, onSelect, onStep }: BarProps) {
  // Each group's first dot's place on the Strip: the dots before it, counted.
  const firstOf = spreads.map((_, group) =>
    spreads.slice(0, group).reduce((sum, before) => sum + before.titles.length, 0),
  );
  const count = firstOf[spreads.length - 1] + (spreads[spreads.length - 1]?.titles.length ?? 0);

  return (
    <nav
      aria-label={copy.label}
      className="pill fixed inset-x-0 bottom-4 z-10 mx-auto hidden w-fit items-center gap-2 rounded-full px-2 py-1 large:flex"
    >
      {/* The groups sit a clear step apart, the dots inside one touching, so five groups read as five. */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          aria-label={copy.previous}
          disabled={current <= 0}
          onClick={() => onStep(-1)}
          className={ARROW}
        >
          <span aria-hidden="true">&larr;</span>
        </button>

        {spreads.map((group, groupIndex) => (
          <ul key={group.panel.id} className="flex items-center">
            {group.titles.map((title, inGroup) => {
              const at = firstOf[groupIndex] + inGroup;
              return (
                <li key={at} className="flex">
                  <button
                    type="button"
                    aria-label={title}
                    aria-current={at === current ? "true" : undefined}
                    onClick={() => onSelect(at)}
                    className={DOT}
                  >
                    <span aria-hidden="true" className={DOT_MARK} />
                  </button>
                </li>
              );
            })}
          </ul>
        ))}

        <button
          type="button"
          aria-label={copy.next}
          disabled={current >= count - 1}
          onClick={() => onStep(1)}
          className={ARROW}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <p
        aria-live="off"
        hidden={!hintShown}
        className="border-l border-border pl-3 pr-1 text-caption text-muted"
      >
        {copy.hint}
      </p>
    </nav>
  );
}
