import { Section } from "@/components/sections/section";
import type { Skill } from "@/content/site";

type SkillsProps = {
  heading: string;
  skills: Skill[];
};

/**
 * What Shahmeer does. Verb phrases, set as a list rather than chips, because a
 * phrase is read and a product name is scanned.
 */
export function Skills({ heading, skills }: SkillsProps) {
  return (
    <Section heading={heading}>
      <ul className="grid gap-x-gutter gap-y-2 sm:grid-cols-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="border-l-2 border-border pl-3 text-body text-muted"
          >
            {skill}
          </li>
        ))}
      </ul>
    </Section>
  );
}
