import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import Home from "@/app/page";
import {
  about,
  caseStudies,
  caseStudiesCopy,
  certifications,
  contact,
  contactCopy,
  education,
  experience,
  headings,
  links,
  panelOrder,
  panels,
  profileLinks,
  projects,
  projectsCopy,
  sketch,
} from "@/content/site";
import {
  elements,
  headingsOf,
  images,
  outlineProblems,
  textOf,
} from "./checks/markup";

/**
 * The home page as a browser first receives it: static HTML, before any
 * JavaScript runs. Everything below reads that text and nothing else, so a
 * class renamed or a component split in two changes nothing here, and a Panel
 * dropped or a link pointed at the wrong place fails the build.
 */
const html = renderToStaticMarkup(createElement(Home));
const order = panelOrder(panels);
const sections = elements(html, "section");

/** The Panel with the given id, as rendered. */
function panel(id: string) {
  const found = sections.find((section) => section.attributes.id === id);
  if (found === undefined) {
    throw new Error(`No <section id="${id}"> in the page`);
  }
  return found;
}

/** The four Panels beyond Home: headed by their label, with a line under it. */
const beyondHome = [panels.work, panels.skills, panels.experience, panels.contact];

/**
 * The Blobs drawn in a piece of HTML, each as the inline style that places
 * and colours it. A Blob is the one thing on the page drawn by inline style,
 * because its colour and place are inputs and not a class; so the style is
 * what the page says about it, and what is read here.
 */
function blobsOf(html: string): string[] {
  return [...html.matchAll(/style="(--blob-[^"]*)"/g)].map(([, style]) => style);
}

/** True when each string appears in the text after the one before it. */
function inOrder(text: string, parts: string[]): boolean {
  let from = 0;
  for (const part of parts) {
    const at = text.indexOf(part, from);
    if (at === -1) {
      return false;
    }
    from = at + part.length;
  }
  return true;
}

describe("Panels", () => {
  /**
   * Five Panels and nothing else is a section: the Nav, the URL hash and the
   * tests all address a Panel by this id, so the set and the order are fixed.
   */
  it("are the five, by id, in order, and no other section", () => {
    expect(sections.map((section) => section.attributes.id)).toEqual(
      order.map((entry) => entry.id),
    );
  });

  /** A screen reader announces a Panel by its heading, so each names its own. */
  it("are each labelled by a heading inside them", () => {
    for (const section of sections) {
      const labelId = section.attributes["aria-labelledby"];

      expect(labelId, section.attributes.id).toBeTruthy();
      expect(
        section.inner,
        `${section.attributes.id} is labelled by ${labelId}`,
      ).toMatch(new RegExp(`<h[1-6][^>]*\\bid="${labelId}"`));
    }
  });

  it("name the four beyond Home the way the Nav does", () => {
    for (const entry of order.slice(1)) {
      expect(headingsOf(panel(entry.id).inner)[0]).toEqual({
        level: 2,
        text: entry.label,
      });
    }
  });

  /**
   * Every Panel beyond Home says one line under its heading, before any of
   * its content, so a Recruiter arriving on it knows what it holds.
   */
  it("read, beyond Home, their heading and then their line before their content", () => {
    for (const entry of beyondHome) {
      const [beforeLine, ...afterLine] = textOf(panel(entry.id).inner).split(entry.line);

      expect(entry.line.trim(), entry.id).not.toBe("");
      expect(afterLine, `${entry.id} says its line`).toHaveLength(1);
      expect(beforeLine.trim(), `${entry.id} reads only its heading first`).toBe(entry.label);
    }
  });

  /**
   * Every Panel has Blobs behind it, and its own: a Panel's colours and
   * places are its own choice, so no two Panels are washed the same way.
   */
  it("each draw two or more Blobs of their own", () => {
    const drawn = order.map((entry) => blobsOf(panel(entry.id).inner));

    for (const [index, blobs] of drawn.entries()) {
      expect(blobs.length, order[index].id).toBeGreaterThanOrEqual(2);
    }
    expect(new Set(drawn.map((blobs) => blobs.join(" "))).size).toBe(order.length);
  });

  it("Home reads greeting, Headline, pitch, button, profile links, then About", () => {
    const home = panel(panels.home.id);
    const text = textOf(home.inner);

    expect(headingsOf(home.inner)[0]).toEqual({
      level: 1,
      text: contact.headline,
    });
    expect(
      inOrder(text, [
        contact.greeting,
        contact.headline,
        contact.pitch,
        contact.callToAction,
        ...profileLinks(links).map((link) => link.label),
        ...about,
      ]),
    ).toBe(true);
  });

  /**
   * The one picture of Shahmeer, and the words a screen reader says in its
   * place: they name him, because for some visitors the words are the picture.
   */
  it("Home shows the sketch, with alt text that names Shahmeer", () => {
    const found = images(panel(panels.home.id).inner).find(
      (image) => image.alt === sketch.alt,
    );

    expect(found).toBeDefined();
    expect(found?.alt).toContain(contact.name);
  });

  /**
   * The certification band at the foot of Home: each badge with its name and
   * date, and the badge's alt text says what it is. The list the band
   * replaced is gone, so each name is read once on the whole page.
   */
  it("Home's band shows each badge, name and date, and the old list is nowhere", () => {
    const home = panel(panels.home.id);
    const badges = images(home.inner);
    const text = textOf(home.inner);

    for (const certification of certifications) {
      expect(badges.map((badge) => badge.alt)).toContain(certification.logo.alt);
      expect(
        inOrder(text, [headings.certifications, certification.name, certification.awarded]),
      ).toBe(true);
      expect(textOf(html).split(certification.name)).toHaveLength(2);
    }
  });

  it("Work holds the Case Studies and then the Projects", () => {
    const work = panel(panels.work.id);

    expect(headingsOf(work.inner).map((heading) => heading.text)).toEqual([
      panels.work.label,
      headings.caseStudies,
      ...caseStudies.map((caseStudy) => caseStudy.title),
      headings.projects,
      ...projects.map((project) => project.name),
    ]);
  });

  /**
   * What each Work card keeps when it becomes a card in a row: the Case Study
   * note that says why there is nothing to click (ADR-0001), the Result label
   * an Engineer looks for, and the Tech Tags that say what was used and when.
   */
  it("Work keeps the notes, a Result label per Case Study, and every Tech Tag", () => {
    const text = textOf(panel(panels.work.id).inner);

    expect(text).toContain(caseStudiesCopy.note);
    expect(text).toContain(projectsCopy.note);
    expect(text.split(caseStudiesCopy.resultLabel)).toHaveLength(caseStudies.length + 1);
    for (const card of [...caseStudies, ...projects]) {
      for (const techTag of card.techTags) {
        expect(text).toContain(`${techTag.name} ${techTag.year}`);
      }
    }
  });

  it("Skills holds the Skills and the Tools, each under its own heading", () => {
    expect(
      headingsOf(panel(panels.skills.id).inner).map((heading) => heading.text),
    ).toEqual([panels.skills.label, headings.skills, headings.tools]);
  });

  it("Experience holds every Role and then Education", () => {
    const inner = panel(panels.experience.id).inner;

    expect(headingsOf(inner).map((heading) => heading.text)).toEqual([
      panels.experience.label,
      ...experience.map((entry) => entry.title),
      headings.education,
    ]);
    for (const entry of education) {
      expect(textOf(inner)).toContain(entry.qualification);
    }
  });

  /**
   * The email and each profile link are the targets, and the copyright line
   * is the last thing on the page: nothing hangs below it.
   */
  it("Contact holds the email, the profile links and, last, the copyright line", () => {
    const inner = panel(panels.contact.id).inner;
    const text = textOf(inner);

    expect(inner).toContain(`href="mailto:${contact.email}"`);
    for (const link of profileLinks(links)) {
      expect(inner).toContain(`href="${link.href}"`);
    }
    expect(
      inOrder(text, [
        contact.email,
        ...profileLinks(links).map((link) => link.label),
        contactCopy.copyright,
      ]),
    ).toBe(true);
    expect(text.endsWith(contactCopy.copyright)).toBe(true);
  });
});

describe("Nav", () => {
  const [nav, ...more] = elements(html, "nav");
  const anchors = elements(nav.inner, "a");

  it("is the one labelled <nav> on the page", () => {
    expect(more).toEqual([]);
    expect(nav.attributes["aria-label"]).toBeTruthy();
  });

  /** One link per Panel, to that Panel's id, in the order the Panels come. */
  it("links every Panel by id, in Panel order, by its label", () => {
    const toPanels = anchors.filter((anchor) =>
      anchor.attributes.href.startsWith("#"),
    );

    expect(toPanels.map((anchor) => anchor.attributes.href)).toEqual(
      order.map((entry) => `#${entry.id}`),
    );
    expect(toPanels.map((anchor) => textOf(anchor.inner))).toEqual(
      order.map((entry) => entry.label),
    );
  });

  /**
   * Before any JavaScript runs the page is at the top, so Home is the lit
   * link. The observer moves it from there.
   */
  it("lights the Home link and no other at first paint", () => {
    const lit = anchors.filter(
      (anchor) => anchor.attributes["aria-current"] === "page",
    );

    expect(lit.map((anchor) => anchor.attributes.href)).toEqual([
      `#${panels.home.id}`,
    ]);
  });

  it('carries the "Get in touch" button', () => {
    const button = anchors.find(
      (anchor) => anchor.attributes.href === `mailto:${contact.email}`,
    );

    expect(button).toBeDefined();
    expect(textOf(button?.inner ?? "")).toBe(contact.callToAction);
  });
});

describe("The page", () => {
  /** The footer's content lives in the Contact Panel now, and nothing hangs below it. */
  it("has no footer", () => {
    expect(html).not.toMatch(/<footer\b/);
  });

  /**
   * Every picture on the page is one a visitor is meant to read: the sketch
   * and the three badges, and no other. Each carries words for a screen
   * reader, so none is announced as "image".
   */
  it("shows the sketch and the three badges, each with alt text, and no other picture", () => {
    const found = images(html);

    expect(found).toHaveLength(1 + certifications.length);
    for (const image of found) {
      expect(image.alt?.trim(), image.src).toBeTruthy();
    }
  });

  /**
   * The Panels sit in one `<main>`, the Strip, and a keyboard can reach it:
   * the arrow keys move it a screen at a time, and a thing that takes keys
   * must be something a Tab can land on.
   */
  it("keeps the Panels in one focusable main", () => {
    const [main, ...more] = elements(html, "main");

    expect(more).toEqual([]);
    expect(main.attributes.tabindex).toBe("0");
    expect(elements(main.inner, "section")).toHaveLength(order.length);
  });

  /**
   * One URL and one outline: the Headline is the h1 and the first heading
   * read, and no heading after it skips a level. A search engine and a screen
   * reader both read the page as the outline the headings make. That the
   * Panel headings come in Panel order is held above, Panel by Panel.
   */
  it("opens with the Headline and skips no heading level", () => {
    const found = headingsOf(html);

    expect(found[0]).toEqual({ level: 1, text: contact.headline });
    expect(outlineProblems(found)).toEqual([]);
  });
});
