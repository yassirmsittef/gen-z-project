# Vrais paiements : montage séquestre conforme UE

*Étude de décision — 11 juillet 2026. Basée sur des sources publiques ; les points
marqués ⚖️ sont à valider par un avocat en droit financier avant tout lancement réel.*

## TL;DR

- Le modèle Tremplin (don avec récompense) **échappe à l'agrément européen PSFP/ECSP**,
  réservé au crowdfunding de prêt et d'investissement.
- En revanche, **encaisser l'argent des contributeurs pour le reverser aux porteurs est
  un service de paiement** : il faut un prestataire agréé dans la boucle — Tremplin ne
  doit jamais détenir les fonds sur ses propres comptes.
- Le système actuel de **tokens prépayés rechargeables serait, en vrai argent, de
  l'émission de monnaie électronique** (agrément EME) : il doit disparaître ou être
  porté par le partenaire agréé.
- **Stripe Connect ne sait pas faire notre séquestre** : rétention maximale ~90 jours,
  pas d'escrow — incompatible avec la libération par étapes sur plusieurs mois.
- **Recommandation : Mangopay (ou Lemonway) en Phase 2** — wallets par membre et par
  projet, séquestre sans limite de durée, libération par étapes = simples transferts
  entre wallets. Notre ledger interne devient le miroir du PSP, l'architecture du code
  actuel s'y mappe naturellement.

## 1. Ce que dit la réglementation

### 1.1 Agrément crowdfunding (PSFP) : non concerné

Le règlement (UE) [2020/1503](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R1503)
(« ECSP ») impose un agrément PSFP, délivré en France par l'AMF, aux plateformes de
**prêt et d'investissement**. Les **dons, avec ou sans contrepartie, sont exclus du
périmètre** (article 1er § 2) — c'est le régime d'Ulule ou KissKissBankBank, et celui de
Tremplin (contribution contre récompense symbolique / suivi du projet, sans rendement
financier). ⚖️ Confirmer avec l'AMF que nos « récompenses » restent hors champ.

Sources : [CCI Paris — harmonisation européenne du crowdfunding](https://www.cci-paris-idf.fr/fr/prospective/creda/harmonisation-europeenne-crowdfunding),
[Actu-Juridique — réglementation PSFP](https://www.actu-juridique.fr/affaires/droit-financier/crowdfunding-apercu-de-la-reglementation-periode-transitoire-et-supervision-des-prestataires-de-services-de-financement-participatif-psfp/),
[Lemonway — Crowdfunding & ECSP](https://www.lemonway.com/en/blog/crowdfunding-ecsp-regulation).

### 1.2 Services de paiement : le vrai sujet

Recevoir les fonds des contributeurs **sur un compte au nom de la plateforme** pour les
reverser ensuite aux porteurs = **encaissement pour compte de tiers** = service de
paiement (Code monétaire et financier). Trois issues :

1. **Agrément propre** (établissement de paiement, ACPR) — capital, dossier, compliance
   permanente : hors de portée d'un MVP.
2. **Agent d'un PSP agréé** — statut intermédiaire, déclaration ACPR via le PSP.
3. **Ne jamais toucher les fonds** : ils transitent et stationnent chez un PSP agréé
   (comptes de cantonnement), la plateforme n'est qu'orchestrateur technique. **C'est le
   montage standard du secteur, et notre cible.**

Sources : [economie.gouv.fr — cadre réglementaire](https://www.economie.gouv.fr/facileco/cadre-reglementaire-financement-participatif),
[Memo Bank — encaissement pour compte de tiers](https://memo.bank/magazine/encaissement-pour-compte-de-tiers/),
[Thelys Avocats — plateformes et réglementation financière](https://www.thelys-avocats.fr/plateformes-de-crowdfunding-dans-les-meandres-de-la-reglementation-financiere/).

### 1.3 ⚠️ Les tokens prépayés = monnaie électronique

Aujourd'hui : recharge 25 $ → 25 tokens dépensables plus tard, sur n'importe quel
projet. En argent réel, une valeur prépayée stockée, acceptée par des tiers (les
porteurs), remboursable — **c'est la définition de la monnaie électronique** → agrément
EME. En Phase 2, le wallet de tokens doit donc :

- soit **disparaître** (paiement direct carte → projet à chaque contribution, plus de
  solde rechargeable) ;
- soit être **porté par le partenaire** : le « solde de tokens » devient l'affichage du
  wallet Mangopay/Lemonway du membre (1 token = 1 €), l'émission de ME est chez eux.

À noter : la future **DSP3/PSR** (accord politique provisoire de novembre 2025) prévoit
de fusionner les statuts EP et EME — sans changer la conclusion : il faut un agréé dans
la boucle. Source : [Thelys Avocats](https://www.thelys-avocats.fr/plateformes-de-crowdfunding-dans-les-meandres-de-la-reglementation-financiere/).

## 2. Les trois options

### Option A — Mangopay ou Lemonway (recommandée)

Infrastructure de paiement pour plateformes, pensée pour le crowdfunding :

| | **Mangopay** | **Lemonway** |
|---|---|---|
| Statut | EME agréé (Luxembourg), passeport UE | Établissement de paiement **ACPR** (France), passeport 30 pays |
| Séquestre | **Sans limite de durée** (« unlimited escrow »), ~0,50 €/transaction escrow d'après les sources publiques ; tarification générale sur devis | Comptes de cantonnement ; tarifs affichés côté plateforme partenaire, sur devis |
| Références crowdfunding | Nombreuses plateformes UE | ~200 plateformes de crowdfunding, leader zone euro sur le segment |
| Modèle technique | Wallets par utilisateur + par projet, PayIn / Transfer / PayOut, KYC intégré | Équivalent (comptes de paiement par membre/projet) |

Flux cible pour Tremplin :

```
Contributeur ──PayIn carte──▶ Wallet membre ──Transfer──▶ Wallet projet (séquestre)
                                                              │
                              étape validée par le vote ──Transfer──▶ Wallet porteur ──PayOut──▶ IBAN
                              campagne échouée         ──Refunds──▶  contributeurs
```

Pourquoi ça nous va bien :

- **La libération par étapes devient triviale** : un `Transfer` wallet projet → wallet
  porteur au moment où `castVote` débloque l'étape — exactement là où
  `attemptMilestonePayout` s'insère aujourd'hui.
- **Notre ledger interne (`CreditTransaction`) devient le miroir du PSP** (`refId` = id
  de transaction Mangopay) : l'architecture actuelle (services transactionnels + ledger
  + idempotence par refId) se transpose sans refonte.
- Le KYC des porteurs (obligatoire avant payout, LCB-FT) remplace le gate
  `payouts_enabled` actuel de Connect — même forme dans le code.

Coûts d'entrée : contrat + onboarding compliance (quelques semaines), tarification sur
devis. ⚖️ CGU tripartites (membre ↔ PSP ↔ plateforme) à faire relire.

### Option B — Rester sur Stripe Connect (au prix d'un changement de promesse)

Stripe **ne fournit pas d'escrow** ; les payouts manuels permettent de retenir les
fonds **au maximum ~90 jours** ([doc Stripe](https://docs.stripe.com/connect/manual-payouts)).
Nos campagnes (jusqu'à 60 j) + libération par étapes (des mois) dépassent ce cadre.

Rester chez Stripe imposerait le modèle Kickstarter : débit au succès de la campagne,
**versement intégral et rapide au porteur**, et la « libération par étapes » redevient un
jeu interne de réputation sans rétention réelle des fonds. C'est le moins de travail
depuis l'existant (Checkout + Connect déjà branchés), mais **ça dénature la promesse
produit** (les fonds ne sont plus réellement bloqués par jalons). À garder en secours si
le séquestre strict est abandonné un jour.

Source : [Stripe — manual payouts](https://docs.stripe.com/connect/manual-payouts),
[Sharetribe — Stripe Connect overview](https://www.sharetribe.com/academy/marketplace-payments/stripe-connect-overview/).

### Option C — Agrément propre (EP/EME)

Capital réglementaire, dossier ACPR, dispositif LCB-FT permanent, reporting. Pertinent à
grande échelle, absurde pour un MVP. Écartée.

## 3. Recommandation & plan

**Option A, en commençant par Mangopay** (séquestre illimité explicitement produit,
sandbox gratuite, docs développeur solides). Demander un devis aux **deux** (Lemonway,
très implanté dans le crowdfunding FR/ACPR, peut être mieux-disant).

Plan d'intégration (Phase 2, dans l'ordre) :

1. **Sandbox Mangopay** : NaturalUser + Wallet par membre, Wallet par projet ; rejouer
   tout le cycle seedé (contribution, échec+remboursements, étapes) contre la sandbox.
2. **Recharge** : remplacer Stripe Checkout par un PayIn carte → wallet membre ;
   `formatCredits` lit le solde du wallet (1 token = 1 €). Le webhook Stripe actuel
   disparaît au profit des hooks Mangopay (même pattern refId/idempotence).
3. **KYC porteur** : upload de documents à la première demande de versement, gate sur le
   PayOut (même forme que l'actuel `payouts_enabled`).
4. **Bascule** : feature flag `PAYMENT_PROVIDER=stripe|mangopay` le temps de la
   transition ; les comptes de test Stripe restent en démo.
5. ⚖️ Avocat : qualification don/récompense (AMF), CGU, mentions, DSP3 à surveiller.

**Ce qui ne change pas** : les règles du jeu (vote pondéré, étapes, remboursements), le
ledger interne, l'UI. C'est le sens du travail fait jusqu'ici — le montage réel se
branche sur les mêmes points d'ancrage que le prototype Stripe.

## Sources

- [EUR-Lex — Règlement (UE) 2020/1503](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R1503)
- [economie.gouv.fr — Le cadre réglementaire du financement participatif](https://www.economie.gouv.fr/facileco/cadre-reglementaire-financement-participatif)
- [CCI Paris IdF — Une harmonisation européenne des règles sur le crowdfunding](https://www.cci-paris-idf.fr/fr/prospective/creda/harmonisation-europeenne-crowdfunding)
- [Actu-Juridique — Crowdfunding : aperçu de la réglementation PSFP](https://www.actu-juridique.fr/affaires/droit-financier/crowdfunding-apercu-de-la-reglementation-periode-transitoire-et-supervision-des-prestataires-de-services-de-financement-participatif-psfp/)
- [Thelys Avocats — Plateformes de crowdfunding et réglementation financière](https://www.thelys-avocats.fr/plateformes-de-crowdfunding-dans-les-meandres-de-la-reglementation-financiere/)
- [Memo Bank — L'encaissement pour compte de tiers](https://memo.bank/magazine/encaissement-pour-compte-de-tiers/)
- [Stripe — Using manual payouts](https://docs.stripe.com/connect/manual-payouts)
- [Sharetribe — Stripe Connect marketplace payments](https://www.sharetribe.com/academy/marketplace-payments/stripe-connect-overview/)
- [Mangopay — site & pricing](https://mangopay.com/pricing) · [Sharetribe — Mangopay overview](https://www.sharetribe.com/academy/marketplace-payments/mangopay-overview/) · [BusinessFinanced — Mangopay services & pricing](https://www.businessfinanced.co.uk/mangopay/)
- [Lemonway — solution crowdfunding](https://www.lemonway.com/en/crowdfunding-platform) · [Lemonway — à propos (agrément ACPR)](https://www.lemonway.com/en/about-lemonway) · [Lemonway — leader zone euro](https://www.lemonway.com/press/crowdfunding-la-solution-de-paiement-en-ligne-lemon-way-desormais-leader-sur-la-zone-euro)
- [Lemonway — Crowdfunding & ECSP Regulation](https://www.lemonway.com/en/blog/crowdfunding-ecsp-regulation)
