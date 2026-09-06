import { describe, expect, it } from "vitest";

import { projects, type Project } from "@/content/site";
import { projectProblems } from "./checks/content-rules";

/**
 * The two Projects the spec fixes, in the order a visitor reads them.
 *
 * A Project earns its place by being openable, so what is pinned here is the
 * link a visitor clicks and the year the work was done. Masoodia is live and
 * public; the plant app has a repo only, which is why a Project may carry one
 * link or the other.
 */
const EXPECTED_PROJECTS = [
  {
    id: "masoodia",
    liveUrl: "https://www.masoodia.com/",
    repoUrl: "https://github.com/Shahhmeeer/masoodia-website",
    year: 2024,
    techTagNames: ["JavaScript"],
  },
  {
    id: "plant-ecommerce-app",
    liveUrl: undefined,
    repoUrl: "https://github.com/Shahhmeeer/final-year-project",
    year: 2024,
    techTagNames: ["Flutter", "Firebase"],
  },
] as const;

const masoodia = projects.find((project) => project.id === "masoodia");
const plantApp = projects.find(
  (project) => project.id === "plant-ecommerce-app",
);

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

  it("rejects a Project with nothing to open", () => {
    const unopenable = {
      id: "unopenable",
      name: "Unopenable",
      summary: "A summary.",
      techTags: [{ name: "JavaScript", year: 2024 }],
      year: 2024,
      ownership: { kind: "solo", note: "Built solo." },
    } as unknown as Project;

    expect(projectProblems(unopenable)).not.toEqual([]);
  });
});

describe("the two Projects", () => {
  it("ships the two Projects the spec asks for, in order", () => {
    expect(projects.map((project) => project.id)).toEqual(
      EXPECTED_PROJECTS.map((project) => project.id),
    );
  });

  it.each(EXPECTED_PROJECTS.map((project) => [project.id, project] as const))(
    "%s links where the spec says, and carries its Tech Tags",
    (id, expected) => {
      const project = projects.find((candidate) => candidate.id === id);

      expect(project?.liveUrl).toBe(expected.liveUrl);
      expect(project?.repoUrl).toBe(expected.repoUrl);
      expect(project?.techTags.map((techTag) => techTag.name)).toEqual(
        expected.techTagNames,
      );
    },
  );

  /**
   * The year is why a Tech Tag is safe to show: a reader must never take a
   * 2024 technology for present daily work.
   */
  it.each(EXPECTED_PROJECTS.map((project) => [project.id, project] as const))(
    "%s shows its year, on the card and on every Tech Tag",
    (id, expected) => {
      const project = projects.find((candidate) => candidate.id === id);

      expect(project?.year).toBe(expected.year);
      for (const techTag of project?.techTags ?? []) {
        expect(techTag.year).toBe(expected.year);
      }
    },
  );

  it("says what Masoodia's business does, and that the delivery was solo", () => {
    const summary = masoodia?.summary.toLowerCase() ?? "";

    for (const line of ["coal export", "event management", "solar", "biomass"]) {
      expect(summary).toContain(line);
    }

    expect(masoodia?.ownership.kind).toBe("solo");
    expect(masoodia?.ownership.note?.toLowerCase()).toContain("vercel");
  });

  it("says the plant app is a Flutter and Firebase final year project", () => {
    const summary = plantApp?.summary.toLowerCase() ?? "";

    expect(summary).toContain("flutter");
    expect(summary).toContain("firebase");
    expect(summary).toContain("final year project");
  });
});
