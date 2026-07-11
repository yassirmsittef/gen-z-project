"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES } from "@/lib/cities";

function GoogleButton() {
  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou</span>
        </div>
      </div>
      <form action={signInWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full">
          Continuer avec Google
        </Button>
      </form>
    </>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="toi@exemple.fr" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      {googleEnabled && <GoogleButton />}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Pseudo</Label>
          <Input id="name" name="name" autoComplete="nickname" placeholder="Ton pseudo" required minLength={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="toi@exemple.fr" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">
            Ta ville <span className="font-normal text-muted-foreground">(optionnel)</span>
          </Label>
          <Input
            id="city"
            name="city"
            list="register-cities"
            autoComplete="off"
            placeholder="ex : Lyon — pour apparaître sur le globe"
          />
          <datalist id="register-cities">
            {CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {`${city.name} — ${city.country}`}
              </option>
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">
            Position de la ville sur le globe Communauté, jamais ta position exacte. Modifiable
            à tout moment.
          </p>
        </div>

        {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte (+5 tokens offerts)"}
        </Button>
      </form>

      {googleEnabled && <GoogleButton />}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
