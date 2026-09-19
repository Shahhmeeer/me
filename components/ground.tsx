import type { Ref } from "react";

/**
 * How fast the Ground moves, as a fraction of the Strip's rate: half, so
 * the cards read as in front of it. It is not a knob; the prototype tried
 * the range and this is the one that read as depth and not as drift.
 */
export const GROUND_RATE = 0.5;

/**
 * The Ground's rate for this visitor. Parallax is motion, so a visitor who
 * has asked for less gets the Ground moving with the Strip, at 1: the dots
 * are still there, and nothing on the page moves at a second rate
 * (ADR-0005).
 */
export function groundRate(reduced: boolean): number {
  return reduced ? 1 : GROUND_RATE;
}

/**
 * How wide the Ground's row is drawn, in pixels: the Strip's overhang at
 * the Ground's rate, which is as far as the row will ever move, plus one
 * screen, so that with the row moved as far as it goes there is still
 * ground under the whole viewport and never a bare edge.
 */
export function groundWidth(overhang: number, screen: number, reduced: boolean): number {
  return overhang * groundRate(reduced) + screen;
}

type GroundProps = {
  /** The row inside the layer: what `components/strip.tsx` sizes and moves. */
  rowRef?: Ref<HTMLDivElement>;
};

/**
 * The Ground: the fine dot grid under everything on the Strip, moving at
 * half the Strip's speed, so the page has depth without anything to blur;
 * the one thing behind the Illustrations, as CONTEXT.md has it.
 *
 * The component draws the two boxes and nothing more. The outer one is the
 * layer: fixed over the viewport, behind the page, clipping, hidden from a
 * screen reader and taking no pointer, so nothing here can be read, clicked
 * or announced. The inner one is the row, the one thing that moves: the
 * Strip's loop gives it a width, the overhang at the Ground's rate plus a
 * screen, and moves it each frame by a transform at that rate of the drawn
 * position, so it is one composited layer and moving it repaints nothing,
 * which is the whole reason it is a transform and not a background
 * position. Its dots, a radial-gradient mask over the foreground ink at a
 * few percent, and that it is not drawn below the large rule are the
 * `.ground` rules in `app/globals.css`, so the ink follows the palette.
 * `components/strip.tsx` draws it before the runway and nowhere else.
 */
export function Ground({ rowRef }: GroundProps) {
  return (
    <div aria-hidden="true" className="ground">
      <div ref={rowRef} />
    </div>
  );
}
