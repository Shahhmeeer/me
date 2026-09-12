import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { QUIET_LINK, TARGET_LINK } from "@/components/interactive";
import { profileLinks, type Links } from "@/content/site";

type ProfileLinksProps = {
  links: Links;
  /**
   * True to draw each link as a target, a card a thumb can hit, the way the
   * Contact Panel wants them; false, the default, for the quiet links beside
   * the button on Home.
   */
  targets?: boolean;
};

/**
 * The links that stand for Shahmeer somewhere else, drawn the one way.
 *
 * The Home Panel offers them at the top and the Contact Panel repeats them at
 * the end.
 * Which links they are and what order they come in is a content decision, made
 * by `profileLinks`; how they look is this component's. Keeping both in one
 * place each is what stops a link added later from reaching only one end of the
 * page, or reaching both and looking different at each.
 *
 * The two ends want them drawn two ways: quiet beside the button on Home,
 * as targets on Contact, where each is a card of its own. Both are drawn
 * here, so the choice is one word at the call and the links stay one list.
 *
 * No wrapper is rendered: Home sets these beside its contact button and
 * Contact sets them in a row of targets, so each supplies its own.
 */
export function ProfileLinks({ links, targets = false }: ProfileLinksProps) {
  return (
    <>
      {profileLinks(links).map((link) => (
        <a
          key={link.href}
          href={link.href}
          {...(link.external ? EXTERNAL_LINK_ATTRIBUTES : {})}
          className={targets ? TARGET_LINK : QUIET_LINK}
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
