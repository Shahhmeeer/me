import { ACCENT_LINK } from "@/components/interactive";
import { ProfileLinks } from "@/components/profile-links";
import { Block } from "@/components/sections/block";
import type { Contact, ContactCopy, Links } from "@/content/site";

type ContactBlockProps = {
  contact: Contact;
  links: Links;
  copy: ContactCopy;
};

/**
 * The content of the Contact Panel: the last thing a visitor reads, and the
 * second chance to contact Shahmeer.
 *
 * The address is written out rather than hidden behind a word like "Email me".
 * A Recruiter working from a phone taps the mailto link; one working from a
 * desk with a company mail client open reads the address and copies it. The
 * link text is the address, so the same element serves both.
 *
 * The profile links repeat here because a visitor who has read to the end
 * should not have to travel back to Home to check the LinkedIn profile. The
 * copyright line closes the page; there is no footer below it.
 */
export function ContactBlock({ contact, links, copy }: ContactBlockProps) {
  return (
    <Block>
      <div className="flex flex-col gap-1">
        <span className="text-caption text-muted">{copy.emailLabel}</span>
        <a href={`mailto:${contact.email}`} className={ACCENT_LINK}>
          {contact.email}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ProfileLinks links={links} />
      </div>

      <p className="text-caption text-muted">{copy.copyright}</p>
    </Block>
  );
}
