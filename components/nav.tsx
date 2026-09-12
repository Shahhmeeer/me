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
 * per Panel and the "Get in touch" button at its end.
 *
 * The links are plain anchors to the Panel ids. A browser scrolls to the
 * Panel on its own, with JavaScript or without it, and the strip to come
 * slides the same way. Home is lit at first paint, because that is where a
 * page opens; the observer in `components/panel-observer.tsx` moves the light
 * from there, and reads the links by their hrefs to do it.
 *
 * Below a large display the button leaves the pill so the five links fit at
 * 360px; the Home and Contact Panels still carry the way to make contact.
 */
export function Nav({ panels, contact, copy }: NavProps) {
  return (
    <nav
      aria-label={copy.label}
      className="nav fixed inset-x-0 top-4 z-10 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full p-1"
    >
      <ul className="flex items-center">
        {panelOrder(panels).map((panel, index) => (
          <li key={panel.id}>
            <a
              href={`#${panel.id}`}
              aria-current={index === 0 ? "page" : undefined}
              className={NAV_LINK}
            >
              {panel.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        href={`mailto:${contact.email}`}
        className={`${PRIMARY_ACTION} hidden large:block`}
      >
        {contact.callToAction}
      </a>
    </nav>
  );
}
