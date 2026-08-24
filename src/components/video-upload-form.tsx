"use client";

import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Video } from "lucide-react";
import { postVideoAction } from "@/actions/call-videos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_CAPTION,
  MAX_VIDEO_SECONDS,
  MIN_VIDEO_CAPTION,
  VIDEO_CONTENT_TYPES,
} from "@/lib/constants";

type Mesures = { durationMs: number; width: number; height: number; poster: Blob | null };

/**
 * Lit la vidéo choisie SANS l'envoyer : durée, dimensions, et une vignette
 * prise à la première image. Refuser une vidéo trop longue ici évite de faire
 * monter 30 Mo pour rien — et la vignette donne au fil une image nette avant
 * que la lecture démarre, au lieu d'un rectangle noir.
 */
function mesurer(file: File): Promise<Mesures> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const échouer = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Vidéo illisible — essaie un autre fichier (MP4 ou WebM)."));
    };
    video.onerror = échouer;

    video.onloadedmetadata = () => {
      const durationMs = Math.round(video.duration * 1000);
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!Number.isFinite(durationMs) || durationMs <= 0) return échouer();

      // On se place juste après le début : la toute première image est
      // souvent noire (fondu d'ouverture de la plupart des caméras).
      video.currentTime = Math.min(0.1, video.duration / 2);
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return resolve({ durationMs, width, height, poster: null });
        }
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
          (poster) => {
            URL.revokeObjectURL(url);
            resolve({ durationMs, width, height, poster });
          },
          "image/webp",
          0.7
        );
      };
    };

    video.src = url;
  });
}

/**
 * Publier un témoignage sous un appel.
 *
 * Le fichier ne passe PAS par l'action serveur — le corps d'une Server Action
 * est plafonné bien en dessous d'une vidéo. Le navigateur dépose directement
 * sur le stockage avec un jeton signé, puis l'action n'enregistre que l'URL
 * et les mesures.
 */
export function VideoUploadForm({ callId, target }: { callId: string; target: string }) {
  const [state, formAction, pending] = useActionState(postVideoAction, undefined);
  const [fichier, setFichier] = useState<File | null>(null);
  const [mesures, setMesures] = useState<Mesures | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState<"repos" | "televersement" | "enregistrement">("repos");

  // L'action serveur a refusé (plafond atteint, appel disparu, fichier déjà
  // publié) : on rouvre le formulaire. Sans ce retour au repos, le bouton
  // restait désactivé sur « Publication… » pour de bon — même en choisissant
  // un autre fichier — et le membre ne pouvait que recharger la page.
  // Comparaison avec la réponse précédente : on ne réagit qu'au CHANGEMENT,
  // sinon la remise à zéro rejouerait à chaque rendu.
  const [dernièreRéponse, setDernièreRéponse] = useState(state);
  if (state !== dernièreRéponse) {
    setDernièreRéponse(state);
    if (state?.error) setEnvoi("repos");
  }
  const [urls, setUrls] = useState<{ url: string; posterUrl?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function choisir(file: File | undefined) {
    setErreur(null);
    setMesures(null);
    setUrls(null);
    setFichier(null);
    if (!file) return;

    if (!(VIDEO_CONTENT_TYPES as readonly string[]).includes(file.type)) {
      return setErreur("Format non accepté — envoie un MP4, un WebM ou une vidéo iPhone.");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return setErreur(
        `Vidéo trop lourde (${Math.round(file.size / 1e6)} Mo). Maximum ${Math.round(MAX_VIDEO_BYTES / 1e6)} Mo — filme plus court ou en qualité moindre.`
      );
    }

    try {
      const m = await mesurer(file);
      if (m.durationMs > MAX_VIDEO_SECONDS * 1000) {
        return setErreur(
          `${Math.round(m.durationMs / 1000)} secondes, c'est trop long. ${MAX_VIDEO_SECONDS} secondes maximum.`
        );
      }
      setFichier(file);
      setMesures(m);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Vidéo illisible.");
    }
  }

  async function envoyer(event: React.FormEvent<HTMLFormElement>) {
    if (urls) return; // déjà téléversé : on laisse l'action serveur enregistrer
    event.preventDefault();
    if (!fichier || !mesures) return setErreur("Choisis d'abord une vidéo.");

    setErreur(null);
    setEnvoi("televersement");
    try {
      const blob = await upload(`temoignages/${Date.now()}-${fichier.name}`, fichier, {
        access: "public",
        handleUploadUrl: "/api/videos/upload",
      });
      let posterUrl: string | undefined;
      if (mesures.poster) {
        const p = await upload(`temoignages/posters/${Date.now()}.webp`, mesures.poster, {
          access: "public",
          handleUploadUrl: "/api/videos/upload",
          contentType: "image/webp",
        });
        posterUrl = p.url;
      }
      setUrls({ url: blob.url, posterUrl });
      setEnvoi("enregistrement");
      // Les champs cachés sont désormais remplis : on relance la soumission,
      // qui passera cette fois à l'action serveur.
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    } catch (e) {
      setEnvoi("repos");
      setErreur(e instanceof Error ? e.message : "Envoi impossible.");
    }
  }

  if (state?.success) {
    return (
      <div className="glass rounded-2xl rounded-tr-sm p-5">
        <p className="font-display text-lg font-semibold text-success">Ton témoignage est en ligne.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Il apparaît dans le direct, rattaché à l&apos;appel sur {target}.
        </p>
        <Button asChild className="mt-4">
          <a href="/direct">Voir le direct</a>
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={envoyer} className="glass rounded-2xl rounded-tr-sm p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Video aria-hidden className="h-5 w-5 text-secondary" />
        Filme ton témoignage
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {MAX_VIDEO_SECONDS} secondes maximum, {Math.round(MAX_VIDEO_BYTES / 1e6)} Mo max. Ta vidéo
        est publiée sous ton nom, rattachée à cet appel — et tu restes responsable de ce que tu y
        affirmes, exactement comme pour un appel écrit.
      </p>

      <input type="hidden" name="callId" value={callId} />
      <input type="hidden" name="url" value={urls?.url ?? ""} />
      <input type="hidden" name="posterUrl" value={urls?.posterUrl ?? ""} />
      <input type="hidden" name="durationMs" value={mesures?.durationMs ?? ""} />
      <input type="hidden" name="width" value={mesures?.width ?? ""} />
      <input type="hidden" name="height" value={mesures?.height ?? ""} />

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="video-fichier">Ta vidéo</Label>
        <input
          id="video-fichier"
          type="file"
          accept={VIDEO_CONTENT_TYPES.join(",")}
          onChange={(e) => void choisir(e.target.files?.[0])}
          className="block w-full cursor-pointer rounded-xl border border-input bg-background/60 p-2.5 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary/20 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-secondary"
        />
        {mesures && (
          <p className="text-xs text-muted-foreground">
            {Math.round(mesures.durationMs / 1000)} s · {mesures.width}×{mesures.height}
            {mesures.poster ? " · vignette capturée" : " · pas de vignette"}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="video-legende">Ce que montre ta vidéo</Label>
        <Textarea
          id="video-legende"
          name="caption"
          required
          rows={3}
          minLength={MIN_VIDEO_CAPTION}
          maxLength={MAX_VIDEO_CAPTION}
          placeholder="Dis en une phrase ce qu'on voit et ce que ça prouve…"
        />
      </div>

      {(erreur || state?.error) && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {erreur ?? state?.error}
        </p>
      )}

      <Button type="submit" disabled={pending || envoi !== "repos" || !fichier} className="mt-4">
        {envoi === "televersement"
          ? "Envoi de la vidéo…"
          : envoi === "enregistrement" || pending
            ? "Publication…"
            : "Publier mon témoignage"}
      </Button>
    </form>
  );
}
