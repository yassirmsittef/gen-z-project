"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { CityMarker } from "@/components/earth-scene";

/**
 * Wrapper client du globe : import dynamique (Three.js hors du bundle
 * serveur) + traduction « clic sur une ville » → navigation ?ville= (la liste
 * des membres est filtrée côté serveur, URL partageable).
 */

const EarthScene = dynamic(() => import("@/components/earth-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="data-label animate-pulse-slow">Initialisation du globe…</p>
    </div>
  ),
});

type Props = {
  markers: CityMarker[];
  selectedCity: string | null;
  /** Recherche texte en cours (préservée dans l'URL quand on change de ville). */
  query: string;
};

export function CommunityGlobe({ markers, selectedCity, query }: Props) {
  const router = useRouter();

  const onSelectCity = useCallback(
    (city: string | null) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (city) params.set("ville", city);
      const qs = params.toString();
      router.replace(`/communaute${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, query]
  );

  return <EarthScene markers={markers} selectedCity={selectedCity} onSelectCity={onSelectCity} />;
}
