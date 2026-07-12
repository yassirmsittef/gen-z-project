import type { MetadataRoute } from "next";

/** PWA installable : « Ajouter à l'écran d'accueil » aux couleurs de GeniGain. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GeniGain — la communauté qui finance ta génération",
    short_name: "GeniGain",
    description:
      "Contribue aux projets de ta génération, vote les preuves d'avancement, débloque les fonds étape par étape.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0E14",
    theme_color: "#0B0E14",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
