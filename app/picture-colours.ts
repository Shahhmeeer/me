/**
 * The colour tokens, for the pictures drawn at build time.
 *
 * Colour is declared once in app/globals.css, and the page reads it from
 * there. The share image and the tab icon cannot: ImageResponse draws from
 * inline styles and never sees a stylesheet. So the values are repeated here,
 * once, keyed by the same token names, and tests/theme.test.ts holds this
 * copy equal to the stylesheet. A token retuned in the CSS then fails the
 * build instead of leaving the pictures a shade behind the page.
 *
 * The site has one light theme (ADR-0006), so the pictures are light too: a
 * shared link then previews as the page it opens.
 */
export const PICTURE_COLOURS = {
  "--portfolio-background": "#f2e2ba",
  "--portfolio-foreground": "#33342f",
  "--portfolio-muted": "#50514f",
  "--portfolio-accent": "#2f5c85",
  "--portfolio-on-accent": "#f2e2ba",
} as const;
