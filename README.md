# Tremplin ⚡ — Plateforme communautaire de financement participatif

**Phase 1 (MVP)** : la Gen Z et les créateurs lancent leurs projets et se font financer par la
communauté — en **crédits fictifs**. Aucun paiement réel : on valide les mécaniques communautaires
avant d'introduire Stripe Connect en Phase 2.

## Les mécaniques clés

- **Contribuer avant de poster** — la création de projet est verrouillée tant que tu n'as pas
  soutenu au moins 1 projet (`MIN_CONTRIBUTIONS_TO_CREATE`).
- **Monnaie : le token, 1 token = 1 $** (fictif en Phase 1) — 5 tokens offerts à
  l'inscription, contribution minimum 5 tokens, **recharge du compte** depuis le dashboard
  (montants prédéfinis, transaction BONUS au ledger — branchera Stripe en Phase 2).
- **Contribution confirmée en deux temps** — un dialogue récapitulatif (montant, équivalence
  en $, rappel du séquestre) doit être accepté avant que la contribution soit enregistrée.
- **Financement tout-ou-rien** — une campagne a un objectif et une deadline (7 à 60 jours).
  Objectif atteint → statut *Financé*, la collecte s'arrête. Deadline dépassée sans objectif →
  *Non abouti*, tous les contributeurs sont remboursés.
- **Fonds débloqués par étapes** — le porteur découpe son plan en 2 à 5 étapes, chacune avec un
  **montant en crédits** (somme = objectif). Les crédits restent **sous séquestre** : à chaque
  étape, le porteur soumet une **preuve d'avancement** (texte + liens + images) et les
  **contributeurs votent**.
  - **Vote pondéré** : le poids d'un vote = total contribué par le votant au projet. Validation
    dès que le poids POUR dépasse 50% des crédits collectés (refus symétrique) ; si tous les
    contributeurs ont voté sans majorité stricte, la balance des poids tranche (égalité → refus).
  - Preuve validée → le montant de l'étape est viré au porteur, l'étape suivante s'ouvre (la
    dernière étape reçoit aussi l'éventuel dépassement d'objectif).
  - Preuve refusée → `rejectionCount` s'incrémente ; au 2e refus le projet échoue et le
    séquestre restant est remboursé au prorata.
- **Compétences** — chaque membre déclare ses `skills` (dashboard), chaque projet ses
  `neededSkills` ; le gate « contribue d'abord » et la page /rebond recommandent en priorité
  les projets qui matchent tes compétences.
- **17 catégories business** (tech, e-commerce, services, éducation, santé, finance,
  immobilier…) avec descriptions, **moteur de recherche** plein texte (titre, pitch,
  description) et **classements** (/classements) des meilleurs projets en campagne et réalisés.
- **Chat d'entraide** (/chat) — messagerie directe entre membres pour faire cohabiter les
  projets : collabs, échanges de compétences, coups de main. Boutons « Contacter » sur les
  pages projet et profils. Rafraîchissement léger par polling (pas de websocket en Phase 1).
- **Réputation** — chaque utilisateur a un score public : +2 par contribution, +1 par vote,
  +10 par étape validée, +25 par projet réalisé, **−15 par projet échoué**. Niveaux : Rookie 🐣,
  Contributeur·rice 🤝 (10+), Bâtisseur·se 🧱 (50+), Légende 🌟 (150+).
- **L'échec n'est pas une sortie** — un projet raté redirige son créateur vers la page
  **/rebond** : remboursement des contributeurs, message d'encouragement et réorientation vers
  d'autres opportunités (projets actifs de la même catégorie d'abord).

Toutes les constantes de jeu sont dans [`src/lib/constants.ts`](src/lib/constants.ts).

## Stack

- **Next.js 15** (App Router, TypeScript strict) — mutations via **Server Actions** uniquement
- **PostgreSQL** via **Prisma** (compatible Supabase)
- **Auth.js (NextAuth v5)** — email/mot de passe + Google OAuth (optionnel)
- **Tailwind CSS + shadcn/ui**, validation **Zod** côté client **et** serveur

## Design system — Néo-futurisme

Direction artistique définie par le skill projet
[`.claude/skills/neo-futurisme/`](.claude/skills/neo-futurisme/SKILL.md) (tokens exacts dans
[`references/design-tokens.md`](.claude/skills/neo-futurisme/references/design-tokens.md)) :

- **Thème nuit** `#0B0E14`, surfaces verre (`backdrop-blur` + fond semi-transparent), halos
  discrets ; dégradé accent turquoise → cyan réservé aux actions et à la progression, violet
  `#C084FC` pour la réputation et la communauté
- **Typo** : Space Grotesk (titres, chiffres clés) / Inter (corps) / JetBrains Mono
  (labels de données en petites capitales espacées), via `next/font`
- **Motifs signature** : traînées lumineuses (progress), anneau orbital de réputation autour
  des avatars (`ReputationRing`), ligne de trajectoire à nœuds lumineux pour les jalons,
  coin asymétrique `rounded-tr-sm` sur les cartes importantes
- **Hero 3D animé** (accueil) : scène orbitale Three.js (noyau wireframe + anneaux de
  particules teal→cyan→violet, parallaxe souris) — 60 fps, pause hors écran,
  `prefers-reduced-motion` → frame statique, chargée dynamiquement hors du bundle partagé
- **Garde-fous** : contrastes AA, jamais de blanc pur, une seule animation majeure par écran,
  `prefers-reduced-motion` respecté, icônes Lucide uniquement (pas d'emoji), monnaie notée
  « cr »

## Démarrage

```bash
npm install
cp .env.example .env        # puis renseigner AUTH_SECRET (openssl rand -base64 32)

# 1. Base de données — au choix :
npm run db:start            # Postgres embarqué, zéro install (laisser tourner)
# ou : docker compose up -d # si Docker est installé
# ou : une base Supabase → adapter DATABASE_URL

# 2. Dans un autre terminal :
npm run db:migrate          # crée le schéma
npm run db:seed             # données de démo

npm run dev                 # http://localhost:3000
```

### Comptes de démo (mot de passe : `demo1234`)

| Email | Situation |
| --- | --- |
| `demo@demo.dev` | Compte vierge : 100 ⚡, aucune contribution → le gate « contribue d'abord » est actif |
| `lea@demo.dev` | Contributrice active, 2 projets en campagne |
| `zoe@demo.dev` | Projet financé, preuve d'étape **en cours de vote** |
| `sam@demo.dev` | Projet financé, étape 1 déjà débloquée |
| `nina@demo.dev` | Projet **réalisé** (toutes étapes validées) |
| `max@demo.dev` | Projet **échoué** (deadline) → réputation en négatif, parcours rebond |

### Stripe — recharges en argent réel (optionnel)

Sans clés, la recharge reste **fictive** (mode démo). Pour brancher de vrais paiements :

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **mode Test** → Développeurs →
   Clés API → copier la clé secrète `sk_test_...` dans `STRIPE_SECRET_KEY` (`.env`)
2. Webhook local : installer la [CLI Stripe](https://stripe.com/docs/stripe-cli) puis
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — copier le
   `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`
3. Redémarrer le serveur. Le bouton devient « Payer X $ avec Stripe » → Checkout
   (carte de test : `4242 4242 4242 4242`, date future, CVC libre) → le webhook
   crédite les tokens (idempotent, session id en refId au ledger)

En production : clés live + endpoint webhook déclaré dans le dashboard Stripe
(`https://ton-domaine/api/webhooks/stripe`, événement `checkout.session.completed`),
et `NEXT_PUBLIC_APP_URL` sur ton domaine.

### Stripe Connect — versements aux porteurs (mode test)

Les porteurs configurent leurs versements depuis le dashboard (« Mes versements » →
onboarding Express). Quand la communauté valide une étape, son montant est transféré
depuis le solde de la plateforme vers le compte du porteur
(`src/lib/payouts.ts`, idempotent via `Milestone.stripeTransferId`) ; tout échec est
silencieux — le ledger interne en tokens reste la source de vérité.

Prérequis une seule fois : **activer Connect** sur le compte Stripe de la plateforme
([dashboard.stripe.com/connect](https://dashboard.stripe.com/connect) → Get started),
sinon la création de comptes renvoie « You can only create new accounts if you've
signed up for Connect ».

⚠️ **Avant tout lancement réel en UE** : encaisser pour compte de tiers exige un agrément
d'établissement de paiement ou un partenaire régulé (Mangopay, Lemonway, ou le montage
Stripe « destination charges »). Le montage actuel (transfers depuis le solde plateforme)
est un prototype de test, pas un montage conforme.

### Google OAuth (optionnel)

Renseigner `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` dans `.env` (callback :
`http://localhost:3000/api/auth/callback/google`). Le bouton Google n'apparaît que si ces
variables sont présentes.

## Architecture

```
src/
  app/                  # pages (App Router) — toutes dynamiques (force-dynamic)
    projects/           # liste + filtres, création (gate), détail (contribution, étapes, votes)
    dashboard/          # solde, historique de crédits, mes contributions, mes projets
    u/[id]/             # profil public : réputation, activité, projets
    rebond/             # réorientation après échec
  actions/              # Server Actions (auth, projets, contributions, preuves/votes)
  lib/
    project-service.ts  # TOUTE la logique métier (transactions Prisma) : contribution,
                        # séquestre, votes, déblocage, échec/remboursement
    validation.ts       # schémas Zod partagés client/serveur
    constants.ts        # règles du jeu (crédits, quorum, réputation...)
  components/           # UI (shadcn/ui + composants métier)
prisma/
  schema.prisma         # User (skills, totalContributed), Project (neededSkills, coverUrl),
                        # Milestone (amount, rejectionCount), Proof (links, imageUrls),
                        # Vote (weight, decision), Contribution,
                        # CreditTransaction (ledger : WELCOME/CONTRIBUTION/
                        # MILESTONE_RELEASE/REFUND/BONUS, refId), ReputationEvent
  seed.ts               # démo pilotée par les vrais services métier
```

### Choix d'implémentation notables

- **Ledger de crédits** : chaque mouvement (`CreditTransaction`) est signé et tracé — le solde
  `User.credits` est dénormalisé mais toujours mis à jour dans la même transaction Prisma.
- **Expiration des campagnes** : gérée par un **cron Vercel** (`vercel.json` → `/api/cron/expire-projects`,
  toutes les 10 min, `failExpiredProjects()`), hors du chemin de rendu — plus de scan à chaque page.
  Sécurisée par `CRON_SECRET` en prod. En local, l'appeler à la main (`GET /api/cron/expire-projects`).
- **Arrondis** : la dernière étape reçoit le reliquat du séquestre pour que 100% des fonds
  soient distribués ; les remboursements partiels sont au prorata (arrondi à l'entier inférieur).
- **Auth** : sessions JWT (nécessaire avec le provider credentials), adapter Prisma pour OAuth ;
  les inscriptions Google reçoivent aussi leurs crédits de bienvenue (event `createUser`).

## Phase 2 (hors scope MVP)

Paiements réels (Stripe Connect), notifications, commentaires/updates de projet, recherche,
modération, mobile.
