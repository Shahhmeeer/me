import Image from "next/image";

import type { Certification } from "@/content/site";

type CertificationCardsProps = {
  certifications: Certification[];
};

/**
 * The three Salesforce certifications, one card each: the badge large, the
 * name, and the month it was awarded.
 *
 * They are the Recruiter's first filter, and a badge is read faster than a
 * line of text, so the badge is the biggest thing on the card and the words
 * sit under it. The cards fill the card column of Home's second Spread in
 * `components/home-panel.tsx`, after the About sentences in the stack,
 * where the band they replaced was. They sit three across wherever there is
 * room for three, from a tablet up, so all three are seen at once and no
 * badge is left in a card five times its width; on a phone they stack.
 *
 * The badge's alt text names the certification and calls it a badge, so a
 * screen reader hears what the picture is for rather than "image". It does
 * repeat the name under it; that is the price of a badge that reads as
 * something and not as decoration. Each badge is a square drawn at a fixed
 * height, and told so, so the browser fetches a small one. The name is a
 * paragraph and not a heading: three names as headings would put three
 * entries under Certifications in the outline that say no more than the
 * heading does.
 */
export function CertificationCards({ certifications }: CertificationCardsProps) {
  return (
    <ul className="grid gap-gutter sm:grid-cols-3">
      {certifications.map((certification) => (
        <li
          key={certification.name}
          className="card flex flex-col items-start gap-3 p-gutter"
        >
          <Image
            src={certification.logo.src}
            alt={certification.logo.alt}
            width={certification.logo.width}
            height={certification.logo.height}
            sizes="8rem"
            className="h-32 w-auto"
          />
          <div className="flex flex-col gap-1">
            <p className="text-body font-medium text-foreground">
              {certification.name}
            </p>
            <p className="text-caption text-muted">{certification.awarded}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
