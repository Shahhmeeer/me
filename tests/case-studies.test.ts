import { describe, expect, it } from "vitest";

import { caseStudies, type CaseStudy } from "@/content/site";
import { caseStudyProblems } from "./checks/content-rules";

/**
 * The three proof cards the spec fixes, in the order a visitor reads them.
 * Employers are named because ADR-0001 allows it; the end clients they were
 * built for are never named, which the confidentiality guard checks separately.
 */
const EXPECTED_CARDS = [
  {
    id: "questionnaire-portal",
    employer: "Cloud Consulting Inc",
    ownership: "solo",
  },
  {
    id: "payment-gateway-integrations",
    employer: "Prism Solutions",
    ownership: "solo",
  },
  {
    id: "scheduling-portal",
    employer: "Cloud Consulting Inc",
    ownership: "team",
  },
] as const;

/** The payment card, whose volume must stay a band. */
const paymentCard = caseStudies.find(
  (caseStudy) => caseStudy.id === "payment-gateway-integrations",
);

describe("Case Study integrity", () => {
  it.each(caseStudies.map((caseStudy) => [caseStudy.id, caseStudy] as const))(
    "%s is complete",
    (_id, caseStudy) => {
      expect(caseStudyProblems(caseStudy)).toEqual([]);
    },
  );

  it("rejects a deliberately incomplete Case Study", () => {
    const incomplete = {
      id: "broken",
      title: "Broken",
      employer: "An employer",
      clientDescriptor: "A mid-size logistics operator",
      problem: "Something hurt.",
      action: "Something was built.",
      result: "",
      techTags: [],
      ownership: { kind: "team" },
    } as unknown as CaseStudy;

    expect(caseStudyProblems(incomplete).length).toBeGreaterThan(1);
  });
});

describe("the three proof cards", () => {
  it("ships the three Case Studies the spec asks for, in order", () => {
    expect(caseStudies.map((caseStudy) => caseStudy.id)).toEqual(
      EXPECTED_CARDS.map((card) => card.id),
    );
  });

  it.each(EXPECTED_CARDS.map((card) => [card.id, card] as const))(
    "%s names its employer and states its ownership",
    (id, card) => {
      const caseStudy = caseStudies.find((candidate) => candidate.id === id);

      expect(caseStudy?.employer).toBe(card.employer);
      expect(caseStudy?.ownership.kind).toBe(card.ownership);
    },
  );

  it("gives every card a descriptor in place of the end client's name", () => {
    for (const caseStudy of caseStudies) {
      expect(caseStudy.clientDescriptor.trim()).not.toBe("");
    }
  });

  /**
   * That no exact figure appears is a rule over every card and lives in
   * `caseStudyProblems`. What is checked here is the band itself, which only
   * the payment card carries.
   */
  it("states the payment volume as a band", () => {
    expect(paymentCard).toBeDefined();
    expect(paymentCard?.result.toLowerCase()).toContain("six figure");
  });
});
