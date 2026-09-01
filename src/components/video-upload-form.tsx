"use client";

import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Video } from "lucide-react";
import { postVideoAction } from "@/actions/call-videos";
import { useT } from "@/components/i18n-provider";
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
function mesurer(file: File, messageIllisible: string): Promise<Mesures> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const échouer = () => {
      URL.revokeObjectURL(url);
      reject(new Error(messageIllisible));
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
  const t = useT("calls");
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
      return setErreur(t("videoUploadForm.formatRejected"));
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return setErreur(
        t("videoUploadForm.tooHeavy", {
          size: Math.round(file.size / 1e6),
          max: Math.round(MAX_VIDEO_BYTES / 1e6),
        })
      );
    }

    try {
      const m = await mesurer(file, t("videoUploadForm.unreadableRetry"));
      if (m.durationMs > MAX_VIDEO_SECONDS * 1000) {
        return setErreur(
          t("videoUploadForm.tooLong", {
            seconds: Math.round(m.durationMs / 1000),
            max: MAX_VIDEO_SECONDS,
          })
        );
      }
      setFichier(file);
      setMesures(m);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("videoUploadForm.unreadable"));
    }
  }

  async function envoyer(event: React.FormEvent<HTMLFormElement>) {
    if (urls) return; // déjà téléversé : on laisse l'action serveur enregistrer
    event.preventDefault();
    if (!fichier || !mesures) return setErreur(t("videoUploadForm.chooseFirst"));

    setErreur(null);
    setEnvoi("televersement");
    try {
      // On demande d'abord la permission. Sans ça, un refus du serveur
      // (direct plein, quota du jour atteint) revenait en « Failed to
      // retrieve the client token » : @vercel/blob lève sa propre erreur sans
      // lire notre réponse. Et le fichier serait déjà monté pour rien.
      const permission = await fetch("/api/videos/quota").then((r) => r.json());
      if (!permission.ok) {
        setEnvoi("repos");
        return setErreur(permission.raison ?? t("videoUploadForm.publishImpossible"));
      }

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
      setErreur(e instanceof Error ? e.message : t("videoUploadForm.sendImpossible"));
    }
  }

  if (state?.success) {
    return (
      <div className="glass rounded-2xl rounded-se-sm p-5">
        <p className="font-display text-lg font-semibold text-success">
          {t("videoUploadForm.successHeading")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("videoUploadForm.successBody", { target })}
        </p>
        <Button asChild className="mt-4">
          <a href="/direct">{t("videoUploadForm.seeLive")}</a>
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={envoyer} className="glass rounded-2xl rounded-se-sm p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Video aria-hidden className="h-5 w-5 text-secondary" />
        {t("videoUploadForm.heading")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("videoUploadForm.intro", {
          maxSeconds: MAX_VIDEO_SECONDS,
          maxMb: Math.round(MAX_VIDEO_BYTES / 1e6),
        })}
      </p>

      <input type="hidden" name="callId" value={callId} />
      <input type="hidden" name="url" value={urls?.url ?? ""} />
      <input type="hidden" name="posterUrl" value={urls?.posterUrl ?? ""} />
      <input type="hidden" name="durationMs" value={mesures?.durationMs ?? ""} />
      <input type="hidden" name="width" value={mesures?.width ?? ""} />
      <input type="hidden" name="height" value={mesures?.height ?? ""} />

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="video-fichier">{t("videoUploadForm.fileLabel")}</Label>
        <input
          id="video-fichier"
          type="file"
          accept={VIDEO_CONTENT_TYPES.join(",")}
          onChange={(e) => void choisir(e.target.files?.[0])}
          className="block w-full cursor-pointer rounded-xl border border-input bg-background/60 p-2.5 text-sm file:me-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary/20 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-secondary"
        />
        {mesures && (
          <p className="text-xs text-muted-foreground">
            {t(
              mesures.poster ? "videoUploadForm.fileMetaPoster" : "videoUploadForm.fileMetaNoPoster",
              {
                seconds: Math.round(mesures.durationMs / 1000),
                width: mesures.width,
                height: mesures.height,
              }
            )}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="video-legende">{t("videoUploadForm.captionLabel")}</Label>
        <Textarea
          id="video-legende"
          name="caption"
          required
          rows={3}
          minLength={MIN_VIDEO_CAPTION}
          maxLength={MAX_VIDEO_CAPTION}
          placeholder={t("videoUploadForm.captionPlaceholder")}
        />
      </div>

      {(erreur || state?.error) && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {erreur ?? state?.error}
        </p>
      )}

      <Button type="submit" disabled={pending || envoi !== "repos" || !fichier} className="mt-4">
        {envoi === "televersement"
          ? t("videoUploadForm.uploading")
          : envoi === "enregistrement" || pending
            ? t("videoUploadForm.publishing")
            : t("videoUploadForm.submit")}
      </Button>
    </form>
  );
}
