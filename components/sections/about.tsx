import type { Contact } from "@/content/site";

type AboutProps = {
  /** Three sentences: who he is, what he builds, what he is interested in. */
  sentences: string[];
  contact: Contact;
};

/**
 * Three sentences and the two facts a Recruiter checks next: where Shahmeer is,
 * and which hours he has worked.
 *
 * It sits on the Home Panel under the Headline and the button, with no heading
 * of its own: a Recruiter who has just read who Shahmeer is does not need to be
 * told the next three sentences are about him.
 */
export function About({ sentences, contact }: AboutProps) {
  return (
    <div className="flex flex-col gap-gutter">
      <p className="max-w-measure text-lead text-muted">
        {sentences.join(" ")}
      </p>

      <p className="text-caption text-muted">
        <span className="text-foreground">{contact.location}</span>
        <span aria-hidden="true"> &middot; </span>
        {contact.timezoneAvailability}
      </p>
    </div>
  );
}
