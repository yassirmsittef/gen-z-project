"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { updateProfileAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { CURRENCIES } from "@/lib/money";

/**
 * Recadre la photo en carré centré et la compresse en webp 512 px DANS le
 * navigateur : l'upload pèse ~50 Ko au lieu de plusieurs Mo, et le serveur
 * n'a jamais à redimensionner. Rend null si le navigateur ne sait pas faire
 * (l'original passera s'il est raisonnable).
 */
async function squareWebp(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const size = Math.min(512, side);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    );
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (!blob) return null;
    return new File([blob], "avatar.webp", { type: "image/webp" });
  } catch {
    return null;
  }
}

export function ProfileForm({
  initialName,
  initialAvatarUrl,
  initialBio,
  initialCurrency,
  initialLinks,
}: {
  initialName: string | null;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  initialCurrency: string;
  initialLinks: string[];
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Aperçu local de la photo choisie + drapeau « retirer » (exclusifs).
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const shownAvatar = removed ? null : (preview ?? initialAvatarUrl);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const input = event.target;
    const original = input.files?.[0];
    if (!original) return;

    const resized = await squareWebp(original);
    if (resized) {
      // On remplace le fichier de l'input par la version compressée : le
      // submit reste un formulaire natif, sans état parallèle.
      const dt = new DataTransfer();
      dt.items.add(resized);
      input.files = dt.files;
    } else if (original.size > 900_000) {
      // Pas de recadrage possible ET fichier trop lourd pour l'action serveur.
      input.value = "";
      setFileError("Image trop lourde — choisis une photo de moins de 1 Mo.");
      return;
    }

    setRemoved(false);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(input.files![0]);
    });
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="avatarFile">Photo de profil</Label>
        <div className="flex items-center gap-4">
          {/* La photo elle-même est le bouton : le geste que tout le monde
              tente en premier. Voile caméra au survol et au focus clavier. */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={shownAvatar ? "Changer la photo de profil" : "Ajouter une photo de profil"}
            className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <UserAvatar
              name={initialName}
              avatarUrl={shownAvatar}
              className="h-16 w-16 border-0 text-xl"
            />
            <span
              className="absolute inset-0 flex items-center justify-center rounded-full bg-background/65 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            >
              <Camera className="h-5 w-5 text-foreground" />
            </span>
          </button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera aria-hidden />
              {shownAvatar ? "Changer la photo" : "Ajouter une photo"}
            </Button>
            {shownAvatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRemoved(true);
                  setPreview((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return null;
                  });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <Trash2 aria-hidden />
                Retirer
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          id="avatarFile"
          name="avatarFile"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFileChange}
          aria-describedby="avatar-hint"
        />
        <input type="hidden" name="removeAvatar" value={removed ? "1" : ""} />
        <p id="avatar-hint" className="text-xs text-muted-foreground">
          Recadrée en carré automatiquement. Visible sur ton profil, tes projets et tes
          messages.
        </p>
        {fileError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {fileError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Pseudo</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName ?? ""}
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio (280 caractères max, optionnel)</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={initialBio ?? ""}
          maxLength={280}
          placeholder="Qui tu es, ce que tu crées, ce que tu cherches."
        />
        <p className="text-xs text-muted-foreground">
          Affichée sur ton profil public, à côté de ta réputation et de tes projets.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="link-1">Tes liens (3 max, optionnel)</Label>
        {[0, 1, 2].map((i) => (
          <Input
            key={i}
            id={i === 0 ? "link-1" : undefined}
            name="links"
            type="url"
            defaultValue={initialLinks[i] ?? ""}
            placeholder={
              ["https://instagram.com/toi", "https://tiktok.com/@toi", "https://tonsite.fr"][i]
            }
            aria-label={`Lien ${i + 1}`}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Site, réseaux, portfolio — affichés sur ton profil public (https uniquement).
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredCurrency">Ma devise</Label>
        <select
          id="preferredCurrency"
          name="preferredCurrency"
          defaultValue={initialCurrency}
          className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Les montants de ton dashboard s&apos;affichent dans cette devise (conversion
          indicative au taux du jour). Seule la jauge des 50&nbsp;$ pour poster reste en
          dollars.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm font-medium text-success">Profil enregistré.</p>}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
