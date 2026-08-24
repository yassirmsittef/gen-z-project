# Ouvrir la boîte bonjour@genigain.com

*Préparé le 24 août 2026. C'est le chantier n° 1 : l'adresse est publiée sur
chaque page d'appel (lien « demander le retrait »), dans les CGU §12, les
mentions légales et la politique de confidentialité — qui promet un délai de
réponse. Tant que la boîte n'existe pas, la plateforme annonce une procédure
qu'elle ne peut pas honorer. Rien de tout ceci ne se règle dans le code : il
faut ton compte Apple et ~20 minutes.*

## État des lieux (vérifié le 24/08, `dig` à l'appui)

- `genigain.com` : **aucun enregistrement MX** — tout email vers
  `bonjour@genigain.com` rebondit aujourd'hui.
- L'envoi (Resend) est réparti sur **deux** noms, et il faut connaître les
  deux avant de toucher au DNS :
  - la **signature DKIM est sur la racine** : `resend._domainkey.genigain.com`
    porte la clé publique. C'est la racine qui est le domaine vérifié chez
    Resend, pas le sous-domaine ;
  - `send.genigain.com` porte l'**enveloppe** : son SPF
    (`include:amazonses.com`) et son MX de retour
    (`feedback-smtp.eu-west-1.amazonses.com`), qui collecte les rebonds.
- **Ajouter la réception sur la racine reste sans danger pour l'envoi**, mais
  pour une autre raison que « l'envoi est ailleurs » : le MX de la racine ne
  sert qu'à RECEVOIR, Resend expédie avec un chemin de retour en
  `send.genigain.com`, et le sélecteur DKIM d'Apple (`sig1`) ne croise pas
  celui de Resend (`resend`). **À condition de n'ajouter que des noms, sans
  jamais toucher aux deux existants.**
- La racine n'a **aucun TXT** aujourd'hui : le SPF iCloud qu'on y pose est le
  premier, donc aucune fusion à faire. ⚠️ **Un nom ne peut jamais porter deux
  enregistrements SPF** : si Resend en réclamait un sur la racine plus tard,
  il faudrait fusionner les deux `include:` dans une SEULE ligne, pas en
  ajouter une deuxième.

### À ne surtout pas supprimer en chemin
`resend._domainkey.genigain.com` (TXT) et tout ce qui porte
`send.genigain.com` (TXT et MX) : ce sont eux qui font partir — et arriver —
les emails de la plateforme.

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

D'abord, photographier l'existant — c'est ce qui permettra de constater
après coup que rien n'a disparu :

```bash
vercel dns ls genigain.com
```

Poser ensuite les enregistrements affichés par Apple — au choix dans le
dashboard (vercel.com → équipe → Domains → genigain.com → DNS Records) ou par
la CLI déjà authentifiée. `dns add` **ajoute** sans écraser : les
enregistrements Resend restent en place tant qu'on ne fait pas de
`dns remove`. Les valeurs standard d'Apple (⚠️ **recopie celles qu'Apple
affiche**, la valeur DKIM est propre au domaine) :

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
   genigain.com → l'email Resend arrive toujours, et **dans la boîte de
   réception, pas dans les indésirables** (c'est ce qui révélerait une
   signature cassée). Contrôle DNS complémentaire — les deux doivent
   toujours répondre :

```bash
dig TXT resend._domainkey.genigain.com +short && dig TXT send.genigain.com +short
```

## Après la mise en service

- Activer les notifications Mail pour cette boîte : la politique de
  confidentialité **promet un délai de réponse** — une demande de retrait
  §12 qui dort est exactement ce que la procédure devait éviter.
- Prévoir où archiver ces échanges : chaque demande de retrait et sa
  réponse font partie du dossier de l'appel concerné.
