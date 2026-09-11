/**
 * The light-scheme colour tokens, for the pictures drawn at build time.
 *
 * Colour is declared once per scheme in app/globals.css, and the page reads
 * it from there. The share image and the tab icon cannot: ImageResponse draws
 * from inline styles and never sees a stylesheet. So the light values are
 * repeated here, once, keyed by the same token names, and tests/contrast.test.ts
 * holds this copy equal to the stylesheet. A token retuned in the CSS then
 * fails the build instead of leaving the pictures a shade behind the page.
 *
 * The light scheme, because a shared link is read on the sharing app's own
 * background, which is usually light.
 */
export const PICTURE_COLOURS = {
  "--portfolio-background": "#fcfcfc",
  "--portfolio-foreground": "#141414",
  "--portfolio-muted": "#565656",
  "--portfolio-accent": "#1d4ed8",
  "--portfolio-on-accent": "#ffffff",
} as const;
