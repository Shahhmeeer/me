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
 * A chip's border is the `.tech-tag` rule in `app/globals.css`, not a
 * utility here, so the hover that turns it teal, and the transition behind
 * the reduced-motion query, can be written there where the theme test
 * reads them. Nothing else about a chip changes under a pointer.
 */
export function TechTagList({ techTags }: TechTagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {techTags.map((techTag) => (
        <li
          key={techTag.name}
          className="tech-tag rounded-full bg-surface px-3 py-1.5 text-caption font-medium text-foreground"
        >
          {techTag.name}{" "}
          <span className="font-normal text-muted">{techTag.year}</span>
        </li>
      ))}
    </ul>
  );
}
