import { describe, expect, it } from "vitest";

import { isTypingIn } from "@/components/strip";

/**
 * The Strip's arrow keys and where they are pressed. The Strip takes ← and
 * → from wherever focus is, except a box the visitor is typing in: there
 * the keys move the caret, and a typo fixed in Message must not slide the
 * Form away. The guard is a function of what it reads off the focused
 * element, so a test hands it that and nothing of the browser.
 */

/** An element as the guard sees it. */
function focused(tagName: string, isContentEditable = false) {
  return { tagName, isContentEditable };
}

describe("isTypingIn", () => {
  it("yields the keys to a text input and a textarea", () => {
    expect(isTypingIn(focused("INPUT"))).toBe(true);
    expect(isTypingIn(focused("TEXTAREA"))).toBe(true);
  });

  it("yields the keys to anything contenteditable", () => {
    expect(isTypingIn(focused("DIV", true))).toBe(true);
  });

  /** A press with nothing focused reaches the body; a target that is no element is null. */
  it("keeps the keys on a button, a link, the Strip and nothing focused", () => {
    expect(isTypingIn(focused("BUTTON"))).toBe(false);
    expect(isTypingIn(focused("A"))).toBe(false);
    expect(isTypingIn(focused("MAIN"))).toBe(false);
    expect(isTypingIn(focused("BODY"))).toBe(false);
    expect(isTypingIn(null)).toBe(false);
  });
});
