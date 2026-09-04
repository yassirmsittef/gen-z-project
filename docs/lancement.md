# Ouverture officielle de GeniGain — la liste

*Préparée le 5 septembre 2026, à partir de l'état RÉEL de la prod (vérifié :
variables Vercel, pages en ligne, DNS, code).*

Aujourd'hui genigain.com tourne, sécurisé, sauvegardé, surveillé — mais en
**mode test** : le site l'annonce lui-même (« Bêta · paiements Stripe en mode
test, aucun vrai débit »). Ouvrir officiellement, c'est passer en argent réel
et honorer ce que le site promet. Six choses, dans l'ordre. Quatre ne se
règlent PAS dans le code.

## Ce qui est déjà prêt (rien à faire)
- Sécurité durcie, pare-feu, sauvegarde chiffrée quotidienne, CI verte,
  double authentification + codes de secours, bouton panique.
- Référencement : robots, sitemap, manifest PWA, image OpenGraph, icônes —
  tous servis en 200.
- Pages légales (CGU, confidentialité, mentions) en ligne, 7 langues.
- **Le passage en live est automatique côté texte** : bandeau d'accueil,
  pied de page, CGU, mentions, tableau de bord lisent le mode sur la clé
  Stripe. Poser des clés `_live_` suffit — aucune chaîne à chasser.

## 1. Stripe en argent réel — LE déclencheur (toi, ~15 min)
Dans le tableau de bord Stripe, **mode Live** (interrupteur en haut à droite) :
1. Développeurs → Clés API → la **clé restreinte live** (voir 2 bis) — pas
   la clé secrète complète.
2. Développeurs → Webhooks → **Ajouter un endpoint** :
   - URL : `https://genigain.com/api/webhooks/stripe`
   - Événements à cocher, exactement ces trois :
     `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`
   - copier le **secret de signature** de cet endpoint (`whsec_…`). Le mode
     live a SON propre secret : celui du test ne marchera pas.
3. Sur Vercel → gen-z-project → Settings → Environment Variables, remplacer
   en **Production** : `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.
4. Redéployer (Deployments → ⋯ → Redeploy). Le bandeau « mode test » disparaît
   de lui-même ; à sa place : « 0 % de commission · paiements sécurisés par
   Stripe ».
Ne colle jamais ces clés ailleurs que dans Vercel — et jamais dans une
conversation.

## 2. Stripe Connect activé sur le compte live (toi, ~10 min)
Les porteurs reçoivent leurs fonds via des comptes **Connect Express**
(capacité `transfers`). Sur le compte live : Connect → Commencer → choisir
**Express**. Sans ça, un porteur qui clique « Activer les versements »
verra une erreur. (En test, ça marchait sur le sandbox — le live doit être
activé à part.)

**Depuis le 5 septembre, le séquestre est CHEZ LE PORTEUR** : l'argent d'une
contribution part sur son compte Connect dès l'encaissement, en payouts
manuels, et n'atteint sa banque qu'à chaque étape validée. Ton solde reste à
zéro — rien à voler, rien à geler. Un porteur doit donc avoir **fini son
activation avant** de recevoir le premier centime (le site le lui dit).

## 2 bis. Une clé API RESTREINTE pour le site + une clé physique pour toi
Le site n'a besoin que de ces droits — rien d'autre. Développeurs → Clés API
→ **Créer une clé restreinte**, et coche exactement :
- Checkout Sessions : **écriture** · PaymentIntents : **lecture** ·
  Charges : **lecture** · Refunds : **écriture** · Transfers : **écriture**
  (couvre les reversals) · Payouts : **écriture** · Connect — Accounts et
  Account Links : **écriture**.
La clé commence par `rk_live_` (le site la reconnaît comme live). Avec elle,
un serveur compromis ne peut ni changer ton compte bancaire, ni virer vers un
inconnu. Et pour TON accès au tableau de bord Stripe : **clé de sécurité
physique** (YubiKey) dans Paramètres → Sécurité, et alertes sur tout
changement de compte bancaire.

## 3. La boîte bonjour@genigain.com (toi, ~20 min)
Le domaine n'a **aucun enregistrement MX** (vérifié le 05/09) : tout email
envoyé à bonjour@ rebondit. Or l'adresse est publiée sur chaque page d'appel,
dans les CGU et la politique de confidentialité, qui promet un délai de
réponse. Ouvrir officiellement avec une adresse qui rebondit, c'est annoncer
une procédure qu'on ne peut pas honorer. Marche à suivre détaillée, DNS
compris (attention à ne pas casser l'envoi Resend) : `docs/boite-bonjour.md`.

## 4. Relecture par un avocat (toi)
CGU, confidentialité, mentions : écrites avec soin, jamais relues par un
juriste. Avant d'encaisser de l'argent réel en Suisse, c'est le moment.

## 5. Créer le premier projet, pour de vrai (toi, 10 min — je vérifie)
La création de projet n'a **jamais été testée en prod**. Ton compte admin
est exempté du seuil de contribution : crée un vrai projet de bout en bout
(titre, étapes, publication). Dis-moi quand c'est fait, je vérifie qu'il
s'affiche, qu'on peut y contribuer, que les étapes se déroulent.

## 6. Un locuteur natif relit chaque langue (toi, quand tu peux)
Les 7 langues ont été écrites sans relecture native — l'arabe d'abord.
Pas bloquant pour ouvrir, mais un contresens dans une CGU se paie.

## Le jour J, l'ordre
1 → 2 → redéploiement → 5 (un vrai projet) → une **vraie contribution de
1 €** par toi pour voir l'argent passer → puis annoncer. Le 3 avant d'annoncer.
Je reste disponible pour vérifier chaque étape côté prod.
