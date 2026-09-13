import Image from "next/image";

import { Blob, type BlobShape } from "@/components/blob";
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
  sketch: Picture;
  certifications: Certification[];
  /** The heading over the certification band. */
  certificationsHeading: string;
};

/**
 * The colour behind Home: teal high on the right, behind the sketch; aqua low
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
 * The Home Panel: the one screen that says who Shahmeer is.
 *
 * It reads greeting, Headline, pitch, button, profile links, then the About
 * sentences, in that order, because that is the order a Recruiter wants them
 * in: whose site, what he is, what he does, how to reach him, then the rest.
 * The Headline is the page's one h1. The sketch sits beside the words, a
 * paper card over the Blob, and the certification band closes the Panel at
 * its foot, the width of the screen.
 *
 * On a small display the sketch comes first and small, then the words, then
 * the band. It is moved there by CSS order and not by the markup, so a
 * screen reader still meets the Headline before the picture.
 *
 * On a large display Home is the one Panel that is exactly a screen, not a
 * row that grows sideways: words on the left, sketch on the right, band
 * along the bottom, and nothing to slide past. So it takes the `.panel`
 * snap point from `app/globals.css` but not the sticky column and content
 * row of `components/panel.tsx`. What is taller than the screen is clipped,
 * never scrolled, as on every Panel (ADR-0003); the words are sized so that
 * nothing is, down to a 720px-tall display. It is `relative` and `isolate`
 * so the Blob fills it and sits under everything on it.
 *
 * The sketch is the largest thing on the first screen, so it is preloaded;
 * and it is told its width at each layout, so the browser fetches the size
 * it will draw and not the file.
 */
export function HomePanel({
  panel,
  contact,
  links,
  about,
  sketch,
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

        <div className="order-first w-full max-w-[13rem] large:order-none large:w-[30%] large:max-w-[22rem] large:shrink-0">
          <div className="sketch">
            <Image
              src={sketch.src}
              alt={sketch.alt}
              width={sketch.width}
              height={sketch.height}
              sizes="(min-width: 1280px) 22rem, 13rem"
              preload
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>

      <CertificationBand
        heading={certificationsHeading}
        certifications={certifications}
      />
    </section>
  );
}
