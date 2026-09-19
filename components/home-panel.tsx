import Image from "next/image";

import { Disc, type DiscShape } from "@/components/disc";
import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { ACCENT_LINK } from "@/components/interactive";
import { Panel } from "@/components/panel";
import { About } from "@/components/sections/about";
import { CertificationCards } from "@/components/sections/certifications";
import { Pitch } from "@/components/sections/pitch";
import { Eyebrow, SPREAD_FRAME, Spread } from "@/components/spread";
import type {
  BlockHeadings,
  Certification,
  CertificationsCopy,
  Contact,
  Links,
  Panel as PanelEntry,
  Picture,
} from "@/content/site";

type HomePanelProps = {
  panel: PanelEntry;
  contact: Contact;
  links: Links;
  /** The three About sentences. */
  about: string[];
  /** The sketch with its paper cut away, for the portrait. */
  cutout: Picture;
  headings: Pick<BlockHeadings, "certifications">;
  certifications: Certification[];
  certificationsCopy: CertificationsCopy;
};

/**
 * Home's two Spreads, by title, for the Bar's dots: the Hero, named by the
 * Headline since that is what it says large, and the certifications. The
 * Panel below is laid out to the same two, so a dot is never without its
 * Spread.
 */
export function homeSpreadTitles(
  contact: Pick<Contact, "headline">,
  headings: Pick<BlockHeadings, "certifications">,
): string[] {
  return [contact.headline, headings.certifications];
}

/**
 * The Disc the portrait rises out of, placed in the cutout's own box and
 * measured by it, so it sits the same behind the head at 13rem on a phone
 * and at 22rem on the Strip. Its top edge is a fifth of the way down the
 * drawing, where it crosses the hair with the crown above it, and it is
 * four fifths as wide, so the shoulders are wider than it and its foot is
 * just inside the drawing's, where the cutout fades out. It rests a little
 * left of centre and drifts right through it: the drift is in screen widths
 * and the box is in rems, so on the widest screens the far end of the drift
 * would otherwise cross the gutter the Hero clips at.
 */
const PORTRAIT_DISC: DiscShape = {
  top: "20%",
  left: "6%",
  size: "80%",
};

/**
 * The Home Panel: two Spreads, the Hero that says who Shahmeer is and the
 * certifications that back it up (ADR-0003).
 *
 * The Hero reads eyebrow, greeting, Headline, pitch, button, profile links,
 * then the About sentences, in that order, because that is the order a
 * Recruiter wants them in: whose site, what he is, what he does, how to
 * reach him, then the rest. The Headline is the page's one h1, and the
 * eyebrow before it is plain text, `Home`, so the outline opens on the
 * Headline; it is the Hero and not the certifications that names the
 * Panel, so the certifications Spread heads nothing. The portrait sits
 * beside the words: the cutout of the
 * sketch over the Disc, the head and hair rising above the Disc's top
 * edge, the Disc drifting gently behind it, and no paper, no card and no
 * tilt.
 *
 * The Hero is a Spread that lays itself out rather than one from
 * `components/spread.tsx`: its title is the Headline with the greeting
 * over it, and the portrait beside the words is not a card. So it wears
 * the Spread's frame, the `.spread` rule from `app/globals.css` for its
 * width and its height, and the Spread's eyebrow, and lays
 * the screen out itself:
 * words on the left, portrait on the right, nothing to slide past. The
 * words are sized so that nothing is taller than the screen, down to a
 * 720px-tall display, and whatever is would be clipped, never scrolled, as
 * on any Spread.
 *
 * The certifications are the second Spread, from `components/spread.tsx`
 * like every other, and open on their title, as every Spread after a
 * Panel's first does: the Certifications heading set large, an h2 under
 * the Headline; the line under it; the
 * link to Salesforce's verification page with the email address printed
 * beside it, because that page asks for one and a Recruiter should not have
 * to hunt for it; and the three cards beside them, one badge each. Each
 * certification's name is read here and nowhere else on the page.
 *
 * On a small display Home stacks, as every Panel does: the portrait first
 * and small, then the words, then the certifications under the About
 * sentences, where the band they replaced was: three cards across on a
 * tablet, stacked on a phone. The portrait is moved first by CSS order and
 * not by the markup, so a screen reader still meets the Headline before
 * the picture.
 *
 * The cutout is the largest thing on the first screen, so it is preloaded;
 * and it is told its width at each layout, so the browser fetches the size
 * it will draw and not the file.
 */
export function HomePanel({
  panel,
  contact,
  links,
  about,
  cutout,
  headings,
  certifications,
  certificationsCopy,
}: HomePanelProps) {
  const headingId = `${panel.id}-heading`;

  return (
    <Panel panel={panel}>
      <div className={SPREAD_FRAME}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-block large:h-full large:flex-row large:gap-block">
          {/*
            The gutter between its blocks in the stack, as between every title
            and its card; a step tighter on the Strip, so the column clears the
            Bar at 720px tall.
          */}
          <div className="flex w-full flex-col gap-gutter large:flex-1 large:gap-4">
            <Eyebrow panel={panel} />

            <div className="flex flex-col gap-2">
              <p className="text-lead text-muted">{contact.greeting}</p>
              <h1
                id={headingId}
                className="text-display font-semibold tracking-tight text-balance text-foreground"
              >
                {contact.headline}
              </h1>
            </div>

            <Pitch contact={contact} links={links} />

            <About sentences={about} contact={contact} />
          </div>

          {/*
            The portrait's box: `relative` so the Disc is placed by it, `isolate`
            so the Disc's negative index keeps it under the cutout and inside
            the box, and not clipped, so the Disc may drift past its edge;
            the Hero clips at its gutter, and the Disc's drift is sized to
            stay inside that. The cutout fades out over its last quarter, so the
            flat edge where the drawing's paper was cut is not seen as a line
            across the Disc.
          */}
          <div className="relative isolate order-first w-full max-w-[13rem] large:order-none large:w-[30%] large:max-w-[22rem] large:shrink-0">
            <Disc shape={PORTRAIT_DISC} />
            {/* A fetch hint, not the layout rule: it can only name a width, so it names the Strip's. */}
            <Image
              src={cutout.src}
              alt={cutout.alt}
              width={cutout.width}
              height={cutout.height}
              sizes="(min-width: 1280px) 22rem, 13rem"
              preload
              className="h-auto w-full mask-b-from-75%"
            />
          </div>
        </div>
      </div>

      <Spread
        title={headings.certifications}
        level={2}
        note={certificationsCopy.line}
        underTitle={
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a
              href={certificationsCopy.verify.href}
              {...(certificationsCopy.verify.external ? EXTERNAL_LINK_ATTRIBUTES : {})}
              className={ACCENT_LINK}
            >
              {certificationsCopy.verify.label}
            </a>
            <span className="text-body text-muted">{contact.email}</span>
          </p>
        }
      >
        <CertificationCards certifications={certifications} />
      </Spread>
    </Panel>
  );
}
