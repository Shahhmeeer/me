import { Section } from "@/components/sections/section";
import type { ExperienceCopy, ExperienceEntry } from "@/content/site";

type ExperienceProps = {
  heading: string;
  experience: ExperienceEntry[];
  copy: ExperienceCopy;
};

/**
 * The employment history, and the block a Recruiter reads to check the dates
 * line up. So a role leads with its employer and title, and the dates sit
 * beside them rather than at the end of a paragraph.
 *
 * Highlights are nested inside the role they were built for, because a
 * Highlight only means anything with an employer attached to it. A role with no
 * Highlight renders no list: a new role has nothing to show yet, and an empty
 * bullet would say otherwise.
 *
 * Every word here comes from the content module, the remote label and the word
 * between the two dates included.
 */
export function Experience({ heading, experience, copy }: ExperienceProps) {
  return (
    <Section heading={heading}>
      <div className="flex flex-col gap-block">
        {experience.map((entry) => (
          <article key={entry.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lead font-semibold tracking-tight text-foreground">
                {entry.title}
              </h3>
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
                {entry.start}
                {copy.dateSeparator}
                {entry.end}
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
        ))}
      </div>
    </Section>
  );
}
