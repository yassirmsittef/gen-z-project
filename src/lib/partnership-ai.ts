import Anthropic from "@anthropic-ai/sdk";
import type { PartnershipRequest, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Copilote partenariats : analyse la fiabilité et l'équité d'une offre de
 * marque avant que le porteur réponde.
 *
 * Deux moteurs, même contrat de sortie :
 *  - « heuristique » : règles anti-arnaque locales, instantané, toujours
 *    disponible — c'est aussi le filet de sécurité si l'appel IA échoue ;
 *  - « claude » : analyse approfondie via l'API Anthropic (sortie JSON
 *    structurée), activée si une clé est configurée (ANTHROPIC_API_KEY),
 *    même patron que stripeEnabled.
 *
 * Le résultat est mis en cache sur PartnershipRequest.aiAnalysis.
 */

export const aiEnabled = Boolean(
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
);

export type AnalysisSignal = {
  niveau: "danger" | "attention" | "info";
  texte: string;
};

export type PartnershipAnalysis = {
  /** 0-100 — la marque semble-t-elle réelle et digne de confiance ? */
  fiabilite: number;
  /** 0-100 — la contrepartie est-elle à la hauteur du travail demandé ? */
  equite: number;
  verdict: "favorable" | "prudence" | "deconseille";
  resume: string;
  signaux: AnalysisSignal[];
  questions: string[];
  /** Réponse prête à envoyer à la marque (éditable par le porteur). */
  reponseSuggeree: string;
  moteur: "claude" | "heuristique";
};

const analysisSchema = z.object({
  fiabilite: z.number().min(0).max(100),
  equite: z.number().min(0).max(100),
  verdict: z.enum(["favorable", "prudence", "deconseille"]),
  resume: z.string().min(1),
  signaux: z
    .array(
      z.object({
        niveau: z.enum(["danger", "attention", "info"]),
        texte: z.string().min(1),
      })
    )
    .max(12),
  questions: z.array(z.string().min(1)).max(8),
  reponseSuggeree: z.string().min(1),
});

/** Contexte projet minimal nécessaire à l'analyse. */
export type AnalysisContext = {
  projectTitle: string;
  projectGoal: number;
  ownerName: string;
};

// ---------- Moteur heuristique ----------

const DISPOSABLE_MAIL = [
  "yopmail",
  "mailinator",
  "tempmail",
  "temp-mail",
  "guerrillamail",
  "10minutemail",
  "trashmail",
  "jetable",
  "maildrop",
  "throwaway",
];

const FREE_MAIL = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.fr",
  "outlook.com",
  "outlook.fr",
  "yahoo.com",
  "yahoo.fr",
  "icloud.com",
  "live.com",
  "live.fr",
  "laposte.net",
  "proton.me",
  "protonmail.com",
  "free.fr",
  "orange.fr",
  "sfr.fr",
  "wanadoo.fr",
];

const SCAM_PATTERNS: Array<{ re: RegExp; texte: string }> = [
  {
    re: /frais\s+(d['’]|de\s+)?(inscription|dossier|livraison|douane|activation|adh[ée]sion)/i,
    texte:
      "L'offre demande de payer des frais — un vrai partenariat ne te fait JAMAIS avancer d'argent.",
  },
  {
    re: /(payer|r[ée]gler|avancer|verser)\b.{0,40}\b(d['’]abord|en avance|avant de)/i,
    texte: "Paiement demandé de ta poche avant toute prestation : schéma d'arnaque classique.",
  },
  {
    re: /(western union|moneygram|crypto|bitcoin|usdt|paysafecard|carte[-\s]?cadeau|gift\s?card|coupon)/i,
    texte: "Moyen de paiement intraçable mentionné — impossible de récupérer les fonds en cas de litige.",
  },
  {
    re: /(virement|ch[èe]que)\b.{0,30}(en trop|de trop|sup[ée]rieur)/i,
    texte: "Scénario de trop-perçu (on t'envoie « trop » puis on te demande de rembourser) : arnaque connue.",
  },
  {
    re: /\b(whatsapp|telegram|signal)\b/i,
    texte: "La marque veut basculer sur une messagerie privée — garde les échanges traçables.",
  },
  {
    re: /(urgent|imm[ée]diat|aujourd['’]hui seulement|dernier d[ée]lai|places? limit[ée]es?|sous 24\s?h)/i,
    texte: "Pression temporelle artificielle : une offre sérieuse te laisse le temps de réfléchir.",
  },
];

function emailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function websiteDomain(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function analyzeHeuristics(
  request: PartnershipRequest,
  context: AnalysisContext
): PartnershipAnalysis {
  const signaux: AnalysisSignal[] = [];
  const questions: string[] = [];
  let fiabilite = 65;
  let equite = 50;

  const domain = emailDomain(request.brandEmail);
  const siteDomain = websiteDomain(request.brandWebsite);
  const fullText = `${request.message}\n${request.deliverables ?? ""}`;

  // --- Fiabilité ---
  let dangers = 0;
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.re.test(fullText)) {
      const niveau = pattern.re.source.includes("whatsapp") || pattern.re.source.includes("urgent")
        ? ("attention" as const)
        : ("danger" as const);
      signaux.push({ niveau, texte: pattern.texte });
      if (niveau === "danger") {
        dangers += 1;
        fiabilite -= 30;
      } else {
        fiabilite -= 12;
      }
    }
  }

  if (DISPOSABLE_MAIL.some((d) => domain.includes(d))) {
    signaux.push({ niveau: "danger", texte: "Adresse email jetable — aucune entreprise sérieuse n'en utilise." });
    dangers += 1;
    fiabilite -= 40;
  } else if (FREE_MAIL.includes(domain)) {
    signaux.push({
      niveau: "attention",
      texte: `Email personnel (@${domain}) plutôt qu'une adresse professionnelle au nom de la marque.`,
    });
    fiabilite -= 10;
    questions.push("Pouvez-vous confirmer votre identité depuis une adresse email au domaine de votre entreprise ?");
  }

  if (!request.brandWebsite) {
    signaux.push({ niveau: "attention", texte: "Aucun site web fourni — difficile de vérifier que la marque existe." });
    fiabilite -= 10;
    questions.push("Pouvez-vous partager le site officiel de la marque et un moyen de vérifier votre rôle ?");
  } else if (siteDomain && domain && !FREE_MAIL.includes(domain)) {
    if (domain === siteDomain || domain.endsWith(`.${siteDomain}`) || siteDomain.endsWith(`.${domain}`)) {
      signaux.push({ niveau: "info", texte: "L'email correspond au domaine du site web : bon signe de légitimité." });
      fiabilite += 15;
    } else {
      signaux.push({
        niveau: "attention",
        texte: `Le domaine de l'email (@${domain}) ne correspond pas au site annoncé (${siteDomain}).`,
      });
      fiabilite -= 15;
    }
  }

  if (request.message.trim().length < 80) {
    signaux.push({ niveau: "attention", texte: "Offre très vague — un vrai brief détaille l'attendu et le calendrier." });
    fiabilite -= 5;
  }

  // --- Équité ---
  switch (request.compensation) {
    case "VISIBILITY":
      equite = 22;
      signaux.push({
        niveau: "attention",
        texte: "Contrepartie « visibilité » uniquement : ton travail mérite une vraie rémunération.",
      });
      questions.push("Prévoyez-vous une rémunération (argent ou dotation) en plus de la visibilité ?");
      break;
    case "PRODUCT":
      equite = 45;
      signaux.push({ niveau: "info", texte: "Dotation en produits : vérifie leur valeur réelle et ce qui est exigé en échange." });
      questions.push("Quelle est la valeur des produits offerts, et livrés sous quel délai ?");
      break;
    case "MONEY":
    case "MIXED": {
      if (request.budget == null) {
        equite = 40;
        signaux.push({ niveau: "attention", texte: "Rémunération annoncée mais aucun montant précisé." });
        questions.push("Quel est le budget exact et le calendrier de paiement ?");
      } else if (request.budget >= 200) {
        equite = 75;
      } else if (request.budget >= 100) {
        equite = 65;
      } else if (request.budget >= 30) {
        equite = 55;
      } else {
        equite = 35;
        signaux.push({ niveau: "attention", texte: "Budget annoncé très faible au regard du travail habituel d'une collab." });
      }
      break;
    }
  }

  if (/exclusiv/i.test(fullText)) {
    equite -= 10;
    signaux.push({
      niveau: "attention",
      texte: "Clause d'exclusivité évoquée : ne l'accorde jamais gratuitement, elle se négocie cher.",
    });
  }

  if ((request.deliverables ?? "").length > 600 && (request.budget ?? 0) < 100) {
    equite -= 10;
    signaux.push({ niveau: "attention", texte: "Beaucoup d'exigences listées pour une contrepartie modeste." });
  }

  if (request.deliverables && request.deliverables.trim().length >= 30) {
    fiabilite += 5;
  }

  fiabilite = clamp(fiabilite);
  equite = clamp(equite);

  const verdict: PartnershipAnalysis["verdict"] =
    dangers > 0 || fiabilite < 40
      ? "deconseille"
      : fiabilite >= 60 && equite >= 50
        ? "favorable"
        : "prudence";

  questions.push("Pouvez-vous envoyer un brief écrit détaillé et un modèle de contrat ?");
  if (verdict !== "deconseille" && request.compensation !== "VISIBILITY" && request.budget != null) {
    questions.push("Le paiement peut-il être réglé au moins en partie à la signature ?");
  }

  const contact = request.contactName?.trim() || request.brandName;
  const reponseSuggeree =
    verdict === "deconseille"
      ? `Bonjour ${contact},\n\nMerci pour votre message concernant « ${context.projectTitle} ». Après examen, je ne donnerai pas suite à cette proposition : plusieurs éléments ne me permettent pas de vérifier la fiabilité de l'offre en l'état.\n\nBonne continuation,\n${context.ownerName}`
      : verdict === "prudence"
        ? `Bonjour ${contact},\n\nMerci pour votre intérêt pour « ${context.projectTitle} » ! Avant d'aller plus loin, j'aurais besoin de quelques précisions :\n${questions
            .slice(0, 3)
            .map((q) => `- ${q}`)
            .join("\n")}\n\nAu plaisir d'échanger,\n${context.ownerName}`
        : `Bonjour ${contact},\n\nMerci pour votre proposition autour de « ${context.projectTitle} » — elle m'intéresse ! Pour avancer, pouvez-vous m'envoyer un brief détaillé (attendus, calendrier, modalités de paiement) et un modèle de contrat ?\n\nAu plaisir de collaborer,\n${context.ownerName}`;

  // Les signaux « info » positifs en dernier, dangers en premier.
  const ordre = { danger: 0, attention: 1, info: 2 };
  signaux.sort((a, b) => ordre[a.niveau] - ordre[b.niveau]);

  const resume =
    verdict === "deconseille"
      ? "Cette offre cumule des signaux typiques d'arnaque ou d'expéditeur invérifiable : ne t'engage pas et ne paie jamais rien."
      : verdict === "prudence"
        ? "L'offre n'est pas forcément malhonnête, mais des points importants restent à clarifier avant de t'engager."
        : "L'offre paraît légitime et la contrepartie correcte — cadre-la par écrit avant de commencer.";

  return {
    fiabilite,
    equite,
    verdict,
    resume,
    signaux,
    questions: [...new Set(questions)].slice(0, 5),
    reponseSuggeree,
    moteur: "heuristique",
  };
}

// ---------- Moteur Claude (analyse approfondie) ----------

const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fiabilite", "equite", "verdict", "resume", "signaux", "questions", "reponseSuggeree"],
  properties: {
    fiabilite: { type: "integer", description: "Fiabilité de la marque, 0 à 100" },
    equite: { type: "integer", description: "Équité de l'offre (contrepartie vs travail demandé), 0 à 100" },
    verdict: { type: "string", enum: ["favorable", "prudence", "deconseille"] },
    resume: { type: "string", description: "2 à 3 phrases, en français, tutoiement du créateur" },
    signaux: {
      type: "array",
      description: "Signaux concrets, du plus grave au plus positif (6 max)",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["niveau", "texte"],
        properties: {
          niveau: { type: "string", enum: ["danger", "attention", "info"] },
          texte: { type: "string" },
        },
      },
    },
    questions: {
      type: "array",
      description: "Questions à poser à la marque avant de s'engager (5 max)",
      items: { type: "string" },
    },
    reponseSuggeree: {
      type: "string",
      description:
        "Réponse prête à envoyer à la marque : français, vouvoiement, professionnelle, signée du prénom du créateur",
    },
  },
} as const;

const SYSTEM_PROMPT = `Tu es le copilote partenariats de GeniGain, une plateforme de financement participatif pour jeunes créateurs (Gen Z). Une marque vient d'envoyer une proposition de partenariat à un créateur ; ton rôle est de protéger le créateur des arnaques et des offres déséquilibrées, sans tuer les vraies opportunités.

Analyse la demande avec en tête les schémas classiques : frais à payer d'avance (jamais acceptable), arnaque au trop-perçu, moyens de paiement intraçables, email jetable ou personnel pour une soi-disant entreprise, incohérence entre email et site web, pression temporelle, bascule vers WhatsApp/Telegram, « visibilité » comme seule contrepartie, exclusivité demandée gratuitement, exigences démesurées par rapport au budget.

Sois concret et direct, en français. La fiabilité mesure « la marque est-elle réelle et digne de confiance » ; l'équité mesure « la contrepartie est-elle à la hauteur du travail demandé ». Le résumé et les signaux tutoient le créateur. La reponseSuggeree est une réponse complète prête à envoyer à la marque : vouvoiement, ton professionnel et cordial, signée du prénom du créateur ; si verdict prudence, elle pose les questions clés ; si déconseillé, c'est un refus poli et ferme, sans accusation directe.`;

function buildUserPrompt(request: PartnershipRequest, context: AnalysisContext): string {
  const compensationLabel: Record<PartnershipRequest["compensation"], string> = {
    MONEY: "rémunération en argent",
    PRODUCT: "produits / dotation",
    VISIBILITY: "visibilité uniquement",
    MIXED: "argent + produits",
  };
  return [
    `Projet du créateur : « ${context.projectTitle} » (objectif ${context.projectGoal} $). Prénom du créateur : ${context.ownerName}.`,
    ``,
    `Demande de partenariat reçue :`,
    `- Marque : ${request.brandName}`,
    `- Contact : ${request.contactName || "(non précisé)"}`,
    `- Email : ${request.brandEmail}`,
    `- Site web : ${request.brandWebsite || "(aucun)"}`,
    `- Contrepartie : ${compensationLabel[request.compensation]}`,
    `- Budget annoncé : ${request.budget != null ? `${request.budget} $` : "(non précisé)"}`,
    ``,
    `Message de la marque :`,
    `"""${request.message}"""`,
    ``,
    `Ce que la marque attend du créateur :`,
    `"""${request.deliverables || "(non précisé)"}"""`,
  ].join("\n");
}

async function analyzeWithClaude(
  request: PartnershipRequest,
  context: AnalysisContext
): Promise<PartnershipAnalysis | null> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: ANALYSIS_JSON_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(request, context) }],
  });

  if (response.stop_reason === "refusal") {
    console.warn("[partenariats] analyse refusée par les classifieurs");
    return null;
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) return null;

  const parsed = analysisSchema.safeParse(JSON.parse(textBlock.text));
  if (!parsed.success) {
    console.error("[partenariats] sortie IA invalide :", parsed.error.flatten());
    return null;
  }

  return {
    ...parsed.data,
    fiabilite: clamp(parsed.data.fiabilite),
    equite: clamp(parsed.data.equite),
    moteur: "claude",
  };
}

// ---------- Orchestration + cache ----------

async function persistAnalysis(requestId: string, analysis: PartnershipAnalysis) {
  await prisma.partnershipRequest.update({
    where: { id: requestId },
    data: {
      aiAnalysis: analysis as unknown as Prisma.InputJsonValue,
      aiAnalyzedAt: new Date(),
    },
  });
}

export function parseStoredAnalysis(value: Prisma.JsonValue | null): PartnershipAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const parsed = analysisSchema
    .extend({ moteur: z.enum(["claude", "heuristique"]) })
    .safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Analyse rapide (heuristique) calculée et mise en cache au premier affichage.
 * L'analyse Claude, plus lente, est déclenchée séparément (deepAnalyze).
 */
export async function getOrCreateAnalysis(
  request: PartnershipRequest,
  context: AnalysisContext
): Promise<PartnershipAnalysis> {
  const stored = parseStoredAnalysis(request.aiAnalysis);
  if (stored) return stored;

  const analysis = analyzeHeuristics(request, context);
  await persistAnalysis(request.id, analysis);
  return analysis;
}

/** Analyse approfondie Claude ; conserve l'heuristique si l'appel échoue. */
export async function deepAnalyze(
  request: PartnershipRequest,
  context: AnalysisContext
): Promise<PartnershipAnalysis | null> {
  if (!aiEnabled) return null;
  try {
    const analysis = await analyzeWithClaude(request, context);
    if (!analysis) return null;
    await persistAnalysis(request.id, analysis);
    return analysis;
  } catch (error) {
    console.error(`[partenariats] analyse Claude impossible pour ${request.id} :`, error);
    return null;
  }
}
