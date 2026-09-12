import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";

type SectionProps = {
  /** The heading a visitor reads. It comes from the content module. */
  heading: string;
  /**
   * True for a block a visitor is already looking at when the page loads. It
   * is drawn outright, because a block on screen has nothing to arrive from.
   */
  alreadyOnScreen?: boolean;
  /**
   * The heading level: one under the Panel's own. Every Panel but Home is an
   * h2, so a block is an h3; a block on Home sits under the h1 Headline and
   * is an h2, or the outline would skip a level.
   */
  level?: 2 | 3;
  children: ReactNode;
};

/**
 * One titled block inside a Panel. Every block wears the same heading and
 * spacing, so a new block never has to invent either.
 *
 * It is a `<div>` and not a `<section>`: the Panel is the section, labelled
 * by its heading, and a block is a part of it, headed one level down.
 *
 * The arrival is here rather than in the page, so a block added later fades in
 * with the rest without anyone remembering to ask for it. What is already on
 * screen does not arrive: whatever sits on the Home Panel at first paint. A
 * Recruiter reads that at once rather than waiting for JavaScript to hand it
 * over.
 */
export function Section({
  heading,
  alreadyOnScreen = false,
  level = 3,
  children,
}: SectionProps) {
  const Heading = level === 2 ? "h2" : "h3";
  const block = (
    <div className="flex flex-col gap-gutter">
      <Heading className="text-title font-semibold tracking-tight text-foreground">
        {heading}
      </Heading>
      {children}
    </div>
  );

  return alreadyOnScreen ? block : <Reveal>{block}</Reveal>;
}
