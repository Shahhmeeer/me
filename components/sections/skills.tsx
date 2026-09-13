import type { Skill } from "@/content/site";

type SkillListProps = {
  skills: Skill[];
};

/**
 * What Shahmeer does. Verb phrases, set as a list rather than chips, because a
 * phrase is read and a product name is scanned. Two columns wherever there is
 * room for them, so six phrases make three short rows and not a tall one.
 *
 * The heading is not here. Skills is one Spread, in
 * `components/skills-panel.tsx`, and "What I do" is that Spread's large
 * title; this list is what goes under it, with the Tools in the card beside.
 */
export function SkillList({ skills }: SkillListProps) {
  return (
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
  );
}
