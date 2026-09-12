import { Block } from "@/components/sections/block";
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
 * told the next three sentences are about him. It is set a step under the
 * pitch: the pitch is the hook and this is the detail, and on a large display
 * Home is one screen, so the longest run of words on it is the smallest.
 */
export function About({ sentences, contact }: AboutProps) {
  return (
    <Block alreadyOnScreen>
      <p className="max-w-measure text-body text-muted">
        {sentences.join(" ")}
      </p>

      <p className="text-caption text-muted">
        <span className="text-foreground">{contact.location}</span>
        <span aria-hidden="true"> &middot; </span>
        {contact.timezoneAvailability}
      </p>
    </Block>
  );
}
