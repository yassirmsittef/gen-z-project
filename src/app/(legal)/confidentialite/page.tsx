import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données GeniGain collecte, pourquoi, avec quels prestataires et dans quels pays, combien de temps — et comment exercer tes droits.",
};

/**
 * Politique de confidentialité — reflète les traitements réellement en place
 * (schema.prisma, sous-traitants effectifs, backup.ts, account.ts). À tenir à
 * jour à chaque nouveau traitement ou prestataire, ET changer la date.
 * Réécriture du 9 septembre 2026 (docs/revue-juridique-2026-09.md).
 */
export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="data-label mt-3">Version du 9 septembre 2026</p>

      <p>
        Cette page décrit ce que GeniGain fait de tes données, sans jargon inutile. Le principe
        général : on ne collecte que ce qui sert le fonctionnement de la plateforme, rien n’est
        vendu, et il n’y a aucun traceur publicitaire sur le site.
      </p>

      <h2>Qui est responsable</h2>
      <p>
        Le responsable du traitement est GeniGain, plateforme éditée par{" "}
        <strong>Yassir Msittef, établi à Genève, Suisse</strong> (coordonnées dans les{" "}
        <Link href="/mentions-legales">mentions légales</Link>). GeniGain est ouverte à
        l’international : le traitement de tes données est soumis à la loi suisse sur la
        protection des données (<strong>nLPD</strong>) et, si tu résides dans l’Union européenne,
        au <strong>RGPD</strong>. Pour toute question ou demande liée à tes données :{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>.
      </p>

      <h2>Ce qu’on collecte</h2>
      <ul>
        <li>
          <strong>Ton compte</strong> : pseudo, email, mot de passe (stocké uniquement sous forme
          hachée — personne ne peut le lire, pas même nous), langue et devise d’affichage, date
          de création du compte, et si ton email est vérifié.
        </li>
        <li>
          <strong>Ton profil</strong>, si tu le remplis : photo (recadrée et compressée sur ton
          appareil avant envoi), bio, liens publics, compétences, ville et son pays. La ville
          affichée sur le globe Communauté est la position de la ville, jamais ta position
          exacte — GeniGain ne collecte aucune donnée GPS.
        </li>
        <li>
          <strong>Ton activité</strong> : contributions (montant, devise, équivalent USD au taux
          du jour, identifiants de paiement Stripe, et si tu as choisi « anonyme »), dons à
          GeniGain, projets, votes, commentaires, projets suivis, réputation et ses événements,
          notifications et tes préférences de notification.
        </li>
        <li>
          <strong>Porteur</strong> : l’identifiant de ton compte de versement Stripe Connect.
          Les documents d’identité (KYC) sont collectés et gardés par Stripe, pas par nous.
        </li>
        <li>
          <strong>Tes messages privés</strong> avec les autres membres : visibles de toi et de
          ton interlocuteur seulement. L’équipe n’y accède pas depuis le site ; elle ne peut y
          accéder en base que pour une obligation légale ou un incident de sécurité.
        </li>
        <li>
          <strong>Tes messages dans les salons et groupes</strong> : visibles des membres du
          salon (tout membre connecté pour un salon public, les seuls membres pour un groupe
          privé) et de la modération ; conservés tant que le salon existe. Ton arrivée dans un
          salon est annoncée avec ton pseudo. On garde aussi les salons que tu rejoins, animes
          ou gères, et les exclusions (qui, quand, par qui).
        </li>
        <li>
          <strong>Tes appels au remplacement</strong> : la marque que tu nommes, le secteur, ton
          motif, ce que tu veux à la place, les liens que tu fournis à l’appui — et, s’il a été
          retiré, la date du retrait et son motif. Un appel est public. Il est publié sous ton
          pseudo, sauf si tu coches « anonyme » : ton nom et ta photo ne sont alors montrés à
          personne sur le site, mais l’appel reste rattaché à ton compte chez nous. GeniGain et
          la modération savent qui l’a écrit, et peuvent devoir le communiquer à une autorité ou
          à un tribunal qui le demande légalement. Anonyme sur le site, jamais anonyme pour la
          loi.
        </li>
        <li>
          <strong>Tes témoignages vidéo</strong> : le fichier lui-même (hébergé chez Vercel),
          sa vignette, sa légende et sa durée. Une vidéo est publique et publiée sous ton pseudo.
          Elle peut te rendre identifiable par ton visage et ta voix, ainsi que les lieux et les
          personnes que tu filmes — n’y fais apparaître personne sans son accord. Le retrait d’un
          témoignage supprime le fichier, pas seulement son affichage.
        </li>
        <li>
          <strong>Ta participation au fil</strong> : tes réponses dans la discussion sous un appel
          (publiques, sous ton pseudo), les appels que tu soutiens, et les projets que tu as
          déclarés remplaçants d’une marque.
        </li>
        <li>
          <strong>Signalements</strong> que tu envoies ou qui te visent, avec une copie du contenu
          signalé le temps que la modération tranche.
        </li>
        <li>
          <strong>Demandes de partenariat</strong> : les marques transmettent leur nom, leur email
          et leur proposition via un formulaire public.
        </li>
        <li>
          <strong>Sécurité</strong> : chaque échec de connexion est noté avec l’adresse email
          tentée (il ne sert que 15 minutes et est effacé au plus tard le lendemain) ;
          inscription, réinitialisation de mot de passe et demandes de partenariat sont comptées
          par adresse IP hachée, gardée 24 heures ; pour les admins, un secret de double
          authentification ; les journaux serveur de l’hébergeur (adresses IP, horodatages), à
          des fins de sécurité et de diagnostic.
        </li>
        <li>
          <strong>Traduction</strong> : si tu utilises « Traduire » sans être connecté, on
          retient le nombre de caractères traduits et la date, associés à ton adresse IP hachée —
          uniquement pour tenir le quota du service. Le texte traduit n’est pas conservé.
        </li>
        <li>
          <strong>Si tu te connectes avec Google</strong> (quand cette option est proposée) :
          Google nous transmet ton email, ton nom et ta photo, et on garde le jeton de connexion.
          Google est une source de données, pas un traceur.
        </li>
        <li>
          <strong>Jamais collecté</strong> : ton numéro de carte (il ne transite que par Stripe),
          ta géolocalisation, ton carnet de contacts.
        </li>
      </ul>

      <h2>Pourquoi (et sur quelle base légale)</h2>
      <ul>
        <li>
          <strong>Faire fonctionner le service</strong> (exécution du contrat) : compte,
          contributions et verrou des fonds, votes, remboursements et versements, dons,
          messagerie, salons, appels, notifications — y compris par email pour les événements
          majeurs, selon tes préférences.
        </li>
        <li>
          <strong>Sécurité et confiance</strong> (intérêt légitime) : prévention de la fraude,
          cadences anti-abus, modération des contenus signalés, alertes à l’équipe, analyse
          automatique anti-arnaque des demandes de partenariat (réservée au porteur ; aucune
          décision automatisée n’est prise — c’est toujours le porteur qui décide).
        </li>
        <li>
          <strong>Faire vivre une communauté visible</strong> (intérêt légitime) : profil public,
          « Le pouls », classements, compteurs de l’accueil. Tu peux t’y opposer en contribuant
          anonymement ou en nous écrivant.
        </li>
        <li>
          <strong>Avec ton consentement</strong> : l’envoi d’un texte à Microsoft pour le
          traduire sur mobile — demandé la première fois, retirable à tout moment.
        </li>
        <li>
          <strong>Obligations légales</strong> : traçabilité comptable des paiements,
          remboursements, versements et dons (10 ans, art. 958f CO) ; réponses aux demandes
          légales des autorités.
        </li>
      </ul>

      <h2>Qui y a accès</h2>
      <p>
        <strong>Ce que tout le monde voit, même sans compte</strong> : ton pseudo, ta photo, ta
        bio, tes liens, tes compétences, ta ville, ta réputation et ses derniers événements, ta
        date d’inscription, tes projets, le nombre de tes contributions et de tes votes, le total
        que tu as investi dans la communauté (en dollars), et ta présence parmi les contributeurs
        d’un projet — sauf si tu as coché « anonyme » au paiement. « Le pouls » de l’accueil
        montre ton arrivée, tes contributions non anonymes avec leur montant, tes projets lancés
        et tes dons à GeniGain avec leur montant. Ton email n’est jamais public.
      </p>
      <p>
        Pour le reste, GeniGain s’appuie sur des <strong>prestataires techniques</strong> qui
        traitent les données pour son compte, sous contrat :
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> (États-Unis ; fonctions exécutées à Francfort, Allemagne) —
          hébergement du site, stockage des photos de profil, des vidéos et vignettes, et des
          sauvegardes chiffrées de la base.
        </li>
        <li>
          <strong>Neon Inc.</strong> (États-Unis ; base de données stockée à Francfort, Allemagne)
          — base de données.
        </li>
        <li>
          <strong>Stripe Payments Europe Ltd</strong> (Irlande) — paiements, remboursements,
          versements, dons ; Stripe est seul à manipuler les données de carte, applique sa propre
          politique de confidentialité et fait lui-même la vérification d’identité des porteurs
          (KYC).
        </li>
        <li>
          <strong>Resend Inc.</strong> (États-Unis) — envoi des emails transactionnels (adresse,
          nom, contenu du message).
        </li>
        <li>
          <strong>Anthropic PBC</strong> (États-Unis) — analyse approfondie optionnelle des
          demandes de partenariat, seulement si tu es porteur et que la fonction est activée ; le
          résultat n’est montré qu’au porteur.
        </li>
        <li>
          <strong>Microsoft (Azure AI Translator)</strong> — traduction à la demande. Sur Chrome
          et Edge pour ordinateur, « Traduire » utilise le modèle intégré au navigateur et le
          texte ne quitte pas ta machine. Ailleurs (téléphones, Safari, Firefox), le texte est
          envoyé à Microsoft seulement si tu appuies sur « Traduire » et après ton accord,
          demandé la première fois. Tant que ce service n’est pas activé, « Traduire » sur mobile
          indique qu’il est indisponible et rien n’est envoyé. Microsoft ne conserve pas le texte
          soumis et ne s’en sert pas pour entraîner ses modèles.
        </li>
        <li>
          <strong>Google LLC</strong> (États-Unis) — seulement si tu choisis « Continuer avec
          Google », quand cette option est proposée.
        </li>
      </ul>
      <p>
        Certains de ces prestataires sont établis aux États-Unis. Les transferts hors de Suisse et
        de l’Union européenne sont encadrés par les mécanismes prévus par la nLPD et le RGPD :
        Data Privacy Framework (reconnu par la Suisse depuis le 15 septembre 2024) pour les
        entreprises certifiées, ou clauses contractuelles types de la Commission européenne,
        adaptées pour la Suisse. Écris-nous pour en recevoir copie. Aucune donnée n’est vendue ni
        transmise à des annonceurs.
      </p>

      <h2>Combien de temps</h2>
      <ul>
        <li>
          <strong>Ton compte et son contenu</strong> : tant que le compte existe.
        </li>
        <li>
          <strong>Supprimer ton compte</strong> (tableau de bord → Sécurité) anonymise ton profil
          tout de suite : pseudo remplacé par « Membre retiré », email neutralisé, photo, bio,
          ville, liens et compétences effacés, sessions coupées. Tes témoignages filmés sont
          retirés du direct et leurs fichiers supprimés du stockage, ta photo aussi. Ce qui reste
          en ligne, signé « Membre retiré » : tes commentaires, tes messages (dans les salons, et
          chez ceux qui les ont reçus en privé), tes appels, tes réponses et les légendes de tes
          vidéos — ils font partie des conversations des autres. Si tu veux retirer tes contenus
          publics, fais-le depuis chaque page avant de partir ; si un texte restant permet de te
          reconnaître, écris-nous : on le retire. Tes contributions, remboursements, versements et
          dons restent liés au compte anonymisé pour les obligations comptables (10 ans). Si un de
          tes contenus fait l’objet d’un signalement ouvert, une copie est gardée le temps que la
          modération tranche. Stripe conserve ses propres écritures et ton compte de versement
          selon ses règles : pour ce qui lui appartient, écris-lui.
        </li>
        <li>
          <strong>Sauvegardes</strong> : chaque nuit, une copie chiffrée de la base (AES-256, clé
          gardée hors du stockage) est déposée chez Vercel et gardée <strong>14 jours</strong>,
          uniquement pour restaurer le service après un incident. Ce que tu effaces disparaît des
          sauvegardes au plus tard 14 jours après. Si une restauration faisait réapparaître un
          compte supprimé, on le ré-anonymise aussitôt.
        </li>
        <li>
          Échecs de connexion (email tenté, date) : effacés chaque nuit. Compteurs anti-abus
          (adresse IP hachée) : 24 heures. Compteurs de traduction (caractères et date, jamais le
          texte) : 31 jours. Liens de réinitialisation de mot de passe : 60 minutes. Liens de
          vérification d’email : 24 heures.
        </li>
        <li>
          Un appel, une réponse ou une vidéo que tu retires restent en base, masqués, pour que les
          plafonds et les signalements tiennent ; le fichier vidéo, lui, est détruit.
        </li>
        <li>Les journaux techniques sont conservés sur de courtes durées par l’hébergeur.</li>
      </ul>

      <h2>Tes droits</h2>
      <p>
        Accès, rectification, effacement, limitation, opposition, portabilité : depuis ton tableau
        de bord (carte « Sécurité » : corriger tes données, télécharger l’ensemble de tes données
        en un clic, supprimer ton compte) ou par email à{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>. On te répond sous{" "}
        <strong>30 jours</strong>, gratuitement. On peut te demander de confirmer ton identité
        (par exemple en écrivant depuis l’email de ton compte). Tu peux retirer un consentement à
        tout moment — pour la traduction en ligne, il t’est redemandé sur chaque appareil et tu
        peux refuser. Tu peux aussi saisir une autorité de contrôle : en Suisse, le Préposé
        fédéral à la protection des données et à la transparence (PFPDT) ; dans l’Union
        européenne, l’autorité de protection des données de ton pays.
      </p>

      <h2>Cookies et stockage local</h2>
      <p>
        Uniquement le nécessaire, aucun bandeau : ta session de connexion (7 jours, renouvelée
        quand tu es actif, supprimée à la déconnexion), le jeton qui protège les formulaires
        contre les envois forgés (le temps de la visite), ta langue d’affichage (12 mois, posée
        quand tu la choisis), et, dans le stockage local du navigateur, ton accord pour la
        traduction en ligne. Tu peux les supprimer dans ton navigateur ; sans eux, tu devras te
        reconnecter ou rechoisir ta langue. Pas de cookies publicitaires, pas d’outils de mesure
        d’audience tiers.
      </p>

      <h2>Âge minimum</h2>
      <p>
        GeniGain est réservé aux personnes de <strong>16 ans et plus</strong>, déclaré à
        l’inscription. Si tu as moins de 18 ans, il te faut l’accord d’un parent ou représentant
        légal pour payer par carte, et 18 ans pour lancer un projet (Stripe l’exige) — voir les{" "}
        <Link href="/cgu">conditions d’utilisation</Link>. Selon ton pays de l’Union européenne
        (13 à 16 ans), un accord parental peut aussi être requis pour un consentement comme celui
        de la traduction. Si on apprend qu’un compte appartient à une personne de moins de 16
        ans, on le supprime.
      </p>

      <h2>Évolutions</h2>
      <p>
        Si cette politique change de façon significative (nouveau traitement, nouveau
        prestataire), la date de version en tête de page sera mise à jour et le changement
        annoncé sur le site, par email si tes droits sont touchés.
      </p>
    </>
  );
}
