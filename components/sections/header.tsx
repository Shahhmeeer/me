import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { profileLinks, type Contact, type Links } from "@/content/site";

type HeaderProps = {
  contact: Contact;
  links: Links;
};

export function Header({ contact, links }: HeaderProps) {
  return (
    <header className="flex flex-col gap-gutter">
      <div className="flex flex-col gap-2">
        <h1 className="text-display font-semibold tracking-tight text-foreground">
          {contact.name}
        </h1>
        <p className="text-title font-medium text-accent">{contact.headline}</p>
      </div>

      <p className="max-w-measure text-lead text-muted">{contact.pitch}</p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${contact.email}`}
          className="rounded-full bg-accent px-5 py-2.5 text-body font-medium text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {contact.callToAction}
        </a>

        {profileLinks(links).map((link) => (
          <a
            key={link.href}
            href={link.href}
            {...(link.external ? EXTERNAL_LINK_ATTRIBUTES : {})}
            className="text-body font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}
