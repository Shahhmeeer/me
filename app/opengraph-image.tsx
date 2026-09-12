import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PICTURE_COLOURS } from "@/app/picture-colours";
import { contact, shareCard, sketch } from "@/content/site";

/**
 * The picture on a shared link, drawn at build time from the content module.
 *
 * It repeats the top of the Home Panel in the site's own dark colours: the
 * name, the Headline and the pitch on the left, the pencil sketch as a tilted
 * paper card on the right, so the preview in a chat window looks like the
 * page it opens. Next.js serves this for the Open Graph card and, with no
 * twitter-image beside it, the Twitter card too.
 *
 * The sketch is read from `public` here and handed over as a data URL,
 * because ImageResponse draws from what it is given and never fetches a
 * path. The file is the one the Home Panel shows, so the Pictures check
 * already holds it on disk at the size the content claims.
 */

export const alt = shareCard.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const background = PICTURE_COLOURS["--portfolio-background"];
const foreground = PICTURE_COLOURS["--portfolio-foreground"];
const muted = PICTURE_COLOURS["--portfolio-muted"];
const accent = PICTURE_COLOURS["--portfolio-accent"];

const sketchSrc = `data:image/png;base64,${await readFile(
  join(process.cwd(), "public", sketch.src),
  "base64",
)}`;

/** The sketch's width on the card, and its height at the file's own aspect. */
const sketchWidth = 340;
const sketchHeight = Math.round((sketchWidth * sketch.height) / sketch.width);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "80px 96px",
          background,
          color: foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
            {contact.name}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 40, color: accent }}>
            {contact.headline}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 28,
              lineHeight: 1.4,
              color: muted,
            }}
          >
            {contact.pitch}
          </div>
          <div style={{ display: "flex", marginTop: 48, fontSize: 24, color: muted }}>
            {shareCard.url.replace(/^https:\/\//, "")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: sketchWidth,
            height: sketchHeight,
            flexShrink: 0,
            borderRadius: 24,
            overflow: "hidden",
            transform: "rotate(3deg)",
            boxShadow: "0 2px 4px rgb(0 0 0 / 0.4), 0 32px 64px -16px rgb(0 0 0 / 0.7)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws a plain <img>; next/image has no page to optimise for here */}
          <img src={sketchSrc} alt="" width={sketchWidth} height={sketchHeight} />
        </div>
      </div>
    ),
    size,
  );
}
