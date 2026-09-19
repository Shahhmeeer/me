import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import Home from "@/app/page";
import {
  about,
  barCopy,
  caseStudies,
  caseStudiesCopy,
  certifications,
  certificationsCopy,
  contact,
  contactCopy,
  education,
  experience,
  headings,
  links,
  navCopy,
  panelOrder,
  panels,
  profileLinks,
  projects,
  projectsCopy,
  sketch,
  sketchCutout,
  skills,
  tools,
} from "@/content/site";
import {
  afterId,
  afterTitle,
  elements,
  headingsOf,
  idsOf,
  images,
  inOrder,
  inputs,
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

/** How many Projects share a Spread: a grid of two by two. */
const PROJECTS_PER_SPREAD = 4;

/**
 * How many Spreads each Panel is, in Panel order, cut from the content by
 * the rule each Panel lays itself out by: Home is the Hero and the
 * certifications; Work one per Case Study and one per four Projects;
 * Skills one; Experience one per Role; Contact one.
 */
const spreadCounts = [
  2,
  caseStudies.length + Math.ceil(projects.length / PROJECTS_PER_SPREAD),
  1,
  experience.length,
  1,
];

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
   * Every Panel beyond Home says its heading and then its line before any
   * of its content, so a Recruiter arriving on it knows what it holds, and
   * says both once: a Panel of several Spreads, Work or Experience, names
   * itself on its first Spread and not again on each, so a visitor sliding
   * through Work reads "Work" and its line, then the Case Studies and the
   * Projects.
   */
  it("read, beyond Home, their heading and then their line before their content, once", () => {
    for (const entry of beyondHome) {
      const text = textOf(panel(entry.id).inner);
      const [beforeLine, ...afterLine] = text.split(entry.line);

      expect(entry.line.trim(), entry.id).not.toBe("");
      expect(beforeLine.trim(), `${entry.id} reads only its heading first`).toBe(entry.label);
      expect(afterLine, `${entry.id} says its line once`).toHaveLength(1);
    }
  });

  /**
   * No Spread counts itself: the Strip flows past a Spread rather than
   * stopping on it (ADR-0005), so there are no stops to number, and a
   * `02 / 04` would promise a stop that is not there. Read across the
   * whole page, the Hero included, which once said `Home · 01 / 02`.
   */
  it("count no Spread anywhere on the page", () => {
    expect(textOf(html)).not.toMatch(/\d\d \/ \d\d/);
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
   * The address opens a mail client from Home and from Contact, where a
   * visitor reads it: the Nav's button stopped doing that when it went to
   * Contact, and these two are what it points a visitor at.
   */
  it("Home and Contact each link the email address by mailto", () => {
    for (const id of [panels.home.id, panels.contact.id]) {
      const toMail = elements(panel(id).inner, "a").filter(
        (anchor) => anchor.attributes.href === `mailto:${contact.email}`,
      );

      expect(toMail.length, id).toBeGreaterThanOrEqual(1);
    }
  });

  /**
   * The one picture of Shahmeer, and the words a screen reader says in its
   * place: they name him, because for some visitors the words are the picture.
   * It is the cutout, the drawing with its paper taken away; the paper sketch
   * is the Share Card's now and is drawn nowhere on the page.
   */
  it("Home shows the cutout, with alt text that names Shahmeer, and not the paper sketch", () => {
    const found = images(panel(panels.home.id).inner).find(
      (image) => image.alt === sketchCutout.alt,
    );

    expect(found).toBeDefined();
    expect(found?.alt).toContain(contact.name);
    expect(images(html).map((image) => image.src)).not.toContain(sketch.src);
  });

  /**
   * The Disc the portrait rises out of: a Blob in the teal of the borders,
   * drawn where the cutout is and just before it, so it sits behind the head
   * and not somewhere on the Panel. Read as the last Blob before the cutout,
   * after the words, since the Panel's own wash is drawn before everything.
   * That it is a disc and not a wash, and how far it drifts, is the
   * stylesheet's, held by `tests/theme.test.ts`.
   */
  it("Home draws a teal Blob just before the cutout, behind it", () => {
    const home = panel(panels.home.id).inner;
    const cutoutAt = home.indexOf(`alt="${sketchCutout.alt}"`);
    const lastWordAt = home.indexOf(about[about.length - 1]);
    const [disc, ...more] = blobsOf(home.slice(lastWordAt, cutoutAt));

    expect(lastWordAt, "the last About sentence, as written").toBeGreaterThan(-1);
    expect(cutoutAt).toBeGreaterThan(lastWordAt);
    expect(more).toEqual([]);
    expect(disc).toContain("--portfolio-accent-border");
  });

  /**
   * Home is two Spreads: the Hero, which names the Panel, `Home` before the
   * greeting, so the Headline is still the first thing said large; and the
   * certifications after the About sentences, which open on their heading
   * and do not name the Panel again, since the Hero named it once.
   */
  it("Home reads its label once, before the greeting, and not again before the certifications", () => {
    const text = textOf(panel(panels.home.id).inner);
    const lastAbout = about[about.length - 1];
    const [, afterAbout] = text.split(lastAbout);
    const [beforeCertifications] = afterAbout.split(headings.certifications);

    expect(text.startsWith(`${panels.home.label}${contact.greeting}`)).toBe(true);
    expect(inOrder(text, [lastAbout, headings.certifications])).toBe(true);
    expect(beforeCertifications).not.toContain(panels.home.label);
  });

  /**
   * The certifications Spread, the second of Home: its heading, its line,
   * the verify link with the email address beside it, then each badge with
   * its name and the month it was awarded, in content order. The band the
   * cards replaced is gone: no certification is read on the Hero, and each
   * name is read once on the whole page. Cut at the heading, in the HTML,
   * so the badges' alt text is still there to be read in its place.
   */
  it("Home's second Spread reads heading, line, the verify link, the email, then each badge, name and date", () => {
    const inner = panel(panels.home.id).inner;
    const at = inner.search(new RegExp(`<h2[^>]*>${headings.certifications}</h2>`));
    const [hero, second] = [inner.slice(0, at), inner.slice(at)];
    const badges = images(second);

    expect(at).toBeGreaterThan(0);
    expect(
      inOrder(second, [
        headings.certifications,
        certificationsCopy.line,
        certificationsCopy.verify.label,
        contact.email,
        ...certifications.flatMap((certification) => [
          certification.logo.alt,
          certification.name,
          certification.awarded,
        ]),
      ]),
    ).toBe(true);
    expect(badges.map((badge) => badge.alt)).toEqual(
      certifications.map((certification) => certification.logo.alt),
    );
    for (const certification of certifications) {
      expect(textOf(hero)).not.toContain(certification.name);
      expect(textOf(html).split(certification.name)).toHaveLength(2);
    }
  });

  /**
   * The verify link leaves the site for Salesforce's page, in a new tab,
   * with the attributes every outside link wears, so this page is not lost
   * and the new one gets no handle on it.
   */
  it("Home's verify link opens Salesforce's page in a new tab, cut off from this one", () => {
    const [link, ...more] = elements(panel(panels.home.id).inner, "a").filter(
      (anchor) => anchor.attributes.href === certificationsCopy.verify.href,
    );

    expect(more).toEqual([]);
    expect(textOf(link.inner)).toBe(certificationsCopy.verify.label);
    expect(link.attributes.target).toBe("_blank");
    expect(link.attributes.rel).toBe("noopener noreferrer");
  });

  /**
   * The outline of Home: the Headline as the h1, then Certifications as
   * the one h2, so a screen reader lists the credentials right after who
   * he is. Nothing else on Home is a heading.
   */
  it("Home is headed by the Headline and then Certifications, and nothing else", () => {
    expect(headingsOf(panel(panels.home.id).inner)).toEqual([
      { level: 1, text: contact.headline },
      { level: 2, text: headings.certifications },
    ]);
  });

  /**
   * The outline of Work, Spread by Spread: the Panel's h2 once, in the first
   * eyebrow; the Case Studies heading with it; each Case Study's title as the
   * Spread's own heading, one level down; then the Projects Spread and its
   * cards. Later eyebrows are plain text, so the h2 is read once.
   */
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
   * The Projects Spreads come after the Case Studies, each headed Projects
   * and holding four cards at most, the last one whatever is left, so a
   * Recruiter sees everything that can be opened at once; with the two
   * Projects there are today, that is one Spread of two cards. Read so that
   * a Project added is a content edit and nothing else, here included. A
   * Projects Spread is what follows a saying of the Projects heading, as a
   * heading on the first and as plain text on any that continues it.
   */
  it("Work holds every Project card on its Projects Spreads, four at most to each", () => {
    const spreads = afterTitle(panel(panels.work.id).inner, headings.projects);
    const cards = spreads.map((spread) => elements(spread, "article").length);

    expect(cards).toHaveLength(Math.ceil(projects.length / PROJECTS_PER_SPREAD));
    expect(cards.slice(0, -1)).toEqual(cards.slice(0, -1).map(() => PROJECTS_PER_SPREAD));
    expect(cards[cards.length - 1]).toBe(projects.length % PROJECTS_PER_SPREAD || PROJECTS_PER_SPREAD);
  });

  /**
   * A link to one Case Study lands on it: each Case Study Spread carries the
   * Case Study's id, and the Projects Spread the Projects id, inside Work,
   * so `#payment-gateway-integrations` lands on that Spread the way `#work`
   * lands on the Panel. What is read after each id opens on what that
   * Spread opens on, the Panel's label for the first and the title for
   * every other, so the id is on the Spread and not on something inside it.
   */
  it("Work carries each Case Study's id and the Projects id, one Spread to each", () => {
    const work = panel(panels.work.id).inner;
    const landings = [
      ...caseStudies.map((caseStudy) => [caseStudy.id, caseStudy.title]),
      [projectsCopy.id, headings.projects],
    ];

    for (const [index, [id, title]] of landings.entries()) {
      const after = afterId(work, id);

      expect(after, id).toHaveLength(1);
      expect(
        textOf(after[0]).startsWith(index === 0 ? panels.work.label : title),
        id,
      ).toBe(true);
    }
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

  /**
   * Skills is one Spread: the Skills heading is its title with every Skill
   * under it, and the Tools heading and every Tool are the card beside them.
   * Read as the order a visitor meets them in, after the label and the line.
   */
  it("Skills reads label, line, the Skills and then the Tools, each under its heading", () => {
    const inner = panel(panels.skills.id).inner;

    expect(headingsOf(inner).map((heading) => heading.text)).toEqual([
      panels.skills.label,
      headings.skills,
      headings.tools,
    ]);
    expect(
      inOrder(textOf(inner), [
        panels.skills.label,
        panels.skills.line,
        headings.skills,
        ...skills,
        headings.tools,
        ...tools,
      ]),
    ).toBe(true);
  });

  /**
   * The outline of Experience: the Panel's h2 once, in the first eyebrow;
   * each Role's title as its Spread's own heading, one level down; and
   * Education, which is not a Role and keeps a heading of its own, last.
   */
  it("Experience holds every Role and then Education", () => {
    const inner = panel(panels.experience.id).inner;

    expect(headingsOf(inner).map((heading) => heading.text)).toEqual([
      panels.experience.label,
      ...experience.map((entry) => entry.title),
      headings.education,
    ]);
  });

  /**
   * Each Role's Highlights are read inside that Role's Spread and nowhere
   * else, with the employer, the place and the dates before them: a
   * Highlight only means something with an employer attached to it, and a
   * Recruiter reading one Spread reads what was done at that one job. A
   * Role's Spread is cut at the Role's id, which the Spread carries, and
   * runs to the next Role's.
   */
  it("Experience reads each Role's card, Highlights included, on that Role's Spread only", () => {
    const inner = panel(panels.experience.id).inner;
    const starts = experience.map((entry) => inner.indexOf(` id="${entry.id}"`));
    const spreads = starts.map((at, index) => inner.slice(at, starts[index + 1]));

    expect(starts.every((at, index) => at > (starts[index - 1] ?? -1))).toBe(true);
    for (const [index, entry] of experience.entries()) {
      const text = textOf(spreads[index]);
      const lines = entry.highlights.map((highlight) => highlight.line);

      expect(
        inOrder(text, [entry.title, entry.employer, entry.location, entry.start, entry.end, ...lines]),
        entry.id,
      ).toBe(true);
      for (const [other, spread] of spreads.entries()) {
        if (other !== index) {
          for (const line of lines) {
            expect(textOf(spread), `${entry.id} on Spread ${other + 1}`).not.toContain(line);
          }
        }
      }
    }
  });

  /**
   * The degree is read after the last Role's Highlights and before Contact,
   * so the history reads back to 2019 unbroken, on Experience's last
   * Spread: a Recruiter checking for gaps reads the two together.
   */
  it("Experience reads the degree after the last Role's Highlights, before Contact", () => {
    const last = experience[experience.length - 1];
    const text = textOf(html);

    expect(
      inOrder(text, [
        ...last.highlights.map((highlight) => highlight.line),
        headings.education,
        ...education.flatMap((entry) => [entry.qualification, entry.start, entry.end]),
        panels.contact.label,
      ]),
    ).toBe(true);
    expect(textOf(panel(panels.experience.id).inner)).toContain(headings.education);
  });

  /**
   * A link to one Role lands on it: each Role Spread carries the Role's id,
   * so `#scaleable-solutions` lands on that Spread the way `#experience`
   * lands on the Panel. What is read after each id opens on what that
   * Spread opens on, the Panel's label for the first and the Role's title
   * for every other, so the id is on the Spread and not on something
   * inside it.
   */
  it("Experience carries each Role's id, one Spread to each", () => {
    const inner = panel(panels.experience.id).inner;

    for (const [index, entry] of experience.entries()) {
      const after = afterId(inner, entry.id);

      expect(after, entry.id).toHaveLength(1);
      expect(
        textOf(after[0]).startsWith(index === 0 ? panels.experience.label : entry.title),
        entry.id,
      ).toBe(true);
    }
  });

  /**
   * Contact is one Spread. Its left column reads the label, the line, the
   * email address as the title and a link to it, then each Profile and the
   * CV, then the copyright line; and the copyright line is the last thing
   * on the page, so nothing hangs below it. The address is the one link on
   * the page a browser can open a mail client from, so it is read as a
   * heading: a screen reader lists it with the Panels.
   */
  it("Contact reads label, line, the email as a linked title, the profile links, and the copyright last", () => {
    const inner = panel(panels.contact.id).inner;
    const text = textOf(inner);
    const [label, title] = headingsOf(inner);

    expect(label).toEqual({ level: 2, text: panels.contact.label });
    expect(title).toEqual({ level: 3, text: contact.email });
    expect(inner).toMatch(
      new RegExp(`<h3\\b[^>]*>[\\s\\S]*?href="mailto:${contact.email}"[\\s\\S]*?</h3>`),
    );
    for (const link of profileLinks(links)) {
      expect(inner).toContain(`href="${link.href}"`);
    }
    expect(
      inOrder(text, [
        panels.contact.label,
        panels.contact.line,
        contact.email,
        ...profileLinks(links).map((link) => link.label),
        contactCopy.copyright,
      ]),
    ).toBe(true);
    expect(text.endsWith(contactCopy.copyright)).toBe(true);
  });

  /**
   * The form (ADR-0004): a plain post to the route's path, so it works
   * before any script runs and with none. Three fields, each named to a
   * visitor by a `<label>` bound to it, so a screen reader says what each
   * is for and a click on the word lands in the box; the email typed so a
   * phone offers the right keyboard; all three required, so an empty post
   * is stopped in the browser. And the Send button, labelled from the
   * content module like every other word here.
   */
  it("Contact posts a form of three labelled, required fields and a Send button", () => {
    const [form, ...more] = elements(panel(panels.contact.id).inner, "form");
    const { fields } = contactCopy.form;
    const labels = elements(form.inner, "label");
    const boxes = [
      ...inputs(form.inner),
      ...elements(form.inner, "textarea").map((area) => area.attributes),
    ];

    expect(more).toEqual([]);
    expect(form.attributes.method).toBe("post");
    expect(form.attributes.action).toBe(contactCopy.form.action);

    for (const field of [fields.name, fields.email, fields.message]) {
      const box = boxes.find((candidate) => candidate.name === field.name);
      const label = labels.find((candidate) => candidate.attributes.for === box?.id);

      expect(box, field.name).toBeDefined();
      expect(box?.id, field.name).toBeTruthy();
      expect(box?.required, field.name).toBeDefined();
      expect(box?.placeholder, field.name).toBe(field.placeholder);
      expect(textOf(label?.inner ?? ""), field.name).toBe(field.label);
    }
    expect(boxes.find((box) => box.name === fields.email.name)?.type).toBe("email");

    const [button, ...moreButtons] = elements(form.inner, "button");
    expect(moreButtons).toEqual([]);
    expect(button.attributes.type).toBe("submit");
    expect(textOf(button.inner)).toBe(contactCopy.form.submit);
  });

  /**
   * The honeypot: a fourth field a human never meets, hidden from sight and
   * from the accessibility tree, out of the Tab order, and not filled in by
   * a browser's autofill either, so only a bot that fills every box fills
   * it. It is not required, because a human leaves it empty.
   */
  it("Contact hides the honeypot from a visitor, a screen reader, the Tab key and autofill", () => {
    const [form] = elements(panel(panels.contact.id).inner, "form");
    const { honeypot } = contactCopy.form;
    const box = inputs(form.inner).find((input) => input.name === honeypot.name);
    const hidden = elements(form.inner, "div").find(
      (div) => div.attributes["aria-hidden"] === "true",
    );

    expect(box).toBeDefined();
    expect(box?.autocomplete).toBe("off");
    expect(box?.tabindex).toBe("-1");
    expect(box?.required).toBeUndefined();
    expect(hidden?.inner).toContain(`name="${honeypot.name}"`);
  });

  /**
   * The success and failure lines are said after a post and never before
   * it: a visitor who has not written must not read "Thanks", and one who
   * has must not read that it failed.
   */
  it("Contact says neither the success nor the failure line at first paint", () => {
    const text = textOf(html);

    expect(text).not.toContain(contactCopy.form.success);
    expect(text).not.toContain(contactCopy.form.failure);
  });
});

/** The one `<nav>` a screen reader hears by this name. */
function navigation(label: string) {
  const found = elements(html, "nav").filter(
    (nav) => nav.attributes["aria-label"] === label,
  );

  expect(found, `one <nav> labelled "${label}"`).toHaveLength(1);
  return found[0];
}

describe("Nav", () => {
  const nav = navigation(navCopy.label);
  const anchors = elements(nav.inner, "a");

  /** Two navs and no more: the Nav over the Strip, and the Bar under it. */
  it("is one of the two labelled <nav>s on the page, the Bar the other", () => {
    expect(elements(html, "nav").map((found) => found.attributes["aria-label"])).toEqual([
      navCopy.label,
      barCopy.label,
    ]);
  });

  /**
   * One link per Panel, to that Panel's id, in the order the Panels come,
   * and those are the list: the button after the list also points into the
   * page, and is not a sixth Panel.
   */
  it("lists every Panel by id, in Panel order, by its label", () => {
    const [list, ...moreLists] = elements(nav.inner, "ul");
    const toPanels = elements(list.inner, "a");

    expect(moreLists).toEqual([]);
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

  /**
   * The button goes to Contact, where the Form and the address both are,
   * and not to a mail client: a Recruiter on a locked-down laptop has no
   * mail client to open, and the address is still there to copy. Nothing
   * in the Nav opens mail.
   */
  it('carries the "Get in touch" button, linking to Contact', () => {
    const button = anchors.find(
      (anchor) => textOf(anchor.inner) === contact.callToAction,
    );

    expect(button?.attributes.href).toBe(`#${panels.contact.id}`);
    expect(
      anchors.filter((anchor) => anchor.attributes.href.startsWith("mailto:")),
    ).toEqual([]);
  });
});

describe("Bar", () => {
  const bar = navigation(barCopy.label);
  const groups = elements(bar.inner, "ul");
  const dots = groups.flatMap((group) => elements(group.inner, "button"));

  /**
   * One group of dots per Panel, in Panel order, with as many dots as the
   * Panel has Spreads, cut from the same content arrays the Panels lay
   * themselves out by, so a Recruiter counts five groups and reads how
   * deep each one goes.
   */
  it("groups one dot per Spread by Panel, five groups in Panel order", () => {
    expect(groups.map((group) => elements(group.inner, "button").length)).toEqual(
      spreadCounts,
    );
  });

  /**
   * Each dot is named by its Spread's title, in Strip order: the Headline
   * for the Hero, then Certifications, each Case Study, Projects, the
   * Skills heading, each Role, and the email address. That is what a
   * screen reader lists and what a pointer over a dot reads, so a
   * Recruiter can jump to the Case Study they want.
   */
  it("names every dot by its Spread's title, in Strip order", () => {
    expect(dots.map((dot) => dot.attributes["aria-label"])).toEqual([
      contact.headline,
      headings.certifications,
      ...caseStudies.map((caseStudy) => caseStudy.title),
      headings.projects,
      headings.skills,
      ...experience.map((entry) => entry.title),
      contact.email,
    ]);
    for (const dot of dots) {
      expect(dot.attributes.type).toBe("button");
    }
  });

  /**
   * Before any JavaScript runs the page is at the top, so the Hero's dot is
   * the lit one and there is nowhere back to go; the arrow on is live. The
   * observer in the Strip moves it from there.
   */
  it("lights the first dot, disables the arrow back and not the arrow on, at first paint", () => {
    const buttons = elements(bar.inner, "button");
    const lit = dots.filter((dot) => dot.attributes["aria-current"] === "true");
    const previous = buttons.find((button) => button.attributes["aria-label"] === barCopy.previous);
    const next = buttons.find((button) => button.attributes["aria-label"] === barCopy.next);

    expect(lit.map((dot) => dot.attributes["aria-label"])).toEqual([contact.headline]);
    expect(previous?.attributes.disabled).toBeDefined();
    expect(next?.attributes.disabled).toBeUndefined();
  });

  /** The hint is on the page at first paint, from the content module, as a live region switched off. */
  it("says the hint, live off, at first paint", () => {
    const hint = elements(bar.inner, "p").find(
      (paragraph) => textOf(paragraph.inner) === barCopy.hint,
    );

    expect(hint?.attributes["aria-live"]).toBe("off");
    expect(hint?.attributes["data-spent"]).toBe("false");
  });
});

describe("The page", () => {
  /** The footer's content lives in the Contact Panel now, and nothing hangs below it. */
  it("has no footer", () => {
    expect(html).not.toMatch(/<footer\b/);
  });

  /**
   * Every picture on the page is one a visitor is meant to read: the cutout
   * and the three badges, and no other. Each carries words for a screen
   * reader, so none is announced as "image".
   */
  it("shows the cutout and the three badges, each with alt text, and no other picture", () => {
    const found = images(html);

    expect(found).toHaveLength(1 + certifications.length);
    for (const image of found) {
      expect(image.alt?.trim(), image.src).toBeTruthy();
    }
  });

  /**
   * A hash in the address lands on one element: every id on the page is
   * written once. The Panel ids, the heading ids that label them, and now
   * the Spread ids, all share the one page, and a Case Study id that
   * matched a Panel's would leave the browser to pick between them.
   */
  it("writes every id once", () => {
    const ids = idsOf(html);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size, ids.join(", ")).toBe(ids.length);
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
