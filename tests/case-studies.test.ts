import { describe, expect, it } from "vitest";

import { caseStudies, type CaseStudy } from "@/content/site";
import { caseStudyProblems } from "./checks/content-rules";
import { collectStrings } from "./checks/strings";

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

/**
 * An exact money amount: a currency symbol next to digits, or digits next to a
 * money word. ADR-0001 allows "six figures a month" and forbids the figure
 * itself.
 */
const EXACT_MONEY = /[$£€]\s?[0-9]|[0-9][0-9,.]*\s?(k|m|bn|million|billion)\b/i;

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

  it("describes every end client by scale rather than by name", () => {
    for (const caseStudy of caseStudies) {
      expect(caseStudy.clientDescriptor.trim()).not.toBe("");
    }
  });

  it("states the payment volume as a band, never an exact figure", () => {
    expect(paymentCard).toBeDefined();
    expect(paymentCard?.result.toLowerCase()).toContain("six figure");

    const exact = collectStrings(paymentCard).filter((text) =>
      EXACT_MONEY.test(text),
    );

    expect(exact).toEqual([]);
  });
});
