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
 * Panel on its own, with JavaScript or without it; on a large display
 * `components/strip.tsx` takes the click and lands the Panel's first Spread
 * at the screen's left instead. Home is lit at first paint, because that is
 * where a page opens; the strip in `components/strip.tsx` moves the light
 * from there, and reads the links in the list by their hrefs to do it.
 *
 * The button is one more anchor into the page, to Contact, where the Form
 * and the email address both are: a Recruiter on a locked-down laptop has
 * no mail client for a `mailto:` to open, and lands on the way to write
 * that works there. It sits outside the list, so it is not read as a sixth
 * Panel and is never the lit link.
 *
 * Below a large display the button leaves the pill, and the pill gets room
 * for a thumb: its padding grows to `p-1.5` and each link's to `px-3 py-2`,
 * `NAV_LINK` in `components/interactive.ts`, so the links sit apart and a
 * thumb hits the one it aims at. The Home and Contact Panels still carry
 * the way to make contact.
 *
 * With that padding five links overrun a 360px phone by more than the
 * padding can give back short of the cramped step this replaced, so the
 * Home link is hidden below `large` rather than the pill made to scroll: a
 * pill that scrolls is a pill a thumb misses, and the Headline is a swipe
 * up from anywhere. The link stays in the list, so the strip lights it as
 * on any display; a phone at the top of the page shows no lit link, and a
 * screen reader there hears four. Only the markup is the same everywhere.
 */
export function Nav({ panels, contact, copy }: NavProps) {
  const isHome = (panel: { id: string }) => panel.id === panels.home.id;

  return (
    <nav
      aria-label={copy.label}
      className="pill fixed inset-x-0 top-4 z-10 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full p-1.5 large:p-1"
    >
      <ul className="flex items-center">
        {panelOrder(panels).map((panel) => (
          <li
            key={panel.id}
            className={isHome(panel) ? "hidden large:block" : undefined}
          >
            <a
              href={`#${panel.id}`}
              aria-current={isHome(panel) ? "page" : undefined}
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
