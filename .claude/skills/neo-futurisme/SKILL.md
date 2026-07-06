---
name: neo-futurisme
description: Direction artistique néo-futuriste pour toute l'interface du projet. Utiliser ce skill dès que la tâche touche à l'UI, au CSS, à Tailwind, aux composants visuels, aux pages, aux couleurs, à la typographie ou aux animations — même si l'utilisateur ne mentionne pas explicitement le design. Garantit une identité visuelle cohérente et distinctive sur toutes les pages.
---

# Néo-futurisme — Direction artistique du projet

Le néo-futurisme allie optimisme technologique et humanité : formes fluides inspirées de
Zaha Hadid et Santiago Calatrava, matériaux « high-tech » (verre, lumière, translucidité),
mouvement et énergie — mais au service des gens, pas de la froideur. Ici, il exprime l'idée
de la plateforme : construire l'avenir ensemble.

## Philosophie (à respecter dans chaque écran)

- **L'élan, pas la grille rigide.** Les compositions suggèrent le mouvement vers l'avant :
  diagonales douces, courbes, éléments qui « s'échappent » légèrement du cadre. Jamais de
  mise en page 100 % symétrique et statique.
- **La lumière comme matériau.** Dégradés lumineux, halos (glow) discrets, surfaces
  translucides (glassmorphism sobre : backdrop-blur + fond semi-transparent) sur les cartes
  et barres de navigation.
- **Optimisme lisible.** Le futurisme ne sacrifie jamais la lisibilité : contrastes AA
  minimum, hiérarchie typographique nette, espaces généreux.
- **Une seule audace par écran.** Un élément signature fort (hero, visualisation de
  progression, transition) — le reste discipliné et calme.

## Tokens (source de vérité : references/design-tokens.md)

- Fond : `#0B0E14` (nuit profonde, légèrement bleutée) ; surfaces `#131826` ; verre
  `rgba(19,24,38,0.6)` + blur.
- Accent primaire : dégradé `#5EEAD4 → #38BDF8` (turquoise → cyan électrique) — réservé
  aux actions et à la progression.
- Accent secondaire : `#C084FC` (violet lumineux) — réputation, badges, éléments
  communautaires.
- Texte : `#F1F5F9` primaire, `#94A3B8` secondaire. Jamais de blanc pur `#FFFFFF` en aplat.
- Typo : display **Space Grotesk** (titres, chiffres clés), corps **Inter**, données/labels
  **JetBrains Mono** en petites capitales espacées.
- Formes : coins asymétriques signature — `rounded-2xl` global mais UN coin en `rounded-sm`
  sur les cartes importantes (évoque l'aile, l'élan). Rayons jamais mélangés au hasard.

## Motifs récurrents

- **Barres de progression = traînées lumineuses** : dégradé accent + léger glow
  (`shadow-[0_0_12px]` teinté), extrémité arrondie.
- **Réputation = anneau orbital** autour de l'avatar (SVG stroke en dégradé, épaisseur
  selon le badge).
- **Jalons = ligne de trajectoire** verticale/diagonale reliant des nœuds lumineux
  (validé = plein, en cours = pulsation lente, verrouillé = contour).
- **Hover cartes** : translation `-translate-y-1` + intensification du glow, 200 ms
  ease-out. Pas de scale.
- **Fond des pages clés** : maillage de lignes fines ou halo radial très discret
  (opacité < 6 %), jamais de particules animées partout.

## Interdits

- Pas de néon criard multicolore ni d'esthétique « cyberpunk sale » (glitch, scanlines).
- Pas de dégradés violets/roses génériques sur fond sombre appliqués sans intention.
- Pas d'animation sur plus d'un élément majeur par écran ; respecter
  `prefers-reduced-motion`.
- Pas d'emoji dans l'interface ; utiliser `lucide-react`.

## Procédure

1. Lire `references/design-tokens.md` (variables CSS et config Tailwind exactes) avant de
   coder.
2. Pour tout nouveau composant : identifier lequel des motifs récurrents s'applique, sinon
   rester sobre.
3. Vérifier contraste AA, mobile-first, focus visible au clavier.
4. Avant de conclure : relire l'écran et retirer un effet (règle du « un accessoire en
   moins »).
