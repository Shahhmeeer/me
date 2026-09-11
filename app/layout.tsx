import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { contact, shareCard } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The Share Card, as the tags a crawler reads. The image itself comes from
 * app/opengraph-image.tsx, which Next.js adds to both cards on its own; the
 * icon comes from app/icon.tsx the same way.
 */
export const metadata: Metadata = {
  metadataBase: new URL(shareCard.url),
  title: shareCard.title,
  description: shareCard.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: shareCard.title,
    description: shareCard.description,
    siteName: contact.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: shareCard.title,
    description: shareCard.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
         * The reveal in app/globals.css hides a block until JavaScript marks
         * it arrived. With JavaScript off nothing ever would, so this hands
         * every block straight back and the page reads in full.
         */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>.reveal{opacity:1;transform:none}</style>",
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
