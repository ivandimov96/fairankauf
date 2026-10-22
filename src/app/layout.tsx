import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} – schnell, fair und ohne Stress`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – schnell, fair und ohne Stress`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  // German-only site: stop browsers from auto-translating it (e.g. "Marke" into "brand").
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  themeColor: "#1b1c1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" translate="no" className={`${geistSans.variable} ${bricolage.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
