import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import type { Panel } from "@/content/site";

/**
 * Where a Spread sits in its Panel, and what the Panel is called. The
 * eyebrow says the label and, on a Panel of more than one Spread, the
 * position as `NN / NN`.
 */
type EyebrowProps = {
  /** The Panel this Spread is part of: its label for the eyebrow. */
  panel: Panel;
  /** Where this Spread sits in its Panel, counting from 1. The first carries the Panel's heading. */
  position: number;
  /** How many Spreads the Panel has. The counter is shown only when there is more than one. */
  count: number;
};

type SpreadProps = Omit<EyebrowProps, "panel"> & {
  /**
   * The Panel, with its line under the eyebrow where it has one. Every
   * Panel beyond Home has; Home is headed by the Headline and has none, so
   * its certifications Spread reads eyebrow and then title.
   */
  panel: Panel & { line?: string };
  /**
   * The id a link lands on this Spread by, `#payment-gateway-integrations`:
   * the item's content id, or the block's for a Spread of many items. None
   * on a Spread that continues another, so no id is written twice.
   */
  id?: string;
  /**
   * A block this Spread opens, read between the line and the title: Work's
   * first Spread opens the Case Studies, with the note that says why there
   * is nothing to click. Headed one level under the Panel.
   */
  opens?: { heading: string; note?: string };
  /**
   * The one thing this Spread shows, set large. Words, or the words with a
   * link around them: Contact's title is the email address, and a link to
   * it.
   */
  title: ReactNode;
  /**
   * The title's heading level: one under whatever heads it. Level 2 is the
   * certifications on Home, under the h1 Headline; a Panel beyond Home is
   * the h2 and its titles are 3 and 4.
   */
  level: 2 | 3 | 4;
  /**
   * True for a title that is one word: Contact's email address. A word
   * cannot wrap to fit the column, so on the Strip it is set a step below
   * the large size, at which the address breaks at its at sign and fits.
   */
  oneWord?: boolean;
  /**
   * True when this Spread carries on what the Spread before it opened: a
   * second Spread of Projects. The title is said again, so a visitor landing
   * here knows what the cards are, but as plain text and not a heading again,
   * so the outline names the block once; and on a small display it is not
   * said at all, so the cards continue the list under the one heading.
   */
  continues?: boolean;
  /** A sentence under the title. */
  note?: string;
  /**
   * What is read under the title, in the left column, before the card:
   * Skills' list of what Shahmeer does, under "What I do", with the Tools
   * in the card beside it. Most Spreads have nothing here; the title alone
   * names the thing and the card is its detail.
   */
  underTitle?: ReactNode;
  /**
   * What closes the Spread, read after the card: Contact's copyright line,
   * the last thing on the page. On the Strip it sits at the foot of the
   * left column, under the title and whatever is under it; in the stack it
   * comes after the card, so nothing hangs below it either way.
   */
  foot?: ReactNode;
  /** The card column: one `.card`, or a grid of them. */
  children: ReactNode;
};

/** The eyebrow's type: small capitals at caption size, letter-spaced. */
const EYEBROW = "text-caption font-medium uppercase tracking-[0.14em]";

/**
 * The frame of a Spread: the `.spread` rule for its width, its height and
 * its snap point, a column, and on the Strip the gutter at its sides and
 * foot, the Nav's room at its top, and a clip for whatever does not fit.
 * The Hero in `components/home-panel.tsx` wears it too, so it is the same
 * box as every Spread and lays out only what is inside.
 */
export const SPREAD_FRAME =
  "spread flex flex-col large:overflow-clip large:px-gutter large:pt-nav large:pb-gutter";

/**
 * The same, for the Panel heading that is the first eyebrow on the Strip
 * and the Panel's large heading below it. Written out because Tailwind
 * reads class names as literals.
 */
const EYEBROW_ON_STRIP =
  "large:inline large:text-caption large:font-medium large:uppercase large:tracking-[0.14em]";

/**
 * The title at each level: its element, and its size below the Strip, which
 * is what a heading at that level wore when the item was a block or a card
 * in a stack. The h2 is the certifications on Home, and in the stack it is
 * a block of Home under the Headline, so it wears a block's size and not a
 * Panel's. On the Strip every title is set large, by `TITLE_ON_STRIP`.
 */
const TITLE: Record<SpreadProps["level"], { tag: "h2" | "h3" | "h4"; size: string }> = {
  2: { tag: "h2", size: "text-title" },
  3: { tag: "h3", size: "text-title" },
  4: { tag: "h4", size: "text-lead" },
};

/**
 * The title's size on the Strip: the Panel size, or for a title that is one
 * word, the step between the title size and it that the scale does not
 * name, the largest at which the email address's local part fits the
 * column, at the Panel size's leading so its two lines sit as close as any
 * title's. Both are `large:` so they win over the stack size on the Strip.
 */
const TITLE_ON_STRIP = {
  words: "large:text-panel",
  oneWord: "large:text-[2.5rem]/[1.1]",
};

/** `NN / NN`, zero-padded, so the counter is the same width on every Spread. */
function counterOf(position: number, count: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(position)} / ${pad(count)}`;
}

/**
 * ` · NN / NN` after the label, on the Strip only, and nothing on a Panel
 * of one Spread: `01 / 01` would say there is somewhere else to go.
 */
function Counter({ position, count }: Pick<EyebrowProps, "position" | "count">) {
  return count > 1 ? (
    <span className={`hidden large:inline ${EYEBROW} text-muted`}>
      <span aria-hidden="true"> &middot; </span>
      {counterOf(position, count)}
    </span>
  ) : null;
}

/**
 * The eyebrow of a Spread that is not its Panel's first, as plain text: the
 * label in small capitals and the counter after it. Drawn on the Strip
 * only; in the stack the Panel's heading over its first Spread says where
 * a visitor is. The Hero, a Spread that lays itself out in
 * `components/home-panel.tsx`, wears it too, as `Home · 01 / 02`, so the
 * certifications Spread beside it counts from something.
 */
export function Eyebrow({ panel, position, count }: EyebrowProps) {
  return (
    <p className={`hidden large:block ${EYEBROW} text-foreground`}>
      {panel.label}
      <Counter position={position} count={count} />
    </p>
  );
}

/**
 * One Spread: one screen-wide stop on the Strip, inside a Panel (ADR-0003).
 *
 * Two columns. On the left, in order: the eyebrow, the Panel's label in
 * small capitals followed by ` · NN / NN` when the Panel has more than one
 * Spread; the Panel's line at caption size, where the Panel has one; a
 * block heading, if this Spread opens one; the item's title set large; and,
 * on a Spread that has one, what goes under the title. On the right, the card column,
 * which arrives with the reveal as every block does. A Spread with a foot
 * reads it last, and draws it at the foot of the left column: the Strip
 * lays the Spread out as a grid of two columns and two rows, the card
 * spanning both rows and the foot the second row of the left column, so
 * the foot is written after the card and still sits under the title.
 * Nothing is sticky. The two columns are centred at the width Home uses,
 * so a wide screen gets margins and not a card stretched to fill it.
 *
 * The Panel's h2 is rendered once, as the label inside the first Spread's
 * eyebrow, and the Panel is labelled by it; every later eyebrow is plain
 * text, so the outline stays one h2 per Panel however many Spreads it has.
 * The title keeps its own level, one under whatever heads it, so the
 * outline reads Panel, block, item however the items are laid out. A
 * Spread that continues the one before it says the same title, as plain
 * text by the same rule, so the outline names the block once.
 *
 * On a small display there is no Strip and no Spread, and the Panel stacks
 * (CONTEXT.md). So the first Spread's eyebrow is the Panel's large heading
 * and its line is the Panel's line, as they were; the later eyebrows and
 * lines are not drawn, and the counter is never drawn; and the title stands
 * over its card at the size a heading of its level wore in the stack. The
 * space above a Spread in the stack is the Spread's own: a block after the
 * Spread before it, so a title reads as its card's and not the last card's,
 * and none when it is the first. A Spread that continues draws no title
 * there either, and leaves only the gutter its cards keep between
 * themselves, so two Spreads of Projects stack as the one list under the
 * one heading. That is layout, not markup: a screen reader meets the same
 * text on any display, one h2, then the line, then the blocks in order.
 *
 * The id, where there is one, is the Spread's own element's: a hash naming
 * it lands on the Spread by the browser's anchor scroll, on the Strip and
 * in the stack alike, and `components/strip.tsx` makes the landing instant
 * on the Strip. The observer there never writes a Spread's id into the
 * address, only its Panel's, so an address copied mid-read stays short. In
 * the stack the landing keeps the Nav's height clear above the Spread, as
 * a Panel's top padding does for `#work`: the space over a later Spread is
 * a margin, which an anchor scroll does not count, and without the clearance
 * the title would land under the pill. The Strip does not scroll that way,
 * so there it changes nothing.
 *
 * `width: 100vw`, the height and the snap point are the `.spread` rule in
 * `app/globals.css`; the card holds no width of its own and fills the card
 * column here. Which display gets the Strip is decided by the `large`
 * variant there and nowhere here.
 */
export function Spread({
  panel,
  position,
  count,
  id,
  opens,
  title,
  level,
  oneWord = false,
  continues = false,
  note,
  underTitle,
  foot,
  children,
}: SpreadProps) {
  const first = position === 1;
  const Title = continues ? "p" : TITLE[level].tag;

  return (
    <div
      id={id}
      className={`${SPREAD_FRAME} scroll-mt-nav gap-gutter large:[.spread+&]:mt-0 ${
        continues ? "[.spread+&]:mt-gutter" : "[.spread+&]:mt-block"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-gutter large:grid large:h-full large:grid-cols-[26rem_minmax(0,1fr)] large:grid-rows-[minmax(0,1fr)_auto] large:items-start large:gap-x-block large:gap-y-0">
        <div
          className={`${continues ? "hidden large:flex" : "flex"} flex-col gap-gutter`}
        >
          {first ? (
            <div className="flex flex-col gap-3">
              <div>
                <h2
                  id={`${panel.id}-heading`}
                  className={`text-panel font-semibold tracking-tight text-foreground ${EYEBROW_ON_STRIP}`}
                >
                  {panel.label}
                </h2>
                <Counter position={position} count={count} />
              </div>
              {panel.line !== undefined ? (
                <p className="max-w-measure text-lead text-muted large:text-caption">
                  {panel.line}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="hidden large:flex large:flex-col large:gap-3">
              <Eyebrow panel={panel} position={position} count={count} />
              {panel.line !== undefined ? (
                <p className="max-w-measure text-caption text-muted">{panel.line}</p>
              ) : null}
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
              className={`${TITLE[level].size} font-semibold tracking-tight text-balance text-foreground ${
                oneWord ? TITLE_ON_STRIP.oneWord : TITLE_ON_STRIP.words
              }`}
            >
              {title}
            </Title>
            {note !== undefined ? (
              <p className="max-w-measure text-caption text-muted">{note}</p>
            ) : null}
          </div>

          {underTitle}
        </div>

        <div className="large:row-span-2 large:min-w-0">
          <Reveal>{children}</Reveal>
        </div>

        {foot !== undefined ? (
          <div className="large:col-start-1 large:pt-gutter">{foot}</div>
        ) : null}
      </div>
    </div>
  );
}
