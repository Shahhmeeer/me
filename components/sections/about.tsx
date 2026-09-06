import { Section } from "@/components/sections/section";
import type { Contact } from "@/content/site";

type AboutProps = {
  heading: string;
  /** Three sentences: who he is, what he builds, what he is interested in. */
  sentences: string[];
  contact: Contact;
};

/**
 * Three sentences and the two facts a Recruiter checks next: where Shahmeer is,
 * and which hours he has worked.
 */
export function About({ heading, sentences, contact }: AboutProps) {
  return (
    <Section heading={heading}>
      <p className="max-w-measure text-lead text-muted">
        {sentences.join(" ")}
      </p>

      <p className="text-caption text-muted">
        <span className="text-foreground">{contact.location}</span>
        <span aria-hidden="true"> &middot; </span>
        {contact.timezoneAvailability}
      </p>
    </Section>
  );
}
