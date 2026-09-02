import { NextResponse, type NextRequest } from "next/server";

/**
 * Politique de sécurité du contenu (CSP), posée à chaque requête (proxy Next 16,
 * ex-middleware).
 *
 * Pourquoi ici et pas dans next.config.ts : un nonce n'a de valeur que s'il est
 * DIFFÉRENT à chaque réponse. Un en-tête statique ne peut pas le fournir, et une
 * CSP sans nonce oblige à ouvrir `'unsafe-inline'` sur les scripts — c'est-à-dire
 * à désactiver la protection qu'on prétend poser.
 *
 * Next lit le nonce dans l'en-tête `Content-Security-Policy` de la REQUÊTE et le
 * recopie sur ses propres balises <script> ; d'où la double écriture (requête et
 * réponse) ci-dessous. Sans elle, l'hydratation est bloquée et la page reste
 * inerte.
 *
 * `strict-dynamic` : seuls les scripts chargés PAR un script déjà autorisé le
 * sont à leur tour. Cela couvre les fragments de Next sans jamais avoir à
 * énumérer leurs URL — et un <script> injecté par une faille XSS, lui, n'a pas
 * de nonce et ne s'exécute pas.
 *
 * Ce qui reste ouvert, et pourquoi :
 * - `style-src 'unsafe-inline'` : Next et les polices posent des styles en
 *   ligne sans nonce. Un style injecté peut défigurer une page, il n'exécute
 *   pas de code — le risque n'est pas du même ordre que pour un script.
 * - le stockage Vercel Blob : c'est là que vivent les avatars et les
 *   témoignages filmés, et c'est là que le navigateur les DÉPOSE directement.
 * - `data:` et `blob:` pour les images et les vidéos : l'aperçu d'un avatar
 *   recadré et la vignette d'une vidéo sont fabriqués sur l'appareil, avant
 *   tout envoi.
 */

const BLOB = "https://*.public.blob.vercel-storage.com";
const BLOB_UPLOAD = "https://*.vercel-storage.com";
/** Photos de profil des comptes arrivés par Google. */
const AVATARS_GOOGLE = "https://lh3.googleusercontent.com";

function politique(nonce: string, dev: boolean): string {
  const directives = [
    ["default-src", "'self'"],
    // En développement seulement, Next recompile à chaud avec `eval`. En
    // production, l'ouvrir reviendrait à rendre `strict-dynamic` décoratif.
    ["script-src", `'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`],
    ["style-src", "'self' 'unsafe-inline'"],
    ["img-src", `'self' data: blob: ${BLOB} ${AVATARS_GOOGLE}`],
    ["media-src", `'self' blob: ${BLOB}`],
    ["font-src", "'self' data:"],
    ["connect-src", `'self' ${BLOB} ${BLOB_UPLOAD}${dev ? " ws: http://localhost:*" : ""}`],
    ["worker-src", "'self' blob:"],
    ["manifest-src", "'self'"],
    // Personne n'encadre GeniGain : ni pour piéger un clic de contribution,
    // ni pour se faire passer pour la plateforme.
    ["frame-ancestors", "'none'"],
    ["frame-src", "'none'"],
    ["object-src", "'none'"],
    // Un <base> injecté détournerait toutes les URL relatives de la page.
    ["base-uri", "'self'"],
    // Un formulaire ne poste que chez nous. Le paiement part par REDIRECTION
    // vers Stripe (pas par un POST inter-origines) : cette borne ne le gêne pas.
    ["form-action", "'self'"],
  ];
  const rendu = directives.map(([k, v]) => `${k} ${v}`);
  if (!dev) rendu.push("upgrade-insecure-requests");
  return rendu.join("; ");
}

// Next 16 : la convention `middleware` devient `proxy` (runtime Node, plus
// d'edge) — le nom dit mieux ce que fait ce fichier : il s'interpose sur
// chaque requête pour poser la CSP, rien de plus.
export function proxy(request: NextRequest) {
  const dev = process.env.NODE_ENV !== "production";
  const nonce = crypto.randomUUID();
  const csp = politique(nonce, dev);

  // Sur la REQUÊTE : c'est là que Next va chercher le nonce à recopier.
  const enTetes = new Headers(request.headers);
  enTetes.set("x-nonce", nonce);
  enTetes.set("Content-Security-Policy", csp);

  const reponse = NextResponse.next({ request: { headers: enTetes } });
  // Sur la RÉPONSE : c'est là que le navigateur va la lire.
  reponse.headers.set("Content-Security-Policy", csp);
  return reponse;
}

export const config = {
  matcher: [
    /*
     * Tout, sauf ce que Next sert lui-même sans le rendre : les fragments
     * statiques, les images optimisées, et les icônes. Ces fichiers reçoivent
     * les en-têtes statiques de next.config.ts — leur faire traverser le
     * middleware coûterait une invocation par fichier, pour rien.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
