import { ImageResponse } from "next/og";

export const alt = "FairAnkauf – Auto schnell und fair verkaufen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#173f33",
          color: "#f8f4ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#f4c430",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 32 32">
              <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#173f33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
            Fair<span style={{ color: "#f4c430" }}>Ankauf</span>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>
          Auto verkaufen. Fair. Ohne Stress.
        </div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#cfd8d2" }}>
          Kostenlos und unverbindlich · Abholung und Abmeldung inklusive
        </div>
      </div>
    ),
    size,
  );
}
