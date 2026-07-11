import { z } from "zod";
import { PartnershipCompensation, ProjectCategory } from "@prisma/client";
import {
  MAX_DURATION_DAYS,
  MAX_GOAL,
  MAX_MILESTONES,
  MAX_PROOF_IMAGES,
  MAX_PROOF_LINKS,
  MAX_SKILLS_PER_PROJECT,
  MAX_SKILLS_PER_USER,
  MIN_CONTRIBUTION,
  MIN_DURATION_DAYS,
  MIN_GOAL,
  MIN_MILESTONE_AMOUNT,
  MIN_MILESTONES,
} from "@/lib/constants";

// Schémas partagés client/serveur (spec : Zod des deux côtés).

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Ton pseudo doit faire au moins 2 caractères.")
    .max(50, "50 caractères max."),
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "8 caractères minimum."),
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
  avatarUrl: z
    .string()
    .url("Lien d'avatar invalide (URL complète attendue).")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(280, "280 caractères max — va à l'essentiel.").optional(),
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
  amount: z.coerce
    .number({ invalid_type_error: "Montant invalide." })
    .int("Montant entier uniquement.")
    .min(MIN_CONTRIBUTION, `Contribution minimum : ${MIN_CONTRIBUTION} tokens.`),
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

/** Transforme un champ texte "un élément par ligne (ou virgule)" en tableau propre. */
export function parseList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
