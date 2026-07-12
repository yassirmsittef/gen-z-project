# GeniGain ⚡ — Plateforme communautaire de financement participatif

**Bêta** : la Gen Z et les créateurs lancent leurs projets et se font financer par la
communauté — **en argent réel, chacun dans sa devise** (architecture complète branchée sur
Stripe **en mode test** : les mécaniques sont réelles, aucun vrai débit avant l'activation
Connect + relecture légale).
**En ligne : https://gen-z-project.vercel.app**

## Les mécaniques clés

- **Contribuer avant de poster** — la création de projet est verrouillée tant que tu n'as pas
  cumulé **20 $ US de contributions** (toutes devises confondues, converties au taux du jour
  du paiement — `GATE_USD_CENTS`), avec une jauge de progression sur la page de création.
- **Argent réel, une devise par projet** — le porteur choisit la devise de sa campagne
  (toutes les devises Stripe : EUR, USD, CHF, MAD…) ; les contributions se paient par carte
  via Stripe Checkout dans cette devise (fulfillment par webhook signé, idempotent par
  session), les remboursements repartent sur les cartes (prorata du séquestre restant,
  rejoués par le cron), les versements aux porteurs partent en virement Stripe dans la
  devise du projet. Montants stockés en unités mineures, affichés via Intl. Pas de wallet
  interne, pas de bonus, pas de commission (décisions 2026-07-12). Clés Stripe en mode
  TEST jusqu'à l'activation Connect + relecture légale.
- **Financement tout-ou-rien** — une campagne a un objectif et une deadline (7 à 90 jours,
  le porteur choisit ; plafond aligné sur le délai de réalisation : les fonds des
  contributeurs ne restent jamais bloqués indéfiniment).
  Objectif atteint → statut *Financé*, la collecte s'arrête. Deadline dépassée sans objectif →
  *Non abouti*, tous les contributeurs sont remboursés.
- **Fonds débloqués par étapes** — le porteur découpe son plan en 2 à 5 étapes, chacune avec un
  **montant dans la devise du projet** (somme = objectif). Les fonds restent **sous séquestre** : à chaque
  étape, le porteur soumet une **preuve d'avancement** (texte + liens + images) et les
  **contributeurs votent**.
  - **Vote pondéré** : le poids d'un vote = total contribué par le votant au projet. Validation
    dès que le poids POUR dépasse 50% des montants collectés (refus symétrique) ; si tous les
    contributeurs ont voté sans majorité stricte, la balance des poids tranche (égalité → refus).
  - Preuve validée → le montant de l'étape est viré au porteur, l'étape suivante s'ouvre (la
    dernière étape reçoit aussi l'éventuel dépassement d'objectif).
  - Preuve refusée → `rejectionCount` s'incrémente ; au 2e refus le projet échoue et le
    séquestre restant est remboursé au prorata.
- **Échéance de réalisation : 90 jours après financement** (`REALIZATION_DAYS`) — le porteur
  doit faire valider toutes ses étapes dans ce délai. À l'échéance (cron quotidien), un vote
  encore ouvert est **tranché à la balance des bulletins posés** (égalité → refus) : le porteur
  repart avec tout ce que la communauté a validé, le séquestre restant est remboursé au
  prorata. Décision documentée dans [`docs/sequestre-ue.md`](docs/sequestre-ue.md).
- **Ton compte, ton projet** — profil éditable (pseudo, avatar, bio), changement de mot de
  passe et **suppression de compte** (anonymisation RGPD : l'historique financier reste
  cohérent au nom de « Membre retiré », refusée tant qu'une campagne soutenue est en cours) ;
  le porteur **modifie le contenu** de son projet pendant la campagne (le cadre financier est
  figé) et peut le **retirer tant que personne n'a contribué**.
- **Compétences** — chaque membre déclare ses `skills` (dashboard), chaque projet ses
  `neededSkills` ; le gate « contribue d'abord » et la page /rebond recommandent en priorité
  les projets qui matchent tes compétences.
- **17 catégories business** (tech, e-commerce, services, éducation, santé, finance,
  immobilier…) avec descriptions, **moteur de recherche** plein texte (titre, pitch,
  description) et **classements** (/classements) des meilleurs projets en campagne et réalisés.
- **Chat d'entraide** (/chat) — messagerie directe entre membres pour faire cohabiter les
  projets : collabs, échanges de compétences, coups de main. Boutons « Contacter » sur les
  pages projet et profils. **Temps réel par SSE** (`/api/chat/stream`, reconnexion auto).
- **Communauté sur le globe** (/communaute) — Terre 3D stylisée avec un point lumineux par
  ville de membre (localisation déclarative, ville uniquement), clic = filtre, et recherche
  des membres par nom / compétence / ville.
- **Vie du projet** — le porteur poste des **actus** (timeline sur la page projet), la
  communauté **commente** (modération légère : l'auteur ou le porteur suppriment), chacun
  peut **suivre** un projet (étoile + compteur, section « Projets suivis » au dashboard).
- **Notifications in-app** — cloche navbar à **badge vivant** (compteur rafraîchi sans
  navigation) + page /notifications : contribution reçue, objectif atteint, preuve à voter,
  étape débloquée/refusée, échec + remboursements, message, demande de partenariat,
  commentaire, actu (contributeurs ∪ followers). **Préférences par type** : chaque membre
  coupe ce qu'il ne veut plus recevoir.
- **Le pouls** — fil d'activité de la plateforme sur l'accueil (contributions, lancements,
  actus, nouveaux membres, temps relatif).
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

npm test                    # règles du jeu (12 tests d'intégration, base de dev requise)
```

### Comptes de démo (mot de passe : `demo1234`)

| Email | Situation |
| --- | --- |
| `demo@demo.dev` | Compte vierge, aucune contribution → le gate « 20 $ » et sa jauge sont visibles |
| `lea@demo.dev` | Contributrice active, 2 projets en campagne |
| `zoe@demo.dev` | Projet financé, preuve d'étape **en cours de vote** |
| `sam@demo.dev` | Projet financé, étape 1 déjà débloquée |
| `nina@demo.dev` | Projet **réalisé** (toutes étapes validées) |
| `max@demo.dev` | Projet **échoué** (deadline) → réputation en négatif, parcours rebond |

### Stripe — contributions par carte (obligatoire)

Les contributions passent par Stripe Checkout dans la devise du projet — sans clés,
contribuer est impossible. Configuration :

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **mode Test** → Développeurs →
   Clés API → copier la clé secrète `sk_test_...` dans `STRIPE_SECRET_KEY` (`.env`)
2. Webhook local : installer la [CLI Stripe](https://stripe.com/docs/stripe-cli) puis
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — copier le
   `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`
3. Redémarrer le serveur. « Contribuer X € » → Checkout (carte de test :
   `4242 4242 4242 4242`, date future, CVC libre) → le webhook signé enregistre la
   contribution (idempotent par session id) et cumule l'équivalent USD du gate

En production : clés live + endpoint webhook déclaré dans le dashboard Stripe
(`https://ton-domaine/api/webhooks/stripe`, événement `checkout.session.completed`),
et `NEXT_PUBLIC_APP_URL` sur ton domaine.

### Stripe Connect — versements aux porteurs (mode test)

Les porteurs configurent leurs versements depuis le dashboard (« Mes versements » →
onboarding Express). Quand la communauté valide une étape, son montant est figé en
parts adossées aux charges des contributions (`MilestonePayout`, répartition
proportionnelle — `src/lib/payout-split.ts`) puis chaque part devient un transfer
`source_transaction` vers le compte du porteur (`executeDuePayouts`,
`src/lib/payouts.ts`) : aucun solde plateforme n'est requis, la devise du projet est
gardée de bout en bout, et un échec (compte pas encore configuré…) laisse la part due —
le cron quotidien la rejoue. La répartition proportionnelle garantit qu'en cas d'échec
ultérieur du projet, chaque charge conserve exactement de quoi rembourser son prorata.
Les remboursements (échec de campagne, échéance dépassée) repartent vers les cartes via
`executeDueRefunds`, rejoués par le même cron.

Prérequis une seule fois : **activer Connect** sur le compte Stripe de la plateforme
([dashboard.stripe.com/connect](https://dashboard.stripe.com/connect) → Get started),
sinon la création de comptes renvoie « You can only create new accounts if you've
signed up for Connect ».

⚠️ **Avant tout lancement réel en UE** : encaisser pour compte de tiers exige un agrément
d'établissement de paiement ou un partenaire régulé (Mangopay, Lemonway). Le montage
actuel (charges plateforme + transfers adossés) est un prototype de test, pas un montage
conforme.

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

### Partenariats de marques (copilote IA)

Les marques proposent un partenariat **sans compte** depuis la page d'un projet
(« Partenariat marque ») et suivent la réponse via un **lien privé à token**
(`/partenariats/suivi/[token]`). Le porteur reçoit la demande dans sa boîte
`/partenariats` avec une **analyse fiabilité/équité** avant de répondre :

- **Moteur heuristique** (toujours actif, instantané) : détection des arnaques
  classiques — frais à payer d'avance, trop-perçu, paiement intraçable, email
  jetable/perso, incohérence email↔site, pression temporelle, bascule WhatsApp,
  « visibilité » seule, exclusivité gratuite (`src/lib/partnership-ai.ts`).
- **Analyse approfondie Claude** (optionnelle) : renseigner `ANTHROPIC_API_KEY`
  (https://platform.claude.com) — modèle `claude-opus-4-8`, sortie JSON structurée,
  déclenchée automatiquement à l'ouverture d'une demande en attente ; en cas
  d'échec, l'heuristique reste affichée.

La réponse (accepter/refuser) part avec un **brouillon pré-rédigé** par le
copilote, éditable. L'analyse interne n'est jamais exposée à la marque.

## Phase 2 (hors scope MVP)

Passage des clés Stripe en live + montage séquestre régulé UE (Mangopay/Lemonway),
notifications par email et préférences, modération avancée, application mobile.
