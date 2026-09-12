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
 * name it the same way. Padded at the top for the Nav floating over it.
 *
 * On a small display the Panels stack: each is at least one screen tall and
 * centred when its content is shorter than that, so a Panel with little to
 * say still reads as a screen and not as a gap.
 *
 * On a large display they sit side by side on the Strip (ADR-0003), and a
 * Panel is a row: the left column, heading and greeting, is sticky and stays
 * put while the content to its right slides past. The content is a row of
 * blocks that grows the Panel sideways to fit; what is taller than the screen
 * is clipped, never scrolled, because the Strip has one direction. The
 * column is painted on the page colour so what slides under it is hidden
 * rather than read through it. Which screen a Panel is on is decided once,
 * by the `large` variant in `app/globals.css`, and nowhere here.
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
      className="panel mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-gutter px-gutter pt-nav pb-section large:items-start large:justify-start large:pl-0 large:pb-gutter"
    >
      <div className="flex flex-col gap-2 large:sticky large:left-0 large:z-1 large:max-w-[40vw] large:shrink-0 large:self-stretch large:bg-background large:px-gutter">
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

      <div className="contents large:flex large:min-h-0 large:flex-row large:items-start large:gap-gutter large:self-stretch large:overflow-clip">
        {children}
      </div>
    </section>
  );
}
