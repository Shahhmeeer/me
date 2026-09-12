import { describe, expect, it } from "vitest";

import { elements, headingsOf, images, outlineProblems, textOf } from "./markup";

describe("textOf", () => {
  it("strips the tags and reads back what React escaped", () => {
    expect(textOf('<span class="x">Hey, I&#x27;m <b>here</b> &amp; there</span>')).toBe(
      "Hey, I'm here & there",
    );
  });
});

describe("elements", () => {
  const html =
    '<nav aria-label="Panels"><a href="#home" aria-current="page">Home</a><a href="#work">Work</a></nav>' +
    '<section id="home"><h1>One</h1></section><section id="work"></section>';

  it("finds every element of a name, in document order, with its attributes", () => {
    expect(elements(html, "section").map((element) => element.attributes.id)).toEqual([
      "home",
      "work",
    ]);
  });

  it("keeps the inner HTML so a reader can look inside", () => {
    const [nav] = elements(html, "nav");

    expect(nav.attributes["aria-label"]).toBe("Panels");
    expect(elements(nav.inner, "a").map((link) => link.attributes.href)).toEqual([
      "#home",
      "#work",
    ]);
  });

  it("reads a bare attribute as present and empty", () => {
    expect(elements('<a href="#x" hidden></a>', "a")[0].attributes.hidden).toBe("");
  });

  it("finds nothing when the element is absent", () => {
    expect(elements(html, "footer")).toEqual([]);
  });
});

describe("images", () => {
  it("finds every <img>, in document order, with its attributes", () => {
    const html =
      '<div><img alt="A sketch" src="/a.png"/><p>text</p><img alt="" src="/b.png"></div>';

    expect(images(html).map((image) => image.alt)).toEqual(["A sketch", ""]);
    expect(images(html).map((image) => image.src)).toEqual(["/a.png", "/b.png"]);
  });

  it("finds nothing when there is no image", () => {
    expect(images("<p>text</p>")).toEqual([]);
  });
});

describe("headingsOf", () => {
  it("lists every heading in reading order with its level and text", () => {
    expect(headingsOf("<h1>Top</h1><p>x</p><h2 id='a'>Next <em>one</em></h2><h3>Deep</h3>")).toEqual(
      [
        { level: 1, text: "Top" },
        { level: 2, text: "Next one" },
        { level: 3, text: "Deep" },
      ],
    );
  });
});

describe("outlineProblems", () => {
  it("accepts one h1 followed by headings that never skip a level", () => {
    expect(
      outlineProblems(headingsOf("<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h3>E</h3><h4>F</h4>")),
    ).toEqual([]);
  });

  it("rejects a page with no h1, or with two", () => {
    expect(outlineProblems(headingsOf("<h2>A</h2><h3>B</h3>"))).toContainEqual(
      "The page must have one <h1>, but has 0: ",
    );
    expect(outlineProblems(headingsOf("<h1>A</h1><h1>B</h1>"))).toEqual([
      "The page must have one <h1>, but has 2: A, B",
    ]);
  });

  it("rejects a heading that skips a level", () => {
    expect(outlineProblems(headingsOf("<h1>A</h1><h3>C</h3>"))).toEqual([
      '"C" is an <h3> after an <h1>, skipping a level',
    ]);
  });

  it("rejects a page that opens below h1", () => {
    expect(outlineProblems(headingsOf("<h2>A</h2><h1>B</h1>"))).toContainEqual(
      '"A" is an <h2> after an <h0>, skipping a level',
    );
  });
});
