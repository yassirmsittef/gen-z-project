import type { Dict } from "@/lib/i18n/t";

/** /comment-ca-marche : le mode d'emploi complet — trajectoire, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "Comment ça marche",
  "meta.description":
    "Contribue d'abord, lance ensuite : fonds sous séquestre, débloqués étape par étape par le vote des contributeurs, remboursés si ça n'aboutit pas.",
  "intro.label": "Le mode d'emploi",
  "intro.title": "Comment ça marche",
  "intro.lead": "GeniGain repose sur une idée simple :",
  "intro.highlight": "l'argent suit les preuves",
  "intro.after":
    ". On contribue avant de poster, les fonds restent sous séquestre, et c'est le vote des contributeurs qui les débloque, étape par étape.",
  "stages.contributeTitle": "Contribue d'abord",
  "stages.contributeChipMin": "dès {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → droit de poster",
  "stages.contributeBody":
    "Ici, personne ne débarque avec sa cagnotte : on commence par soutenir les autres. Tu contribues par carte, dans la devise du projet. Chaque paiement est converti en dollars au taux du jour et s'ajoute à ton compteur — à {gate} cumulés, tu gagnes le droit de lancer ton propre projet.",
  "stages.launchTitle": "Lance ton projet",
  "stages.launchChipDuration": "{min}–{max} jours",
  "stages.launchChipMilestones": "{min}–{max} étapes",
  "stages.launchBody":
    "Objectif entre {minGoal} et {maxGoal} dans la devise de ton choix, campagne de {minDays} à {maxDays} jours, et surtout : un plan découpé en {minMilestones} à {maxMilestones} étapes chiffrées dont la somme fait l'objectif. C'est ce découpage qui rend la suite honnête — tu ne reçois jamais tout d'un coup.",
  "stages.fundTitle": "La communauté finance",
  "stages.fundChipEscrow": "séquestre",
  "stages.fundChipRefund": "remboursement si raté",
  "stages.fundBody":
    "Pendant la campagne, les contributions s'accumulent sous séquestre : ni toi ni personne n'y touche. Objectif atteint — la collecte s'arrête et l'aventure commence. Objectif manqué à l'échéance — chaque contributeur est remboursé automatiquement sur sa carte, net des frais de carte que la banque ne restitue pas (GeniGain n'en garde aucun).",
  "stages.proveTitle": "Prouve, la communauté vote",
  "stages.proveChipVote": "vote pondéré",
  "stages.proveChipDays": "{days} jours pour réaliser",
  "stages.proveBody":
    "À chaque étape, tu publies une preuve (liens, images) et tes contributeurs votent. Chaque voix pèse le montant contribué : la majorité des montants décide. Étape validée = fonds de l'étape débloqués. Une même étape refusée {attempts} fois, ou les {days} jours écoulés, et le projet s'arrête.",
  "stages.cashTitle": "Encaisse — ou rebondis",
  "stages.cashChipPayout": "versement par étape",
  "stages.cashChipFee": "0 % de commission",
  "stages.cashChipProrata": "prorata remboursé",
  "stages.cashBody":
    "Chaque étape validée part vers ton compte de versement Stripe, nette des frais bancaires — GeniGain ne prend rien au passage. Et si le projet s'arrête en route ? Ce que la communauté a validé te reste acquis, tout le séquestre restant repart au prorata vers les contributeurs — et la communauté t'aide à rebondir sur la suite.",
  "faq.heading": "Les questions qu'on nous pose",
  "faq.investmentQ": "C'est un investissement ?",
  "faq.investmentA":
    "Non. Une contribution est un soutien : elle ne donne ni part du projet, ni intérêt, ni rendement financier. Ce que tu y gagnes est ailleurs : tu fais naître des projets que tu as choisis parce qu'ils te parlent ou te seront utiles — l'app, le produit, le lieu ou le service que tu aimerais voir exister et dont tu profiteras une fois là. Tu gardes un droit de vote sur leurs étapes, tu construis ta réputation dans la communauté, et tu débloques le droit de lancer le tien.",
  "faq.costQ": "Ça coûte combien ?",
  "faq.costA":
    "0 % de commission GeniGain. Le contributeur paie exactement le montant qu'il a choisi ; les frais bancaires (Stripe) sont déduits des versements au porteur, comme sur toute plateforme — GeniGain ne garde rien au passage. Si une commission arrive un jour, elle sera annoncée à l'avance, affichée avant chaque paiement et jamais rétroactive.",
  "faq.feesQ": "Qui paie les frais de carte, exactement ?",
  "faq.feesA":
    "Les frais de traitement sont fixés par Stripe (le prestataire de paiement) et varient selon ta carte et ton pays — en général de l'ordre de 1,5 à 3 %. GeniGain ne les fixe pas, ne les voit pas et n'en ajoute aucun. Concrètement : quand tu contribues, tu paies exactement ton montant ; les frais sont prélevés par Stripe et déduits de ce que le porteur reçoit. Si le projet échoue et que tu es remboursé, Stripe ne rend pas la commission qu'il a prélevée au départ — ton remboursement est donc net de ces frais, et là encore GeniGain n'en garde aucun. C'est le seul « coût » d'une contribution, et il ne va jamais dans la poche de la plateforme.",
  "faq.whoQ": "Qui peut participer ?",
  "faq.whoA":
    "L'inscription est ouverte dès 15 ans. Pour contribuer par carte ou lancer une campagne, il faut être majeur·e ou avoir l'accord de ton représentant légal.",
  "faq.vanishQ": "Et si le porteur disparaît dans la nature ?",
  "faq.vanishA":
    "C'est exactement ce que le séquestre empêche : les fonds non débloqués ne sont jamais entre ses mains. Sans preuve validée, rien ne bouge — et au bout de {days} jours, tout ce qui n'a pas été débloqué par un vote repart automatiquement vers les contributeurs (net des frais de carte, non restitués par la banque).",
  "faq.payoutQ": "Comment je reçois mes fonds en tant que porteur ?",
  "faq.payoutA":
    "Via Stripe Connect : tu crées ton compte de versement depuis ton dashboard et tu passes la vérification d'identité de Stripe. Chaque étape validée est ensuite virée automatiquement, dans la devise de ton projet. Une étape validée reste due tant que ton compte n'est pas prêt.",
  "faq.realMoneyQ": "C'est du vrai argent ?",
  "faq.realMoneyALive":
    "Oui. Les paiements sont réels et sécurisés par Stripe : ta contribution est réellement débitée, placée sous séquestre, et débloquée au porteur étape par étape selon le vote des contributeurs. GeniGain ne voit ni ne stocke jamais ton numéro de carte.",
  "faq.realMoneyATest":
    "La mécanique est réelle de bout en bout, mais la plateforme est en phase de test : les paiements Stripe tournent en mode test, aucune carte n'est réellement débitée. L'ouverture des paiements réels sera annoncée clairement.",
  "legal.before": "La version juridique de ces règles vit dans les",
  "legal.link": "conditions d'utilisation",
  "legal.after": ".",
  "cta.discover": "Découvrir les projets",
  "cta.register": "Créer mon compte",
} as const satisfies Dict;
