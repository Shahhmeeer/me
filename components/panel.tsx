import type { ReactNode } from "react";

type PanelProps = {
  /** The anchor: what the Nav links to and the URL hash carries. */
  id: string;
  /** The heading a visitor reads, and what a screen reader calls the Panel. */
  heading: string;
  /**
   * True for Home, whose heading is the Headline: the page's one h1, at
   * display size. Every other Panel is an h2 headed by its Nav label.
   */
  isHeadline?: boolean;
  /** The short line above the heading. Only Home has one. */
  greeting?: string;
  children: ReactNode;
};

/**
 * One Panel: a screen of the site.
 *
 * Every Panel is a `<section>` with a stable id, labelled by its own heading,
 * so the Nav, the URL hash, a screen reader and the rendered-page test all
 * name it the same way. At least one screen tall and centred when its content
 * is shorter than that, so a Panel with little to say still reads as a
 * screen and not as a gap. Padded at the top for the Nav floating over it.
 *
 * Panels stack top to bottom on every display today. Sitting them side by
 * side on a large display comes next, and changes nothing here.
 */
export function Panel({
  id,
  heading,
  isHeadline = false,
  greeting,
  children,
}: PanelProps) {
  const headingId = `${id}-heading`;
  const Heading = isHeadline ? "h1" : "h2";
  const size = isHeadline ? "text-display" : "text-panel";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-gutter px-gutter pt-nav pb-section"
    >
      <div className="flex flex-col gap-2">
        {greeting !== undefined ? (
          <p className="text-lead text-muted">{greeting}</p>
        ) : null}
        <Heading
          id={headingId}
          className={`${size} font-semibold tracking-tight text-foreground`}
        >
          {heading}
        </Heading>
      </div>

      {children}
    </section>
  );
}
