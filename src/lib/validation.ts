import { z } from "zod";
import { isVideoBlob } from "@/lib/blob";
import { PartnershipCompensation, ProjectCategory } from "@prisma/client";
import { CURRENCY_CODES } from "@/lib/money";
import { LOCALE_CODES } from "@/lib/i18n/locales";
import { makeT, type Translator } from "@/lib/i18n/t";
import { v as V_FR } from "@/messages/fr/v";
import type { Messages } from "@/messages/types";
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
//
// FABRIQUE PAR LANGUE : les messages viennent du namespace `v`
// (src/messages/<langue>/v.ts). Les exports nommés en bas de fichier sont les
// instances FRANÇAISES — mêmes formes, mêmes types, mêmes phrases au
// caractère près qu'avant la fabrique : le garde-fou contrat-formulaires, les
// z.infer et la pré-validation côté client continuent de s'appuyer dessus.
// Les server actions, elles, récupèrent la langue du requérant via
// requestSchemas() (src/lib/validation-locale.ts) et destructurent SOUS LES
// MÊMES NOMS — les littéraux safeParse ne bougent pas.

type TV = Translator<Messages["v"]>;

export function makeSchemas(tv: TV) {
  const registerSchema = z
    .object({
      name: z
        .string()
        .min(2, tv("nameMin"))
        .max(50, tv("maxChars", { n: 50 })),
      email: z.string().email(tv("emailInvalid")),
      password: z.string().min(8, tv("passwordMin")),
      confirmPassword: z.string(),
      // DANS le schéma (contrairement à preferredCurrency, lu à la main) :
      // le garde-fou contrat-formulaires exige ainsi la clé dans l'action.
      preferredLanguage: z.enum(LOCALE_CODES),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tv("confirmMismatch"),
      path: ["confirmPassword"],
    });

  const loginSchema = z.object({
    email: z.string().email(tv("emailInvalid")),
    password: z.string().min(1, tv("passwordRequired")),
    // Code de double authentification — absent pour la plupart des comptes ;
    // exigé par `authorize` seulement si le compte l'a activée.
    code: z.string().trim().max(12).optional(),
  });

  const skillSchema = z
    .string()
    .trim()
    .min(2, tv("skillMin"))
    .max(24, tv("skillMax"));

  const userSkillsSchema = z
    .array(skillSchema)
    .max(MAX_SKILLS_PER_USER, tv("skillsMax", { n: MAX_SKILLS_PER_USER }));

  const requestResetSchema = z.object({
    email: z.string().email(tv("emailInvalid")),
  });

  const resetPasswordSchema = z
    .object({
      token: z.string().min(1),
      newPassword: z.string().min(8, tv("newPasswordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tv("newConfirmMismatch"),
      path: ["confirmPassword"],
    });

  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, tv("currentPasswordRequired")),
      newPassword: z.string().min(8, tv("newPasswordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tv("newConfirmMismatch"),
      path: ["confirmPassword"],
    });

  const updateProfileSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, tv("nameMin"))
      .max(50, tv("maxChars", { n: 50 })),
    bio: z.string().trim().max(280, tv("bioMax")).optional(),
    // Langue de l'interface — même famille que la devise : une préférence
    // de lecture, relue en base à chaque requête.
    preferredLanguage: z.enum(LOCALE_CODES),
    // Devise d'affichage du dashboard — préférence de lecture, pas de compte.
    preferredCurrency: z
      .string()
      .toLowerCase()
      .refine((c) => (CURRENCY_CODES as readonly string[]).includes(c), tv("currencyUnknown")),
    // Liens publics (site, réseaux) : https uniquement, 3 max.
    links: z
      .array(
        z
          .string()
          .trim()
          .max(200, tv("profileLinkTooLong"))
          .url(tv("linkInvalid"))
          .startsWith("https://", tv("linksHttpsOnly"))
      )
      .max(3, tv("profileLinksMax")),
  });

  const milestoneInputSchema = z.object({
    title: z.string().min(3, tv("milestoneTitleMin")).max(80, tv("maxChars", { n: 80 })),
    description: z
      .string()
      .min(10, tv("milestoneDescMin"))
      .max(500, tv("maxChars", { n: 500 })),
    amount: z.coerce
      .number({ invalid_type_error: tv("amountInvalid") })
      .int(tv("amountInt"))
      .min(MIN_MILESTONE_AMOUNT, tv("milestoneAmountMin", { min: MIN_MILESTONE_AMOUNT })),
  });

  // Champs de CONTENU d'un projet — partagés entre création et édition. Les
  // champs financiers (objectif, durée, étapes) n'en font pas partie : une fois
  // la campagne lancée, les contributeurs se sont engagés sur ces règles.
  const projectContentFields = {
    title: z.string().min(5, tv("projectTitleMin")).max(80, tv("maxChars", { n: 80 })),
    pitch: z
      .string()
      .min(10, tv("pitchMin"))
      .max(140, tv("pitchMax")),
    description: z
      .string()
      .min(50, tv("projectDescMin"))
      .max(5000, tv("maxChars", { n: 5000 })),
    category: z.nativeEnum(ProjectCategory, {
      errorMap: () => ({ message: tv("categoryChoose") }),
    }),
    coverUrl: z
      .string()
      .url(tv("coverInvalid"))
      .optional()
      .or(z.literal("")),
    neededSkills: z
      .array(skillSchema)
      .max(MAX_SKILLS_PER_PROJECT, tv("skillsMax", { n: MAX_SKILLS_PER_PROJECT }))
      .default([]),
  } as const;

  const updateProjectSchema = z.object(projectContentFields);

  const createProjectSchema = z
    .object({
      ...projectContentFields,
      currency: z
        .string()
        .refine((c) => CURRENCY_CODES.includes(c), tv("currencyChoose")),
      goal: z.coerce
        .number({ invalid_type_error: tv("goalInvalid") })
        .int(tv("goalInt"))
        .min(MIN_GOAL, tv("goalMin", { min: MIN_GOAL }))
        .max(MAX_GOAL, tv("goalMax", { max: MAX_GOAL })),
      durationDays: z.coerce
        .number({ invalid_type_error: tv("durationInvalid") })
        .int()
        .min(MIN_DURATION_DAYS, tv("durationMin", { min: MIN_DURATION_DAYS }))
        .max(MAX_DURATION_DAYS, tv("durationMax", { max: MAX_DURATION_DAYS })),
      milestones: z
        .array(milestoneInputSchema)
        .min(MIN_MILESTONES, tv("milestonesMin", { min: MIN_MILESTONES }))
        .max(MAX_MILESTONES, tv("milestonesMax", { max: MAX_MILESTONES })),
    })
    .refine((data) => data.milestones.reduce((sum, m) => sum + m.amount, 0) === data.goal, {
      message: tv("milestonesSum"),
      path: ["milestones"],
    });

  const contributeSchema = z.object({
    projectId: z.string().min(1),
    // Unités MAJEURES de la devise du projet (5 €, 5 MAD, 5 CHF…).
    amount: z.coerce
      .number({ invalid_type_error: tv("amountInvalid") })
      .int(tv("amountInt"))
      .min(MIN_CONTRIBUTION_MAJOR, tv("contributionMin", { min: MIN_CONTRIBUTION_MAJOR })),
  });

  const submitProofSchema = z.object({
    milestoneId: z.string().min(1),
    content: z
      .string()
      .min(20, tv("proofMin"))
      .max(2000, tv("maxChars", { n: 2000 })),
    links: z
      .array(z.string().url(tv("proofLinkInvalid")))
      .max(MAX_PROOF_LINKS, tv("linksMax", { n: MAX_PROOF_LINKS }))
      .default([]),
    imageUrls: z
      .array(z.string().url(tv("proofImageInvalid")))
      .max(MAX_PROOF_IMAGES, tv("imagesMax", { n: MAX_PROOF_IMAGES }))
      .default([]),
  });

  const messageSchema = z.object({
    recipientId: z.string().min(1),
    body: z
      .string()
      .trim()
      .min(1, tv("messageEmpty"))
      .max(1000, tv("messageMax")),
  });

  const createGroupSchema = z.object({
    name: z
      .string()
      .trim()
      .min(3, tv("groupNameMin"))
      .max(40, tv("maxChars", { n: 40 })),
    purpose: z
      .string()
      .trim()
      .min(10, tv("groupPurposeMin"))
      .max(140, tv("groupPurposeMax")),
    category: z.nativeEnum(ProjectCategory, {
      errorMap: () => ({ message: tv("groupCategoryChoose") }),
    }),
  });

  const groupMessageSchema = z.object({
    groupId: z.string().min(1),
    body: z
      .string()
      .trim()
      .min(1, tv("messageEmpty"))
      .max(1000, tv("messageMax")),
  });

  const commentSchema = z.object({
    projectId: z.string().min(1),
    body: z
      .string()
      .trim()
      .min(2, tv("commentShort"))
      .max(1000, tv("maxChars", { n: 1000 })),
  });

  const projectUpdateSchema = z.object({
    projectId: z.string().min(1),
    title: z
      .string()
      .trim()
      .min(3, tv("updateTitleMin"))
      .max(80, tv("maxChars", { n: 80 })),
    body: z
      .string()
      .trim()
      .min(10, tv("updateBodyMin"))
      .max(3000, tv("maxChars", { n: 3000 })),
  });

  const partnershipRequestSchema = z.object({
    projectId: z.string().min(1),
    brandName: z
      .string()
      .trim()
      .min(2, tv("brandNameMin"))
      .max(80, tv("maxChars", { n: 80 })),
    contactName: z.string().trim().max(80, tv("maxChars", { n: 80 })).optional().or(z.literal("")),
    brandEmail: z.string().trim().email(tv("emailInvalid")),
    brandWebsite: z
      .string()
      .trim()
      .url(tv("urlFull"))
      .optional()
      .or(z.literal("")),
    compensation: z.nativeEnum(PartnershipCompensation, {
      errorMap: () => ({ message: tv("compensationChoose") }),
    }),
    budget: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce
        .number({ invalid_type_error: tv("budgetInvalid") })
        .int(tv("amountInt"))
        .min(0, tv("budgetInvalid"))
        .max(1_000_000, tv("budgetInvalid"))
        .optional()
    ),
    message: z
      .string()
      .trim()
      .min(30, tv("partnershipMessageMin"))
      .max(3000, tv("maxChars", { n: 3000 })),
    deliverables: z.string().trim().max(1500, tv("maxChars", { n: 1500 })).optional().or(z.literal("")),
  });

  const partnershipResponseSchema = z.object({
    requestId: z.string().min(1),
    decision: z.enum(["ACCEPTED", "DECLINED"], {
      errorMap: () => ({ message: tv("decisionChoose") }),
    }),
    reply: z
      .string()
      .trim()
      .min(10, tv("replyTooShort"))
      .max(3000, tv("maxChars", { n: 3000 })),
  });

  // Appel au remplacement. Les minimums sont volontairement hauts : un appel
  // qui tient en trois mots est un slogan, et un slogan n'appelle personne à
  // construire quoi que ce soit.
  const boycottCallSchema = z.object({
    target: z
      .string()
      .trim()
      .min(2, tv("callTargetMin"))
      .max(60, tv("callTargetMax")),
    category: z.nativeEnum(ProjectCategory, {
      errorMap: () => ({ message: tv("callSectorChoose") }),
    }),
    reason: z
      .string()
      .trim()
      .min(MIN_CALL_REASON, tv("callReasonMin", { min: MIN_CALL_REASON }))
      .max(MAX_CALL_REASON, tv("maxChars", { n: MAX_CALL_REASON })),
    wanted: z
      .string()
      .trim()
      .min(MIN_CALL_WANTED, tv("callWantedMin", { min: MIN_CALL_WANTED }))
      .max(MAX_CALL_WANTED, tv("maxChars", { n: MAX_CALL_WANTED })),
    sources: z
      .array(
        z
          .string()
          .trim()
          .url(tv("sourceLinkFull"))
          .startsWith("https://", tv("sourceHttps"))
          .max(300, tv("sourceTooLong"))
      )
      .max(MAX_CALL_SOURCES, tv("linksMax", { n: MAX_CALL_SOURCES })),
  });

  const callCommentSchema = z.object({
    callId: z.string().min(1),
    body: z
      .string()
      .trim()
      .min(2, tv("callReplyShort"))
      .max(1000, tv("maxChars", { n: 1000 })),
  });

  // Témoignage vidéo. L'URL n'est pas saisie par un humain : elle vient de
  // Vercel Blob après l'upload direct. On la contraint quand même à notre
  // propre domaine de stockage — sinon n'importe quelle URL pourrait être
  // injectée et le fil servirait de vitrine à des vidéos hébergées ailleurs,
  // hors de portée de la modération et du retrait.
  const callVideoSchema = z.object({
    callId: z.string().min(1),
    url: z
      .string()
      .url()
      .refine(isVideoBlob, tv("videoNotHosted")),
    posterUrl: z
      .string()
      .url()
      .refine(isVideoBlob, tv("posterNotHosted"))
      .optional(),
    caption: z
      .string()
      .trim()
      .min(MIN_VIDEO_CAPTION, tv("captionMin", { min: MIN_VIDEO_CAPTION }))
      .max(MAX_VIDEO_CAPTION, tv("maxChars", { n: MAX_VIDEO_CAPTION })),
    durationMs: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_VIDEO_SECONDS * 1000, tv("videoMaxSeconds", { max: MAX_VIDEO_SECONDS })),
    width: z.coerce.number().int().positive().optional(),
    height: z.coerce.number().int().positive().optional(),
  });

  return {
    registerSchema,
    loginSchema,
    userSkillsSchema,
    requestResetSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema,
    milestoneInputSchema,
    updateProjectSchema,
    createProjectSchema,
    contributeSchema,
    submitProofSchema,
    messageSchema,
    createGroupSchema,
    groupMessageSchema,
    commentSchema,
    projectUpdateSchema,
    partnershipRequestSchema,
    partnershipResponseSchema,
    boycottCallSchema,
    callCommentSchema,
    callVideoSchema,
  };
}

// Les instances FRANÇAISES nommées — garde-fou, types et client s'appuient
// dessus ; ne jamais les supprimer (contrat-formulaires crierait, exprès).
export const {
  registerSchema,
  loginSchema,
  userSkillsSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  milestoneInputSchema,
  updateProjectSchema,
  createProjectSchema,
  contributeSchema,
  submitProofSchema,
  messageSchema,
  createGroupSchema,
  groupMessageSchema,
  commentSchema,
  projectUpdateSchema,
  partnershipRequestSchema,
  partnershipResponseSchema,
  boycottCallSchema,
  callCommentSchema,
  callVideoSchema,
} = makeSchemas(makeT(V_FR, "fr"));

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type BoycottCallInput = z.infer<typeof boycottCallSchema>;

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
