import { z } from "zod";
import { ProjectCategory } from "@prisma/client";
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

export const createProjectSchema = z
  .object({
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
    goal: z.coerce
      .number({ invalid_type_error: "Objectif invalide." })
      .int("Objectif entier uniquement.")
      .min(MIN_GOAL, `Objectif minimum : ${MIN_GOAL} tokens.`)
      .max(MAX_GOAL, `Objectif maximum : ${MAX_GOAL} tokens.`),
    coverUrl: z
      .string()
      .url("Lien de visuel invalide (URL complète attendue).")
      .optional()
      .or(z.literal("")),
    durationDays: z.coerce
      .number({ invalid_type_error: "Durée invalide." })
      .int()
      .min(MIN_DURATION_DAYS, `Campagne de ${MIN_DURATION_DAYS} jours minimum.`)
      .max(MAX_DURATION_DAYS, `Campagne de ${MAX_DURATION_DAYS} jours maximum.`),
    neededSkills: z
      .array(skillSchema)
      .max(MAX_SKILLS_PER_PROJECT, `${MAX_SKILLS_PER_PROJECT} compétences max.`)
      .default([]),
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

/** Transforme un champ texte "un élément par ligne (ou virgule)" en tableau propre. */
export function parseList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
