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
  children: ReactNode;
};

/**
 * One titled block of the page. Every block below the Header wears the same
 * heading and spacing, so a new block never has to invent either.
 *
 * The arrival is here rather than in the page, so a block added later fades in
 * with the rest without anyone remembering to ask for it. What is already on
 * screen does not arrive: the Header, and whichever block sits under it. A
 * Recruiter reads those in the first paint rather than waiting for JavaScript
 * to hand them over.
 */
export function Section({
  heading,
  alreadyOnScreen = false,
  children,
}: SectionProps) {
  const block = (
    <section className="flex flex-col gap-gutter">
      <h2 className="text-title font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      {children}
    </section>
  );

  return alreadyOnScreen ? block : <Reveal>{block}</Reveal>;
}
