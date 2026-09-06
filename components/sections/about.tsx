import { Section } from "@/components/sections/section";

type AboutProps = {
  heading: string;
  /** Three sentences: who he is, what he builds, what he is interested in. */
  sentences: string[];
  location: string;
  timezoneAvailability: string;
};

/**
 * Three sentences and the two facts a Recruiter checks next: where Shahmeer is,
 * and which hours he has worked.
 */
export function About({
  heading,
  sentences,
  location,
  timezoneAvailability,
}: AboutProps) {
  return (
    <Section title={heading}>
      <p className="max-w-measure text-lead text-muted">
        {sentences.join(" ")}
      </p>

      <p className="text-caption text-muted">
        <span className="text-foreground">{location}</span>
        <span aria-hidden="true"> &middot; </span>
        {timezoneAvailability}
      </p>
    </Section>
  );
}
