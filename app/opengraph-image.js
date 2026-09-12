import { siteConfig } from "@/lib/site-config";
import { ImageResponse } from "next/og";

export const alt = `${siteConfig.name} — Computer Parts, Laptops & PC Builder in Bangladesh`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_CHIPS = [
  "Component",
  "Laptop",
  "Gaming",
  "Accessories",
  "Networking",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            R
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 700 }}>{siteConfig.name}</span>
            <span style={{ fontSize: 18, color: "#93c5fd", letterSpacing: 2 }}>
              {siteConfig.tagline}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            <span>Computer parts, laptops</span>
            <span>and custom PC builds</span>
          </div>
          <span style={{ fontSize: 26, color: "#cbd5e1" }}>
            Genuine products · EMI available · Nationwide delivery
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {CATEGORY_CHIPS.map((chip) => (
            <span
              key={chip}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid #334155",
                backgroundColor: "#1e293b",
                fontSize: 22,
                color: "#e2e8f0",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ),
    size
  );
}
