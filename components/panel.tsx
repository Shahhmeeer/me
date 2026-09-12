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
 * One Panel: a screen of the site, for the four Panels beyond Home.
 *
 * Every Panel is a `<section>` with a stable id, labelled by its own heading,
 * so the Nav, the URL hash, a screen reader and the rendered-page test all
 * name it the same way. Padded at the top for the Nav floating over it. The
 * heading is an h2, the Panel's Nav label, and under it is the Panel's one
 * line, so a visitor arriving knows what the Panel holds before reading any
 * of it. Home is headed by the Headline, the page's one h1, and is laid out
 * its own way in `components/home-panel.tsx`.
 *
 * On a small display the Panels stack: heading, line, then content, and each
 * is at least one screen tall and centred when its content is shorter than
 * that, so a Panel with little to say still reads as a screen and not as a
 * gap.
 *
 * On a large display they sit side by side on the Strip (ADR-0003), and a
 * Panel is a row: the left column, the heading and the line, is sticky and
 * stays put while the content to its right slides past. The content is a row
 * of blocks that grows the Panel sideways to fit; what is taller than the
 * screen is clipped, never scrolled, because the Strip has one direction.
 * The column is a set width, painted on the page colour, so what slides under
 * it is hidden rather than read through it. The gaps between the column, the
 * blocks and the cards close up on a Strip narrower than 1280px, so that at
 * the narrowest large display the first card is mostly on screen beside the
 * column and not mostly off it. Which screen a Panel is on is decided once,
 * by the `large` variant in `app/globals.css`, and nowhere here: a width
 * alone never picks a Strip rule, so `xl:` is only ever stacked on `large:`.
 * What every Panel on the Strip shares, the snap point and the screen, is
 * the `.panel` rule there.
 *
 * The Blob fills the Panel and sits under everything on it: the Panel is
 * `relative` and `isolate` for that. On the Strip the column hides whatever
 * Blob is under it, so a Panel's shapes are placed where the content is.
 */
export function Panel({ panel, blobs, children }: PanelProps) {
  const headingId = `${panel.id}-heading`;

  return (
    <section
      id={panel.id}
      aria-labelledby={headingId}
      className="panel relative isolate mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-gutter px-gutter pt-nav pb-section large:w-max large:flex-row large:items-start large:justify-start large:gap-gutter large:pl-0 large:pb-gutter large:xl:gap-block"
    >
      <Blob shapes={blobs} />

      <div className="flex flex-col gap-3 large:sticky large:left-0 large:z-1 large:w-88 large:shrink-0 large:self-stretch large:bg-background large:px-gutter">
        <h2
          id={headingId}
          className="text-panel font-semibold tracking-tight text-foreground"
        >
          {panel.label}
        </h2>
        <p className="max-w-measure text-lead text-muted">{panel.line}</p>
      </div>

      <div className="contents large:flex large:min-h-0 large:flex-row large:items-start large:gap-gutter large:self-stretch large:overflow-clip large:xl:gap-block">
        {children}
      </div>
    </section>
  );
}
