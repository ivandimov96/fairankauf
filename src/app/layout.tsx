import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairAnkauf – Auto schnell und fair verkaufen",
  description: "Verkaufen Sie Ihr Auto schnell, fair und ohne Aufwand.",
};

export const viewport: Viewport = {
  themeColor: "#1f6b4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
