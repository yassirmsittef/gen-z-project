import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";

/**
 * Carte de partage dynamique d'un projet : titre, pitch, progression — DA
 * nuit/aurora. Satori ne supporte pas les fragments React : chaque niveau est
 * une vraie div flex explicite.
 */

export const runtime = "nodejs";
export const alt = "Projet GeniGain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIGIL_PATH =
  "M-1.520,-1.700 L-1.020,-0.550 L-0.780,0.400 L-0.500,0.820 L-0.220,0.720 L0.000,2.050 L0.220,0.720 L0.500,0.820 L0.780,0.400 L1.020,-0.550 L1.520,-1.700 L0.620,-1.180 L0.000,-0.850 L-0.620,-1.180 Z M-0.880,-0.800 L-0.280,0.100 L-0.620,0.380 Z M0.880,-0.800 L0.620,0.380 L0.280,0.100 Z";

function chipStyle(color: string, border: string, background: string) {
  return {
    display: "flex",
    alignItems: "center",
    padding: "6px 20px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    backgroundColor: background,
    color,
    fontSize: 24,
    textTransform: "uppercase" as const,
    letterSpacing: 3,
  };
}

export default async function ProjectOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      title: true,
      pitch: true,
      raised: true,
      goal: true,
      category: true,
      status: true,
    },
  });

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B0E14",
            color: "#F1F5F9",
            fontSize: 64,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          GeniGain
        </div>
      ),
      size
    );
  }

  const percent = Math.min(100, Math.round((project.raised / Math.max(1, project.goal)) * 100));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          padding: 64,
          backgroundColor: "#0B0E14",
          backgroundImage:
            "radial-gradient(50% 60% at 80% 0%, rgba(56,189,248,0.20), transparent 70%)",
          color: "#F1F5F9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={chipStyle("#38BDF8", "rgba(56,189,248,0.45)", "rgba(56,189,248,0.12)")}>
            {CATEGORY_LABELS[project.category]}
          </div>
          <div style={chipStyle("#94A3B8", "rgba(148,163,184,0.35)", "transparent")}>
            {STATUS_LABELS[project.status]}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              fontSize: project.title.length > 40 ? 54 : 66,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.05,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              fontSize: 30,
              color: "#94A3B8",
              lineHeight: 1.35,
            }}
          >
            {project.pitch.length > 120 ? `${project.pitch.slice(0, 117)}...` : project.pitch}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 16,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.max(2, percent)}%`,
                height: 16,
                borderRadius: 999,
                backgroundImage: "linear-gradient(120deg, #5EEAD4, #38BDF8)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 30 }}>
              {project.raised.toLocaleString("fr-FR")} / {project.goal.toLocaleString("fr-FR")}{" "}
              tokens · {percent}%
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <svg width="42" height="48" viewBox="-1.9 -2.1 3.8 4.5">
                <path d={SIGIL_PATH} fill="#38BDF8" fillRule="evenodd" />
              </svg>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>GeniGain</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
