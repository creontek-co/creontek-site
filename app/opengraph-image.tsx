import { ImageResponse } from "next/og";
import { WORDMARK_D, WORDMARK_VIEWBOX } from "@/lib/logo-paths";

export const alt = "CreonTek: technology that moves businesses forward";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0B0B0C",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
      }}
    >
      <svg width="330" height="55" viewBox={WORDMARK_VIEWBOX} fill="#FFFFFF">
        <path d={WORDMARK_D} fillRule="evenodd" />
      </svg>
      <div
        style={{
          display: "flex",
          color: "#FFFFFF",
          fontSize: 76,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          maxWidth: 900,
        }}
      >
        We build technology that moves businesses forward.
      </div>
      <div style={{ display: "flex", width: 120, height: 3, background: "#2F5BFF" }} />
    </div>,
    size,
  );
}
