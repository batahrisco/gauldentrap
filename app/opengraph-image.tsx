import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

// Generated at build time so link previews carry our own branding — the
// reference site's OG image was baked with its name, logo and domain.
export const alt = "Gauldentrap — Premium Cannabis, Ships Worldwide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const root = process.cwd();
  // TTF, not the woff2 the site loads — satori rejects woff2 outright
  // ("Unsupported OpenType signature wOF2").
  const bebas = readFileSync(path.join(root, "app/fonts/bebas-neue-latin.ttf"));
  const logo = readFileSync(path.join(root, "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const STATS = [
    ["924+", "Products"],
    ["6", "Countries"],
    ["30-Day", "Guarantee"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080808",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* gold hairline down the top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg,#4a3600,#ffc61a,#4a3600)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={132} height={132} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Bebas",
                fontSize: 88,
                color: "#ffc61a",
                letterSpacing: 6,
                lineHeight: 1,
              }}
            >
              GAULDENTRAP
            </div>
            <div style={{ fontSize: 22, color: "#8d8578", letterSpacing: 8, marginTop: 8 }}>
              PREMIUM DISPENSARY
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 34, color: "#f0ece2", lineHeight: 1.35 }}>
            Flower · Edibles · Vapes · Concentrates · Hash
          </div>
          <div style={{ fontSize: 26, color: "#8d8578" }}>
            Lab tested · Discreetly shipped worldwide · gauldentrap.com
          </div>
        </div>

        <div style={{ display: "flex", gap: 64, borderTop: "1px solid #222", paddingTop: 28 }}>
          {STATS.map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "Bebas", fontSize: 60, color: "#ffc61a", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 20, color: "#8d8578", letterSpacing: 3, marginTop: 6 }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Bebas", data: bebas, style: "normal", weight: 400 }],
    }
  );
}
