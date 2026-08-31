"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Megaphone, Pause, Play, Target, Volume2, VolumeX } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { ReportButton } from "@/components/report-button";
import { UserAvatar } from "@/components/user-avatar";
import { removeVideoAction } from "@/actions/call-videos";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type VideoDuFilRendu = {
  id: string;
  url: string | null;
  posterUrl: string | null;
  caption: string;
  createdAt: string;
  author: { id: string; name: string | null; avatarUrl: string | null };
  call: { slug: string; target: string; category: string; voix: number };
  peutRetirer: boolean;
};

/**
 * Le fil vertical. Défilement magnétique natif (`scroll-snap`) plutôt qu'un
 * moteur JavaScript : c'est le navigateur qui gère l'inertie, donc ça reste
 * fluide sur un téléphone modeste, et ça marche encore si le JS tombe.
 *
 * UNE seule vidéo joue à la fois, décidée par IntersectionObserver et non par
 * un calcul de position au scroll : pas de lecture de layout pendant le
 * défilement, donc pas de saccade.
 *
 * Le son est COUPÉ au départ — c'est ce que tous les navigateurs exigent pour
 * autoriser la lecture automatique, et c'est aussi la politesse minimale
 * quand quelqu'un ouvre une page. Le premier geste de l'utilisateur peut le
 * rétablir, et ce choix vaut ensuite pour tout le fil.
 */
export function VideoFeed({
  initiales,
  curseurInitial,
  autoriseSuite = true,
}: {
  initiales: VideoDuFilRendu[];
  curseurInitial: string | null;
  autoriseSuite?: boolean;
}) {
  const t = useT("calls");
  const [videos, setVideos] = useState(initiales);
  const [curseur, setCurseur] = useState(curseurInitial);

  // Le fil se resynchronise quand le serveur renvoie une liste différente.
  // Sans ça, `revalidatePath("/direct")` re-rendait bien l'arbre serveur mais
  // l'état local gardait l'ancienne liste : un témoignage qu'on venait de
  // retirer restait affiché, légende comprise, jusqu'au rechargement complet
  // de la page. On ne compare que les identifiants — comparer les objets
  // rejouerait à chaque rendu.
  const [signature, setSignature] = useState(() => initiales.map((v) => v.id).join());
  const signatureServeur = initiales.map((v) => v.id).join();
  if (signatureServeur !== signature) {
    setSignature(signatureServeur);
    setVideos(initiales);
    setCurseur(curseurInitial);
  }
  const [chargeEnCours, setChargeEnCours] = useState(false);
  const [actif, setActif] = useState(0);
  const [muet, setMuet] = useState(true);
  const [enPause, setEnPause] = useState(false);
  // Les vidéos que le navigateur du visiteur n'a pas su décoder.
  const [illisibles, setIllisibles] = useState<Set<string>>(new Set());

  const conteneur = useRef<HTMLDivElement>(null);
  const lecteurs = useRef<(HTMLVideoElement | null)[]>([]);
  // `prefers-reduced-motion` : on ne déclenche aucune lecture automatique.
  const [mouvementReduit, setMouvementReduit] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lire = () => setMouvementReduit(mq.matches);
    lire();
    mq.addEventListener("change", lire);
    return () => mq.removeEventListener("change", lire);
  }, []);

  const chargerLaSuite = useCallback(async () => {
    if (!autoriseSuite || !curseur || chargeEnCours) return;
    setChargeEnCours(true);
    try {
      const r = await fetch(`/api/videos?cursor=${encodeURIComponent(curseur)}`);
      if (r.ok) {
        const data = (await r.json()) as { videos: VideoDuFilRendu[]; cursor: string | null };
        setVideos((v) => [...v, ...data.videos]);
        setCurseur(data.cursor);
      }
    } finally {
      setChargeEnCours(false);
    }
  }, [autoriseSuite, curseur, chargeEnCours]);

  // Qui est à l'écran ? Un seuil haut (60 %) évite de basculer sur la vidéo
  // suivante dès qu'elle pointe le nez pendant un défilement rapide.
  useEffect(() => {
    const noeuds = conteneur.current?.querySelectorAll<HTMLElement>("[data-index]");
    if (!noeuds?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActif(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { threshold: 0.6 }
    );
    noeuds.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [videos.length]);

  // Lecture exclusive : la vidéo active joue, toutes les autres se taisent ET
  // se rembobinent — sinon on retrouve une vidéo à mi-parcours en remontant.
  useEffect(() => {
    lecteurs.current.forEach((v, i) => {
      if (!v) return;
      if (i === actif) {
        v.muted = muet;
        if (!mouvementReduit && !enPause) void v.play().catch(() => undefined);
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
    // Trois écrans avant la fin : on va chercher la suite.
    if (actif >= videos.length - 3) void chargerLaSuite();
  }, [actif, muet, enPause, mouvementReduit, videos.length, chargerLaSuite]);

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold">{t("videoFeed.emptyHeading")}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t("videoFeed.emptyBody")}</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/appels">{t("videoFeed.seeCalls")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Réglages persistants du fil, hors de la pile qui défile. */}
      <div className="pointer-events-none absolute right-4 top-4 z-30 flex flex-col gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="pointer-events-auto"
          aria-pressed={!muet}
          title={muet ? t("videoFeed.soundOn") : t("videoFeed.soundOff")}
          onClick={() => setMuet((m) => !m)}
        >
          {muet ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
          <span className="sr-only">{muet ? t("videoFeed.soundOn") : t("videoFeed.soundOff")}</span>
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="pointer-events-auto"
          aria-pressed={enPause}
          title={enPause ? t("videoFeed.resume") : t("videoFeed.pause")}
          onClick={() => setEnPause((p) => !p)}
        >
          {enPause ? <Play aria-hidden /> : <Pause aria-hidden />}
          <span className="sr-only">
            {enPause ? t("videoFeed.resumePlayback") : t("videoFeed.pause")}
          </span>
        </Button>
      </div>

      <div
        ref={conteneur}
        className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-2xl"
        style={{ scrollbarWidth: "none" }}
      >
        {videos.map((video, index) => (
          <article
            key={video.id}
            data-index={index}
            className="relative flex h-[calc(100dvh-4rem)] snap-start items-center justify-center overflow-hidden bg-black"
          >
            {video.url && illisibles.has(video.id) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                {video.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.posterUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain opacity-40"
                  />
                )}
                <p className="relative text-sm font-semibold">{t("videoFeed.unreadable")}</p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-sm text-secondary underline-offset-4 hover:underline"
                >
                  {t("videoFeed.openInNewTab")}
                </a>
              </div>
            )}

            {video.url && !illisibles.has(video.id) && (
              // Muet + `playsInline` : sans ces deux-là, aucun navigateur
              // mobile n'autorise la lecture automatique.
              <video
                ref={(el) => {
                  lecteurs.current[index] = el;
                  // Le décodage échoue souvent AVANT l'hydratation : à ce
                  // moment-là `onError` de React n'est pas encore branché et
                  // l'événement passe sans témoin. On relit donc l'état de
                  // l'élément au montage, sinon le repli n'apparaît qu'après
                  // un rechargement — c'est-à-dire jamais, pour le visiteur.
                  if (el?.error) {
                    setIllisibles((prev) =>
                      prev.has(video.id) ? prev : new Set(prev).add(video.id)
                    );
                  }
                }}
                src={video.url}
                poster={video.posterUrl ?? undefined}
                loop
                muted
                playsInline
                preload={index <= 1 ? "auto" : "none"}
                controls={mouvementReduit}
                className="h-full w-full object-contain"
                onClick={() => setEnPause((p) => !p)}
                onError={() => setIllisibles((s) => new Set(s).add(video.id))}
              />
            )}

            {/* Voile bas : garantit la lisibilité du texte sur n'importe quelle image. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(11,14,20,0.92),transparent)]"
            />

            <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
              <Link
                href={`/appels/${video.call.slug}`}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-3.5 py-1.5 backdrop-blur-md transition-colors duration-200 hover:bg-secondary/30"
              >
                <Target aria-hidden className="h-3.5 w-3.5 shrink-0 text-secondary" />
                <span className="data-label text-secondary">{t("videoFeed.noLongerWants")}</span>
                <span translate="no" className="truncate font-semibold text-foreground">
                  {video.call.target}
                </span>
              </Link>

              <p className="max-w-2xl text-sm leading-relaxed text-foreground/95 sm:text-base">
                {video.caption}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/u/${video.author.id}`}
                  className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-secondary"
                >
                  <UserAvatar
                    name={video.author.name}
                    avatarUrl={video.author.avatarUrl}
                    className="h-8 w-8"
                  />
                  <span className="font-medium">
                    {video.author.name ?? t("videoFeed.memberFallback")}
                  </span>
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Megaphone aria-hidden className="h-3.5 w-3.5" />
                  <span className="font-mono tabular-nums">{video.call.voix}</span>{" "}
                  {t("videoFeed.voicesOnCall", { count: video.call.voix })}
                </span>
                <span className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-xs text-muted-foreground">
                  {CATEGORY_LABELS[video.call.category as keyof typeof CATEGORY_LABELS]}
                </span>

                <span className="ml-auto flex items-center gap-1">
                  <ReportButton targetType="CALL_VIDEO" targetId={video.id} iconOnly />
                  {video.peutRetirer && (
                    <form action={removeVideoAction}>
                      <input type="hidden" name="videoId" value={video.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        {t("videoFeed.withdraw")}
                      </Button>
                    </form>
                  )}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground">{t("videoFeed.hostDisclaimer")}</p>
            </div>
          </article>
        ))}

        {chargeEnCours && (
          <p className={cn("py-6 text-center text-sm text-muted-foreground")}>
            {t("videoFeed.loading")}
          </p>
        )}
      </div>
    </div>
  );
}
