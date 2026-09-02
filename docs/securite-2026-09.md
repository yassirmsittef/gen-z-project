# Sécurité de GeniGain — rapport du chantier des 1er–3 septembre 2026

Livrable final de la mission « niveau NASA/CIA ». Tout ce qui est marqué
**prouvé** l'a été par exécution (test qui tombe quand on retire la garde,
ou vérification sur le serveur en mode production), jamais par relecture.

## 1. Ce qui a été corrigé

### Fondations (déployé le 2 septembre à 23 h 30, `main` = `9803297`)
- **Dépendances** : 12 vulnérabilités → 5, plus aucune critique. `next-auth`
  beta.29 → beta.32 (contournement du `@` par homoglyphe, exception sur en-tête
  `Bearer`, mauvaise délivrance d'email), `next` 15.1 → 15.5 (SSRF et déni de
  service via Server Actions). Prouvé : 200+ tests, connexion réelle, session
  existante conservée, anti brute-force intact.
- **En-têtes** : la prod ne servait qu'un HSTS nu. Désormais : CSP **à nonce
  par requête** (`strict-dynamic`, `frame-ancestors 'none'`), HSTS
  `includeSubDomains; preload`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, isolation entre origines, `x-powered-by` supprimé.
  Prouvé en mode production : 47 scripts, 47 noncés, zéro violation.
- **Sessions** : 7 jours au lieu de 30, **révocables** (version de session
  portée par le JWT, reconfrontée toutes les 5 min) — changer ou réinitialiser
  son mot de passe, ou effacer son compte, fait tomber les sessions ouvertes
  ailleurs. Cookie `__Host-`. Prouvé : version montée en base → session disparue.
- **Double authentification (TOTP)** pour les comptes ADMIN — RFC 6238 écrite
  à la main, prouvée contre les vecteurs officiels ; enrôlement en deux temps ;
  un code faux compte comme un échec de connexion.
- **Argent** — critique. Un vote qui débloque une étape et l'arrêt du projet par
  son porteur, lancés dans la même seconde, sortaient **1 600 d'un séquestre de
  1 000** (reproduit 6 fois sur 12). Un seul mouvement d'argent à la fois par
  projet (verrou Postgres). Une contribution remboursée ne pèse plus dans les
  votes ; le webhook écoute les remboursements faits depuis Stripe et les
  litiges bancaires. Prouvé : 12 courses, surplus zéro ; verrou retiré, le test
  tombe au premier essai.
- **Fichiers** : « est à nous » testait une sous-chaîne — une query string ou
  une majuscule dans l'hôte faisait passer l'URL d'un tiers pour la nôtre, de
  quoi accrocher puis détruire la vidéo d'un autre. L'URL est lue comme le
  navigateur la lit, et stockée sous forme canonique.
- **Cadences** : inscription 5/h par adresse, réinitialisation 10/h,
  partenariat 5/h, **login 30 échecs/15 min par adresse** (contre le password
  spraying) en plus des 10 par compte, messages privés 60/h, commentaires
  30/h, traduction 200 requêtes/h et compteur sous verrou, photo de profil 5/h,
  vidéos/appels/adhésions recomptés sous verrou.
- **Données** : la page publique d'un projet chargeait la ligne User entière de
  chaque contributeur (hachage, email, identifiants Stripe) ; bcrypt coût 12
  avec re-hachage transparent ; photo de profil typée par ses octets (plus de
  SVG scripté) ; pages d'erreur qui ne disent rien ; cron fermé par défaut sans
  secret ; contrôle d'origine sur les routes API à état.

### Suite (5 commits après `9803297`, à déployer)
- **RGPD** : l'effacement retire le nom réel des lignes « X a rejoint », des
  notifications reçues par les autres, du texte des signalements ; un
  commentaire supprimé disparaît de la cloche du porteur.
- **Alertes admin** (`SECURITY_ALERT`, non masquables, par email, 7 langues) :
  50 échecs de connexion en 15 min, litige bancaire, traduction saturée.
- **Vérification de l'email** à l'inscription ; `promote-admin.ts` refuse une
  adresse non confirmée.
- **Modération des salons** : la preuve d'un message signalé survit à son
  effacement par l'auteur (dossier ouvert, contenu conservé) ; lignes
  d'arrivée une par jour, adhésions 3/jour, retirables par l'animation.
- **Sauvegardes** : dump complet chiffré (AES-256-GCM) chaque nuit sur Vercel
  Blob, 14 conservés ; script de restauration ; **exercice de restauration
  réussi** (base de dev → base neuve, 14 tables identiques).
- Divers : temps de réponse du login égalisé (oracle bcrypt), balises à jeton
  aléatoire autour du texte des marques dans le copilote IA, 3 « remplaçants »
  par projet et par jour.

## 2. Ce qui reste, et pourquoi

| Point | Pourquoi ce n'est pas fait | Qui décide |
|---|---|---|
| `BACKUP_KEY` sur Vercel | Secret à générer et poser par le fondateur (`openssl rand -hex 32`), à garder aussi hors de Vercel. **Sans elle, aucun dump n'est écrit.** | Fondateur |
| Déploiement des 5 derniers commits | Règle de la mission : jamais sans confirmation explicite. | Fondateur |
| Next 16 / Prisma 7 | Deux migrations majeures (proxy, Turbopack ; driver adapter, `prisma.config.ts`), 2–4 h chacune, au cœur de l'auth et de la base. Les 5 vulnérabilités qu'elles ferment sont toutes dans la chaîne de **construction**, hors d'atteinte d'un attaquant à l'exécution. | Fondateur (session dédiée) |
| Pare-feu Vercel (WAF) | Réglage du tableau de bord Vercel, pas du code. | Fondateur |
| « Email déjà utilisé » à l'inscription | Fermer l'oracle impose de ne plus connecter automatiquement le nouveau membre (même réponse pour un email libre ou pris). Choix produit. Freiné par la cadence. | Fondateur |
| Verrouillage d'un compte tiers | 10 échecs sur l'email d'un membre le bloquent 15 min. Le remède (exemption des appareils connus) est un chantier en soi. | — |
| Copilote IA en français seul | Dormant : pas de clé Anthropic en prod. | — |
| Traduction sur téléphone | Dormant par décision : pas de compte Azure. | Fondateur |

## 3. Risque résiduel estimé

- **Faible** : verrouillage d'un compte tiers (15 min), oracle « email déjà
  utilisé » (freiné), majeures Next/Prisma (chaîne de build), copilote (dormant).
- **Moyen tant que `BACKUP_KEY` n'est pas posée** : les sauvegardes n'existent
  pas ; la rétention effective reste les 6 h de Neon.
- **Moyen tant que les 5 commits ne sont pas déployés** : la prod n'a ni les
  alertes admin, ni la vérification d'email, ni les correctifs RGPD et
  salons, ni les sauvegardes.

## Méthode, pour la suite
Un audit adversarial multi-agents a produit 46 trouvailles (71 verdicts
confirmés). Il a aussi vidé la limite d'usage du fondateur en 40 minutes :
les prochains audits se font à la main, à partir du journal, ou en petit.
Chaque correctif porte un test qui **tombe** quand on retire la garde —
deux tests qui ne pouvaient pas tomber ont été attrapés ainsi.
