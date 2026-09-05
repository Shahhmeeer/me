import { describe, expect, it } from "vitest";

import { projects, type Project } from "@/content/site";
import { projectProblems } from "./checks/content-rules";

describe("Project integrity", () => {
  it.each(projects.map((project) => [project.id, project] as const))(
    "%s is complete",
    (_id, project) => {
      expect(projectProblems(project)).toEqual([]);
    },
  );

  it("rejects a deliberately incomplete Project", () => {
    const incomplete = {
      id: "broken",
      name: "Broken",
      liveUrl: "not a url",
      summary: "A summary.",
      techTags: [],
      year: 2025,
      ownership: { kind: "solo" },
    } as unknown as Project;

    expect(projectProblems(incomplete).length).toBeGreaterThan(1);
  });
});
