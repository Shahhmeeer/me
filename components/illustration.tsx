import type { CSSProperties } from "react";

/**
 * How fast an Illustration moves, as a fraction of the Strip's rate: a
 * little under 1, so the drawings fall behind the cards as the visitor
 * scrolls and the cards read as in front of a world. Between the Ground's
 * half and the cards' 1, so the page has three planes. It is not a knob;
 * the prototype tried the range and this is the one that read as depth.
 */
export const ILLUSTRATION_RATE = 0.85;

/**
 * The rate for this visitor. Parallax is motion, so a visitor who has
 * asked for less gets the Illustrations moving with the Strip, at 1: the
 * drawings are still there, and nothing on the page moves at a second
 * rate (ADR-0005).
 */
export function illustrationRate(reduced: boolean): number {
  return reduced ? 1 : ILLUSTRATION_RATE;
}

/** Where the pieces are served from, under `public`: what `scripts/retint.mts` writes to. */
export const ILLUSTRATIONS_PATH = "/images/illustrations";

/**
 * Where one Illustration sits: which Spread it is placed beside, counted
 * from 0 within its Panel; which edge it is measured from; how far along
 * from that edge and how far down; and how wide. `after` is the gap after
 * the Spread's right edge, where most sit; `box` is measured from the left
 * edge of the Spread's content column, for a Spread whose content is
 * centred in a full-screen Spread, Contact, where the Spread's own edge is
 * nowhere near its words. The offset and the width are in vw, so a wider
 * screen gets the same picture and not more beige; the top is a share of
 * the Strip's height.
 */
export type Placement = {
  /** The Panel's id, as `content/site.ts` names it. */
  panel: string;
  /** The Spread's place in that Panel, from 0. */
  spread: number;
  edge: "after" | "box";
  /** The file's name under `ILLUSTRATIONS_PATH`, without the `.svg`. */
  name: string;
  /** How far down the Strip the piece's top sits, as a CSS length. */
  top: string;
  offsetVw: number;
  widthVw: number;
};

/**
 * The eleven Illustrations and where each sits: the table, in one place,
 * in Strip order. A new Spread gets one by a row here and a file from
 * `scripts/retint.mts`, and nothing else moves.
 *
 * The placement rule: behind the content, so a drawing that runs under a
 * card is depth and not collision; one near most Spreads, so the row
 * reads as a world and not a line of cards; none in the gap before
 * Contact, since the address starts near the Spread's edge and anything in
 * that gap runs behind it; and none on the Hero, whose portrait is its
 * illustration. Contact's two are placed by its box: the envelope in the
 * left margin and the figure under the links, in the bare band below the
 * centred content.
 */
export const PLACEMENTS: readonly Placement[] = [
  // The laptop between the portrait and the certifications: the developer's desk beside the developer.
  { panel: "home", spread: 0, edge: "after", name: "bug-detected", top: "40%", offsetVw: -2, widthVw: 12 },
  { panel: "home", spread: 1, edge: "after", name: "thumbs-up", top: "30%", offsetVw: -2, widthVw: 9 },
  { panel: "work", spread: 0, edge: "after", name: "random-idea", top: "46%", offsetVw: -1, widthVw: 10 },
  { panel: "work", spread: 1, edge: "after", name: "soda-splash", top: "18%", offsetVw: 0, widthVw: 7 },
  { panel: "work", spread: 2, edge: "after", name: "the-right-time", top: "40%", offsetVw: -3, widthVw: 18 },
  { panel: "work", spread: 3, edge: "after", name: "plants", top: "44%", offsetVw: -4, widthVw: 16 },
  { panel: "skills", spread: 0, edge: "after", name: "generating-response", top: "6%", offsetVw: -3, widthVw: 22 },
  { panel: "experience", spread: 0, edge: "after", name: "code-deployed", top: "12%", offsetVw: -3, widthVw: 16 },
  { panel: "experience", spread: 1, edge: "after", name: "message-sent", top: "14%", offsetVw: -2, widthVw: 12 },
  // Nothing after the last Role. Contact: the envelope in the left margin, and the figure under the links.
  { panel: "contact", spread: 0, edge: "box", name: "mail-sent", top: "10%", offsetVw: -14, widthVw: 16 },
  { panel: "contact", spread: 0, edge: "box", name: "working-at-home", top: "78%", offsetVw: 0, widthVw: 12 },
];

/** The file an Illustration is served from, by its name. */
export function srcOf(name: string): string {
  return `${ILLUSTRATIONS_PATH}/${name}.svg`;
}

/**
 * The two edges a piece may be measured from, in pixels from the row's
 * left: the Spread's right edge, and the left edge of its content column.
 */
export type SpreadEdges = {
  after: number;
  box: number;
};

/** Where a piece is drawn on the row: its left edge and its width, in pixels. */
export type Placed = {
  left: number;
  width: number;
};

/**
 * Where a piece sits on the row: its edge plus its offset, at its width,
 * with `vw` the pixels in one hundredth of the window's width, scrollbar
 * included, as the stylesheet's own vw is. Measured once the Spreads have
 * their widths, and again on resize.
 */
export function placeIllustration(
  placement: Pick<Placement, "edge" | "offsetVw" | "widthVw">,
  edges: SpreadEdges,
  vw: number,
): Placed {
  return {
    left: edges[placement.edge] + placement.offsetVw * vw,
    width: placement.widthVw * vw,
  };
}

/**
 * The anchor: the drawn position at which the piece sits where it was
 * placed, which is the position that centres it on the screen. Around it,
 * the piece lags the cards; at it, the placement in the table is exact.
 */
export function anchorOf(placed: Placed, screen: number): number {
  return placed.left + placed.width / 2 - screen / 2;
}

/**
 * How far the piece trails the cards, in pixels, with the row drawn at
 * `x`: the distance from its anchor at one less the rate, written as a
 * transform on the piece against the row's own. At rate 1 it is nothing,
 * and the piece moves with the Strip.
 */
export function lagOf(x: number, anchor: number, rate: number): number {
  return (x - anchor) * (1 - rate);
}

/** How far apart, in seconds, the floats start, so the pieces do not bob in step. */
const FLOAT_STAGGER = 1.7;

/**
 * The Illustrations: the eleven drawings behind the Strip, one `<img>`
 * each, in the order of the table, and nothing more.
 *
 * Each is decoration: `alt=""`, so a screen reader passes it by, and not
 * draggable, so a visitor cannot pick one up off the page. It is a plain
 * `<img>` and not `next/image`, which does nothing for an SVG, not
 * inlined, since eleven drawings of paths do not belong in the React
 * tree, and not lazy, since the Strip is one screen tall and the browser
 * cannot tell what is near (ADR-0005). `components/strip.tsx` draws them
 * before the Panels inside the row, so at the `.illustration` rule's
 * negative index they paint under the cards and over the Ground, and it
 * places, sizes and moves each by the table above. The only thing written
 * here is when its float starts, staggered by its place in the table, as
 * a custom property the float's rule reads; the float itself, the grow
 * and the fade are the `.illustration` rules in `app/globals.css`, inside
 * the motion query.
 */
export function Illustrations() {
  return (
    <>
      {PLACEMENTS.map((placement, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${placement.name}-${index}`}
          src={srcOf(placement.name)}
          alt=""
          draggable={false}
          className="illustration"
          style={{ "--illustration-start": `${-index * FLOAT_STAGGER}s` } as CSSProperties}
        />
      ))}
    </>
  );
}
