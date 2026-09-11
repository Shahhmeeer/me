import { describe, expect, it } from "vitest";

import { contact, shareCard } from "@/content/site";
import { shareCardProblems } from "./checks/share-card-rules";

describe("Share Card", () => {
  it("names Shahmeer and the Headline, and points at the live origin", () => {
    expect(shareCardProblems(shareCard, contact)).toEqual([]);
  });

  it("lives at shahmeerasim.me", () => {
    expect(shareCard.url).toBe("https://shahmeerasim.me");
  });
});
