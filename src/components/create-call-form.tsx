"use client";

import { useActionState } from "react";
import { ShieldAlert } from "lucide-react";
import { createCallAction } from "@/actions/boycott";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CALL_CHARTER,
  CATEGORY_LABELS,
  MAX_CALL_REASON,
  MAX_CALL_SOURCES,
  MAX_CALL_WANTED,
  MIN_CALL_REASON,
  MIN_CALL_WANTED,
} from "@/lib/constants";

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Publier un appel. La charte est AU-DESSUS du formulaire et non repliée :
 * un membre qui écrit son appel doit avoir lu ce qui l'engage avant la
 * première touche, pas après l'avoir envoyé.
 */
export function CreateCallForm() {
  const [state, formAction, pending] = useActionState(createCallAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <section className="glass rounded-2xl rounded-tr-sm p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldAlert aria-hidden className="h-5 w-5 text-secondary" />
          Ce que tu signes en publiant
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Ton appel est publié sous ton nom. GeniGain héberge ce fil, ne l&apos;écrit pas et ne
          le fait pas sien — tu restes responsable de ce que tu affirmes.
        </p>
        <ul className="space-y-2">
          {CALL_CHARTER.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/70"
              />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="call-target">La marque ou l&apos;entreprise</Label>
          <Input
            id="call-target"
            name="target"
            required
            minLength={2}
            maxLength={60}
            autoComplete="off"
            placeholder="Le nom, simplement…"
          />
          <p className="text-xs text-muted-foreground">
            Une entreprise — jamais une personne ni une communauté.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="call-category">Le secteur à remplacer</Label>
          <select id="call-category" name="category" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Choisir…
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            C&apos;est là que les porteurs viendront chercher des appels à prendre.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-reason">Pourquoi tu n&apos;en veux plus</Label>
        <Textarea
          id="call-reason"
          name="reason"
          required
          rows={6}
          minLength={MIN_CALL_REASON}
          maxLength={MAX_CALL_REASON}
          placeholder="Raconte ce que tu as constaté, vécu, lu. Distingue ce que tu sais de ce que tu supposes…"
        />
        <p className="text-xs text-muted-foreground">
          {MIN_CALL_REASON} caractères minimum. Les faits que tu avances t&apos;engagent — les
          sources sont là pour ça.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-wanted">Ce que tu veux à la place</Label>
        <Textarea
          id="call-wanted"
          name="wanted"
          required
          rows={4}
          minLength={MIN_CALL_WANTED}
          maxLength={MAX_CALL_WANTED}
          placeholder="Le produit ou le service que tu achèterais demain s'il existait — et à quelles conditions…"
        />
        <p className="text-xs text-muted-foreground">
          C&apos;est la partie qui fait naître un projet. Sois précis : un porteur doit pouvoir
          la lire comme un cahier des charges.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-sources">Sources (facultatif)</Label>
        <Textarea
          id="call-sources"
          name="sources"
          rows={3}
          spellCheck={false}
          autoComplete="off"
          placeholder={"https://…\nhttps://…"}
        />
        <p className="text-xs text-muted-foreground">
          Un lien par ligne, {MAX_CALL_SOURCES} maximum, en https. Un appel sourcé résiste ; un
          appel sans source tombe au premier signalement.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Publication…" : "Publier l'appel"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Tu pourras le retirer toi-même à tout moment.
        </p>
      </div>
    </form>
  );
}
