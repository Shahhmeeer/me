import { ImageResponse } from "next/og";
import { contact, shareCard } from "@/content/site";

/**
 * The picture on a shared link, drawn at build time from the content module.
 *
 * It repeats the Header in the site's own light colours, so the preview in a
 * chat window looks like the page it opens. Next.js serves this for the Open
 * Graph card and, with no twitter-image beside it, the Twitter card too.
 */

export const alt = shareCard.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The light-scheme tokens from app/globals.css. ImageResponse cannot read a
// stylesheet, so they are repeated here, and the contrast check does not
// measure them: a share image is a picture, not page text.
const background = "#fcfcfc";
const foreground = "#141414";
const muted = "#565656";
const accent = "#1d4ed8";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background,
          color: foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          {contact.name}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 52, color: accent }}>
          {contact.headline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 32,
            lineHeight: 1.4,
            color: muted,
            maxWidth: 960,
          }}
        >
          {contact.pitch}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 64,
            fontSize: 28,
            color: muted,
          }}
        >
          {shareCard.url.replace(/^https:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
