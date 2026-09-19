import { TITLE_LINK } from "@/components/interactive";
import { Panel } from "@/components/panel";
import { ProfileLinks } from "@/components/profile-links";
import { ContactForm } from "@/components/sections/contact-form";
import { Spread } from "@/components/spread";
import type { Contact, ContactCopy, ContentPanel, Links } from "@/content/site";

type ContactPanelProps = {
  panel: ContentPanel;
  contact: Contact;
  links: Links;
  copy: ContactCopy;
  /** The public Turnstile site key, or none on a preview without keys. */
  turnstileSiteKey?: string;
};

/**
 * Contact's one Spread, by title, for the Bar's dot: the email address,
 * which is what the Spread says large.
 */
export function contactSpreadTitles(contact: Pick<Contact, "email">): string[] {
  return [contact.email];
}

/**
 * The Contact Panel: one Spread, which heads it; the last thing a visitor
 * reads, and the second chance to contact Shahmeer.
 *
 * On the left, under the label and the line, the email address is the
 * title set large, and a link, so a Recruiter with a mail client taps it
 * and one without reads it and copies it; the address is written out
 * rather than hidden behind a word like "Email me" for the second of
 * those. It may break at the at sign and nowhere else: an address is one
 * word, and the column is narrower than the word set large. The Profiles
 * and the CV follow in a row under it, drawn quietly as they are on Home,
 * because a visitor who has read to the end should not have to travel
 * back to Home to check the LinkedIn profile. The copyright line closes
 * the page at the foot; there is no footer below it.
 *
 * The card is the form (ADR-0004), for the Recruiter on a locked-down
 * laptop with no mail client behind the address, with the Turnstile
 * widget drawn in it when there is a site key to draw it with.
 *
 * On a small display the Spread stacks: heading, line, the address, the
 * links, the form, then the copyright line last, as it was.
 */
export function ContactPanel({
  panel,
  contact,
  links,
  copy,
  turnstileSiteKey,
}: ContactPanelProps) {
  const [local, domain] = contact.email.split("@");

  return (
    <Panel panel={panel}>
      <Spread
        heads={panel}
        title={
          <a href={`mailto:${contact.email}`} className={TITLE_LINK}>
            {local}
            <wbr />
            {`@${domain}`}
          </a>
        }
        level={3}
        oneWord
        underTitle={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ProfileLinks links={links} />
          </div>
        }
        foot={<p className="text-caption text-muted">{copy.copyright}</p>}
      >
        <ContactForm
          form={copy.form}
          email={contact.email}
          siteKey={turnstileSiteKey}
        />
      </Spread>
    </Panel>
  );
}
