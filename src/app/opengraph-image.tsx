import { ImageResponse } from "next/og";

/** Carte de partage par défaut du site — nuit, sigil, dégradé aurora. */

export const alt = "Tremplin — La communauté qui finance ta génération";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIGIL_PATH =
  "M-1.520,-1.700 L-1.020,-0.550 L-0.780,0.400 L-0.500,0.820 L-0.220,0.720 L0.000,2.050 L0.220,0.720 L0.500,0.820 L0.780,0.400 L1.020,-0.550 L1.520,-1.700 L0.620,-1.180 L0.000,-0.850 L-0.620,-1.180 Z M-0.880,-0.800 L-0.280,0.100 L-0.620,0.380 Z M0.880,-0.800 L0.620,0.380 L0.280,0.100 Z";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#0B0E14",
          backgroundImage:
            "radial-gradient(55% 55% at 50% 20%, rgba(56,189,248,0.22), transparent 70%)",
          color: "#F1F5F9",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="150" height="170" viewBox="-1.9 -2.1 3.8 4.5">
          <defs>
            <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5EEAD4" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <path d={SIGIL_PATH} fill="url(#aurora)" fillRule="evenodd" />
        </svg>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
          Tremplin
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#94A3B8" }}>
          La communauté qui finance ta génération
        </div>
      </div>
    ),
    size
  );
}
