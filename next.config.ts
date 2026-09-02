import type { NextConfig } from "next";

/**
 * En-têtes de sécurité appliqués à TOUTE réponse.
 *
 * La CSP ne vit PAS ici : elle a besoin d'un nonce différent à chaque requête,
 * donc elle est posée par src/middleware.ts. Ce qui reste ci-dessous est
 * strictement statique, et c'est justement pour ça que ça a sa place dans la
 * configuration : ces en-têtes doivent couvrir aussi les fichiers servis sans
 * passer par le middleware.
 */
const enTetesDeSecurite = [
  {
    // Deux ans, sous-domaines compris. `preload` rend le domaine éligible à la
    // liste des navigateurs — poser l'en-tête ne l'y inscrit pas, l'inscription
    // reste une démarche volontaire (et difficile à défaire : à faire quand le
    // HTTPS est établi partout, ce qui est le cas ici).
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Le navigateur ne devine plus le type d'un fichier : une image déposée par
    // un membre ne peut pas se faire passer pour du script.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Anti-clickjacking pour les navigateurs anciens ; les récents obéissent à
    // `frame-ancestors` dans la CSP. Les deux disent la même chose : personne
    // n'encadre GeniGain dans une iframe pour piéger un clic de contribution.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Vers un autre site : l'origine seulement, et rien du tout en HTTP. Un
    // chemin comme /reinitialiser/<jeton> ne doit jamais partir dans un
    // Referer — c'est ainsi que fuitent les liens à usage unique.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Tout ce que la plateforme n'utilise pas est refusé d'avance. La caméra et
    // le micro restent ouverts à notre propre origine : les témoignages du
    // direct se filment depuis le navigateur.
    key: "Permissions-Policy",
    value: [
      "camera=(self)",
      "microphone=(self)",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "serial=()",
      "bluetooth=()",
      "midi=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "display-capture=()",
      "idle-detection=()",
      "local-fonts=()",
      "screen-wake-lock=()",
      "xr-spatial-tracking=()",
      "browsing-topics=()",
    ].join(", "),
  },
  {
    // Isolation entre origines : une fenêtre ouverte par GeniGain ne garde pas
    // de prise sur celle qui l'a ouverte, et inversement.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    // Nos ressources ne s'embarquent pas depuis un autre site.
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
];

const nextConfig: NextConfig = {
  // Bundle : imports lucide-react (barrel) tree-shakés automatiquement.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // `x-powered-by: Next.js` annonçait la pile à qui la demandait. Ça ne protège
  // de rien de le cacher, mais ça ne sert à rien de l'offrir.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: enTetesDeSecurite }];
  },
};

export default nextConfig;
