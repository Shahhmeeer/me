import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { ContactForm } from "@/components/sections/contact-form";
import { contact, contactCopy } from "@/content/site";
import { elements, inputs, textOf } from "./checks/markup";

/**
 * The Form as a browser first receives it, before the script that sends
 * it from the page has run: the page test reads its fields, its labels and
 * its Send button; this reads what the script will change and what must
 * be there for it to change well. The sending, the swap and the focus are
 * the script's and run in a browser; what is read here is that the page
 * says none of it early, and that the line the script will speak into is
 * already on the page, because a screen reader announces a live region
 * only if it was there before its words were.
 */
const html = renderToStaticMarkup(
  <ContactForm form={contactCopy.form} email={contact.email} />,
);
const text = textOf(html);
const { form } = contactCopy;

describe("The Form, before any script runs", () => {
  it("carries one polite live region, focusable by script, with nothing in it yet", () => {
    const live = elements(html, "p").filter(
      (paragraph) => paragraph.attributes["aria-live"] !== undefined,
    );

    expect(live).toHaveLength(1);
    expect(live[0].attributes["aria-live"]).toBe("polite");
    expect(live[0].attributes.tabindex).toBe("-1");
    expect(textOf(live[0].inner)).toBe("");
  });

  it("says nothing of sending, success, failure or a refused field", () => {
    expect(text).not.toContain(form.sending);
    expect(text).not.toContain(form.success);
    expect(text).not.toContain(form.failure);
    for (const word of Object.values(form.problems)) {
      expect(text).not.toContain(word);
    }
  });

  it("offers its Send button enabled, and no box marked invalid", () => {
    const [button] = elements(html, "button");
    const boxes = [
      ...inputs(html),
      ...elements(html, "textarea").map((area) => area.attributes),
    ];

    expect(button.attributes.disabled).toBeUndefined();
    expect(textOf(button.inner)).toBe(form.submit);
    for (const box of boxes) {
      expect(box["aria-invalid"], box.name).toBeUndefined();
    }
  });
});
