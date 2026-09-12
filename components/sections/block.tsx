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
 * The arrival is here rather than in the page, so a block added later fades in
 * with the rest without anyone remembering to ask for it. What is already on
 * screen does not arrive: whatever sits on the Home Panel at first paint. A
 * Recruiter reads that at once rather than waiting for JavaScript to hand it
 * over.
 */
export function Block({
  heading,
  alreadyOnScreen = false,
  children,
}: BlockProps) {
  const block = (
    <div className="flex flex-col gap-gutter">
      {heading !== undefined ? (
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          {heading}
        </h3>
      ) : null}
      {children}
    </div>
  );

  return alreadyOnScreen ? block : <Reveal>{block}</Reveal>;
}
