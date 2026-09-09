import type { Metadata } from "next";
import Link from "next/link";
import { stripeLive } from "@/lib/stripe-mode";

export const metadata: Metadata = {
  title: "Conditions d’utilisation",
  description:
    "Les règles du jeu GeniGain : contribuer, lancer un projet, argent verrouillé chez Stripe et libéré par étapes votées, remboursements, appels, salons.",
};

/**
 * CGU — le texte décrit les règles RÉELLEMENT codées (constants.ts,
 * project-service, payouts, boycott, chat-groups). Toute évolution des règles
 * du jeu doit être répercutée ici ET la date de version changée.
 * Réécriture du 9 septembre 2026 après la revue juridique
 * (docs/revue-juridique-2026-09.md) : séquestre chez le porteur, Soutenir,
 * anonymat d'affichage, salons et groupes, litiges carte, for du consommateur.
 */
export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d’utilisation</h1>
      <p className="data-label mt-3">Version du 9 septembre 2026</p>

      <p>
        Bienvenue sur GeniGain. En créant un compte ou en utilisant la plateforme, tu acceptes
        ces conditions. Elles décrivent les règles réellement appliquées par le service — pas de
        petites lignes surprises. Quand une règle change, la date de version en tête de page
        change avec elle (section 15).
      </p>

      {!stripeLive && (
        <div className="glass mt-6 rounded-2xl rounded-se-sm p-4">
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
        soutiennent financièrement les projets des autres membres, et l’argent est libéré{" "}
        <strong>étape par étape</strong>, sur preuves validées par le vote des contributeurs.
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
          <strong>GeniGain ne détient jamais ton argent.</strong> Les paiements sont encaissés et
          gardés par Stripe. GeniGain donne seulement à Stripe les instructions prévues ici :
          déposer, verrouiller, libérer une étape, rapatrier, rembourser (section 5).
        </li>
        <li>
          GeniGain fournit l’outil et les règles du jeu ; les projets sont portés par leurs
          porteurs, qui en sont seuls responsables.
        </li>
      </ul>

      <h2>2. Ton compte</h2>
      <ul>
        <li>
          Il faut avoir <strong>16 ans</strong> pour ouvrir un compte : tu le confirmes en cochant
          la case à l’inscription. Si on découvre qu’un compte appartient à une personne plus
          jeune, il est fermé.
        </li>
        <li>
          Pour <strong>payer</strong> (contribuer à un projet, soutenir GeniGain), il faut être
          majeur·e ou avoir l’accord de ton représentant légal ; GeniGain peut te demander une
          preuve de cet accord et, s’il manque, rembourser et fermer le compte. Pour{" "}
          <strong>lancer un projet</strong>, il faut avoir 18 ans : Stripe l’exige pour ouvrir
          un compte de versement.
        </li>
        <li>
          Les informations de ton compte doivent être exactes. Un compte par personne ; tu es
          responsable de la confidentialité de ton mot de passe et de ce qui se passe via ton
          compte. Tu peux fermer toutes tes sessions d’un coup depuis ton tableau de bord.
        </li>
        <li>
          Ta ville, ta photo, ta bio et tes liens sont optionnels et modifiables à tout moment
          depuis ton tableau de bord.
        </li>
      </ul>

      <h2>3. Contribuer à un projet</h2>
      <ul>
        <li>
          Le paiement se fait par carte via <strong>Stripe</strong>, dans la devise du projet
          (contribution minimale : 5 unités de cette devise). GeniGain ne voit ni ne stocke
          jamais ton numéro de carte.
        </li>
        <li>
          Chaque contribution est convertie en équivalent dollar US au taux indicatif du jour du
          paiement (fourni par un service tiers ; un taux de secours approximatif sert s’il ne
          répond pas) — uniquement pour le droit de poster (section 4) et les classements.
        </li>
        <li>
          Ta contribution est déposée chez Stripe sur le compte de versement du porteur,{" "}
          <strong>verrouillé</strong> jusqu’aux étapes validées par le vote (section 5).
        </li>
        <li>
          Une contribution n’est pas un achat : tant que le projet suit les règles, elle n’est
          pas remboursable à la demande. Si tu es consommateur dans l’Union européenne : en
          payant, tu demandes expressément que ta contribution soit exécutée tout de suite (le
          dépôt chez Stripe a lieu dès le paiement) et tu reconnais qu’une fois ce dépôt fait, tu
          ne peux plus te rétracter. Tu gardes tous les remboursements prévus par ces conditions.
        </li>
        <li>
          Tu peux contribuer <strong>sans afficher ton nom</strong>. Le porteur et les autres
          membres ne voient pas qui a donné ; ton vote pèse le même poids et le remboursement
          reste le tien. GeniGain et Stripe gardent le lien avec ton compte (remboursement,
          comptabilité, obligations légales).
        </li>
        <li>
          Si un paiement aboutit après la clôture de la campagne, il est enregistré puis
          remboursé automatiquement, net des frais de carte (section 6).
        </li>
      </ul>

      <h2>4. Lancer un projet</h2>
      <ul>
        <li>
          <strong>Contribue d’abord</strong> : le droit de poster un projet s’ouvre à partir de{" "}
          <strong>20 $ US</strong> cumulés — tes contributions à des projets et tes soutiens à
          GeniGain (section 4 bis), chacun converti au taux indicatif du jour du paiement. Si
          une contribution t’est remboursée, sa part sort du cumul. C’est la règle centrale de
          la communauté ; les comptes de l’équipe GeniGain n’y sont pas soumis, le temps
          d’amorcer la plateforme.
        </li>
        <li>
          Une campagne dure de <strong>7 à 90 jours</strong>, avec un objectif entre{" "}
          <strong>50 et 100 000</strong> (dans la devise choisie pour le projet, définitive après
          création). Le projet est découpé en <strong>2 à 5 étapes</strong> dont la somme des
          montants est égale à l’objectif.
        </li>
        <li>
          Pendant la campagne, tu peux modifier le contenu (titre, pitch, description, visuel,
          compétences) mais jamais le cadre financier (objectif, étapes, échéance).
        </li>
        <li>
          <strong>Retirer ou arrêter.</strong> Tant que personne n’a contribué, tu peux retirer
          (effacer) ton projet. Dès la première contribution, tu ne peux plus l’effacer, mais tu
          peux l’<strong>arrêter</strong> à tout moment : tout ce qui n’a pas été libéré par un
          vote est remboursé aux contributeurs (net des frais de carte, section 6) ; ce que les
          votes ont déjà libéré reste acquis. Un arrêt est définitif et visible sur la page du
          projet.
        </li>
        <li>
          Si l’objectif n’est pas atteint à l’échéance, la campagne n’aboutit pas et tous les
          contributeurs sont remboursés (net des frais de carte, section 6).
        </li>
        <li>
          <strong>Impôts.</strong> L’argent que tu reçois est à toi — et il est peut-être
          imposable. Selon ton pays, un don se déclare (impôt sur les donations ou sur le
          revenu, TVA si tu vends quelque chose en échange). C’est toi qui déclares et qui paies.
          GeniGain ne retient rien et ne délivre pas de justificatif fiscal : garde le relevé
          Stripe de tes versements.
        </li>
      </ul>

      <h2>4 bis. Soutenir GeniGain</h2>
      <ul>
        <li>
          Tu peux faire un <strong>don à la plateforme</strong> depuis la page{" "}
          <Link href="/soutenir">Soutenir</Link>, en francs suisses, à partir de 1 CHF. Ce n’est
          pas une contribution à un projet : pas d’étapes, pas de verrou, pas de vote, pas de
          contrepartie. Il est encaissé tout de suite par GeniGain et il est{" "}
          <strong>définitif</strong> — pas de remboursement, sauf erreur manifeste de paiement
          signalée sous 14 jours à bonjour@genigain.com. Il ne te donne aucun droit sur GeniGain
          ni sur un projet.
        </li>
        <li>
          Deux effets, et seulement deux : ton don compte dans le seuil de 20 $ qui ouvre le droit
          de lancer un projet (section 4), et il apparaît dans le fil public « Le pouls » de
          l’accueil, avec ton pseudo et le montant.
        </li>
        <li>
          Si tu es consommateur dans l’Union européenne : en payant, tu demandes que ce service
          (l’ouverture du droit de poster) soit exécuté immédiatement, et tu reconnais perdre
          ton droit de rétractation de 14 jours.
        </li>
        <li>
          Ce que finance ton don : le développement, la sécurité et les coûts de la plateforme.
          Notre ligne de conduite — pas un engagement chiffré dont tu pourrais exiger
          l’exécution — est de consacrer ce qui dépasse ces besoins à soutenir des projets de
          membres, selon des modalités que GeniGain choisit et publie sur le site. Tu reçois un
          reçu par email ; il ne vaut pas attestation fiscale.
        </li>
      </ul>

      <h2>5. Où est ton argent, preuves et votes</h2>
      <p>
        Dès que ta contribution est payée, son montant, net des frais de carte, est déposé par
        Stripe sur le <strong>compte de versement Stripe du porteur</strong>. Ce compte est au
        nom du porteur, mais il est <strong>verrouillé</strong> : ses virements vers sa banque
        sont réglés en « manuel », et seule GeniGain les libère, étape par étape, quand la
        communauté a validé une preuve. L’argent n’est jamais sur un compte de GeniGain : il est
        chez Stripe, au nom du porteur, sous le contrôle de GeniGain. Ce n’est ni un séquestre
        judiciaire ni un compte bloqué au sens bancaire (section 7 pour ce qui arrive si Stripe
        restreint ce compte).
      </p>
      <ul>
        <li>
          En lançant un projet, le porteur accepte que GeniGain règle et maintienne en « manuel »
          les virements de ce compte, libère les fonds étape par étape, et{" "}
          <strong>rapatrie</strong> ce qui n’a pas été libéré si le projet échoue, s’arrête, ou si
          une contribution doit être remboursée ou reprise. Il s’interdit de modifier ce réglage
          ou de retirer ces fonds par un autre moyen : ce serait une violation grave de ces
          conditions.
        </li>
        <li>
          Un projet ne peut recevoir aucune contribution tant que son porteur n’a pas activé et
          fait vérifier son compte de versement (section 7).
        </li>
        <li>
          Pour débloquer une étape, le porteur soumet une <strong>preuve</strong> (liens, images)
          de sa réalisation. Les contributeurs votent. Chaque voix pèse le montant contribué au
          projet : une preuve est validée quand les votes « pour » dépassent 50 % du total
          collecté, refusée quand les « contre » dépassent ce seuil. Si tous les contributeurs
          ont voté sans majorité stricte, la balance des voix tranche — l’égalité vaut refus.
        </li>
        <li>
          Une même étape refusée <strong>deux fois</strong> met fin au projet, et ce qui n’a pas
          été libéré est remboursé.
        </li>
        <li>
          Le porteur dispose de <strong>90 jours</strong> après le financement pour faire valider
          toutes les étapes. À l’échéance, un vote encore ouvert est tranché à la balance des
          bulletins déjà posés, puis ce qui n’a pas été libéré est remboursé.
        </li>
        <li>Le porteur ne vote jamais sur ses propres preuves.</li>
        <li>
          Les contributions payées avant le 5 septembre 2026 sont restées sur le compte Stripe de
          GeniGain : elles sont versées au porteur à chaque étape validée, ou remboursées, selon
          les mêmes règles.
        </li>
      </ul>

      <h2>6. Remboursements</h2>
      <ul>
        <li>
          <strong>Campagne non aboutie</strong> : remboursement de chaque contribution, net des
          frais de carte.
        </li>
        <li>
          <strong>Projet arrêté en cours de réalisation</strong> (double refus, échéance dépassée,
          arrêt par le porteur ou par GeniGain) : remboursement au prorata de ce qui n’a pas été
          libéré — chaque contributeur récupère sa part, net des frais de carte.
        </li>
        <li>
          <strong>Frais de carte non restitués.</strong> Quand une contribution est remboursée,
          Stripe ne restitue pas les frais qu’il a prélevés lors du paiement. Le remboursement
          correspond donc au montant réellement encaissé, déduction faite de ces frais. GeniGain
          n’ajoute aucun frais et n’en conserve aucun.
        </li>
        <li>
          Les remboursements sont lancés automatiquement, vers le moyen de paiement d’origine, à
          partir des fonds rapatriés du compte de versement du porteur. En cas d’incident
          technique, ils sont retentés chaque jour. Si ces fonds ne peuvent pas être récupérés
          (compte bloqué par Stripe, litige bancaire, retrait indu par le porteur), GeniGain te
          le dit, engage les démarches contre le porteur et te tient informé ; elle ne rembourse
          pas sur ses propres fonds.
        </li>
      </ul>

      <h2>7. Ton compte de versement (porteur)</h2>
      <ul>
        <li>
          Tu reçois l’argent sur un compte <strong>Stripe Connect Express</strong> à ton nom, que
          tu ouvres avant de recevoir la première contribution, avec la vérification d’identité
          exigée par Stripe (KYC). En le créant, tu acceptes le contrat de compte connecté de
          Stripe (Stripe Connected Account Agreement, qui inclut les Stripe Services Agreement).
          Stripe peut te demander des informations, retenir des fonds, restreindre ou fermer ton
          compte selon ses propres règles ; GeniGain n’y peut rien.
        </li>
        <li>
          En lançant un projet, tu donnes à GeniGain le <strong>mandat</strong> d’agir sur ce
          compte pour appliquer ces conditions : y déposer les contributions, bloquer les
          virements vers ta banque, libérer chaque étape validée, et rapatrier ce qui doit être
          remboursé ou repris. Tu ne modifies pas ce réglage et tu ne retires pas ces fonds par
          un autre moyen.
        </li>
        <li>
          Une étape validée est libérée en <strong>un virement</strong> vers ta banque, dans la
          devise de règlement de ton compte, net des frais de carte. Les mouvements internes chez
          Stripe se font dans la devise de règlement de GeniGain (le franc suisse) ; Stripe
          convertit au taux du jour, frais de change compris.
        </li>
        <li>
          Tu gardes ce compte en règle (réponds aux demandes de Stripe, tiens tes coordonnées à
          jour). Si Stripe restreint, gèle ou ferme ton compte, les libérations et les
          remboursements attendent que Stripe libère les fonds ; tu restes tenu envers tes
          contributeurs de ce qui n’a pas pu leur être rendu.
        </li>
        <li>
          <strong>Contestations de paiement.</strong> Si un contributeur conteste un paiement
          auprès de sa banque (chargeback), Stripe reprend le montant contesté et facture des
          frais de litige. Tu acceptes que GeniGain fasse rapatrier depuis ton compte de
          versement la part de cette contribution qui s’y trouve encore, et déduise le reste de
          tes prochains versements.
        </li>
        <li>
          Un porteur résidant dans un pays non couvert par Stripe Connect ne peut pas lancer de
          projet ; vérifie la disponibilité avant.
        </li>
      </ul>

      <h2>8. Frais</h2>
      <ul>
        <li>
          <strong>GeniGain ne prend aucune commission</strong> sur les projets : elle ne gagne
          pas un centime sur les flux. Ses seules recettes sont les dons de la section 4 bis.
        </li>
        <li>
          Stripe, lui, prélève des frais sur chaque paiement : un pourcentage plus une part fixe
          (par exemple environ 2,9 % + 0,30 pour une carte européenne, davantage pour une carte
          hors Europe), ainsi que des frais de change si le projet n’est pas en francs suisses.
          Ces frais sont fixés par Stripe et peuvent changer ; le tarif à jour est publié sur
          stripe.com.
        </li>
        <li>
          Concrètement : tu paies exactement le montant choisi. Le porteur reçoit ce montant
          moins les frais Stripe. Si tu es remboursé, tu récupères ce montant moins les mêmes
          frais, que Stripe ne restitue pas. Exemple : sur 10 CHF, Stripe garde environ 0,60 CHF ;
          le porteur reçoit environ 9,40 CHF ; un remboursement rend environ 9,40 CHF. Sur une
          petite contribution, la part fixe pèse plus.
        </li>
        <li>
          <strong>Litiges bancaires.</strong> Si ta banque conteste un paiement, la contribution
          est gelée et ne pèse plus dans les votes ; GeniGain reprend le montant sur le compte de
          versement du porteur (section 7). Seuls les frais de litige facturés par Stripe restent
          à la charge de GeniGain. Contester auprès de ta banque une contribution que tu as bien
          autorisée, alors que ces conditions prévoient ton remboursement, est un abus : GeniGain
          peut fermer ton compte et te réclamer les frais engagés.
        </li>
        <li>
          Si une commission GeniGain est introduite un jour, elle sera annoncée à l’avance,
          affichée avant chaque paiement et jamais rétroactive.
        </li>
      </ul>

      <h2>9. Contenus et comportements</h2>
      <ul>
        <li>
          Le porteur garantit que son projet est réel, licite, et que ses preuves sont sincères.
          Tromper la communauté (fausses preuves, projet fictif) entraîne la fermeture du compte
          et le remboursement des contributeurs, sans préjudice des recours des personnes lésées.
        </li>
        <li>
          Sont interdits : arnaques et contenus trompeurs, contenus haineux ou discriminatoires,
          harcèlement, spam et démarchage, contrefaçon, et plus largement tout contenu illégal.
        </li>
        <li>
          Tes contenus restent ta propriété. Tu accordes à GeniGain une licence non exclusive,
          gratuite et mondiale pour les héberger, les reproduire techniquement (copies de
          travail, miniatures, sauvegardes), les afficher et les partager dans le cadre du
          service (pages du site, fils publics et « Le pouls », aperçus de partage, emails de
          notification), et les faire traduire à la demande d’un lecteur. Cette licence passe
          par les prestataires techniques de GeniGain et dure tant que le contenu est en ligne,
          plus le temps des sauvegardes (14 jours).
        </li>
        <li>
          Tu garantis détenir les droits sur ce que tu publies (textes, images, vidéos, musique)
          et l’accord des personnes reconnaissables.
        </li>
      </ul>

      <h2>9 bis. Salons et groupes</h2>
      <ul>
        <li>
          Les <strong>salons publics</strong> (par catégorie et par langue) sont lisibles par tout
          membre connecté : ce que tu y écris est vu de tous les membres, conservé et cherchable.
          Ton arrivée y est annoncée par un mot d’accueil avec ton pseudo.
        </li>
        <li>
          Un <strong>groupe privé</strong> n’est visible que de ses membres ; on y entre sur
          invitation. Tu peux animer 3 groupes et en rejoindre 20 ; un groupe accueille 200
          membres au plus.
        </li>
        <li>
          La personne qui anime un groupe, et les gérant·es qu’elle désigne, peuvent inviter,
          retirer un message, exclure un membre et le réadmettre. L’exclusion vaut pour ce
          groupe, pas pour la plateforme ; elle se conteste auprès de la modération.
        </li>
        <li>
          La modération de GeniGain peut lire les salons et les groupes, retirer un message et
          dissoudre un groupe contraire à ces conditions (section 11). Un message retiré
          disparaît pour tout le monde.
        </li>
        <li>
          Tu peux mettre un salon en silence (plus de notifications) ou le quitter quand tu veux.
          Les règles de la section 9 s’appliquent partout.
        </li>
      </ul>

      <h2>10. Partenariats de marques</h2>
      <ul>
        <li>
          Les marques peuvent proposer un partenariat à un porteur via un formulaire public, sans
          compte. La marque garantit l’exactitude de sa proposition. Le porteur répond
          librement ; les outils d’aide à la décision fournis par GeniGain (dont une analyse
          automatique anti-arnaque) sont réservés au porteur et ne sont jamais communiqués à la
          marque.
        </li>
        <li>
          <strong>Si tu acceptes un partenariat, dis-le.</strong> Tout contenu que tu publies sur
          GeniGain en lien avec cette marque (mise à jour de projet, réponse sous un appel,
          message de salon) porte en tête la mention « Partenariat rémunéré avec [marque] », tant
          que le partenariat dure — c’est la loi dans plusieurs pays, et c’est la règle ici. Tu ne
          déclares pas ton projet remplaçant d’une marque concurrente de ta marque partenaire, tu
          ne réponds pas à un appel qui la vise, et tu n’en publies pas contre elle. GeniGain
          retire le contenu qui cache un partenariat.
        </li>
        <li>GeniGain met en relation ; elle n’est pas partie aux accords conclus entre marques et porteurs.</li>
      </ul>

      <h2>11. Modération, signalements, fermeture de compte</h2>
      <ul>
        <li>
          Chaque projet, appel, témoignage vidéo, réponse, commentaire, message de salon, groupe
          ou profil peut être <strong>signalé</strong>. L’identité de l’auteur d’un signalement
          n’est jamais communiquée à la personne visée.
        </li>
        <li>
          <strong>Comment on modère</strong> : uniquement des humains, à partir des signalements,
          des demandes d’autorités et de ce que l’équipe constate elle-même. Aucun filtre
          automatique ne retire de contenu ; il n’y a pas de surveillance générale des contenus.
        </li>
        <li>
          La modération peut retirer un contenu, refuser un signalement, dissoudre un groupe et,
          en cas de violation grave ou répétée de ces conditions, fermer un compte. À chaque
          retrait ou fermeture, tu reçois un message qui dit ce qui a été retiré, pourquoi (le
          fait reproché et la règle concernée) et comment contester : écris à
          bonjour@genigain.com sous 30 jours, un humain relit et te répond. Un contenu
          manifestement illicite ou une fraude aux paiements est bloqué tout de suite, et tu es
          prévenu·e juste après.
        </li>
        <li>
          GeniGain peut aussi fermer ton compte avec un préavis de 30 jours par email, sans avoir
          à se justifier. Tu peux fermer le tien à tout moment (section 13).
        </li>
        <li>
          <strong>Effets d’une fermeture</strong> : un porteur voit ses projets en cours arrêtés ;
          ce qui n’a pas été libéré est rendu aux contributeurs (section 6), les étapes déjà
          validées restent acquises. Un contributeur garde ses droits sur ses contributions en
          cours (vote, remboursement). La fermeture ne prive personne de ses recours.
        </li>
      </ul>

      <h2>12. Le fil des appels au remplacement</h2>
      <ul>
        <li>
          Le fil « Appels » permet à un membre de nommer publiquement une entreprise ou une
          marque dont il ne veut plus, d’en exposer les raisons et de décrire ce qu’il
          souhaiterait à la place, afin qu’un porteur s’en saisisse.
        </li>
        <li>
          <strong>L’auteur est seul responsable de son appel.</strong> GeniGain héberge ce
          contenu : la plateforme n’en est pas l’auteur, ne le rédige pas, ne le valide pas au
          préalable et ne le fait pas sien.
        </li>
        <li>
          <strong>Sous ton pseudo, ou anonymement.</strong> Un appel est publié sous ton pseudo.
          Tu peux choisir de le publier anonymement : ton nom et ta photo ne sont pas affichés,
          et rien sur la page ne mène à ton profil. Mais l’anonymat est un réglage d’affichage,
          pas une disparition : GeniGain sait qui a écrit chaque appel, garde cette information
          tant que l’appel existe (modération, plafonds), et la communique si une autorité ou un
          tribunal l’ordonne dans les formes, en Suisse ou dans ton pays. Un appel anonyme engage
          exactement la même responsabilité qu’un appel signé.
        </li>
        <li>
          <strong>La charte</strong>, rappelée avant chaque publication. L’auteur s’engage à ne
          viser qu’une entreprise ou une marque — jamais une personne physique, un salarié ou une
          communauté ; à critiquer ce qu’une entreprise <em>fait</em>, jamais ce qu’elle{" "}
          <em>est</em> — ni la nationalité, ni l’origine, ni la religion, ni les opinions de
          ceux qui la possèdent ou y travaillent ; à pouvoir étayer les faits qu’il affirme et à
          mettre une source publique quand il affirme, pas quand il opine ; à distinguer le fait
          de l’opinion ; à ne nommer ni salarié, ni adresse de magasin, et à n’appeler ni à
          bloquer, ni à entrer, ni à perturber — son seul levier, c’est son argent ; et à
          s’abstenir de tout appel à la violence ou au harcèlement. Un appel dont un fait contesté
          n’est pas étayé est retiré à la première demande motivée de l’entreprise visée.
        </li>
        <li>
          Appeler à ne plus acheter les produits d’une entreprise et exposer ses motifs relève de
          la liberté d’expression. En revanche, l’imputation de faits inexacts, dénigrants ou non
          étayés engage la responsabilité de son auteur, notamment au regard de la loi fédérale
          contre la concurrence déloyale et du droit de la personnalité.
        </li>
        <li>
          <strong>Les témoignages vidéo.</strong> Un appel peut être prolongé par une vidéo de 60
          secondes maximum, publiée sous le pseudo de son auteur et rattachée à cet appel — elle
          ne peut pas exister seule. Filmer engage plus qu’écrire. Avant de filmer : tu filmes
          dans un lieu public, ou avec l’accord de l’occupant du lieu ; personne de reconnaissable
          n’apparaît sans son accord — un mineur, jamais sans l’accord de ses parents ; pas de
          visage ni de badge de salarié ; pas de plaque d’immatriculation ni de document interne ;
          ni violence, ni intrusion, ni contenu illicite. Si tu as moins de 18 ans, ton visage et
          ta voix deviennent publics et le resteront chez ceux qui auront copié la vidéo :
          parles-en à un adulte avant. Une vidéo est signalable, et retirable par son auteur, par
          l’auteur de l’appel ou par la modération. Un retrait <strong>efface le fichier</strong>,
          pas seulement son affichage.
        </li>
        <li>
          <strong>La discussion</strong> sous un appel suit les mêmes règles : chaque réponse est
          publiée sous le pseudo de son auteur, qui en est seul responsable. La contradiction y
          est expressément admise. Une réponse peut être retirée par son auteur, par l’auteur de
          l’appel ou par la modération, et signalée par n’importe qui.
        </li>
        <li>
          L’auteur peut retirer son appel à tout moment ; la modération peut le retirer si elle
          l’estime contraire à ces conditions, en informant l’auteur du motif (section 11).
        </li>
        <li>
          <strong>Entreprise mise en cause</strong> : tu peux demander un retrait, ou répondre.
          Écris à bonjour@genigain.com depuis une adresse de l’entreprise, en indiquant l’appel
          concerné. Pour un retrait : les éléments contestés et pourquoi (voir « Signaler un
          contenu illicite » dans les{" "}
          <Link href="/mentions-legales">mentions légales</Link>) — un contenu manifestement
          illicite est retiré sous 24 heures, les autres demandes reçoivent une réponse motivée
          sous 7 jours. Pour une réponse : 2 000 caractères au plus, sans attaque personnelle ;
          elle est publiée telle quelle sous l’appel, sous la mention « Réponse de [entreprise] »,
          dans les 7 jours. Elle n’est ni un aveu de l’auteur, ni un jugement de GeniGain.
        </li>
        <li>
          <strong>Les appels de l’équipe GeniGain.</strong> L’éditeur peut publier ses propres
          appels. Ils sont signés « Yassir Msittef — éditeur de GeniGain », jamais anonymes, et
          soumis à des règles plus strictes que la charte : l’appel vise une entreprise pour ce
          qu’elle fait, jamais pour la nationalité, l’origine, la religion ou les opinions de ses
          dirigeants, propriétaires ou salariés ; chaque fait avancé renvoie à une source
          publique identifiable (rapport d’organisation internationale, décision de justice,
          enquête publiée, document de l’entreprise) ; l’appel dit « je n’achète plus, et voilà
          pourquoi » et ce qu’il veut à la place — il ne qualifie personne pénalement, n’appelle
          à rien d’autre qu’un choix d’achat, et ne désigne ni salarié, ni magasin, ni adresse ;
          l’entreprise visée peut répondre sous l’appel sans créer de compte ; ces appels n’ont
          aucun privilège d’affichage. Ils engagent l’éditeur en tant qu’auteur et ne changent
          rien au statut des appels des membres, que GeniGain héberge sans les valider.
        </li>
      </ul>

      <h2>13. Tes données</h2>
      <p>
        Le traitement de tes données personnelles est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Tu peux supprimer ton
        compte à tout moment depuis ton tableau de bord (carte « Sécurité ») : ton profil est
        anonymisé tout de suite (pseudo « Membre retiré », email neutralisé, photo, bio, ville,
        liens et compétences effacés, sessions coupées), tes témoignages filmés et ta photo sont
        détruits. Ce qui reste en ligne, signé « Membre retiré » : tes commentaires, tes messages
        dans les salons et en privé, tes appels, tes réponses et les légendes de tes vidéos —
        retire-les toi-même avant de partir si tu ne veux pas les laisser. Tes contributions et
        dons restent liés au compte anonymisé (comptabilité, remboursements). La suppression est
        refusée tant que tu portes un projet en cours de campagne ou de réalisation ayant reçu des
        contributions — mène-le au bout d’abord.
      </p>

      <h2>14. Responsabilité</h2>
      <ul>
        <li>
          GeniGain s’engage sur le fonctionnement de la plateforme (verrou des fonds, votes,
          remboursements lancés automatiquement), pas sur la réussite des projets : contribuer
          comporte le risque qu’un projet n’aboutisse pas, avec un remboursement limité à ce qui
          n’a pas été libéré, net des frais de carte.
        </li>
        <li>
          Le service est fourni avec une obligation de moyens ; des interruptions temporaires
          peuvent survenir (maintenance, incident, force majeure). Les décisions de déblocage
          appartiennent au vote des contributeurs ; GeniGain n’arbitre pas la qualité des projets.
        </li>
        <li>
          GeniGain répond des dommages qu’elle cause intentionnellement ou par faute grave. Pour
          le reste, sa responsabilité est exclue dans la mesure permise par la loi — en
          particulier pour les dommages indirects, le manque à gagner, les actes des porteurs,
          des contributeurs et des auteurs d’appels, ceux des prestataires tiers (Stripe,
          hébergeur), et les interruptions du service. Rien ici ne limite les droits impératifs
          que la loi t’accorde en tant que consommateur.
        </li>
      </ul>

      <h2>15. Évolution des conditions</h2>
      <p>
        Ces conditions peuvent évoluer. Tout changement important (règles d’argent, de vote, de
        données, de modération, de responsabilité, de for) t’est annoncé au moins{" "}
        <strong>30 jours</strong> avant son entrée en vigueur, par email et par un avis sur le
        site, avec la nouvelle version en lien. Si tu n’es pas d’accord, tu peux fermer ton
        compte avant cette date, sans frais ; continuer à utiliser GeniGain après cette date vaut
        acceptation. Les règles d’argent d’une contribution ou d’un projet sont celles en vigueur
        au moment du paiement ou du lancement : un changement ne s’applique jamais à une campagne
        ou à des fonds en cours. Les corrections mineures (formulation, coquilles, liens) sont
        simplement datées en tête de page.
      </p>

      <h2>16. Droit applicable et for</h2>
      <p>
        GeniGain est éditée depuis la Suisse. Ces conditions sont soumises au{" "}
        <strong>droit suisse</strong>. Si tu es un consommateur, les règles impératives du pays où
        tu résides habituellement (protection des consommateurs, protection des données)
        s’appliquent en plus et priment si elles te sont plus favorables.
      </p>
      <p>
        En cas de litige, on cherche d’abord une solution amiable : écris à bonjour@genigain.com —
        réponse sous 30 jours. À défaut, les tribunaux compétents sont ceux de{" "}
        <strong>Genève, Suisse</strong>. Si tu es un consommateur, cette clause ne t’enlève rien :
        tu gardes le droit d’agir et d’être attaqué devant les tribunaux de ton domicile. GeniGain
        n’a pas désigné d’organe de médiation ; si un jour c’est le cas, il sera nommé ici.
      </p>
    </>
  );
}
