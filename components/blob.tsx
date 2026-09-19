import type { CSSProperties } from "react";

/**
 * The palette colours a Blob may be drawn in, by the role the token gives
 * them. A Blob is decoration, so it borrows the accents, the button colour
 * and the Disc's Celadon, and never the text or the page colours, which
 * would vanish into the ground.
 */
export type BlobColour = "accent" | "accent-border" | "action" | "disc";

/** One soft circle: its colour, where its top-left corner sits, and its width. */
export type BlobShape = {
  colour: BlobColour;
  /** From the top of the Panel, as a CSS length: "10%" or "-5rem". */
  top: string;
  /** From the left of the Panel, as a CSS length. */
  left: string;
  /** The circle's width, as a CSS length: "40vw". It is as tall as it is wide. */
  size: string;
};

type BlobProps = {
  /** Two or three shapes read as a wash; one reads as a spotlight. */
  shapes: BlobShape[];
};

/**
 * How far apart in time neighbouring Blobs drift, in seconds. Each starts
 * that much further into its cycle than the one before, so three Blobs on
 * one keyframe never move in step. Negative, because a delay that has already
 * passed is a head start.
 */
const STAGGER_SECONDS = 11;

/**
 * One shape as the stylesheet reads it: its colour, its place, its width,
 * and how far into the drift it starts. The colour is a token by role, so
 * the shape is drawn in whatever the palette says that role is.
 */
function styleOf(shape: BlobShape, index: number): CSSProperties {
  return {
    "--blob-colour": `var(--portfolio-${shape.colour})`,
    "--blob-top": shape.top,
    "--blob-left": shape.left,
    "--blob-size": shape.size,
    "--blob-delay": `${-index * STAGGER_SECONDS}s`,
  } as CSSProperties;
}

/**
 * The Blob: soft colour behind a Panel, drifting slowly.
 *
 * The component draws the shapes and nothing more. Their blur, their fade,
 * their drift, and that they hold still under reduced motion, are all CSS in
 * `app/globals.css`; the field is hidden from a screen reader and takes no
 * pointer, so nothing here can be read, clicked or announced. The Panel that
 * carries it is `relative` and `isolate`, so the field fills it and sits under
 * its content.
 *
 * Every Panel picks its own shapes: Home in `components/home-panel.tsx`, the
 * four beyond it in `app/page.tsx`, each with colours and places of its own
 * and no second copy of the drawing. The rendered-page test holds that no
 * two Panels pick the same.
 */
export function Blob({ shapes }: BlobProps) {
  return (
    <div aria-hidden="true" className="blobs">
      {shapes.map((shape, index) => (
        <span
          key={`${shape.colour}-${shape.top}-${shape.left}`}
          className="blob"
          style={styleOf(shape, index)}
        />
      ))}
    </div>
  );
}

type DiscProps = {
  /** The one shape: where it sits and how wide it is, in the box it is drawn in. */
  shape: BlobShape;
};

/**
 * The Disc: one Blob drawn crisp, for the portrait on Home to rise out of.
 *
 * It is the same shape on the same drift, with the blur and the fade taken
 * off by `.disc` in `app/globals.css`, so it has an edge for the head to
 * cross; and it goes only part of the way along the path, so it stays
 * behind the head. There is no field around it: it is placed in whatever
 * `relative isolate` box it is rendered in, because a Disc behind a picture
 * has to sit where the picture is, and the box is not clipped, so the Disc
 * can drift past its edge the way the Panel's wash drifts past the Panel's.
 * Like every Blob it is hidden from a screen reader and takes no pointer.
 */
export function Disc({ shape }: DiscProps) {
  /* Alone in its box, so it is first in its cycle: there is no neighbour to stagger against. */
  const first = 0;

  return <span aria-hidden="true" className="blob disc" style={styleOf(shape, first)} />;
}
