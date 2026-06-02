import { SITE } from "@lib/site";
import { ImageResponse } from "next/og";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#000000",
        color: "#ffffff",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 44 }}>
        <span style={{ color: "#4ade80", fontWeight: 700 }}>&gt;_</span>
        <span style={{ color: "#9ca3af", marginLeft: 20, fontSize: 30 }}>
          alexng.dev
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800 }}>
          {SITE.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            color: "#9ca3af",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Founding engineer at Futurity. Full-stack TypeScript &amp; Rust.
        </div>
      </div>
    </div>,
    size,
  );
}
