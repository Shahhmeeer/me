import { DateRange } from "@/components/date-range";
import type { ExperienceCopy, ExperienceEntry } from "@/content/site";

type RoleCardProps = {
  entry: ExperienceEntry;
  copy: ExperienceCopy;
};

/**
 * One Role's card: the employer, the place, the dates and the Highlights.
 * A Recruiter reads it to check the dates line up, so the employer leads
 * and the dates sit beside it rather than at the end of a paragraph.
 *
 * The title is not here. Each Role is a Spread of the Experience Panel, in
 * `components/experience-panel.tsx`, and the title is that Spread's large
 * heading beside the card; the card is the detail under it.
 *
 * Highlights are nested inside the Role they were built for, because a
 * Highlight only means something with an employer attached to it. A Role
 * carrying none renders no list at all: a new Role has nothing to show yet,
 * and an empty list would say otherwise.
 *
 * Every word here comes from the content module, the remote label and the
 * word between the two dates included.
 */
export function RoleCard({ entry, copy }: RoleCardProps) {
  return (
    <article className="card flex flex-col gap-3 p-gutter">
      <div className="flex flex-col gap-1">
        <p className="text-caption text-muted">
          <span className="text-foreground">{entry.employer}</span>
          <span aria-hidden="true"> &middot; </span>
          {entry.location}
          {entry.remote ? (
            <>
              <span aria-hidden="true"> &middot; </span>
              {copy.remoteLabel}
            </>
          ) : null}
        </p>
        <p className="text-caption text-muted">
          <DateRange range={entry} copy={copy} />
        </p>
      </div>

      {entry.highlights.length > 0 ? (
        <ul className="flex max-w-measure list-disc flex-col gap-2 pl-5">
          {entry.highlights.map((highlight) => (
            <li key={highlight.id} className="text-body text-muted">
              {highlight.line}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
