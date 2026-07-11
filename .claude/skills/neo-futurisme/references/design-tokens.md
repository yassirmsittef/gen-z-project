# Design tokens néo-futurisme — variables exactes

Source de vérité pour `src/app/globals.css` et `tailwind.config.ts`. Toute valeur codée en
dur dans un composant est un bug de style : passer par ces tokens.

## Variables CSS (globals.css, format HSL shadcn)

```css
:root {
  --background: 220 29% 6%;        /* #0B0E14 nuit profonde bleutée */
  --foreground: 210 40% 96%;       /* #F1F5F9 — jamais de blanc pur */
  --card: 224 33% 11%;             /* #131826 surface */
  --card-foreground: 210 40% 96%;
  --primary: 198 93% 60%;          /* #38BDF8 cyan électrique (actions) */
  --primary-foreground: 220 29% 6%;
  --secondary: 270 95% 75%;        /* #C084FC violet lumineux (communauté) */
  --secondary-foreground: 220 29% 6%;
  --muted: 225 30% 14%;
  --muted-foreground: 215 20% 65%; /* #94A3B8 texte secondaire */
  --accent: 224 33% 16%;           /* surface hover */
  --accent-foreground: 210 40% 96%;
  --destructive: 350 89% 60%;      /* #F43F5E */
  --destructive-foreground: 210 40% 96%;
  --success: 158 64% 52%;          /* #34D399 */
  --success-foreground: 220 29% 6%;
  --border: 223 25% 18%;           /* séparations discrètes */
  --input: 223 25% 22%;
  --ring: 198 93% 60%;             /* focus cyan */
  --radius: 1rem;                  /* rounded-lg = 16px, base des formes fluides */
}
```

Le thème est nativement sombre : pas de mode clair en Phase 1.

## Extensions Tailwind (tailwind.config.ts)

```ts
fontFamily: {
  sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
  display: ["var(--font-space-grotesk)", ...defaultTheme.fontFamily.sans],
  mono: ["var(--font-jetbrains)", ...defaultTheme.fontFamily.mono],
},
backgroundImage: {
  "accent-gradient": "linear-gradient(120deg, #5EEAD4 0%, #38BDF8 100%)",
  "orbital-gradient": "linear-gradient(120deg, #C084FC 0%, #38BDF8 100%)",
},
boxShadow: {
  glow: "0 0 12px rgba(56, 189, 248, 0.35)",
  "glow-strong": "0 0 20px rgba(56, 189, 248, 0.45)",
  "glow-violet": "0 0 12px rgba(192, 132, 252, 0.35)",
  "glow-teal": "0 0 12px rgba(94, 234, 212, 0.35)",
},
animation: {
  "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
},
```

Fonts chargées via `next/font/google` dans `src/app/layout.tsx` : Space Grotesk
(`--font-space-grotesk`), Inter (`--font-inter`), JetBrains Mono (`--font-jetbrains`).

## Recettes des motifs récurrents

- **Verre (cartes, navbar)** : `border border-white/[0.08] bg-card/60 backdrop-blur-md`.
  Ne jamais superposer deux niveaux de verre.
- **Coin signature** (cartes importantes uniquement — projet, financement, hero) :
  `rounded-2xl rounded-tr-sm`. Un seul coin réduit, toujours le même (haut-droit).
- **Bouton primaire** : `bg-accent-gradient text-primary-foreground font-semibold
  rounded-xl shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5
  transition-all duration-200 ease-out`. Réservé à UNE action principale par écran.
- **Traînée lumineuse (progress)** : piste `bg-white/5 rounded-full`, indicateur
  `bg-accent-gradient rounded-full shadow-glow`.
- **Anneau orbital (réputation)** : composant `ReputationRing` — cercle SVG stroke
  `url(#orbital)` (violet → cyan), strokeWidth 1.5 / 2.5 / 3.5 / 4.5 selon le niveau.
- **Nœuds de trajectoire (jalons)** : validé = disque plein dégradé + glow ; en cours =
  disque `animate-pulse-slow` (seule animation de l'écran) ; verrouillé = contour
  `border-white/15` sans fond.
- **Hover carte cliquable** : `-translate-y-1` + glow renforcé, `duration-200 ease-out`.
  Jamais de scale.
- **Halo de page** (hero, pages clés) : `radial-gradient(60% 40% at 50% 0%,
  rgba(56,189,248,0.05), transparent 70%)` — opacité < 6 %, statique.
- **Hero 3D orbital** (accueil uniquement — c'est l'audace de la page, rien d'autre
  n'anime) : composant `HeroScene` (Three.js vanilla, chargé via `next/dynamic`
  ssr:false). Noyau = **le sigil de marque** : masque de médecin de la peste
  dérivé du logo (grand Y aux cornes diagonales évasées + petit M inversé ramassé,
  deux yeux triangulaires percés, long bec). **Source canonique et INTOUCHABLE
  sans validation : `src/lib/mask-sigil.ts`** (`createMaskSigil()`), assets
  réutilisables dans `public/brand/mask-sigil.svg|.obj` (régénérables via
  `npx tsx scripts/export-mask.ts`). Monolithe d'obsidienne `#12161f`
  (metalness 0.75) éclairé point lights teal/violet, arêtes `EdgesGeometry` cyan
  additives. Il **oscille** (±31°, flottaison légère) — jamais de rotation
  complète, la face doit rester lisible. Autour : 3 anneaux de particules
  inclinés (Points + BufferGeometry, ~450 points, dégradés teal→cyan→violet,
  AdditiveBlending) + poussière d'étoiles. Parallaxe souris. Obligations :
  DPR ≤ 2, pause hors écran (IntersectionObserver), `prefers-reduced-motion` →
  une frame statique, dispose complet au démontage, voile radial
  `hsl(220 29% 6% / 0.62)` entre scène et texte pour la lisibilité AA.
- **Séquence d'ouverture du hero** (`INTRO_DURATION = 4.2s`, lente et
  majestueuse) : Acte 1 — le sigil naît en géant (échelle ×2,6, rotation
  d'arrivée −0,65 rad) **chargé d'énergie** (emissive cyan 0,4 → 0, arêtes 1,0
  → 0,9) et se pose en easeOutQuint (fini à 88%), pendant un **travelling
  caméra** (z 8,9 → 7, easeOutCubic) ; Acte 2 — les anneaux émergent DU masque
  avec une arrivée **spring** (easeOutBack ~4% de dépassement, échelle 0,04 → 1,
  décalés de 0,09 par anneau, spin ×4,5 qui se détend, fade-in) ; Acte 3 —
  étoiles en fondu (60 → 95%), puis textes en cascade CSS `.hero-reveal` avec
  **focus-pull** (blur 10px → net, 1,1s cubic-bezier(0.16,1,0.3,1), délais
  inline 1,7 → 3,05s). Reduced motion : intro sautée (état final) + délais CSS
  annulés. Ne pas rallonger au-delà de ~4,5s.
- **Transition « lancement »** (`LaunchLink` dans launch-button.tsx + événement
  `tremplin:launch`) : la caméra plonge dans le masque (z −5,2, accélération
  pow 2,2 sur 1,5s) qui s'embrase (emissive → 1,3), les anneaux sont aspirés
  (échelle ×0,55, spin ×6) pendant que `.launch-overlay` inonde l'écran + blur
  16px (ease-in 1,5s) ; navigation à 1,45s. Une seule teinte : `aurora`
  (teal/cyan, le rêve — actions projet : « Lancer le mien » → /projects/new
  dont l'en-tête se réveille en `.hero-reveal`, « Découvrir les projets »
  → /projects). **RETIRÉ le 2026-07-11 (demande utilisateur : « c'est
  moche ») : le portail violet de Connexion / S'inscrire** (`launch-scene.tsx`
  supprimé, `.launch-overlay--violet` + keyframes `launch-violet` + ancre
  `data-sigil-dock` retirés) — ces deux boutons naviguent désormais
  directement, ne pas réintroduire de transition dessus. Le **logo 3D
  permanent de la navbar** reste (`navbar-sigil.tsx` via loader dynamic,
  fallback SVG) : rotation continue 0,7 rad/s, **boost au toucher** (+7 rad/s,
  friction exponentielle), reduced motion = frame statique. L'overlay aurora
  est rendu en **portal vers body** (obligatoire : le backdrop-filter de la
  navbar piège sinon le position:fixed) et, le composant pouvant vivre dans un
  layout qui ne se démonte PAS à la navigation, il est **retiré explicitement
  en fondu** (`.launch-overlay--out`, 0,55s) dès que le pathname change, avec
  filet de sécurité temporel — sans ça le voile reste collé à l'écran. Reduced
  motion : navigation immédiate, aucun effet. Clic modifié (cmd/ctrl…) :
  comportement natif du lien.
- **Labels de données** : `font-mono text-[11px] uppercase tracking-[0.18em]
  text-muted-foreground` (petites capitales espacées).
- **Jauge orbitale (HUD)** : composant `StatRing` — anneau SVG stroke dégradé
  (teal→cyan ou violet→cyan) avec `drop-shadow` glow, piste `white/6`, valeur
  Space Grotesk au centre, data-label mono dessous. **Uniquement pour des
  progressions réelles** (réputation → prochain palier via
  `nextReputationTarget`, part disponible des crédits, objectif gamifié
  explicite) — jamais de pourcentage décoratif. Le HUD du dashboard = panneau
  verre `rounded-2xl rounded-tr-sm` (coin signature) avec 3 jauges.
- **Flux de données (listes)** : pastille de type colorée (h-2 w-2 rounded-full)
  + label de type EN MONO à côté (la couleur n'est jamais seule porteuse),
  montants en `font-mono` signés (+/−, text-success/text-destructive).

## Rappels d'usage

- Dégradé accent = actions + progression uniquement. Violet = réputation + communauté.
- Texte : `text-foreground` / `text-muted-foreground`. Jamais `text-white`.
- Monnaie : `cr` en toutes lettres (via `formatCredits`), icône `Zap` de lucide-react si
  besoin d'un pictogramme. Pas d'emoji.
- Une seule animation majeure par écran ; `prefers-reduced-motion` coupe tout (géré
  globalement dans globals.css).
