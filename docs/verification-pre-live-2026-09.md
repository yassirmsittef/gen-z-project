# Revue de mise en service — 7 septembre 2026 (avant le passage en live)

Demande du fondateur : « avant de passer en live faut vraiment tout vérifier :
sécurité, fonctionnement, bugs, capacité ». Revue faite sur la prod réelle
(genigain.com, Stripe encore en mode TEST) et sur une copie locale du code
déployé (`main` = `aeafd53`, identique à ce que Vercel sert depuis le 06/09 03:14).

## Verdict en une phrase

Le code est prêt. Ce qui reste à décider n'est pas du code : **les trois
services gratuits sur lesquels le site repose (Vercel Hobby, Neon Free, Resend
Free) coupent le service quand leur quota mensuel est dépassé**, et Vercel
Hobby interdit l'usage commercial. Un site qui manipule de l'argent réel ne
devrait pas dépendre d'un plan qui peut le mettre en pause 30 jours.

## 1. Sécurité — ✅ rien à corriger

| Vérification | Résultat |
|---|---|
| Tests automatiques | 253 / 253 passent (30 fichiers) |
| Compilation de production | OK |
| En-têtes HTTP en prod | CSP à nonce + strict-dynamic, HSTS 2 ans preload, X-Frame DENY, nosniff, Referrer no-referrer, Permissions-Policy, COOP same-origin, pas de X-Powered-By |
| Vue « visiteur non connecté » | /dashboard, /admin, /projects/new, /appels/nouveau, /chat, /notifications → redirection ; /api/me/export, /api/notifications/count, /api/chat/stream → 401 |
| Webhook Stripe sans signature | 400 « Signature manquante » |
| Cron sans secret | 401 |
| Envoi vidéo / traduction sans session | 400 |
| WAF Vercel | Actif. Une rafale de 80 requêtes depuis un même navigateur déclenche le « Security Checkpoint » (403 + `x-vercel-mitigated: challenge`), qui se résout seul en ~5 s dans un vrai navigateur, puis tout repasse en 200 |
| Dépendances (`npm audit`) | 4 « high », toutes dans l'outillage Prisma de développement (`deepmerge-ts`, `mysql2` — jamais importés ; absents du bundle serveur, vérifié par grep dans `.next/server`). La « correction » proposée est un retour à Prisma 6 : refusée. Aucun risque en prod. |
| Journaux d'erreur prod | 0 erreur — mais Hobby ne garde qu'**1 heure** de journaux, donc ça ne prouve que la dernière heure |
| Pentest complet | fait le 06/09, `docs/pentest-2026-09.md`, aucune faille exploitable |

## 2. Fonctionnement — ✅

Toutes les routes répondent (accueil, projets, appels, direct, salons, groupes,
classements, communauté, partenariats, rebond, soutenir, pages légales,
sitemap, robots, manifest). Les pages inexistantes donnent un vrai 404.
Le sélecteur de villes applique les choix éditoriaux du fondateur
(Nazareth, Ariel, Jérusalem → Palestine ; « Tel » ne propose aucune ville
israélienne). Le parcours argent complet (contribution → séquestre chez le
porteur → libération par étape → annulation = reversal + remboursement) et le
don « Soutenir GeniGain » ont été joués de bout en bout le 06/09 contre la vraie
API Stripe en mode test, puis toutes les données de test ont été effacées.

## 3. Bugs — aucun trouvé ; une lenteur corrigée

- **Les fonctions tournaient à Washington (iad1) alors que la base Neon est à
  Francfort.** Chaque page dynamique payait plusieurs allers-retours
  transatlantiques : ~0,7 à 1 s de réponse à vide, 2 à 2,5 s quand la base se
  réveille. Corrigé : `vercel.json` → `"regions": ["fra1"]` (une seule région,
  autorisée sur Hobby). Commit local `bad99c4`, à déployer.
- Mini-test de charge (40 requêtes simultanées sur /projects, puis 40 sur
  /api/cities) : **0 erreur**, toutes servies en moins de 6 s. Le site tient
  une rafale, il ne s'écroule pas.

## 4. Capacité — ⚠️ c'est ici que se joue la décision

Ce qui est en place : URL Neon **poolée** au runtime (pas d'épuisement de
connexions), fonctions Fluid, flux du chat fermé quand l'onglet est caché,
cloche des notifications à cadence lente, cron 1×/jour (60 s max), vidéos
plafonnées (30 Mo, 60 s, 5/jour, garde avant le plafond Blob).

Ce qui peut couper le site (chiffres relevés dans les docs officielles le 07/09) :

| Service | Plan actuel | Plafond mensuel | Ce qui se passe au-delà | Plan au-dessus |
|---|---|---|---|---|
| **Vercel** | Hobby (équipe `boat-and-chill`) | 1 M de requêtes edge, 1 M d'appels de fonction, **4 h de CPU actif**, 360 Go·h de mémoire | **Fonctionnalité en pause jusqu'à 30 jours** ; et la doc dit : « the Hobby plan restricts users to non-commercial, personal use only » | Pro : 20 $/mois — 10 M de requêtes puis à la demande, jamais de pause, 1 jour de journaux, 40 règles WAF |
| **Neon** | Free | 0,5 Go (34 Mo utilisés), **100 CU-heures** = ~400 h à 0,25 CU, réveil après 5 min de veille | **Base suspendue jusqu'au mois suivant** = site entier hors service | Launch : paiement à l'usage, 0,106 $/CU-h, pas de minimum (une base éveillée 24 h/24 à 0,25 CU ≈ 20 $/mois ; en usage réel bien moins) |
| **Resend** | Free | 3 000 emails/mois, **100 par jour**, 3 domaines | Les emails suivants ne partent pas. L'inscription réussit quand même (l'échec d'email est toléré) et la vérification d'email ne bloque aucune action : gêne, pas panne | Pro : 20 $/mois pour 50 000 |
| **Stripe** | — | aucun plafond | — | — |

Lecture concrète : tant qu'une personne a un salon ouvert à l'écran, la base
Neon reste éveillée ; 14 h/jour d'activité suffisent à épuiser les 100 CU-h
avant la fin du mois. Une vidéo partagée qui amène 40 000 premières visites
consomme le million de requêtes edge. Dans les deux cas le site s'arrête, pas
seulement une fonction.

### Recommandation

1. **Vercel Pro (20 $/mois)** dès l'ouverture : c'est la seule option conforme
   aux conditions d'usage pour une plateforme qui encaisse de l'argent, et elle
   supprime la mise en pause.
2. **Neon Launch (à l'usage, ~5 à 20 $/mois à cette taille)** : supprime la
   suspension de la base. Si le fondateur préfère attendre, surveiller
   « Usage » dans la console Neon **chaque jour** la première semaine.
3. **Resend** : rester en Free, regarder le compteur le jour de l'ouverture ;
   passer en Pro seulement si les 100/jour sont atteints.

Ces trois choix appartiennent au fondateur. Le code, lui, est prêt.

## Ce qui n'a PAS pu être vérifié par Claude

- Le contenu des variables d'environnement de prod (le classificateur bloque
  leur extraction) : l'URL poolée est confirmée par la mémoire du 05/07, pas
  relue aujourd'hui.
- Le plan exact des comptes Vercel / Neon / Resend (tableaux de bord derrière
  une connexion) : « Hobby » et « Free » sont supposés d'après la mémoire.
- La liste des sauvegardes chiffrées sur Blob (jeton requis) : la première a
  été confirmée le 03/09, la restauration exercée le 03/09.

## Suite

`docs/lancement.md` — passage en live : Accounts v1 → Connect Express → clé
restreinte `rk_live_` → webhook live → variables Vercel → redéploiement → le
fondateur active ses propres versements en live → premier projet → 1 CHF réel.
