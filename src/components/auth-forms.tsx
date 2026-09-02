"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, registerAction, signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n-provider";
import { CITIES } from "@/lib/cities";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { CURRENCIES } from "@/lib/money";

function GoogleButton() {
  const t = useT("account");

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("googleButton.or")}</span>
        </div>
      </div>
      <form action={signInWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full">
          {t("googleButton.continueWithGoogle")}
        </Button>
      </form>
    </>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  // Champs CONTRÔLÉS, et c'est nécessaire : React remet un formulaire à zéro
  // quand son action revient. Avec la double authentification, l'action
  // revient une première fois pour DEMANDER le code — sans ça, l'email et le
  // mot de passe s'effaçaient et il fallait tout retaper avant de le saisir.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("loginForm.emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("loginForm.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">{t("loginForm.passwordLabel")}</Label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {t("loginForm.forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {state?.needsCode && (
          <div className="space-y-1.5">
            <Label htmlFor="code">{t("loginForm.codeLabel")}</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              autoFocus
              required
              className="font-mono tracking-[0.3em]"
            />
            <p className="text-xs text-muted-foreground">{t("loginForm.codeHint")}</p>
          </div>
        )}

        {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("loginForm.submitPending") : t("loginForm.submit")}
        </Button>
      </form>

      {googleEnabled && <GoogleButton />}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("loginForm.noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("loginForm.signUpLink")}
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
  const t = useT("account");
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("registerForm.nameLabel")}</Label>
          <Input
            id="name"
            name="name"
            autoComplete="nickname"
            placeholder={t("registerForm.namePlaceholder")}
            required
            minLength={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("registerForm.emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("registerForm.emailPlaceholder")}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("registerForm.passwordLabel")}</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
          <p className="text-xs text-muted-foreground">{t("registerForm.passwordHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("registerForm.confirmPasswordLabel")}</Label>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">
            {t("registerForm.cityLabel")}{" "}
            <span className="font-normal text-muted-foreground">{t("registerForm.cityOptional")}</span>
          </Label>
          <Input
            id="city"
            name="city"
            list="register-cities"
            autoComplete="off"
            placeholder={t("registerForm.cityPlaceholder")}
          />
          <datalist id="register-cities">
            {CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {`${city.name} — ${city.country}`}
              </option>
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">{t("registerForm.cityHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredLanguage">{t("registerForm.languageLabel")}</Label>
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
          <p className="text-xs text-muted-foreground">{t("registerForm.languageHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredCurrency">{t("registerForm.currencyLabel")}</Label>
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
          <p className="text-xs text-muted-foreground">{t("registerForm.currencyHint")}</p>
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="cgu"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <span>
            {t("registerForm.acceptPrefix")}{" "}
            <Link href="/cgu" target="_blank" className="font-medium text-primary hover:underline">
              {t("registerForm.termsLink")}
            </Link>{" "}
            {t("registerForm.acceptMiddle")}{" "}
            <Link
              href="/confidentialite"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              {t("registerForm.privacyLink")}
            </Link>
            {t("registerForm.acceptSuffix")}
          </span>
        </label>

        {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("registerForm.submitPending") : t("registerForm.submit")}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <GoogleButton />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("registerForm.googleAcceptPrefix")}{" "}
            <Link href="/cgu" className="text-primary hover:underline">
              {t("registerForm.termsLink")}
            </Link>{" "}
            {t("registerForm.acceptMiddle")}{" "}
            <Link href="/confidentialite" className="text-primary hover:underline">
              {t("registerForm.privacyLink")}
            </Link>
            {t("registerForm.acceptSuffix")}
          </p>
        </>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("registerForm.alreadyAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("registerForm.signInLink")}
        </Link>
      </p>
    </div>
  );
}
