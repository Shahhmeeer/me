import { PRIMARY_ACTION } from "@/components/interactive";
import { ProfileLinks } from "@/components/profile-links";
import { Block } from "@/components/sections/block";
import type { Contact, Links } from "@/content/site";

type PitchProps = {
  contact: Contact;
  links: Links;
};

/**
 * What sits under the Headline on the Home Panel: the one-line pitch, the
 * "Get in touch" button, and the profile links. A Recruiter can act on all
 * three without scrolling, which is the point of putting them first.
 */
export function Pitch({ contact, links }: PitchProps) {
  return (
    <Block alreadyOnScreen>
      <p className="max-w-measure text-lead text-muted">{contact.pitch}</p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href={`mailto:${contact.email}`} className={PRIMARY_ACTION}>
          {contact.callToAction}
        </a>

        <ProfileLinks links={links} />
      </div>
    </Block>
  );
}
