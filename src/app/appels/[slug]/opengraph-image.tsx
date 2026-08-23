import { ImageResponse } from "next/og";
import { liveAnswer } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/lib/constants";

/**
 * Carte de partage d'un appel. C'est la pièce qui recrute : un appel ne vaut
 * que s'il circule, et ce qui donne envie de cliquer n'est pas la colère mais
 * le MANQUE — « personne ne l'a encore remplacé ». La carte met donc en avant
 * la marque visée, ce qu'on veut à la place, et le vide à combler.
 *
 * Teinte violette (communauté), pas le dégradé accent réservé à l'argent.
 * Satori ne supporte pas les fragments : chaque niveau est une div flex.
 */

export const runtime = "nodejs";
export const alt = "Appel au remplacement — GeniGain";
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

/** Coupe au dernier mot entier : une carte de partage ne tronque pas en plein mot. */
function extrait(texte: string, limite: number): string {
  if (texte.length <= limite) return texte;
  const coupe = texte.slice(0, limite);
  const espace = coupe.lastIndexOf(" ");
  return `${(espace > limite * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd()}…`;
}

function carteNeutre() {
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

export default async function AppelOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const call = await prisma.boycottCall.findUnique({
    where: { slug },
    select: {
      target: true,
      wanted: true,
      category: true,
      removedAt: true,
      _count: { select: { supports: true, answers: { where: liveAnswer } } },
    },
  });

  // Un appel retiré ne se partage pas : la carte ne doit pas survivre au
  // retrait dans les caches des réseaux.
  if (!call || call.removedAt) return carteNeutre();

  const voix = call._count.supports;
  const remplaçants = call._count.answers;

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
            "radial-gradient(55% 60% at 80% 0%, rgba(192,132,252,0.20), transparent 70%)",
          color: "#F1F5F9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={chipStyle("#C084FC", "rgba(192,132,252,0.45)", "rgba(192,132,252,0.12)")}>
            {CATEGORY_LABELS[call.category]}
          </div>
          <div
            style={
              remplaçants > 0
                ? chipStyle("#34D399", "rgba(52,211,153,0.4)", "rgba(52,211,153,0.12)")
                : chipStyle("#94A3B8", "rgba(148,163,184,0.35)", "transparent")
            }
          >
            {remplaçants > 0
              ? `${remplaçants} remplaçant${remplaçants > 1 ? "s" : ""}`
              : "Personne encore"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 5,
            }}
          >
            Ne veut plus de
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              fontSize: call.target.length > 22 ? 76 : 96,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.02,
            }}
          >
            {call.target}
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
            À la place :{" "}
            {extrait(call.wanted, 110)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#C084FC" }}>
              {voix}
            </div>
            <div style={{ display: "flex", fontSize: 30, color: "#94A3B8" }}>
              {voix > 1 ? "personnes veulent" : "personne veut"} ça remplacé
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="42" height="48" viewBox="-1.9 -2.1 3.8 4.5">
              <path d={SIGIL_PATH} fill="#C084FC" fillRule="evenodd" />
            </svg>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>GeniGain</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
