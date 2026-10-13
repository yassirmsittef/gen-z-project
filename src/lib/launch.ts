/**
 * Avant-lancement (décision du fondateur, 13/10/2026) : GeniGain ouvre d'abord
 * sa COMMUNAUTÉ — inscription, profil, salons. Tout ce qui fait circuler de
 * l'argent ou publie au nom de la plateforme (projets, appels, vidéos,
 * contributions, versements, soutiens, partenariats) reste fermé jusqu'à la
 * validation juridique par un avocat (dépôts du public, LBA, appels nommant
 * des marques — cf. docs/association et la critique juridique du 12/10).
 *
 * FERMÉ PAR DÉFAUT : il faut écrire NEXT_PUBLIC_GENIGAIN_FEATURES=open pour
 * rouvrir (variable lue au build, donc identique côté serveur et client).
 * Un déploiement qui oublie la variable reste fermé — jamais l'inverse.
 */
export const FEATURES_FROZEN = process.env.NEXT_PUBLIC_GENIGAIN_FEATURES !== "open";
