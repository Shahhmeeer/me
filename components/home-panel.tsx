import Image from "next/image";

import { Blob, type BlobShape, Disc } from "@/components/blob";
import { About } from "@/components/sections/about";
import { CertificationBand } from "@/components/sections/certification-band";
import { Pitch } from "@/components/sections/pitch";
import type {
  Certification,
  Contact,
  Links,
  Panel,
  Picture,
} from "@/content/site";

type HomePanelProps = {
  panel: Panel;
  contact: Contact;
  links: Links;
  /** The three About sentences. */
  about: string[];
  /** The sketch with its paper cut away, for the portrait. */
  cutout: Picture;
  certifications: Certification[];
  /** The heading over the certification band. */
  certificationsHeading: string;
};

/**
 * The colour behind Home: teal high on the right, behind the portrait; aqua low
 * on the left, under the words; a smaller coral between them, the colour of
 * the button. Placed by the corner of the Panel and sized by the screen, so
 * the wash scales with it.
 */
const HOME_BLOBS: BlobShape[] = [
  { colour: "accent-border", top: "-15%", left: "55%", size: "44vw" },
  { colour: "accent", top: "45%", left: "-12%", size: "36vw" },
  { colour: "action", top: "55%", left: "58%", size: "22vw" },
];

/**
 * The Disc the portrait rises out of: teal, placed in the cutout's own box
 * and measured by it, so it sits the same behind the head at 13rem on a
 * phone and at 22rem on the Strip. Its top edge is a fifth of the way down
 * the drawing, where it crosses the hair with the crown above it, and it is
 * four fifths as wide, so the shoulders are wider than it and its foot is
 * just inside the drawing's, where the cutout fades out. It rests a little
 * left of centre and drifts right through it: the drift is in screen widths
 * and the box is in rems, so on the widest screens the far end of the drift
 * would otherwise cross the gutter the row clips at.
 */
const PORTRAIT_DISC: BlobShape = {
  colour: "accent-border",
  top: "20%",
  left: "6%",
  size: "80%",
};

/**
 * The Home Panel: the one screen that says who Shahmeer is.
 *
 * It reads greeting, Headline, pitch, button, profile links, then the About
 * sentences, in that order, because that is the order a Recruiter wants them
 * in: whose site, what he is, what he does, how to reach him, then the rest.
 * The Headline is the page's one h1. The portrait sits beside the words:
 * the cutout of the sketch over a teal disc, the head and hair rising above
 * the disc's top edge, the disc drifting gently behind it like the Blobs,
 * and no paper, no card and no tilt. The certification band closes the
 * Panel at its foot, the width of the screen.
 *
 * On a small display the portrait comes first and small, then the words,
 * then the band. It is moved there by CSS order and not by the markup, so a
 * screen reader still meets the Headline before the picture.
 *
 * On a large display Home is the one Panel that is exactly a screen and
 * not a row of Spreads: words on the left, portrait on the right, band along
 * the bottom, and nothing to slide past. So it takes the `.panel` snap
 * point from `app/globals.css` and lays the screen out itself rather than
 * through `components/panel.tsx`. The words are sized so that nothing is
 * taller than the screen, down to a 720px-tall display (ADR-0003), and
 * whatever is would be clipped, never scrolled, as on a Spread. It is
 * `relative` and `isolate` so the Blob fills it and sits under everything
 * on it.
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
  certifications,
  certificationsHeading,
}: HomePanelProps) {
  const headingId = `${panel.id}-heading`;

  return (
    <section
      id={panel.id}
      aria-labelledby={headingId}
      className="panel relative isolate flex min-h-svh w-full flex-col pt-nav large:w-screen"
    >
      <Blob shapes={HOME_BLOBS} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center-safe gap-block px-gutter pb-section large:min-h-0 large:flex-row large:gap-block large:overflow-clip large:pb-4">
        <div className="flex w-full flex-col gap-5 large:flex-1">
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
          so the Disc's negative index keeps it under the cutout and above the
          Panel's wash, and not clipped, so the Disc may drift past its edge;
          the row above clips at its gutter, and the Disc's drift is sized to
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

      <CertificationBand
        heading={certificationsHeading}
        certifications={certifications}
      />
    </section>
  );
}
