import { Block } from "@/components/sections/block";
import type { Tool } from "@/content/site";

type ToolsProps = {
  heading: string;
  tools: Tool[];
};

/**
 * What Shahmeer works with. Chips, because a Recruiter scans this block for one
 * product name rather than reading it. On the Strip the chips are given a
 * width to wrap in, so they make a few short rows rather than one long one.
 */
export function Tools({ heading, tools }: ToolsProps) {
  return (
    <Block heading={heading}>
      <ul className="flex flex-wrap gap-2 large:w-112 large:shrink-0">
        {tools.map((tool) => (
          <li
            key={tool}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption font-medium text-foreground"
          >
            {tool}
          </li>
        ))}
      </ul>
    </Block>
  );
}
