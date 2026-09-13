import type { Tool } from "@/content/site";

type ToolsCardProps = {
  heading: string;
  tools: Tool[];
};

/**
 * What Shahmeer works with: the card on the Skills Spread
 * (`components/skills-panel.tsx`). Chips, because a Recruiter scans this
 * block for one product name rather than reading it, and they wrap in the
 * card's width to make a few short rows rather than one long one.
 *
 * It keeps a heading of its own, one level under the Panel as the Skills
 * title beside it is, because CONTEXT.md keeps a Skill and a Tool apart: a
 * Skill is something Shahmeer does, a Tool is a product he works with.
 */
export function ToolsCard({ heading, tools }: ToolsCardProps) {
  return (
    <div className="card flex flex-col gap-gutter p-gutter">
      <h3 className="text-title font-semibold tracking-tight text-foreground">
        {heading}
      </h3>
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
    </div>
  );
}
