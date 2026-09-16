import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { ContactForm, TURNSTILE_BOX_ID } from "@/components/sections/contact-form";
import { contact, contactCopy } from "@/content/site";
import { afterId, elements, idsOf, inputs, textOf } from "./checks/markup";

/**
 * The Form as a browser first receives it, before the script that sends
 * it from the page has run: the page test reads its fields, its labels and
 * its Send button; this reads what the script will change and what must
 * be there for it to change well. The sending, the swap and the focus are
 * the script's and run in a browser; what is read here is that the page
 * says none of it early, and that the line the script will speak into is
 * already on the page, because a screen reader announces a live region
 * only if it was there before its words were.
 *
 * The Form is rendered twice: as a preview with no Turnstile site key has
 * it, and as the live site does, with one. The widget itself is
 * Cloudflare's script's to draw and runs in a browser; what is read here is
 * that the Form makes room for it only when there is a key, and that the
 * page a browser with no script receives is the same either way.
 */
const html = renderToStaticMarkup(
  <ContactForm form={contactCopy.form} email={contact.email} />,
);
const withKey = renderToStaticMarkup(
  <ContactForm form={contactCopy.form} email={contact.email} siteKey="1x00000000000000000000AA" />,
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

describe("The Form and the Turnstile widget", () => {
  it("makes no room for the widget when there is no site key", () => {
    expect(idsOf(html)).not.toContain(TURNSTILE_BOX_ID);
  });

  it("makes room for the widget inside the form, before Send, when there is a site key", () => {
    const [form] = elements(withKey, "form");
    const [after, ...more] = afterId(form.inner, TURNSTILE_BOX_ID);

    expect(more).toEqual([]);
    expect(after).toMatch(/^<\/div>\s*<button\b/);
  });

  /**
   * The Token is the script's to wait for, and the script's to block Send
   * for: a browser with no script never has one, and must still be able to
   * post so the route can answer it with the page naming the address.
   */
  it("offers its Send button enabled at first paint even with a site key", () => {
    const [button] = elements(withKey, "button");

    expect(button.attributes.disabled).toBeUndefined();
    expect(textOf(button.inner)).toBe(form.submit);
  });
});
