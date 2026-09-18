import { NAV_LINK, PRIMARY_ACTION } from "@/components/interactive";
import {
  panelOrder,
  type Contact,
  type NavCopy,
  type Panels,
} from "@/content/site";

type NavProps = {
  panels: Panels;
  contact: Contact;
  copy: NavCopy;
};

/**
 * The Nav: a frosted pill floating at the top of every Panel, with one link
 * per Panel and the "Get in touch" button at its end. The Bar under the
 * Strip wears the same pill, `.pill` in `app/globals.css`.
 *
 * The links are plain anchors to the Panel ids. A browser scrolls to the
 * Panel on its own, with JavaScript or without it, and on a large display the
 * Strip slides the same way. Home is lit at first paint, because that is
 * where a page opens; the strip in `components/strip.tsx` moves the light
 * from there, and reads the links in the list by their hrefs to do it.
 *
 * The button is one more anchor into the page, to Contact, where the Form
 * and the email address both are: a Recruiter on a locked-down laptop has
 * no mail client for a `mailto:` to open, and lands on the way to write
 * that works there. It sits outside the list, so it is not read as a sixth
 * Panel and is never the lit link.
 *
 * Below a large display the button leaves the pill so the five links fit at
 * 360px; the Home and Contact Panels still carry the way to make contact.
 */
export function Nav({ panels, contact, copy }: NavProps) {
  return (
    <nav
      aria-label={copy.label}
      className="pill fixed inset-x-0 top-4 z-10 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full p-1"
    >
      <ul className="flex items-center">
        {panelOrder(panels).map((panel) => (
          <li key={panel.id}>
            <a
              href={`#${panel.id}`}
              aria-current={panel.id === panels.home.id ? "page" : undefined}
              className={NAV_LINK}
            >
              {panel.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        href={`#${panels.contact.id}`}
        className={`${PRIMARY_ACTION} hidden large:block`}
      >
        {contact.callToAction}
      </a>
    </nav>
  );
}
