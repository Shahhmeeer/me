import { Section } from "@/components/sections/section";
import type { Tool } from "@/content/site";

type ToolsProps = {
  heading: string;
  tools: Tool[];
};

/**
 * What Shahmeer works with. Chips, because a Recruiter scans this block for one
 * product name rather than reading it.
 */
export function Tools({ heading, tools }: ToolsProps) {
  return (
    <Section title={heading}>
      <ul className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <li
            key={tool}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption font-medium text-foreground"
          >
            {tool}
          </li>
        ))}
      </ul>
    </Section>
  );
}
