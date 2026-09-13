import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import type { ContentPanel } from "@/content/site";

type SpreadProps = {
  /** The Panel this Spread is part of: its label for the eyebrow, its line under it. */
  panel: ContentPanel;
  /** Where this Spread sits in its Panel, counting from 1. The first carries the Panel's heading. */
  position: number;
  /** How many Spreads the Panel has. The counter is shown only when there is more than one. */
  count: number;
  /**
   * A block this Spread opens, read between the line and the title: Work's
   * first Spread opens the Case Studies, with the note that says why there
   * is nothing to click. Headed one level under the Panel.
   */
  opens?: { heading: string; note?: string };
  /** The one thing this Spread shows, set large. */
  title: string;
  /** The title's heading level: one under whatever heads it. */
  level: 3 | 4;
  /** A sentence under the title. */
  note?: string;
  /** The card column: one `.card`, or a grid of them. */
  children: ReactNode;
};

/** The eyebrow's type: small capitals at caption size, letter-spaced. */
const EYEBROW = "text-caption font-medium uppercase tracking-[0.14em]";

/**
 * The same, for the Panel heading that is the first eyebrow on the Strip
 * and the Panel's large heading below it. Written out because Tailwind
 * reads class names as literals.
 */
const EYEBROW_ON_STRIP =
  "large:inline large:text-caption large:font-medium large:uppercase large:tracking-[0.14em]";

/** The title's size below the Strip is what a heading at its level wore in a stack. */
const TITLE_SIZE: Record<SpreadProps["level"], string> = {
  3: "text-title",
  4: "text-lead",
};

/** `NN / NN`, zero-padded, so the counter is the same width on every Spread. */
function counterOf(position: number, count: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(position)} / ${pad(count)}`;
}

/**
 * One Spread: one screen-wide stop on the Strip, inside a Panel (ADR-0003).
 *
 * Two columns. On the left, in order: the eyebrow, the Panel's label in
 * small capitals followed by ` · NN / NN` when the Panel has more than one
 * Spread; the Panel's line at caption size; a block heading, if this Spread
 * opens one; and the item's title set large. On the right, the card column,
 * which arrives with the reveal as every block does. Nothing is sticky. The
 * two columns are centred at the width Home uses, so a wide screen gets
 * margins and not a card stretched to fill it.
 *
 * The Panel's h2 is rendered once, as the label inside the first Spread's
 * eyebrow, and the Panel is labelled by it; every later eyebrow is plain
 * text, so the outline stays one h2 per Panel however many Spreads it has.
 * The title keeps its own level, one under whatever heads it, so the
 * outline reads Panel, block, item as it did when the item was a card in a
 * row.
 *
 * On a small display there is no Strip and no Spread, and the Panel stacks
 * (CONTEXT.md). So the first Spread's eyebrow is the Panel's large heading
 * and its line is the Panel's line, as they were; the later eyebrows and
 * lines are not drawn, and the counter is never drawn; and the title stands
 * over its card at the size a heading of its level wore in the stack. That
 * is layout, not markup: a screen reader meets the same text on any
 * display, one h2, then the line, then the blocks in order.
 *
 * `width: 100vw`, the height and the snap point are the `.spread` rule in
 * `app/globals.css`, and the card's width on a Spread with it. Which display
 * gets the Strip is decided by the `large` variant there and nowhere here.
 */
export function Spread({
  panel,
  position,
  count,
  opens,
  title,
  level,
  note,
  children,
}: SpreadProps) {
  const first = position === 1;
  const Title = level === 3 ? "h3" : "h4";

  const counter =
    count > 1 ? (
      <span className={`hidden large:inline ${EYEBROW} text-muted`}>
        <span aria-hidden="true"> &middot; </span>
        {counterOf(position, count)}
      </span>
    ) : null;

  return (
    <div className="spread flex flex-col gap-gutter large:overflow-clip large:px-gutter large:pt-nav large:pb-gutter">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-gutter large:h-full large:flex-row large:items-start large:gap-block">
        <div className="flex flex-col gap-gutter large:w-104 large:shrink-0">
          {first ? (
            <div className="flex flex-col gap-3">
              <div>
                <h2
                  id={`${panel.id}-heading`}
                  className={`text-panel font-semibold tracking-tight text-foreground ${EYEBROW_ON_STRIP}`}
                >
                  {panel.label}
                </h2>
                {counter}
              </div>
              <p className="max-w-measure text-lead text-muted large:text-caption">
                {panel.line}
              </p>
            </div>
          ) : (
            <div className="hidden large:flex large:flex-col large:gap-3">
              <p className={`${EYEBROW} text-foreground`}>
                {panel.label}
                {counter}
              </p>
              <p className="max-w-measure text-caption text-muted">{panel.line}</p>
            </div>
          )}

          {opens !== undefined ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-title font-semibold tracking-tight text-foreground large:text-lead">
                {opens.heading}
              </h3>
              {opens.note !== undefined ? (
                <p className="max-w-measure text-caption text-muted">{opens.note}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Title
              className={`${TITLE_SIZE[level]} font-semibold tracking-tight text-balance text-foreground large:text-panel`}
            >
              {title}
            </Title>
            {note !== undefined ? (
              <p className="max-w-measure text-caption text-muted">{note}</p>
            ) : null}
          </div>
        </div>

        <div className="large:min-w-0 large:flex-1">
          <Reveal>{children}</Reveal>
        </div>
      </div>
    </div>
  );
}
