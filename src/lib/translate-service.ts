import { createHash } from "node:crypto";
import {
  MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_CHARS_PER_MONTH,
  MAX_TRANSLATION_CHARS_PER_WINDOW,
  MAX_TRANSLATION_REQUESTS_PER_WINDOW,
  TRANSLATION_WINDOW_MINUTES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { alertAdmins } from "@/lib/security-alerts";

/**
 * Traduction par un SERVICE, pour les appareils qui n'ont pas de modèle
 * embarqué — c'est-à-dire les téléphones, donc l'essentiel du public.
 *
 * Le chemin sur l'appareil (src/lib/browser-translate.ts) reste prioritaire :
 * gratuit, hors ligne, et le texte ne bouge pas. Ce fichier n'entre en jeu
 * que quand il n'existe pas — et il est le SEUL endroit qui connaisse le
 * prestataire. En changer (DeepL, autre) ne touche à rien d'autre : ni les
 * boutons, ni la route, ni les messages.
 *
 * Aujourd'hui : Azure AI Translator (palier gratuit F0, 2 M caractères/mois),
 * choisi pour trois raisons — il couvre les 7 langues dont l'arabe, il DÉTECTE
 * la langue dans le même appel (une requête au lieu de deux), et son offre
 * gratuite est la plus large. Simple POST, pas de SDK.
 *
 * ⚠️ Le texte d'un membre quitte nos serveurs pour aller chez le prestataire.
 * C'est écrit dans la politique de confidentialité, et annoncé au lecteur
 * avant le premier envoi (cf. translate-button.tsx). Rien n'est conservé ici :
 * la table TranslationUsage ne compte que des caractères.
 */

const ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";

/** Le service peut rester muet ; sans borne, le bouton tourne à vide. */
const DELAI_MS = 8_000;

/** Sous ce seuil, la détection tient de la loterie — surtout sur les messages
 *  courts d'un fil. Traduire depuis la mauvaise langue rend une bouillie. */
const CONFIANCE_MINIMALE = 0.5;

export type ServiceOutcome =
  | { statut: "traduit"; texte: string; langueSource: string }
  | { statut: "deja-dans-ta-langue"; langueSource: string }
  | { statut: "langue-indisponible"; langueSource: string | null }
  | { statut: "non-supporte" }
  | { statut: "trop-frequent" }
  | { statut: "sature" }
  | { statut: "echec" };

/** Le service est-il branché ? (lu à chaque appel, pas au chargement du
 *  module : poser la clé sur Vercel ne doit pas dépendre d'un redéploiement) */
export function translationServiceConfigured(): boolean {
  return Boolean(process.env.MICROSOFT_TRANSLATOR_KEY);
}

/**
 * Identité de cadence : le membre connecté, sinon son adresse IP HACHÉE
 * (jamais en clair : ce compteur n'a pas à devenir un journal de qui lit
 * quoi). Le sel vient d'AUTH_SECRET — sans lui, un hachage d'IP se casse à
 * coups de dictionnaire.
 */
export function usageKey(userId: string | null, ip: string | null): string {
  if (userId) return `user:${userId}`;
  const sel = process.env.AUTH_SECRET ?? "";
  const brut = (ip ?? "inconnue").trim();
  return `ip:${createHash("sha256").update(`${sel}:${brut}`).digest("hex")}`;
}

const debutFenetre = () => new Date(Date.now() - TRANSLATION_WINDOW_MINUTES * 60_000);
const debutMois = () => new Date(Date.now() - 30 * 24 * 60 * 60_000);

async function charsDepuis(where: { key?: string; depuis: Date }): Promise<number> {
  const { _sum } = await prisma.translationUsage.aggregate({
    _sum: { chars: true },
    where: { ...(where.key ? { key: where.key } : {}), createdAt: { gt: where.depuis } },
  });
  return _sum.chars ?? 0;
}

export async function recordTranslationChars(key: string, chars: number) {
  await prisma.translationUsage.create({ data: { key, chars } });
}

/** Ménage du cron : au-delà du mois glissant, ces lignes ne gardent plus rien
 *  (ni la cadence, ni le plafond mensuel). Marge d'un jour pour ne pas rogner
 *  la fenêtre au moment même où on la compte. */
export async function purgeStaleTranslationUsage() {
  await prisma.translationUsage.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 31 * 24 * 60 * 60_000) } },
  });
}

/**
 * Traduit `texte` vers `cible` pour le lecteur identifié par `key`.
 *
 * L'ordre des gardes n'est pas cosmétique : on refuse AVANT de payer un appel
 * au prestataire, et le plafond mensuel passe avant la cadence individuelle —
 * quand la plateforme est à sec, le dire à tout le monde de la même façon.
 */
export async function serviceTranslate(input: {
  texte: string;
  cible: string;
  key: string;
}): Promise<ServiceOutcome> {
  const texte = input.texte.trim();
  if (!translationServiceConfigured()) return { statut: "non-supporte" };
  if (texte.length < 2 || texte.length > MAX_TRANSLATION_CHARS) return { statut: "echec" };

  // Compter PUIS écrire, sous verrou par lecteur : l'audit a fait sauter le
  // plafond avec 20 requêtes simultanées, chacune comptant avant que les
  // autres n'aient écrit. Le verrou consultatif sérialise le geste ; il est
  // relâché au commit, avant l'appel réseau. Le nombre de requêtes est borné
  // aussi : des textes de deux caractères ne pèsent rien en caractères mais
  // coûtent un appel chacun.
  const verdict = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.key}))`;
    const depuisMois = debutMois();
    const depuisFenetre = debutFenetre();
    const [mois, fenetre, requetes] = await Promise.all([
      tx.translationUsage.aggregate({ _sum: { chars: true }, where: { createdAt: { gt: depuisMois } } }),
      tx.translationUsage.aggregate({
        _sum: { chars: true },
        where: { key: input.key, createdAt: { gt: depuisFenetre } },
      }),
      tx.translationUsage.count({ where: { key: input.key, createdAt: { gt: depuisFenetre } } }),
    ]);
    if ((mois._sum.chars ?? 0) + texte.length > MAX_TRANSLATION_CHARS_PER_MONTH) return "sature" as const;
    if (
      (fenetre._sum.chars ?? 0) + texte.length > MAX_TRANSLATION_CHARS_PER_WINDOW ||
      requetes >= MAX_TRANSLATION_REQUESTS_PER_WINDOW
    ) {
      return "trop-frequent" as const;
    }
    // Compté AVANT l'appel : un appel qui part puis échoue a quand même été
    // facturé au palier gratuit, et une rafale d'échecs ne doit pas être un
    // moyen de contourner le plafond.
    await tx.translationUsage.create({ data: { key: input.key, chars: texte.length } });
    return "ok" as const;
  });
  if (verdict === "sature") {
    // Le mois est fermé : les admins le savent avant les membres.
    await alertAdmins("securityAlert.translationSaturated", {}, "/admin", { flushEmails: false });
  }
  if (verdict !== "ok") return { statut: verdict };

  return callProvider(texte, input.cible);
}

/** Le seul morceau qui connaisse le prestataire. */
async function callProvider(texte: string, cible: string): Promise<ServiceOutcome> {
  const region = process.env.MICROSOFT_TRANSLATOR_REGION;
  let reponse: Response;
  try {
    reponse = await fetch(`${ENDPOINT}&to=${encodeURIComponent(cible)}`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MICROSOFT_TRANSLATOR_KEY ?? "",
        // Exigé dès que la ressource est régionale (le cas par défaut sur
        // Azure) ; absent, le service répond 401 sans expliquer pourquoi.
        ...(region ? { "Ocp-Apim-Subscription-Region": region } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: texte }]),
      signal: AbortSignal.timeout(DELAI_MS),
    });
  } catch {
    return { statut: "echec" };
  }

  if (!reponse.ok) {
    // 429 (cadence) et 403 (quota épuisé) viennent du prestataire, pas du
    // lecteur : « saturé » dit la vérité, « réessaie » mentirait.
    if (reponse.status === 429 || reponse.status === 403) return { statut: "sature" };
    const code = await codeErreur(reponse);
    // 400035 : langue source non prise en charge ; 400036 : langue cible.
    if (code === 400035 || code === 400036) return { statut: "langue-indisponible", langueSource: null };
    console.error(`[traduction] refus du prestataire (${reponse.status}, code ${code ?? "?"})`);
    return { statut: "echec" };
  }

  let charge: unknown;
  try {
    charge = await reponse.json();
  } catch {
    return { statut: "echec" };
  }

  const premier = Array.isArray(charge) ? (charge[0] as Record<string, unknown>) : null;
  const detecte = premier?.detectedLanguage as { language?: string; score?: number } | undefined;
  const traduction = (premier?.translations as { text?: string }[] | undefined)?.[0];
  if (!traduction?.text) return { statut: "echec" };

  const source = detecte?.language?.split("-")[0] ?? null;
  // Une détection incertaine se dit ; elle ne se maquille pas en traduction.
  if (!source || (detecte?.score ?? 0) < CONFIANCE_MINIMALE) {
    return { statut: "langue-indisponible", langueSource: null };
  }
  if (source === cible) return { statut: "deja-dans-ta-langue", langueSource: source };
  return { statut: "traduit", texte: traduction.text, langueSource: source };
}

async function codeErreur(reponse: Response): Promise<number | null> {
  try {
    const corps = (await reponse.json()) as { error?: { code?: number } };
    return corps?.error?.code ?? null;
  } catch {
    return null;
  }
}
