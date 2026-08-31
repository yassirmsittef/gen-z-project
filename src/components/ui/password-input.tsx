"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

/**
 * Champ mot de passe avec l'œil « afficher/masquer ».
 *
 * L'œil ne remplace pas la confirmation là où elle existe : il supprime la
 * faute de frappe INVISIBLE — celle qui crée un compte dont personne ne
 * connaît le mot de passe. `type="button"`, sinon un clic sur l'œil
 * soumettrait le formulaire qu'il est censé sécuriser.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const t = useT("account");
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("passwordInput.hide") : t("passwordInput.show")}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
