import type { ReactNode } from "react";

type SectionProps = {
  /** The heading a visitor reads. It comes from the content module. */
  heading: string;
  children: ReactNode;
};

/**
 * One titled block of the page. Every block below the Header wears the same
 * heading and spacing, so a new block never has to invent either.
 */
export function Section({ heading, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-gutter">
      <h2 className="text-title font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      {children}
    </section>
  );
}
