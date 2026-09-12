import Image from "next/image";

import type { Certification } from "@/content/site";

type CertificationBandProps = {
  heading: string;
  certifications: Certification[];
};

/**
 * The band at the foot of the Home Panel: the three Salesforce badges, each
 * with its name and the month it was awarded.
 *
 * It is the Recruiter's first filter, and a badge is read faster than a line
 * of text, so it is drawn as a band the width of the Panel, on the darker
 * ground, rather than as a list. It is on screen the moment the page loads,
 * so it does not fade in. The heading is small, because the badges are the
 * point; it is a heading all the same, one level under the Headline, so the
 * outline and a screen reader still name what the band is. On the Strip the
 * band is one row, because Home is one screen and a second row would push
 * it off the bottom; between 1024px and 1280px the three badges alone fill
 * the row, so there the heading is read and not seen.
 *
 * The badge's alt text says what it is rather than repeating the name beside
 * it word for word, so a screen reader hears "badge" once and "Administrator"
 * once. Each badge is a square drawn at a fixed height, and told so, so the
 * browser fetches a small one.
 */
export function CertificationBand({
  heading,
  certifications,
}: CertificationBandProps) {
  return (
    <div className="w-full border-t border-border bg-band">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-gutter py-3 large:flex-row large:items-center large:justify-between large:gap-gutter">
        <h2 className="text-caption font-medium tracking-wide text-muted uppercase large:max-xl:sr-only">
          {heading}
        </h2>

        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-block large:flex-nowrap large:gap-x-8">
          {certifications.map((certification) => (
            <li key={certification.name} className="flex items-center gap-3">
              <Image
                src={certification.logo.src}
                alt={certification.logo.alt}
                width={certification.logo.width}
                height={certification.logo.height}
                sizes="2.25rem"
                className="h-9 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-caption font-medium text-foreground">
                  {certification.name}
                </span>
                <span className="text-caption text-muted">
                  {certification.awarded}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
