import { TARGET_LINK } from "@/components/interactive";
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
 * Every way to reach him is a large target, a card that is the link, so a
 * Recruiter on a phone hits it with a thumb and one at a desk cannot miss it.
 * The email comes first and is written out rather than hidden behind a word
 * like "Email me": a Recruiter working from a phone taps the card; one
 * working from a desk with a company mail client open reads the address and
 * copies it. The profile links follow, drawn the same way, because a visitor
 * who has read to the end should not have to travel back to Home to check
 * the LinkedIn profile.
 *
 * The targets stack on a small display and on the Strip they are a column
 * too, two columns from 1280px: five of them in a row would be a slide for
 * what is one screen's worth of links, and two columns at 1024px are a
 * screen and a sliver. The copyright line closes the page under them; there
 * is no footer below it.
 */
export function ContactBlock({ contact, links, copy }: ContactBlockProps) {
  return (
    <Block>
      <div className="flex flex-col gap-gutter large:grid xl:grid-cols-2">
        <a href={`mailto:${contact.email}`} className={TARGET_LINK}>
          <span className="text-caption font-normal tracking-normal text-muted">
            {copy.emailLabel}
          </span>
          {contact.email}
        </a>

        <ProfileLinks links={links} large />
      </div>

      <p className="text-caption text-muted">{copy.copyright}</p>
    </Block>
  );
}
