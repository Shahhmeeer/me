import { Section } from "@/components/sections/section";
import type { Education, ExperienceCopy } from "@/content/site";

type EducationProps = {
  heading: string;
  education: Education[];
  copy: ExperienceCopy;
};

/**
 * The degree. It sits under Experience because a Recruiter checking for gaps
 * reads the two together, and it wears the same row as Certifications: the
 * qualification on the left, its dates on the right.
 */
export function EducationBlock({ heading, education, copy }: EducationProps) {
  return (
    <Section heading={heading}>
      <ul className="flex flex-col">
        {education.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <span className="text-body font-medium text-foreground">
              {entry.qualification}
              <span aria-hidden="true"> &middot; </span>
              <span className="font-normal text-muted">{entry.institution}</span>
            </span>
            <span className="text-caption text-muted">
              {entry.start}
              {copy.dateSeparator}
              {entry.end}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
