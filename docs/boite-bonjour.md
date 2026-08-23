# Ouvrir la boîte bonjour@genigain.com

*Préparé le 24 août 2026. C'est le chantier n° 1 : l'adresse est publiée sur
chaque page d'appel (lien « demander le retrait »), dans les CGU §12, les
mentions légales et la politique de confidentialité — qui promet un délai de
réponse. Tant que la boîte n'existe pas, la plateforme annonce une procédure
qu'elle ne peut pas honorer. Rien de tout ceci ne se règle dans le code : il
faut ton compte Apple et ~20 minutes.*

## État des lieux (vérifié le 24/08)

- `genigain.com` : **aucun enregistrement MX** — tout email vers
  `bonjour@genigain.com` rebondit aujourd'hui.
- L'envoi (Resend) vit sur le sous-domaine `send.genigain.com` (SPF
  amazonses vérifié) : **ajouter la réception sur la racine ne peut rien
  casser côté envoi.**
- La racine n'a aucun TXT : pas de fusion SPF à faire, on part de zéro.

## Recommandation : iCloud+ « Domaine de messagerie personnalisé »

Une **vraie boîte**, pas un simple renvoi : tu pourras **répondre depuis**
`bonjour@genigain.com` — indispensable quand la réponse est un acte de la
procédure §12 (une mise en demeure ne se répond pas depuis une adresse
iCloud personnelle). Inclus dans iCloud+ (l'abonnement payant iCloud, dès
0,99 €/mois — probablement déjà actif sur ton compte), jusqu'à 3 adresses
par domaine, utilisable dans Mail sur iPhone et Mac.

*Alternative si tu ne veux pas d'iCloud+ : ImprovMX (renvoi gratuit vers ta
boîte iCloud). Plus vite posé, mais répondre depuis l'adresse exige une
configuration SMTP en plus — pour une adresse à portée juridique, la vraie
boîte vaut les quelques minutes de plus.*

## Marche à suivre

### 1. Côté Apple (sur ton Mac ou icloud.com)

1. **Réglages Système → [ton nom] → iCloud → iCloud+ → Domaine de
   messagerie personnalisé** (ou icloud.com/icloudplus).
2. « Ajouter un domaine que tu possèdes » → `genigain.com` → « Toi
   uniquement ».
3. Apple affiche alors **les enregistrements DNS à poser** (MX, deux TXT,
   un CNAME DKIM). Garde cette page ouverte.

### 2. Côté Vercel (les NS du domaine sont chez eux)

Poser les enregistrements affichés par Apple — au choix dans le dashboard
(vercel.com → équipe → Domains → genigain.com → DNS Records) ou par la CLI
déjà authentifiée. Les valeurs standard d'Apple (⚠️ **recopie celles
qu'Apple affiche**, la valeur DKIM est propre au domaine) :

```bash
vercel dns add genigain.com '@' MX mx01.mail.icloud.com 10
```

```bash
vercel dns add genigain.com '@' MX mx02.mail.icloud.com 10
```

```bash
vercel dns add genigain.com '@' TXT "apple-domain=LA_VALEUR_AFFICHEE_PAR_APPLE"
```

```bash
vercel dns add genigain.com '@' TXT "v=spf1 include:icloud.com ~all"
```

```bash
vercel dns add genigain.com sig1._domainkey CNAME LA_VALEUR_DKIM_AFFICHEE_PAR_APPLE
```

Puis retourner sur la page Apple → « Terminer la configuration ». La
vérification peut prendre de quelques minutes à une heure (propagation).

### 3. Créer l'adresse

Toujours dans iCloud+ → ton domaine → **créer l'adresse `bonjour`**. Ajoute
le domaine dans Mail (iPhone/Mac) pour recevoir ET répondre depuis
`bonjour@genigain.com`.

### 4. Vérifier — les trois tests

1. **Réception** : envoie un email depuis une boîte externe (pas iCloud)
   vers `bonjour@genigain.com` → il arrive dans Mail.
2. **Réponse** : réponds-y → le destinataire voit `bonjour@genigain.com`
   comme expéditeur.
3. **L'envoi n'a pas bougé** : déclenche un « mot de passe oublié » sur
   genigain.com → l'email Resend arrive toujours (il part de
   `send.genigain.com`, indépendant, mais on vérifie après tout changement
   DNS).

## Après la mise en service

- Activer les notifications Mail pour cette boîte : la politique de
  confidentialité **promet un délai de réponse** — une demande de retrait
  §12 qui dort est exactement ce que la procédure devait éviter.
- Prévoir où archiver ces échanges : chaque demande de retrait et sa
  réponse font partie du dossier de l'appel concerné.
