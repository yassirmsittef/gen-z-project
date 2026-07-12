"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/money";

export function ProfileForm({
  initialName,
  initialAvatarUrl,
  initialBio,
  initialCurrency,
}: {
  initialName: string | null;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  initialCurrency: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
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
        <Label htmlFor="avatarUrl">Avatar (URL, optionnel)</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={initialAvatarUrl ?? ""}
          placeholder="https://.../avatar.jpg"
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
