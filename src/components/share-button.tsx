"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Partager la page courante : partage natif quand il existe (mobile),
 * copie du lien sinon — l'aperçu riche est assuré par les cartes OpenGraph.
 */

/** Copie de secours sans API Clipboard (vieux navigateurs, iframes restrictives). */
function legacyCopy(url: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}
export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Annulation volontaire : on s'arrête là. Tout autre échec → copie.
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy(url);
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      // Dernier recours : l'utilisateur copie lui-même.
      window.prompt("Copie le lien du projet :", url);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={share}>
      {copied ? <Check aria-hidden /> : <Share2 aria-hidden />}
      {/* aria-live : la confirmation de copie est annoncée aux lecteurs d'écran. */}
      <span aria-live="polite">{copied ? "Lien copié !" : "Partager"}</span>
    </Button>
  );
}
