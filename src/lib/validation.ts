import { z } from "zod";
import { isVideoBlob } from "@/lib/blob";
import { PartnershipCompensation, ProjectCategory } from "@prisma/client";
import { CURRENCY_CODES } from "@/lib/money";
import {
  MAX_CALL_REASON,
  MAX_CALL_SOURCES,
  MAX_CALL_WANTED,
  MAX_DURATION_DAYS,
  MAX_GOAL,
  MAX_MILESTONES,
  MAX_PROOF_IMAGES,
  MAX_PROOF_LINKS,
  MAX_SKILLS_PER_PROJECT,
  MAX_SKILLS_PER_USER,
  MAX_VIDEO_CAPTION,
  MAX_VIDEO_SECONDS,
  MIN_CALL_REASON,
  MIN_CALL_WANTED,
  MIN_CONTRIBUTION_MAJOR,
  MIN_VIDEO_CAPTION,
  MIN_DURATION_DAYS,
  MIN_GOAL,
  MIN_MILESTONE_AMOUNT,
  MIN_MILESTONES,
} from "@/lib/constants";

// Schémas partagés client/serveur (spec : Zod des deux côtés).

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ton pseudo doit faire au moins 2 caractères.")
      .max(50, "50 caractères max."),
    email: z.string().email("Adresse email invalide."),
    password: z.string().min(8, "8 caractères minimum."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "La confirmation ne correspond pas au mot de passe.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

const skillSchema = z
  .string()
  .trim()
  .min(2, "Une compétence fait au moins 2 caractères.")
  .max(24, "24 caractères max par compétence.");

export const userSkillsSchema = z
  .array(skillSchema)
  .max(MAX_SKILLS_PER_USER, `${MAX_SKILLS_PER_USER} compétences max.`);

export const requestResetSchema = z.object({
  email: z.string().email("Adresse email invalide."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "8 caractères minimum pour le nouveau mot de passe."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "La confirmation ne correspond pas au nouveau mot de passe.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z.string().min(8, "8 caractères minimum pour le nouveau mot de passe."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "La confirmation ne correspond pas au nouveau mot de passe.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ton pseudo doit faire au moins 2 caractères.")
    .max(50, "50 caractères max."),
  bio: z.string().trim().max(280, "280 caractères max — va à l'essentiel.").optional(),
  // Devise d'affichage du dashboard — préférence de lecture, pas de compte.
  preferredCurrency: z
    .string()
    .toLowerCase()
    .refine((c) => (CURRENCY_CODES as readonly string[]).includes(c), "Devise inconnue."),
  // Liens publics (site, réseaux) : https uniquement, 3 max.
  links: z
    .array(
      z
        .string()
        .trim()
        .max(200, "Lien trop long (200 caractères max).")
        .url("Lien invalide (URL complète attendue).")
        .startsWith("https://", "Liens en https:// uniquement.")
    )
    .max(3, "3 liens maximum."),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const milestoneInputSchema = z.object({
  title: z.string().min(3, "Titre d'étape trop court.").max(80, "80 caractères max."),
  description: z
    .string()
    .min(10, "Décris ce que tu livreras (10 caractères min).")
    .max(500, "500 caractères max."),
  amount: z.coerce
    .number({ invalid_type_error: "Montant invalide." })
    .int("Montant entier uniquement.")
    .min(MIN_MILESTONE_AMOUNT, `Minimum ${MIN_MILESTONE_AMOUNT} tokens par étape.`),
});

// Champs de CONTENU d'un projet — partagés entre création et édition. Les
// champs financiers (objectif, durée, étapes) n'en font pas partie : une fois
// la campagne lancée, les contributeurs se sont engagés sur ces règles.
const projectContentFields = {
  title: z.string().min(5, "Titre trop court (5 caractères min).").max(80, "80 caractères max."),
  pitch: z
    .string()
    .min(10, "Ton pitch doit faire au moins 10 caractères.")
    .max(140, "140 caractères max — sois percutant·e."),
  description: z
    .string()
    .min(50, "Décris ton projet en détail (50 caractères min).")
    .max(5000, "5000 caractères max."),
  category: z.nativeEnum(ProjectCategory, { errorMap: () => ({ message: "Choisis une catégorie." }) }),
  coverUrl: z
    .string()
    .url("Lien de visuel invalide (URL complète attendue).")
    .optional()
    .or(z.literal("")),
  neededSkills: z
    .array(skillSchema)
    .max(MAX_SKILLS_PER_PROJECT, `${MAX_SKILLS_PER_PROJECT} compétences max.`)
    .default([]),
} as const;

export const updateProjectSchema = z.object(projectContentFields);
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createProjectSchema = z
  .object({
    ...projectContentFields,
    currency: z
      .string()
      .refine((c) => CURRENCY_CODES.includes(c), "Choisis la devise de ton projet."),
    goal: z.coerce
      .number({ invalid_type_error: "Objectif invalide." })
      .int("Objectif entier uniquement.")
      .min(MIN_GOAL, `Objectif minimum : ${MIN_GOAL} tokens.`)
      .max(MAX_GOAL, `Objectif maximum : ${MAX_GOAL} tokens.`),
    durationDays: z.coerce
      .number({ invalid_type_error: "Durée invalide." })
      .int()
      .min(
        MIN_DURATION_DAYS,
        `Campagne de ${MIN_DURATION_DAYS} jours minimum — laisse à la communauté le temps de te découvrir.`
      )
      .max(
        MAX_DURATION_DAYS,
        `Campagne de ${MAX_DURATION_DAYS} jours maximum — au-delà, les tokens de tes contributeurs resteraient bloqués trop longtemps sous séquestre.`
      ),
    milestones: z
      .array(milestoneInputSchema)
      .min(MIN_MILESTONES, `Au moins ${MIN_MILESTONES} étapes.`)
      .max(MAX_MILESTONES, `Au plus ${MAX_MILESTONES} étapes.`),
  })
  .refine((data) => data.milestones.reduce((sum, m) => sum + m.amount, 0) === data.goal, {
    message: "La somme des montants des étapes doit être exactement égale à l'objectif.",
    path: ["milestones"],
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const contributeSchema = z.object({
  projectId: z.string().min(1),
  // Unités MAJEURES de la devise du projet (5 €, 5 MAD, 5 CHF…).
  amount: z.coerce
    .number({ invalid_type_error: "Montant invalide." })
    .int("Montant entier uniquement.")
    .min(MIN_CONTRIBUTION_MAJOR, `Contribution minimum : ${MIN_CONTRIBUTION_MAJOR}.`),
});

export const submitProofSchema = z.object({
  milestoneId: z.string().min(1),
  content: z
    .string()
    .min(20, "Détaille ta preuve d'avancement (20 caractères min).")
    .max(2000, "2000 caractères max."),
  links: z
    .array(z.string().url("Lien invalide (URL complète attendue, ex: https://...)."))
    .max(MAX_PROOF_LINKS, `${MAX_PROOF_LINKS} liens max.`)
    .default([]),
  imageUrls: z
    .array(z.string().url("Lien d'image invalide (URL complète attendue)."))
    .max(MAX_PROOF_IMAGES, `${MAX_PROOF_IMAGES} images max.`)
    .default([]),
});

export const messageSchema = z.object({
  recipientId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Ton message est vide.")
    .max(1000, "1000 caractères max par message."),
});

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nom de groupe trop court (3 caractères min).")
    .max(40, "40 caractères max."),
  purpose: z
    .string()
    .trim()
    .min(10, "Dis en une phrase à quoi sert ce groupe (10 caractères min).")
    .max(140, "140 caractères max — une phrase suffit."),
  category: z.nativeEnum(ProjectCategory, {
    errorMap: () => ({ message: "Choisis la catégorie du groupe." }),
  }),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const groupMessageSchema = z.object({
  groupId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Ton message est vide.")
    .max(1000, "1000 caractères max par message."),
});

export const commentSchema = z.object({
  projectId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(2, "Ton commentaire est un peu court.")
    .max(1000, "1000 caractères max."),
});

export const projectUpdateSchema = z.object({
  projectId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(3, "Titre trop court (3 caractères min).")
    .max(80, "80 caractères max."),
  body: z
    .string()
    .trim()
    .min(10, "Raconte un peu plus (10 caractères min).")
    .max(3000, "3000 caractères max."),
});

export const partnershipRequestSchema = z.object({
  projectId: z.string().min(1),
  brandName: z
    .string()
    .trim()
    .min(2, "Le nom de la marque fait au moins 2 caractères.")
    .max(80, "80 caractères max."),
  contactName: z.string().trim().max(80, "80 caractères max.").optional().or(z.literal("")),
  brandEmail: z.string().trim().email("Adresse email invalide."),
  brandWebsite: z
    .string()
    .trim()
    .url("URL complète attendue (https://...).")
    .optional()
    .or(z.literal("")),
  compensation: z.nativeEnum(PartnershipCompensation, {
    errorMap: () => ({ message: "Choisis le type de contrepartie." }),
  }),
  budget: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce
      .number({ invalid_type_error: "Budget invalide." })
      .int("Montant entier uniquement.")
      .min(0, "Budget invalide.")
      .max(1_000_000, "Budget invalide.")
      .optional()
  ),
  message: z
    .string()
    .trim()
    .min(30, "Décris ta proposition (30 caractères minimum).")
    .max(3000, "3000 caractères max."),
  deliverables: z.string().trim().max(1500, "1500 caractères max.").optional().or(z.literal("")),
});

export const partnershipResponseSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "DECLINED"], {
    errorMap: () => ({ message: "Choisis accepter ou refuser." }),
  }),
  reply: z
    .string()
    .trim()
    .min(10, "Ta réponse est trop courte (10 caractères minimum).")
    .max(3000, "3000 caractères max."),
});

/**
 * Appel au remplacement. Les minimums sont volontairement hauts : un appel
 * qui tient en trois mots est un slogan, et un slogan n'appelle personne à
 * construire quoi que ce soit.
 */
export const boycottCallSchema = z.object({
  target: z
    .string()
    .trim()
    .min(2, "Nomme la marque ou l'entreprise visée.")
    .max(60, "60 caractères max — le nom suffit."),
  category: z.nativeEnum(ProjectCategory, {
    errorMap: () => ({ message: "Choisis le secteur à remplacer." }),
  }),
  reason: z
    .string()
    .trim()
    .min(MIN_CALL_REASON, `Explique pourquoi (${MIN_CALL_REASON} caractères minimum).`)
    .max(MAX_CALL_REASON, `${MAX_CALL_REASON} caractères max.`),
  wanted: z
    .string()
    .trim()
    .min(MIN_CALL_WANTED, `Décris ce que tu veux à la place (${MIN_CALL_WANTED} caractères minimum).`)
    .max(MAX_CALL_WANTED, `${MAX_CALL_WANTED} caractères max.`),
  sources: z
    .array(
      z
        .string()
        .trim()
        .url("Une source doit être un lien complet.")
        .startsWith("https://", "Les liens doivent être en https.")
        .max(300, "Lien trop long.")
    )
    .max(MAX_CALL_SOURCES, `${MAX_CALL_SOURCES} liens max.`),
});
export type BoycottCallInput = z.infer<typeof boycottCallSchema>;

export const callCommentSchema = z.object({
  callId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(2, "Ta réponse est un peu courte.")
    .max(1000, "1000 caractères max."),
});

/**
 * Témoignage vidéo. L'URL n'est pas saisie par un humain : elle vient de
 * Vercel Blob après l'upload direct. On la contraint quand même à notre
 * propre domaine de stockage — sinon n'importe quelle URL pourrait être
 * injectée et le fil servirait de vitrine à des vidéos hébergées ailleurs,
 * hors de portée de la modération et du retrait.
 */
export const callVideoSchema = z.object({
  callId: z.string().min(1),
  url: z
    .string()
    .url()
    .refine(isVideoBlob, "Vidéo non hébergée par GeniGain."),
  posterUrl: z
    .string()
    .url()
    .refine(isVideoBlob, "Vignette non hébergée par GeniGain.")
    .optional(),
  caption: z
    .string()
    .trim()
    .min(MIN_VIDEO_CAPTION, `Dis en une phrase ce que montre ta vidéo (${MIN_VIDEO_CAPTION} caractères minimum).`)
    .max(MAX_VIDEO_CAPTION, `${MAX_VIDEO_CAPTION} caractères max.`),
  durationMs: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_VIDEO_SECONDS * 1000, `${MAX_VIDEO_SECONDS} secondes maximum.`),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
});

/**
 * Le formulaire de projet → l'objet que `createProjectSchema` valide.
 *
 * Écrit UNE fois et utilisé des deux côtés (composant client et action
 * serveur) : quand les deux recopiaient la liste des champs chacun de leur
 * côté, elles ont divergé — `currency` a été ajouté au schéma et au
 * formulaire mais pas à l'action, qui rejetait donc toute création avec un
 * « Required » incompréhensible. Ajouter un champ ici le donne aux deux.
 *
 * Les étapes ne transitent pas par le même canal (état React côté client,
 * JSON caché côté serveur) : elles restent un paramètre à part.
 */
export function projectFormToInput(formData: FormData, milestones: unknown) {
  return {
    title: formData.get("title"),
    pitch: formData.get("pitch"),
    description: formData.get("description"),
    category: formData.get("category"),
    currency: formData.get("currency"),
    goal: formData.get("goal"),
    coverUrl: formData.get("coverUrl"),
    durationDays: formData.get("durationDays"),
    neededSkills: parseList(formData.get("neededSkills")),
    milestones,
  };
}

/**
 * Un élément PAR LIGNE. Réservé aux valeurs qui peuvent légitimement contenir
 * une virgule — une URL de source, par exemple : `parseList` la couperait en
 * morceaux et ferait rejeter l'appel entier, alors que l'interface annonce
 * « un lien par ligne ».
 */
export function parseLines(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Le formulaire de MODIFICATION → l'objet que `updateProjectSchema` valide.
 * Même raison d'être que `projectFormToInput` : l'action et le composant
 * recopiaient chacun la liste des champs, exactement la dérive qui a rendu
 * la création de projet impossible pendant un mois.
 */
export function projectEditFormToInput(formData: FormData) {
  return {
    title: formData.get("title"),
    pitch: formData.get("pitch"),
    description: formData.get("description"),
    category: formData.get("category"),
    coverUrl: formData.get("coverUrl"),
    neededSkills: parseList(formData.get("neededSkills")),
  };
}

/** Transforme un champ texte "un élément par ligne (ou virgule)" en tableau propre. */
export function parseList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
