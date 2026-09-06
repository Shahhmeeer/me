import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { ACCENT_LINK } from "@/components/interactive";
import { Section } from "@/components/sections/section";
import { TechTagList } from "@/components/sections/tech-tags";
import { projectLinks, type Project, type ProjectsCopy } from "@/content/site";

type ProjectsProps = {
  heading: string;
  projects: Project[];
  copy: ProjectsCopy;
};

/**
 * The public work, and the answer to "has he shipped anything anyone can see".
 * A card is read as name, year, summary, then the links, because opening one
 * is the whole point of the block.
 *
 * Every link here leaves the site, so every link wears the same attributes.
 * The year sits beside the name and on every Tech Tag, so that no reader takes
 * old work for present daily work.
 */
export function Projects({ heading, projects, copy }: ProjectsProps) {
  return (
    <Section heading={heading}>
      <p className="max-w-measure text-caption text-muted">{copy.note}</p>

      <div className="flex flex-col gap-block">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lead font-semibold tracking-tight text-foreground">
                {project.name}
              </h3>
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
    </Section>
  );
}
