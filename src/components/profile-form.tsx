"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { updateProfileAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useT } from "@/components/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
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
  initialLanguage,
  initialCurrency,
  initialLinks,
}: {
  initialName: string | null;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  initialLanguage: Locale;
  initialCurrency: string;
  initialLinks: string[];
}) {
  const t = useT("account");
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
      setFileError(t("profileForm.fileTooHeavy"));
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
        <Label htmlFor="avatarFile">{t("profileForm.avatarLabel")}</Label>
        <div className="flex items-center gap-4">
          {/* La photo elle-même est le bouton : le geste que tout le monde
              tente en premier. Voile caméra au survol et au focus clavier. */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={shownAvatar ? t("profileForm.changeAvatarAria") : t("profileForm.addAvatarAria")}
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
              {shownAvatar ? t("profileForm.changePhoto") : t("profileForm.addPhoto")}
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
                {t("profileForm.removePhoto")}
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
          {t("profileForm.avatarHint")}
        </p>
        {fileError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {fileError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">{t("profileForm.nameLabel")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName ?? ""}
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">{t("profileForm.bioLabel")}</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={initialBio ?? ""}
          maxLength={280}
          placeholder={t("profileForm.bioPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">
          {t("profileForm.bioHint")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="link-1">{t("profileForm.linksLabel")}</Label>
        {[0, 1, 2].map((i) => (
          <Input
            key={i}
            id={i === 0 ? "link-1" : undefined}
            name="links"
            type="url"
            defaultValue={initialLinks[i] ?? ""}
            placeholder={
              [
                t("profileForm.linkPlaceholder1"),
                t("profileForm.linkPlaceholder2"),
                t("profileForm.linkPlaceholder3"),
              ][i]
            }
            aria-label={t("profileForm.linkAria", { num: i + 1 })}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          {t("profileForm.linksHint")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredLanguage">{t("profileForm.languageLabel")}</Label>
        {/* Chaque langue s'affiche dans sa propre langue — un menu de langues
            doit rester lisible quelle que soit celle de l'interface. */}
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          defaultValue={initialLanguage}
          className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {t("profileForm.languageHint")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredCurrency">{t("profileForm.currencyLabel")}</Label>
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
          {t("profileForm.currencyHint")}
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm font-medium text-success">{t("profileForm.success")}</p>}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? t("profileForm.submitPending") : t("profileForm.submit")}
      </Button>
    </form>
  );
}
