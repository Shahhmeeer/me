import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";

type BlockProps = {
  /**
   * The heading a visitor reads. It comes from the content module. A block
   * with none is headed by its Panel: the Roles under "Experience", the ways
   * to reach Shahmeer under "Contact".
   */
  heading?: string;
  /**
   * A sentence or two said under the heading, before the content: why a Case
   * Study has nothing to click, what a Project is. Only a headed block has
   * one, because the note is read as part of the head.
   */
  note?: string;
  /**
   * True for a block whose content is cards: the Roles. They stack on a
   * small display and are a row on the Strip, and the head stands beside the
   * first card rather than over it. The Case Studies and the Projects were
   * blocks of cards too, and are Spreads now (`components/work-panel.tsx`).
   */
  cards?: boolean;
  /**
   * True for a block a visitor is already looking at when the page loads. It
   * is drawn outright, because a block on screen has nothing to arrive from.
   */
  alreadyOnScreen?: boolean;
  children: ReactNode;
};

/**
 * One block inside a Panel. Every block wears the same heading and spacing,
 * so a new block never has to invent either.
 *
 * It is a `<div>` and not a `<section>`: the Panel is the section, labelled
 * by its heading, and a block is a part of it, headed one level down. Every
 * Panel that holds a headed block is an h2, so the block is an h3; the blocks
 * on Home, under the h1 Headline, carry no heading of their own.
 *
 * A block is a column: heading, note, then content. A block of cards is a
 * column on a small display too, and on the Strip it is a row the visitor
 * slides past, one card at a time, with the heading and the note in a narrow
 * column at its head. Beside the first card and not over it, because a card
 * then has the whole height of the screen: the tallest Role does not fit
 * under a heading on the Strip, and beside one it does. A block of anything
 * else, a list or a grid, is short enough to sit under its heading on any
 * screen, and does. The cards' row is drawn here, so a block of cards and
 * its head agree on what the head stands beside.
 *
 * The arrival is here rather than in the page, so a block added later fades in
 * with the rest without anyone remembering to ask for it. What is already on
 * screen does not arrive: whatever sits on the Home Panel at first paint. A
 * Recruiter reads that at once rather than waiting for JavaScript to hand it
 * over.
 */
export function Block({
  heading,
  note,
  cards = false,
  alreadyOnScreen = false,
  children,
}: BlockProps) {
  const sideways = cards ? " large:flex-row large:items-start" : "";

  const block = (
    <div className={`flex flex-col gap-gutter${sideways}`}>
      {heading !== undefined ? (
        <div
          className={`flex flex-col gap-2${cards ? " large:w-60 large:shrink-0" : ""}`}
        >
          <h3 className="text-title font-semibold tracking-tight text-foreground">
            {heading}
          </h3>
          {note !== undefined ? (
            <p className="max-w-measure text-caption text-muted">{note}</p>
          ) : null}
        </div>
      ) : null}
      {cards ? (
        <div className={`flex flex-col gap-gutter${sideways}`}>{children}</div>
      ) : (
        children
      )}
    </div>
  );

  return alreadyOnScreen ? block : <Reveal>{block}</Reveal>;
}
