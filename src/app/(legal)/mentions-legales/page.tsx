import type { Metadata } from "next";
import Link from "next/link";
import { stripeLive } from "@/lib/stripe-mode";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement, prestataires, données de tiers et signalement de contenu sur GeniGain.",
};

/**
 * Mentions légales — réécriture du 9 septembre 2026 (revue juridique).
 * Le fondateur doit encore y ajouter son adresse postale (ou une adresse de
 * domiciliation) et, dès inscription, la forme juridique et l'IDE : art. 3
 * al. 1 let. s LCD (identité et adresse de contact, y compris électronique).
 */
export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="data-label mt-3">Version du 9 septembre 2026</p>

      <h2>Éditeur</h2>
      <p>
        <strong>GeniGain</strong> — genigain.com — est une plateforme communautaire de
        financement de projets
        {stripeLive
          ? ". Les paiements sont opérés par Stripe."
          : ", actuellement en phase de test (paiements Stripe en mode test, aucun débit réel)."}
      </p>
      <p>
        Éditeur, exploitant et responsable de la publication : <strong>Yassir Msittef</strong>,
        établi à Genève, Suisse. Contact :{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>.
      </p>
      <p>
        GeniGain est une plateforme suisse, ouverte à l’international. Les présentes mentions et
        l’usage du service sont régis par le droit suisse (voir les{" "}
        <Link href="/cgu">conditions d’utilisation</Link>).
      </p>

      <h2>Hébergement et prestataires techniques</h2>
      <ul>
        <li>
          <strong>Hébergement et exécution</strong> : Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, États-Unis — vercel.com. Fonctions exécutées à Francfort (Allemagne) ;
          stockage des images, des vidéos et des sauvegardes chiffrées.
        </li>
        <li>
          <strong>Base de données</strong> : Neon Inc., États-Unis — neon.tech ; données stockées
          à Francfort (Allemagne).
        </li>
        <li>
          <strong>Paiements</strong> : Stripe Payments Europe Ltd, 1 Grand Canal Street Lower,
          Dublin, Irlande — stripe.com.
        </li>
        <li>
          <strong>Emails</strong> : Resend Inc., États-Unis — resend.com.
        </li>
        <li>
          <strong>Analyse des demandes de partenariat</strong> (optionnelle) : Anthropic PBC,
          États-Unis.
        </li>
        <li>
          <strong>Traduction sur mobile</strong> (sur demande et avec accord) : Microsoft, Azure AI
          Translator.
        </li>
        <li>
          <strong>Connexion avec Google</strong> : Google LLC, États-Unis, si cette option est
          proposée.
        </li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque GeniGain, le sigil, l’interface et les éléments graphiques du site sont la
        propriété de l’éditeur. Les contenus publiés par les membres (projets, textes, images,
        vidéos) restent la propriété de leurs auteurs, qui accordent à GeniGain une licence
        d’hébergement et d’affichage dans le cadre du service (voir les{" "}
        <Link href="/cgu">conditions d’utilisation</Link>, section 9). Les marques citées dans les
        appels au remplacement appartiennent à leurs titulaires ; elles sont nommées à titre de
        critique et d’information, jamais pour suggérer un lien avec GeniGain.
      </p>

      <h2>Données de tiers</h2>
      <p>
        La liste des villes du monde (sélecteur de ville, globe Communauté) provient de{" "}
        <a href="https://www.geonames.org/" rel="noreferrer">GeoNames</a>, publiée sous licence{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer">
          Creative Commons Attribution 4.0
        </a>
        . Le rattachement de certaines localités à un pays est un choix éditorial de GeniGain,
        conforme aux résolutions des Nations unies, et n’engage pas GeoNames. Les icônes
        proviennent de Lucide (licence ISC).
      </p>

      <h2>Signaler un contenu illicite</h2>
      <p>
        Tu penses qu’un contenu publié sur GeniGain (projet, appel, témoignage vidéo, réponse,
        commentaire, message de salon, groupe, profil) est illicite ? Deux voies, ouvertes à tout
        le monde, membre ou non : le bouton « Signaler » présent sur chaque contenu (membres
        connectés), ou l’adresse{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>, en français ou en
        anglais. Pour être traité, un signalement contient : l’adresse exacte (URL) du contenu ;
        pourquoi tu le juges illicite, avec les faits et si possible la règle de droit ; ton nom
        et ton email ; et la phrase « je déclare de bonne foi que ce signalement est exact et
        complet ».
      </p>
      <p>
        Ce qu’on fait ensuite : accusé de réception, examen par un humain, puis décision motivée
        envoyée à toi et à l’auteur du contenu — sous 7 jours, sous 24 heures pour un contenu
        manifestement illicite (violence, haine, contenu sexuel impliquant un mineur, atteinte
        grave à une personne). Tu peux contester une décision en répondant sous 30 jours : un
        humain relit. GeniGain n’exerce aucune surveillance générale des contenus de ses membres :
        elle agit sur signalement, sur demande d’une autorité, ou quand elle constate elle-même
        une violation. Si tu résides dans l’Union européenne, cette adresse est aussi le point de
        contact prévu par le règlement sur les services numériques (DSA), pour les utilisateurs
        comme pour les autorités (objet « Autorité DSA »).
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </>
  );
}
