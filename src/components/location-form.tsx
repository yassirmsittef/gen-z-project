"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateLocationAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES } from "@/lib/cities";

/**
 * Ville du profil : saisie assistée par datalist sur la liste officielle
 * (src/lib/cities.ts). Vide = on disparaît du globe — la localisation reste
 * un choix, jamais une capture.
 */
export function LocationForm({ initialCity }: { initialCity: string | null }) {
  const [state, formAction, pending] = useActionState(updateLocationAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="city">Ta ville</Label>
        <Input
          id="city"
          name="city"
          list="cities-suggestions"
          defaultValue={initialCity ?? ""}
          placeholder="ex : Marseille — commence à taper"
          autoComplete="off"
        />
        <datalist id="cities-suggestions">
          {CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {`${city.name} — ${city.country}`}
            </option>
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Elle te place sur le globe de la{" "}
          <Link href="/communaute" className="font-medium text-primary hover:underline">
            page Communauté
          </Link>{" "}
          (position de la ville, jamais ta position exacte). Laisse vide pour ne pas y
          apparaître.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-success">
          {state.removed ? "Tu n'apparais plus sur le globe." : "Ville enregistrée."}
        </p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
