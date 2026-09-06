import { ACCENT_LINK } from "@/components/interactive";
import { ProfileLinks } from "@/components/profile-links";
import { Reveal } from "@/components/reveal";
import type { Contact, FooterCopy, Links } from "@/content/site";

type FooterProps = {
  contact: Contact;
  links: Links;
  copy: FooterCopy;
};

/**
 * The last thing a visitor reads, and the second chance to contact Shahmeer.
 *
 * The address is written out rather than hidden behind a word like "Email me".
 * A Recruiter working from a phone taps the mailto link; one working from a
 * desk with a company mail client open reads the address and copies it. The
 * link text is the address, so the same element serves both.
 *
 * The profile links repeat here because a visitor who has read to the bottom
 * should not have to scroll back to the top to check the LinkedIn profile.
 *
 * It arrives the same way a Section does, so the end of the page is not the
 * one block that appears without being scrolled to.
 */
export function Footer({ contact, links, copy }: FooterProps) {
  return (
    <Reveal>
      <footer className="mx-auto flex w-full max-w-3xl flex-col gap-gutter border-t border-border px-gutter py-block">
        <h2 className="text-title font-semibold tracking-tight text-foreground">
          {copy.heading}
        </h2>

        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted">{copy.emailLabel}</span>
          <a href={`mailto:${contact.email}`} className={ACCENT_LINK}>
            {contact.email}
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ProfileLinks links={links} />
        </div>
      </footer>
    </Reveal>
  );
}
