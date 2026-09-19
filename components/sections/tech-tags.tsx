import type { TechTag } from "@/content/site";

type TechTagListProps = {
  techTags: TechTag[];
};

/**
 * The Tech Tags on one card. Each tag prints its year beside its name, because
 * a Tech Tag says "used here, then" and never "uses today".
 *
 * Case Studies and Projects share this list on purpose: the two cards make the
 * same kind of claim, and a tag drawn differently on one of them would read as
 * a different claim.
 *
 * A chip's Pale Sky fill and its border are the `.tech-tag` rule in
 * `app/globals.css`, not utilities here, so the hover that turns the border
 * Deep Sky, and the transition behind the reduced-motion query, can be
 * written there where the theme test reads them. The name is in the body
 * ink and the year in the muted ink, as they would be on a card. Nothing
 * else about a chip changes under a pointer.
 */
export function TechTagList({ techTags }: TechTagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {techTags.map((techTag) => (
        <li
          key={techTag.name}
          className="tech-tag rounded-full px-3 py-1.5 text-caption font-medium text-foreground"
        >
          {techTag.name}{" "}
          <span className="font-normal text-muted">{techTag.year}</span>
        </li>
      ))}
    </ul>
  );
}
