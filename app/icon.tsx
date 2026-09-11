import { ImageResponse } from "next/og";
import { contact } from "@/content/site";

/**
 * The browser-tab icon: Shahmeer's initials on the site's accent colour,
 * drawn at build time so the tab matches the page. Replaces the Next.js
 * default favicon.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The first letter of each word of the name: "Shahmeer Asim" is "SA". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          background: "#1d4ed8",
          color: "#ffffff",
          fontSize: 30,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        {initials(contact.name)}
      </div>
    ),
    size,
  );
}
