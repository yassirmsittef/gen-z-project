"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { CITIES } from "@/lib/cities";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { CURRENCIES } from "@/lib/money";

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
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
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

export function RegisterForm({
  googleEnabled,
  defaultLocale,
}: {
  googleEnabled: boolean;
  defaultLocale: Locale;
}) {
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
          <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
          <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirme le mot de passe</Label>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
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
        <div className="space-y-1.5">
          <Label htmlFor="preferredLanguage">Ta langue</Label>
          {/* Les noms de langue s'affichent CHACUN DANS SA LANGUE : un menu
              de langues doit se lire même quand l'interface parle une autre. */}
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            defaultValue={defaultLocale}
            className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            L&apos;interface, les notifications et les emails te parleront dans cette langue.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredCurrency">Ta devise</Label>
          <select
            id="preferredCurrency"
            name="preferredCurrency"
            defaultValue="eur"
            className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Tes montants s&apos;afficheront dans cette devise. Le droit de poster un projet
            reste compté en dollars (20&nbsp;$ contribués) : tes contributions y sont
            converties automatiquement au taux du jour.
          </p>
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="cgu"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgu" target="_blank" className="font-medium text-primary hover:underline">
              conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <GoogleButton />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            En continuant avec Google, tu acceptes les{" "}
            <Link href="/cgu" className="text-primary hover:underline">
              conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
