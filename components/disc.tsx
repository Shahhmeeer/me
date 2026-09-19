import type { CSSProperties } from "react";

/** Where the Disc sits and how wide it is, in the box it is drawn in. */
export type DiscShape = {
  /** From the top of the box, as a CSS length: "20%". */
  top: string;
  /** From the left of the box, as a CSS length. */
  left: string;
  /** The circle's width, as a CSS length: "80%". It is as tall as it is wide. */
  size: string;
};

type DiscProps = {
  shape: DiscShape;
};

/** The shape as the stylesheet reads it: its place and its width. */
function styleOf(shape: DiscShape): CSSProperties {
  return {
    "--disc-top": shape.top,
    "--disc-left": shape.left,
    "--disc-size": shape.size,
  } as CSSProperties;
}

/**
 * The Disc: the Celadon shape behind the portrait on Home, for the head to
 * rise out of; the one shape drawn on the page, as CONTEXT.md has it.
 *
 * The component places the shape and nothing more. Its colour, from the
 * `--portfolio-disc` token, its crisp edge, its short drift, and that it
 * holds still under reduced motion, are all the `.disc` rule in
 * `app/globals.css`; it is hidden from a screen reader and takes no
 * pointer, so nothing here can be read, clicked or announced. It is placed
 * in whatever `relative isolate` box it is rendered in, because a Disc
 * behind a picture has to sit where the picture is; the box is not clipped,
 * so the Disc can drift a little past its edge. `components/home-panel.tsx`
 * draws it in the cutout's box and nowhere else.
 */
export function Disc({ shape }: DiscProps) {
  return <span aria-hidden="true" className="disc" style={styleOf(shape)} />;
}
