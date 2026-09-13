import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { ACCENT_LINK } from "@/components/interactive";
import { TechTagList } from "@/components/sections/tech-tags";
import { projectLinks, type Project, type ProjectsCopy } from "@/content/site";

type ProjectCardsProps = {
  projects: Project[];
  copy: ProjectsCopy;
};

/**
 * The public work, and the answer to "has he shipped anything anyone can see".
 * A card is read as name, year, summary, then the links, because opening one
 * is the whole point of the block.
 *
 * The cards fill the card column of the Projects Spread, the last Spread of
 * the Work Panel in `components/work-panel.tsx`, after the Case Studies
 * because the strongest work comes first. They stack on a small display and
 * are a grid of two across on the Strip, so every Project is on the one
 * screen; the heading and the note are the Spread's, beside them.
 *
 * Every link here leaves the site, so every link wears the same attributes.
 * The year sits beside the name and on every Tech Tag, so that no reader takes
 * old work for present daily work.
 */
export function ProjectCards({ projects, copy }: ProjectCardsProps) {
  return (
    <div className="grid gap-gutter large:grid-cols-2">
      {projects.map((project) => (
        <article key={project.id} className="card flex flex-col gap-3 p-gutter">
          <div className="flex flex-col gap-1">
            <h4 className="text-lead font-semibold tracking-tight text-foreground">
              {project.name}
            </h4>
            <p className="text-caption text-muted">{project.year}</p>
          </div>

          <p className="max-w-measure text-body text-muted">
            {project.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {projectLinks(project, copy).map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.accessibleLabel}
                {...(link.external ? EXTERNAL_LINK_ATTRIBUTES : {})}
                className={ACCENT_LINK}
              >
                {link.label}
              </a>
            ))}
          </div>

          <TechTagList techTags={project.techTags} />

          <p className="max-w-measure text-caption text-muted">
            {project.ownership.note}
          </p>
        </article>
      ))}
    </div>
  );
}
