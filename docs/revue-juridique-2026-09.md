# Revue juridique de GeniGain — 9 septembre 2026

Ce document n'est pas un avis d'avocat au sens de la loi. C'est une relecture structurée, à
faire valider par un avocat si possible. Demande du fondateur : « revérifie les CGU, fais un
taf d'une grosse équipe d'avocats ».

## Comment elle a été faite

Sept angles (droit suisse des contrats, protection des données nLPD/RGPD, paiements et LBA,
hébergeur/DSA/appels au boycott, consommateurs et mineurs, cohérence code ↔ textes, propriété
intellectuelle). Six relecteurs ont terminé et rendu **78 constats** ; la contre-vérification
par des relecteurs sceptiques a été coupée par la limite d'usage (1,6 M de tokens consommés),
donc **chaque constat retenu ici a été revérifié à la main contre les textes et le code**
(payouts.ts, route.ts du webhook, project-service.ts, account.ts, backup.ts, schema.prisma).
L'angle propriété intellectuelle a été couvert à la main (attribution GeoNames vérifiée).

## L'essentiel en dix lignes

1. Les CGU dataient du 23 août : elles décrivaient un séquestre qui n'existe plus (l'argent va
   sur le compte Stripe du porteur depuis le 5 septembre), ignoraient la page Soutenir, les
   appels anonymes, les groupes privés. **Réécrites** (version du 9 septembre).
2. Trois vrais bugs d'argent et de vie privée trouvés par la relecture, **corrigés et testés** :
   remboursement impossible pour tout projet hors CHF ; litige carte payé de ta poche ;
   contribution « anonyme » visible sur le profil public.
3. Le formulaire d'appel promettait un anonymat que personne ne peut tenir (« personne ne peut
   remonter jusqu'à toi ») : **corrigé en 7 langues** — anonymat d'affichage, jamais pour la loi.
4. « Engagement : le surplus est reversé » sur /soutenir était une charge exigible par chaque
   donateur : **reformulé en ligne de conduite**, 7 langues.
5. Trois âges circulaient (15, 16, majeur) : **16 ans partout**, déclaré par la case
   d'inscription, 18 ans pour lancer un projet (Stripe l'exige).
6. La charte des appels ne nommait pas le critère qui fait basculer un boycott en
   discrimination (nationalité, origine, religion) ni l'interdiction de viser salariés et
   magasins : **deux règles ajoutées**, et un régime écrit pour tes propres appels.
7. Mentions légales : LCEN (loi française) retirée, prestataires complets avec pays,
   **attribution GeoNames** (licence CC BY 4.0, obligatoire) ajoutée, procédure de signalement
   conforme à l'art. 16 du DSA.
8. Politique de confidentialité : sauvegardes 14 jours, ce qui reste après suppression, salons
   et groupes, données publiques (pouls, totaux), durées réelles, droits sous 30 jours.
9. **Il te reste des gestes que je ne peux pas faire à ta place** (adresse, boîte email,
   représentant UE, question LBA) — liste ci-dessous, avant le live.
10. Le reste (trace d'acceptation, fermeture de compte, purges, traductions) est du travail
    pour le mois qui vient, pas pour ce soir.

## Corrigé aujourd'hui

### Dans le code (tests : 255 passent, build OK)

| Défaut | Où | Correction |
|---|---|---|
| Remboursement d'un projet hors CHF : le rapatriement (reversal) était demandé dans la devise du projet alors que le transfer est en CHF → Stripe refusait, aucun contributeur d'un projet en €/$ n'aurait jamais été remboursé | `src/lib/payouts.ts` executeDueRefunds | Reversal calculé dans la devise du transfer (`reversalMinor`), remboursement dans celle du projet ; test « projet hors CHF » |
| Litige carte (chargeback) : Stripe reprenait le montant sur le solde de la plateforme (à zéro) pendant que l'argent restait chez le porteur | webhook `charge.dispute.created` | `reverseEscrowForDispute` rapatrie intégralement le transfer de séquestre, idempotent ; échec journalisé et remonté aux admins ; test |
| Contribution anonyme : un événement de réputation « Contribution à « Titre » » s'affichait sur le profil public | `src/lib/project-service.ts` | Aucun événement public pour une contribution anonyme |
| Charte des appels incomplète | `src/lib/constants.ts` CALL_CHARTER | + « critique ce qu'elle fait, jamais ce qu'elle est » ; + « pas de salarié, pas d'adresse, pas d'action physique » |

### Dans les textes (7 langues quand c'est une chaîne d'interface)

- CGU, politique de confidentialité, mentions légales : réécrits, version du 9 septembre 2026.
- Formulaire d'appel, case « anonyme » : promesse corrigée (7 langues).
- Page Soutenir, « Engagement » → « Notre ligne de conduite … pas un engagement chiffré » (7 langues).
- Inscription : « J'ai 16 ans ou plus et j'accepte les conditions… » (7 langues).
- Comment ça marche : « dès 15 ans » → 16 ; FAQ « jamais entre ses mains » → où est vraiment l'argent (7 langues).

## À faire par toi AVANT les paiements réels

1. **Ton adresse dans les mentions légales.** La loi suisse (art. 3 al. 1 let. s LCD) exige
   l'identité ET une adresse de contact pour tout service en ligne payant. Une adresse de
   domiciliation ou une case postale à Genève suffit si tu ne veux pas publier ton adresse
   privée. Phrase à ajouter sous « Éditeur » : « Adresse : [rue et numéro], [NPA] Genève,
   Suisse. » Dès inscription au registre : forme juridique et IDE.
2. **La boîte bonjour@genigain.com.** Elle est promise partout (litiges, droits sur les
   données, entreprises visées par un appel, signalements DSA) et elle rebondit. Sans elle, la
   posture d'hébergeur tombe : on ne peut pas dire « écris-nous » à une adresse morte.
   `docs/boite-bonjour.md`.
3. **Représentant dans l'Union européenne.** Le RGPD (art. 27) et le DSA (art. 13) demandent
   à un service établi hors UE qui vise des personnes dans l'UE de désigner un représentant
   dans un État membre. Prestataires en ligne : de l'ordre de 100 à 300 € par an. À décider ;
   à écrire ensuite dans la politique et les mentions.
4. **Question LBA (blanchiment).** Avec le séquestre chez le porteur, GeniGain ne détient
   jamais les fonds — c'est justement pourquoi ce modèle a été choisi. Mais elle donne à
   Stripe des ordres sur l'argent de tiers (verrou, libération, rapatriement). Un relecteur y
   voit une possible « aide au transfert » (art. 2 al. 3 LBA), avec une confiance limitée : la
   FINMA n'a pas publié de position sur un orchestrateur Stripe Connect sans détention de
   fonds. Ma lecture : pas d'intermédiation tant que l'argent ne transite pas par tes comptes
   et que Stripe (agréé) tient les fonds. À poser à un avocat LBA ou à un OAR (ARIF à Genève)
   — une question, pas un blocage.
5. **Stripe** : confirmer par écrit qu'un solde en versements manuels peut rester jusqu'à 180
   jours sur un compte Express sans virement forcé.
6. **Google en prod** : si « Continuer avec Google » est activé, la ligne sous le bouton doit
   dire « En continuant avec Google, tu confirmes avoir 16 ans ou plus et tu acceptes les
   conditions » — et mieux, une étape d'acceptation avant la création du compte.

## Dans le mois (code)

- **Trace d'acceptation** : `termsAcceptedAt` et `termsVersion` sur User, posés à
  l'inscription ; archiver chaque version des CGU. Aujourd'hui GeniGain ne peut pas prouver
  ce qu'un membre a accepté (art. 8 CC).
- **Fermeture de compte** : les CGU la promettent, le code n'a ni champ ni action.
  `suspendedAt` + refus de session + arrêt des projets via le chemin existant.
- **Signalements** : accusé de réception et décision motivée envoyés au signaleur (email),
  formulaire de signalement sans compte pour les tiers ; avis avec motif à l'auteur quand la
  modération retire une réponse.
- **Effacement de compte** : retirer les appels de l'auteur (comme les vidéos), ou tenir un
  registre scellé d'identité 12 mois pour répondre à un juge ; vider aussi le secret TOTP.
- **Purges** : jetons de vérification, signalements traités, notifications anciennes,
  contenus retirés, demandes de partenariat.
- **Restauration** : rejouer les effacements demandés entre-temps après une restauration.
- **Soutenir** : case « anonyme » (le pouls affiche pseudo et montant).
- **Traductions** : la charte des appels est affichée en français à tout le monde ; au
  minimum un résumé des CGU en 7 langues lié depuis la case d'inscription.
- **Paiement** : case « J'ai 18 ans ou l'accord de mon représentant légal » avant un
  paiement, datée en base ; retirer le yen et le franc CFA (5 unités = quelques centimes,
  Stripe refuse) ou fixer un minimum par devise.

## Constats écartés ou nuancés après revérification

- « Droit de rétractation UE » (confiance 0,5) : applicabilité incertaine à un don entre
  particuliers ; traité par une clause d'exécution immédiate (CGU §3 et §4 bis), suffisant.
- « Frais Stripe 1,5 à 3 % » : pas faux, mais incomplet ; le §8 donne désormais la part fixe,
  le change et un exemple chiffré.
- « §4 interdit de retirer un projet soutenu, §6 permet de l'arrêter » : les deux gestes
  existent bien dans le code ; ce n'était pas une contradiction mais une ambiguïté, levée.
- « ODR européenne » : fermée le 20 juillet 2025, jamais citée — rien à faire.
- « Suspension promise sans mécanisme » : gardée dans les CGU comme droit contractuel (une
  fermeture peut se faire à la main), avec motif et contestation ; le mécanisme est dans la
  liste du mois.

## Ce qui était déjà bien (et le reste)

Nature de la contribution bien qualifiée (ni part, ni rendement) ; frais annoncés avant le
paiement ; consentement CGU vérifié côté serveur ; remboursement net exact (projets en CHF) ;
personne ne peut contribuer avant que le compte du porteur soit actif ; litige carte gèle le
poids de vote ; retrait d'un appel ou d'une vidéo notifié avec motif ; vidéos vraiment
détruites ; IP jamais en clair ; traduction sur geste explicite avec consentement ; export RGPD
en un clic ; posture d'hébergeur écrite et cohérente ; réserve des protections impératives du
consommateur déjà présente au §16.
