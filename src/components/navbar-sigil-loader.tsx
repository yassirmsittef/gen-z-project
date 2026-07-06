"use client";

import dynamic from "next/dynamic";

// Le mini-masque 3D est chargé côté client uniquement ; en attendant,
// le SVG de marque assure la continuité visuelle (même silhouette).
const NavbarSigil = dynamic(() => import("./navbar-sigil"), {
  ssr: false,
  loading: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/mask-sigil.svg" alt="" className="h-5 w-5 opacity-90" />
  ),
});

export function NavbarSigilLoader() {
  return <NavbarSigil />;
}
