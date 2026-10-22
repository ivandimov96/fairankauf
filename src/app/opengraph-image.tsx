import { ImageResponse } from "next/og";

import { LOGO_BODY, LOGO_HEIGHT, LOGO_STRIPE, LOGO_VIEWBOX, LOGO_WIDTH } from "@/components/site/logo-paths";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} – schnell, fair und ohne Stress`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_W = 520;
const LOGO_H = Math.round((LOGO_W * LOGO_HEIGHT) / LOGO_WIDTH);

// Social preview (WhatsApp, Facebook, etc.). Rendered once at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#1b1c1f",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <svg width={LOGO_W} height={LOGO_H} viewBox={LOGO_VIEWBOX}>
          <path d={LOGO_BODY} fill="#ffffff" fillRule="evenodd" />
          <path d={LOGO_STRIPE} fill="#e3191f" fillRule="evenodd" />
        </svg>
        <div style={{ display: "flex", marginTop: 40, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          Wir kaufen&nbsp;<span style={{ color: "#e3191f" }}>Ihr Auto</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 40, fontWeight: 700 }}>Fair. Schnell. Ohne Stress.</div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#b8babf" }}>
          Kostenlos und unverbindlich · Abholung und Abmeldung inklusive
        </div>
      </div>
    ),
    size,
  );
}
