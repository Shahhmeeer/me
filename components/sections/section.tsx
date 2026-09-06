import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";

type SectionProps = {
  /** The heading a visitor reads. It comes from the content module. */
  heading: string;
  children: ReactNode;
};

/**
 * One titled block of the page. Every block below the Header wears the same
 * heading and spacing, so a new block never has to invent either.
 *
 * The arrival is here rather than in the page, so a block added later fades in
 * with the rest without anyone remembering to ask for it. The Header is the
 * one thing that does not arrive: it is already on screen when the page loads,
 * and a visitor should read the Headline in the first paint rather than wait
 * for JavaScript to hand it over.
 */
export function Section({ heading, children }: SectionProps) {
  return (
    <Reveal>
      <section className="flex flex-col gap-gutter">
        <h2 className="text-title font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}
