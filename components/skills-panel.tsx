import { Panel } from "@/components/panel";
import { SkillList } from "@/components/sections/skills";
import { ToolsCard } from "@/components/sections/tools";
import { Spread } from "@/components/spread";
import type { BlockHeadings, ContentPanel, Skill, Tool } from "@/content/site";

type SkillsPanelProps = {
  panel: ContentPanel;
  headings: Pick<BlockHeadings, "skills" | "tools">;
  skills: Skill[];
  tools: Tool[];
};

/** Skills' one Spread, by title, for the Bar's dot: the Skills heading. */
export function skillsSpreadTitles(headings: Pick<BlockHeadings, "skills">): string[] {
  return [headings.skills];
}

/**
 * The Skills Panel: one Spread, which heads it. On the left, under the
 * label and the line, "What I do" is the title set large with the Skill
 * list under it in two columns; the card holds "What I work with" and the
 * Tool chips. Both headings are one level under the Panel, as they were
 * when each headed a block, so the outline still reads Skills, What I do,
 * What I work with.
 *
 * On a small display the Spread stacks: heading, line, the Skills title
 * over its list, then the Tools card, in the order they were read before.
 */
export function SkillsPanel({
  panel,
  headings,
  skills,
  tools,
}: SkillsPanelProps) {
  return (
    <Panel panel={panel}>
      <Spread
        heads={panel}
        title={headings.skills}
        level={3}
        underTitle={<SkillList skills={skills} />}
      >
        <ToolsCard heading={headings.tools} tools={tools} />
      </Spread>
    </Panel>
  );
}
