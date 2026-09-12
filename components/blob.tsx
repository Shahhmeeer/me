import type { CSSProperties } from "react";

/**
 * The palette colours a Blob may be drawn in, by the role the token gives
 * them. A Blob is decoration, so it borrows the accents and the button colour
 * and never the text or the page colours, which would vanish into the ground.
 */
export type BlobColour = "accent" | "accent-border" | "action";

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
 * The Blob: soft colour behind a Panel, drifting very slowly.
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
          style={
            {
              "--blob-colour": `var(--portfolio-${shape.colour})`,
              "--blob-top": shape.top,
              "--blob-left": shape.left,
              "--blob-size": shape.size,
              "--blob-delay": `${-index * STAGGER_SECONDS}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
