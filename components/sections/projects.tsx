import { EXTERNAL_LINK_ATTRIBUTES } from "@/components/external-link";
import { Section } from "@/components/sections/section";
import type { Project, ProjectsCopy } from "@/content/site";

type ProjectsProps = {
  heading: string;
  projects: Project[];
  copy: ProjectsCopy;
};

/** One openable link on a Project card, with the label a visitor reads. */
type ProjectLink = {
  label: string;
  href: string;
};

/**
 * The links a card offers, in the order a visitor wants them: the running site
 * first, the source second. A Project carries one or both, never neither, and
 * `projectProblems` fails the build when a card offers nothing to open.
 */
function linksOf(project: Project, copy: ProjectsCopy): ProjectLink[] {
  return [
    { label: copy.liveLabel, href: project.liveUrl },
    { label: copy.repoLabel, href: project.repoUrl },
  ].filter((link): link is ProjectLink => link.href !== undefined);
}

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
              {linksOf(project, copy).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...EXTERNAL_LINK_ATTRIBUTES}
                  className="text-body font-medium text-accent underline-offset-4 transition-opacity hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <ul className="flex flex-wrap gap-2">
              {project.techTags.map((techTag) => (
                <li
                  key={techTag.name}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption font-medium text-foreground"
                >
                  {techTag.name}{" "}
                  <span className="font-normal text-muted">{techTag.year}</span>
                </li>
              ))}
            </ul>

            <p className="max-w-measure text-caption text-muted">
              {project.ownership.note}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
