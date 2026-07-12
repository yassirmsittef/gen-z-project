import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données GeniGain collecte, pourquoi, avec quels prestataires, combien de temps — et comment exercer tes droits.",
};

/**
 * Politique de confidentialité — reflète les traitements réellement en place
 * (schema.prisma, sous-traitants effectifs). À tenir à jour à chaque nouveau
 * traitement ou prestataire.
 */
export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="data-label mt-3">Version du 12 juillet 2026</p>

      <p>
        Cette page décrit ce que GeniGain fait de tes données, sans jargon inutile. Le principe
        général : on ne collecte que ce qui sert le fonctionnement de la plateforme, rien n’est
        vendu, et il n’y a <strong>aucun traceur publicitaire</strong> sur le site.
      </p>

      <h2>Qui est responsable</h2>
      <p>
        Le responsable du traitement est GeniGain, plateforme éditée par Yassir Msittef. Pour
        toute question ou demande liée à tes données :{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>.
      </p>

      <h2>Ce qu’on collecte</h2>
      <ul>
        <li>
          <strong>Ton compte</strong> : pseudo, email, mot de passe (stocké uniquement sous
          forme hachée — personne ne peut le lire, pas même nous), devise d’affichage préférée.
        </li>
        <li>
          <strong>Ton profil, si tu le remplis</strong> : photo (recadrée et compressée sur ton
          appareil avant envoi), bio, liens publics, compétences, ville. La ville affichée sur
          le globe Communauté est la position de la <strong>ville</strong>, jamais ta position
          exacte — GeniGain ne collecte aucune donnée GPS.
        </li>
        <li>
          <strong>Ton activité</strong> : contributions (montant, devise, équivalent USD au
          taux du jour, identifiants de paiement Stripe), projets, votes, commentaires,
          projets suivis, réputation, notifications et tes préférences de notification.
        </li>
        <li>
          <strong>Tes messages privés</strong> avec les autres membres (visibles uniquement de
          toi et de ton interlocuteur, et de la modération en cas de signalement).
        </li>
        <li>
          <strong>Signalements</strong> que tu envoies ou qui te visent.
        </li>
        <li>
          <strong>Demandes de partenariat</strong> : les marques transmettent leur email et leur
          proposition via un formulaire public.
        </li>
        <li>
          <strong>Données techniques</strong> : journaux serveur de l’hébergeur (adresses IP,
          horodatages) à des fins de sécurité et de diagnostic.
        </li>
      </ul>
      <p>
        <strong>Jamais collecté</strong> : ton numéro de carte (il ne transite que par Stripe),
        ta géolocalisation, ton carnet de contacts.
      </p>

      <h2>Pourquoi (et sur quelle base légale)</h2>
      <ul>
        <li>
          <strong>Faire fonctionner le service</strong> (exécution du contrat) : compte,
          contributions et séquestre, votes, remboursements et versements automatiques,
          messagerie, notifications — y compris par email pour les événements majeurs, selon
          tes préférences.
        </li>
        <li>
          <strong>Sécurité et confiance</strong> (intérêt légitime) : prévention de la fraude,
          modération des contenus signalés, analyse automatique anti-arnaque des demandes de
          partenariat (réservée au porteur ; aucune décision automatisée n’est prise — c’est
          toujours le porteur qui décide).
        </li>
        <li>
          <strong>Obligations légales</strong> : traçabilité comptable des paiements,
          remboursements et versements.
        </li>
      </ul>

      <h2>Qui y a accès</h2>
      <p>
        Publiquement visibles : ton pseudo, ta photo, ta bio, tes liens, tes compétences, ta
        ville, ta réputation, tes projets et ta présence parmi les contributeurs d’un projet.
        Ton email n’est jamais public. Pour le reste, GeniGain s’appuie sur des prestataires
        techniques qui traitent les données pour son compte :
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> (États-Unis) — hébergement du site et des photos de profil.
        </li>
        <li>
          <strong>Neon</strong> — base de données.
        </li>
        <li>
          <strong>Stripe</strong> — paiements, remboursements et versements ; Stripe est seul à
          manipuler les données de carte, et applique sa propre politique de confidentialité
          ainsi que la vérification d’identité des porteurs (KYC).
        </li>
        <li>
          <strong>Resend</strong> — envoi des emails transactionnels (réinitialisation de mot de
          passe, notifications majeures).
        </li>
        <li>
          <strong>Anthropic</strong> — analyse approfondie optionnelle des demandes de
          partenariat (le texte de la demande est analysé ; le résultat n’est montré qu’au
          porteur).
        </li>
      </ul>
      <p>
        Certains de ces prestataires sont établis aux États-Unis : les transferts sont encadrés
        par les mécanismes prévus par le RGPD (clauses contractuelles types, EU-U.S. Data
        Privacy Framework). Aucune donnée n’est vendue ni transmise à des annonceurs.
      </p>

      <h2>Combien de temps</h2>
      <ul>
        <li>
          Ton compte et son contenu : tant que le compte existe. La suppression du compte
          (tableau de bord → Sécurité) <strong>anonymise immédiatement</strong> tes données
          personnelles : le profil devient « Membre retiré », l’email est neutralisé, photo,
          bio, ville et compétences sont effacées.
        </li>
        <li>
          Les écritures financières (contributions, remboursements, versements) sont conservées
          sous forme anonymisée pour les obligations comptables et l’intégrité du séquestre.
        </li>
        <li>Les liens de réinitialisation de mot de passe expirent au bout de 60 minutes.</li>
        <li>Les journaux techniques sont conservés sur de courtes durées par l’hébergeur.</li>
      </ul>

      <h2>Tes droits</h2>
      <p>
        Tu peux consulter et corriger tes données directement depuis ton tableau de bord, et
        supprimer ton compte au même endroit. Pour les autres droits prévus par le RGPD (accès,
        portabilité, limitation, opposition), écris à{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a> — réponse sous un mois.
        Tu peux aussi saisir la CNIL (<a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">cnil.fr</a>).
      </p>

      <h2>Cookies</h2>
      <p>
        GeniGain n’utilise que des cookies <strong>strictement nécessaires</strong> : ta session
        de connexion et la protection des formulaires. Pas de cookies publicitaires, pas
        d’outils de mesure d’audience tiers — c’est pourquoi il n’y a pas de bandeau cookies.
      </p>

      <h2>Âge minimum</h2>
      <p>
        GeniGain est réservé aux personnes de 15 ans et plus, l’âge du consentement numérique en
        France. Voir aussi les <Link href="/cgu">conditions d’utilisation</Link> pour les
        conditions liées aux paiements.
      </p>

      <h2>Évolutions</h2>
      <p>
        Si cette politique change de façon significative (nouveau traitement, nouveau
        prestataire), la date de version en tête de page sera mise à jour et le changement
        annoncé sur le site.
      </p>
    </>
  );
}
