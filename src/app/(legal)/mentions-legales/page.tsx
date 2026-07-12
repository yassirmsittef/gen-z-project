import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement et contacts de la plateforme GeniGain.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="data-label mt-3">Version du 12 juillet 2026</p>

      <h2>Éditeur</h2>
      <p>
        GeniGain — <a href="https://genigain.com">genigain.com</a> — est une plateforme
        communautaire de financement de projets, actuellement en phase de test (paiements Stripe
        en mode test, aucun débit réel).
      </p>
      <p>
        Directeur de la publication : Yassir Msittef. Contact :{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>.
      </p>
      <p>
        La structure juridique d’exploitation (forme sociale, immatriculation, siège) sera
        renseignée sur cette page avant l’ouverture des paiements réels.
      </p>

      <h2>Hébergement et prestataires techniques</h2>
      <ul>
        <li>
          <strong>Hébergement</strong> : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
          91723, États-Unis — <a href="https://vercel.com" rel="noopener noreferrer" target="_blank">vercel.com</a>.
        </li>
        <li>
          <strong>Base de données</strong> : Neon Inc. —{" "}
          <a href="https://neon.tech" rel="noopener noreferrer" target="_blank">neon.tech</a>.
        </li>
        <li>
          <strong>Paiements</strong> : Stripe Payments Europe Ltd, 1 Grand Canal Street Lower,
          Dublin, Irlande —{" "}
          <a href="https://stripe.com" rel="noopener noreferrer" target="_blank">stripe.com</a>.
        </li>
        <li>
          <strong>Emails</strong> : Resend Inc. —{" "}
          <a href="https://resend.com" rel="noopener noreferrer" target="_blank">resend.com</a>.
        </li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque GeniGain, le sigil, l’interface et les éléments graphiques du site sont la
        propriété de l’éditeur. Les contenus publiés par les membres (projets, textes, images)
        restent la propriété de leurs auteurs, qui accordent à GeniGain une licence d’affichage
        dans le cadre du service (voir les <Link href="/cgu">conditions d’utilisation</Link>).
      </p>

      <h2>Signaler un contenu</h2>
      <p>
        Chaque projet, commentaire et profil dispose d’un bouton « Signaler » qui alimente
        directement la file de modération. Pour un signalement au titre de la loi pour la
        confiance dans l’économie numérique (LCEN), tu peux aussi écrire à{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a> en décrivant précisément
        le contenu concerné et son adresse.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </>
  );
}
