import type { Metadata } from "next";
import Link from "next/link";
import { stripeLive } from "@/lib/stripe-mode";

export const metadata: Metadata = {
  title: "Conditions d’utilisation",
  description:
    "Les règles du jeu GeniGain : contribuer, lancer un projet, fonds débloqués par étapes votées, remboursements et versements.",
};

/**
 * CGU — le texte décrit les règles RÉELLEMENT codées (constants.ts,
 * project-service, payouts). Toute évolution des règles du jeu doit être
 * répercutée ici. Relecture juridique prévue avant le passage aux paiements
 * réels (clés Stripe live).
 */
export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d’utilisation</h1>
      <p className="data-label mt-3">Version du 12 juillet 2026</p>

      <p>
        Bienvenue sur GeniGain. En créant un compte ou en utilisant la plateforme, tu acceptes
        ces conditions. Elles décrivent exactement les règles appliquées par le service — pas de
        petites lignes surprises : tout ce qui est écrit ici est ce que fait la plateforme.
      </p>

      {!stripeLive && (
        <div className="glass mt-6 rounded-2xl rounded-tr-sm p-4">
          <p className="mt-0 text-sm leading-relaxed text-muted-foreground">
            <strong>Phase de test.</strong> GeniGain fonctionne actuellement avec des paiements
            Stripe en <strong>mode test</strong> : aucune carte n’est réellement débitée. Les
            présentes conditions décrivent le fonctionnement cible de la plateforme ; l’ouverture
            des paiements réels sera annoncée clairement sur le site.
          </p>
        </div>
      )}

      <h2>1. Ce qu’est GeniGain (et ce que ce n’est pas)</h2>
      <p>
        GeniGain est une plateforme communautaire de financement de projets : les membres
        soutiennent financièrement les projets des autres membres, et les fonds collectés sont
        débloqués <strong>étape par étape</strong>, sur preuves validées par le vote des
        contributeurs.
      </p>
      <ul>
        <li>
          Une contribution est un <strong>soutien</strong> : elle ne te donne ni part du projet,
          ni intérêt, ni rendement, ni contrepartie financière d’aucune sorte.
        </li>
        <li>
          GeniGain n’est <strong>ni une plateforme d’investissement, ni un prêteur, ni un
          conseiller financier</strong>. Rien sur le site ne constitue un conseil en
          investissement.
        </li>
        <li>
          GeniGain fournit l’outil et les règles du jeu ; les projets sont portés par leurs
          porteurs, qui en sont seuls responsables.
        </li>
      </ul>

      <h2>2. Ton compte</h2>
      <ul>
        <li>Il faut avoir <strong>au moins 15 ans</strong> pour créer un compte.</li>
        <li>
          Pour contribuer par carte ou lancer une campagne, il faut être{" "}
          <strong>majeur·e</strong> ou avoir l’accord de ton représentant légal.
        </li>
        <li>
          Les informations de ton compte doivent être exactes. Un compte par personne ; tu es
          responsable de la confidentialité de ton mot de passe et de ce qui se passe via ton
          compte.
        </li>
        <li>
          Ta ville, ta photo, ta bio et tes liens sont optionnels et modifiables à tout moment
          depuis ton tableau de bord.
        </li>
      </ul>

      <h2>3. Contribuer à un projet</h2>
      <ul>
        <li>
          Le paiement se fait <strong>par carte via Stripe</strong>, dans la{" "}
          <strong>devise du projet</strong> (contribution minimale : 5 unités de cette devise).
          GeniGain ne voit ni ne stocke jamais ton numéro de carte.
        </li>
        <li>
          Chaque contribution est convertie en équivalent dollar US au taux du jour du paiement —
          uniquement pour le calcul du droit à poster (voir section 4) et les classements.
        </li>
        <li>
          Les fonds collectés sont réservés au projet et débloqués selon les règles de la
          section 5. Une contribution n’est pas un achat : tant que le projet suit les règles,
          elle n’est pas remboursable à la demande.
        </li>
        <li>
          Si un paiement aboutit après la clôture de la campagne, il est enregistré puis
          remboursé automatiquement, net des frais de carte (voir section 6).
        </li>
      </ul>

      <h2>4. Lancer un projet</h2>
      <ul>
        <li>
          <strong>Contribue d’abord</strong> : le droit de poster un projet s’ouvre à partir de{" "}
          <strong>20&nbsp;$ US de contributions cumulées</strong> (tes paiements, convertis au
          taux du jour de chacun). C’est la règle centrale de la communauté.
        </li>
        <li>
          Une campagne dure <strong>de 7 à 90 jours</strong>, avec un objectif entre 50 et
          100&nbsp;000 (dans la devise choisie pour le projet, définitive après création).
        </li>
        <li>
          Le projet est découpé en <strong>2 à 5 étapes</strong> dont la somme des montants est
          égale à l’objectif.
        </li>
        <li>
          Pendant la campagne, tu peux modifier le contenu (titre, pitch, description, visuel,
          compétences) mais <strong>jamais le cadre financier</strong> (objectif, étapes,
          échéance). Un projet ne peut être retiré que s’il n’a encore reçu aucune contribution.
        </li>
        <li>
          Si l’objectif n’est pas atteint à l’échéance, la campagne n’aboutit pas et tous les
          contributeurs sont remboursés (net des frais de carte, voir section 6).
        </li>
      </ul>

      <h2>5. Fonds sous séquestre, preuves et votes</h2>
      <p>
        Quand l’objectif est atteint, les fonds sont bloqués et libérés étape par étape :
      </p>
      <ul>
        <li>
          Pour débloquer une étape, le porteur soumet une <strong>preuve</strong> (liens,
          images) de sa réalisation.
        </li>
        <li>
          Les contributeurs votent. Chaque voix pèse le <strong>montant contribué</strong> au
          projet : une preuve est validée quand les votes « pour » dépassent 50&nbsp;% du total
          collecté, refusée quand les « contre » dépassent ce seuil. Si tous les contributeurs
          ont voté sans majorité stricte, la balance des voix tranche — l’égalité vaut refus.
        </li>
        <li>
          Une même étape refusée <strong>deux fois</strong> met fin au projet, et le séquestre
          restant est remboursé.
        </li>
        <li>
          Le porteur dispose de <strong>90 jours après le financement</strong> pour faire
          valider toutes les étapes. À l’échéance, un vote encore ouvert est tranché à la
          balance des bulletins déjà posés, puis le séquestre restant est remboursé.
        </li>
        <li>Le porteur ne vote jamais sur ses propres preuves.</li>
      </ul>

      <h2>6. Remboursements</h2>
      <ul>
        <li>
          Campagne non aboutie : remboursement de chaque contribution, <strong>net des frais de
          carte</strong> (voir ci-dessous).
        </li>
        <li>
          Projet arrêté en cours de réalisation (double refus, échéance dépassée, ou arrêt par le
          porteur) : remboursement <strong>au prorata</strong> du séquestre restant — chaque
          contributeur récupère sa part de ce qui n’a pas été débloqué, net des frais de carte.
        </li>
        <li>
          <strong>Frais de carte non restitués.</strong> Quand une contribution est remboursée,
          le prestataire de paiement (Stripe) ne restitue pas la commission de traitement qu’il a
          prélevée lors du paiement initial. Le remboursement correspond donc au montant
          réellement encaissé, déduction faite de cette commission. GeniGain n’ajoute aucun frais
          et n’en conserve aucun : ni le contributeur ni la plateforme ne paie de commission à
          GeniGain, mais les frais du réseau bancaire restent à la charge du contributeur en cas
          de remboursement, faute d’être récupérables.
        </li>
        <li>
          Les remboursements sont automatiques, vers le moyen de paiement d’origine. En cas
          d’incident technique, ils sont retentés chaque jour jusqu’à aboutir.
        </li>
      </ul>

      <h2>7. Versements aux porteurs</h2>
      <ul>
        <li>
          Les fonds débloqués sont versés via <strong>Stripe Connect</strong> : le porteur crée
          un compte de versement et passe la vérification d’identité exigée par Stripe (KYC).
        </li>
        <li>
          Les versements se font dans la devise du projet, répartis proportionnellement sur les
          paiements reçus. Une étape validée reste due tant que le compte de versement n’est pas
          finalisé.
        </li>
        <li>
          Un porteur résidant dans un pays non couvert par Stripe Connect ne pourra pas recevoir
          de versements ; vérifie la disponibilité avant de lancer une campagne.
        </li>
      </ul>

      <h2>8. Frais</h2>
      <p>
        GeniGain ne prélève <strong>aucune commission</strong> et n’absorbe aucun frais : la
        plateforme ne gagne ni ne perd d’argent sur les flux. Les seuls frais applicables sont
        ceux du prestataire de paiement (Stripe), fixés par lui et variables selon la carte et le
        pays (de l’ordre de 1,5 à 3&nbsp;% en général). Ils sont déduits des versements aux
        porteurs et, en cas de remboursement, du montant remboursé (section 6) ; le contributeur
        paie exactement le montant qu’il a choisi. Seuls les éventuels frais de litige
        (contestation de paiement / chargeback) facturés par Stripe restent à la charge de
        GeniGain. Si une commission GeniGain est introduite un jour, elle sera annoncée à
        l’avance, affichée avant chaque paiement et jamais rétroactive.
      </p>

      <h2>9. Contenus et comportements</h2>
      <ul>
        <li>
          Le porteur garantit que son projet est réel, licite, et que ses preuves sont
          sincères. Tromper la communauté (fausses preuves, projet fictif) entraîne la
          suspension du compte et le remboursement des contributeurs, sans préjudice des
          recours des personnes lésées.
        </li>
        <li>
          Sont interdits : arnaques et contenus trompeurs, contenus haineux ou discriminatoires,
          spam et démarchage, contrefaçon, et plus largement tout contenu illégal.
        </li>
        <li>
          Tes contenus restent ta propriété. Tu accordes à GeniGain une licence non exclusive et
          gratuite pour les afficher et les partager dans le cadre du service (pages du site,
          aperçus de partage, emails de notification).
        </li>
      </ul>

      <h2>10. Partenariats de marques</h2>
      <p>
        Les marques peuvent proposer un partenariat à un porteur via un formulaire public, sans
        compte. La marque garantit l’exactitude de sa proposition. Le porteur répond librement ;
        les outils d’aide à la décision fournis par GeniGain (dont une analyse automatique
        anti-arnaque) sont réservés au porteur et ne sont jamais communiqués à la marque.
        GeniGain n’est pas partie aux accords conclus entre marques et porteurs.
      </p>

      <h2>11. Modération et signalements</h2>
      <p>
        Chaque projet, commentaire ou profil peut être signalé. L’équipe de modération peut
        retirer un contenu, refuser un signalement ou suspendre un compte en cas de violation de
        ces conditions. L’identité de l’auteur d’un signalement n’est jamais communiquée à la
        personne visée.
      </p>

      <h2>12. Tes données</h2>
      <p>
        Le traitement de tes données personnelles est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Tu peux supprimer ton
        compte à tout moment depuis ton tableau de bord (carte « Sécurité ») : tes données
        personnelles sont alors anonymisées. La suppression est refusée tant que tu portes un
        projet en cours de campagne ou de réalisation ayant reçu des contributions — mène-le au
        bout d’abord.
      </p>

      <h2>13. Responsabilité</h2>
      <ul>
        <li>
          GeniGain s’engage sur le fonctionnement de la plateforme (séquestre, votes,
          remboursements automatiques), pas sur la réussite des projets : contribuer comporte le
          risque qu’un projet n’aboutisse pas, avec un remboursement limité au séquestre non
          débloqué.
        </li>
        <li>
          Le service est fourni avec une obligation de moyens ; des interruptions temporaires
          peuvent survenir (maintenance, incident, force majeure).
        </li>
        <li>
          Les décisions de déblocage appartiennent au vote des contributeurs ; GeniGain
          n’arbitre pas la qualité des projets.
        </li>
      </ul>

      <h2>14. Évolution des conditions</h2>
      <p>
        Ces conditions peuvent évoluer avec la plateforme. Les changements importants seront
        annoncés sur le site avant leur entrée en vigueur ; la date de version en tête de page
        fait foi. Continuer à utiliser GeniGain après un changement vaut acceptation.
      </p>

      <h2>15. Droit applicable</h2>
      <p>
        Ces conditions sont soumises au <strong>droit français</strong>. En cas de litige, une
        solution amiable sera recherchée d’abord — écris-nous à{" "}
        <a href="mailto:bonjour@genigain.com">bonjour@genigain.com</a>. À défaut, les tribunaux
        français sont compétents. Un dispositif de médiation de la consommation sera mis en
        place avant l’ouverture des paiements réels.
      </p>
    </>
  );
}
