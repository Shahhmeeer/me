import type { ReactNode } from "react";

import { Blob, type BlobShape } from "@/components/blob";
import type { ContentPanel } from "@/content/site";

type PanelProps = {
  /** The Panel as the content module names it: its id, heading and line. */
  panel: ContentPanel;
  /** The colour behind it. Each Panel picks its own shapes. */
  blobs: BlobShape[];
  children: ReactNode;
};

/**
 * One Panel beyond Home (ADR-0003): the `<section>` with the id, the Blob
 * behind it, and its Spreads in reading order, and nothing else.
 *
 * Every Panel is a `<section>` with a stable id, labelled by its own
 * heading, so the Nav, the URL hash, a screen reader and the rendered-page
 * test all name it the same way. The heading is inside its first Spread, as
 * that Spread's eyebrow, so the section is labelled by an id it trusts
 * `components/spread.tsx` to write; the children are what says what the
 * Panel holds. Home is headed by the Headline, the page's one h1, and is
 * laid out its own way in `components/home-panel.tsx`.
 *
 * On a small display the Panel stacks its Spreads top to bottom, each a
 * column of title and card, with the Panel's heading and line at the top of
 * the first; the space between two Spreads is each Spread's own, in
 * `components/spread.tsx`, because one that continues the Spread before it
 * keeps less than one that opens something new. Padded at the top for the
 * Nav floating over it, and at least one screen tall and centred when its
 * Spreads are shorter than that, so a Panel with little to say still reads
 * as a screen and not as a gap.
 *
 * On the Strip it is a row of Spreads, each one screen wide and a snap point
 * by the `.spread` rule in `app/globals.css`, and it takes the `.panel` rule
 * there for the height and for never shrinking to fit the row. It is as
 * wide as its Spreads, `w-max`, and not the screen: a Panel a screen wide
 * with four screens of Spreads inside it would have three of them painted
 * over by the Panels after it. Nothing in it is sticky, and nothing in it
 * is wider than a Spread: a Panel with more to show than fits a screen has
 * more Spreads, never a wider one. Which display gets the Strip is decided
 * once, by the `large` variant in `app/globals.css`, and nowhere here.
 *
 * The Blob fills the whole Panel and sits under everything on it: the Panel
 * is `relative` and `isolate` for that. Shapes for a Panel of several
 * Spreads are placed along it.
 */
export function Panel({ panel, blobs, children }: PanelProps) {
  return (
    <section
      id={panel.id}
      aria-labelledby={`${panel.id}-heading`}
      className="panel relative isolate mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-gutter pt-nav pb-section large:w-max large:flex-row large:justify-start large:px-0 large:pt-0 large:pb-0"
    >
      <Blob shapes={blobs} />

      {children}
    </section>
  );
}
