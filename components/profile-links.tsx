import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { QUIET_LINK } from "@/components/interactive";
import { profileLinks, type Links } from "@/content/site";

type ProfileLinksProps = {
  links: Links;
};

/**
 * The links that stand for Shahmeer somewhere else, drawn the one way.
 *
 * The Header offers them at the top and the footer repeats them at the bottom.
 * Which links they are and what order they come in is a content decision, made
 * by `profileLinks`; how they look is this component's. Keeping both in one
 * place each is what stops a link added later from reaching only one end of the
 * page, or reaching both and looking different at each.
 *
 * No wrapper is rendered: the Header sets these beside its contact button and
 * the footer sets them on a line of their own, so each supplies its own.
 */
export function ProfileLinks({ links }: ProfileLinksProps) {
  return (
    <>
      {profileLinks(links).map((link) => (
        <a
          key={link.href}
          href={link.href}
          {...(link.external ? EXTERNAL_LINK_ATTRIBUTES : {})}
          className={QUIET_LINK}
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
