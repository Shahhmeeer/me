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
 * The site has one dark theme (ADR-0002), so the pictures are dark too: a
 * shared link then previews as the page it opens.
 */
export const PICTURE_COLOURS = {
  "--portfolio-background": "#1F1E1E",
  "--portfolio-foreground": "#E3D9DA",
  "--portfolio-muted": "#ABA1A2",
  "--portfolio-accent": "#6ED6D4",
  "--portfolio-on-accent": "#1F1E1E",
} as const;
