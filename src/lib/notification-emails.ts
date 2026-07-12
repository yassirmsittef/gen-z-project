import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appUrl } from "@/lib/stripe";

/**
 * Relais EMAIL des notifications majeures — les moments d'argent et d'action
 * méritent mieux qu'une cloche in-app. Même pattern que les mouvements
 * Stripe : la notification est figée en transaction par le métier, l'email
 * part APRÈS commit (`sendPendingNotificationEmails` aux points chauds) et le
 * cron quotidien rejoue les manqués. Idempotent par `emailedAt`.
 *
 * Une notification déjà LUE in-app ne part pas par email (l'utilisateur est
 * au courant), et les préférences par type sont respectées en amont : un type
 * coupé ne crée pas de notification du tout.
 */

/** Les types relayés par email — volontairement peu nombreux (pas de spam). */
export const EMAILED_TYPES: NotificationType[] = [
  "PROJECT_FUNDED",
  "PROJECT_FAILED",
  "REFUND",
  "PROOF_TO_VOTE",
  "MILESTONE_RELEASED",
];

/** Au-delà, l'info est froide : la cloche in-app suffit. */
const MAX_AGE_HOURS = 48;

type Sender = typeof sendEmail;

function renderEmail(params: {
  name: string | null;
  title: string;
  body: string | null;
  link: string;
  prefsLink: string;
}) {
  const { name, title, body, link, prefsLink } = params;
  const hello = name ? `Salut ${name} — ` : "";
  const text = `${hello}${title}\n\n${body ?? ""}\n\nVoir sur GeniGain :\n${link}\n\nTu reçois cet email parce qu'un événement important concerne tes projets ou tes contributions. Gère tes préférences : ${prefsLink}\n\n— GeniGain, la communauté qui finance ta génération`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background-color:#0B0E14;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0E14;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#131826;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
<tr><td style="padding:32px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#94A3B8;font-family:'SF Mono',Menlo,Consolas,monospace;">GeniGain</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F1F5F9;">${title}</h1>
${body ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#94A3B8;">${body}</p>` : ""}
<p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;padding:12px 24px;background:linear-gradient(120deg,#5EEAD4,#38BDF8);color:#0B0E14;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;">Voir sur GeniGain</a></p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#64748B;">Tu reçois cet email parce qu'un événement important concerne tes projets ou tes contributions. <a href="${prefsLink}" style="color:#5EEAD4;text-decoration:none;">Gérer mes préférences</a></p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:11px;color:#64748B;">GeniGain — la communauté qui finance ta génération</p>
</td></tr></table></body></html>`;
  return { text, html };
}

/**
 * Envoie les emails des notifications majeures en attente. Appelé après les
 * commits (jamais dans une transaction) et rejoué par le cron. `sender`
 * injectable pour les tests (aucun réseau dans la suite).
 */
export async function sendPendingNotificationEmails(sender: Sender = sendEmail) {
  const pending = await prisma.notification.findMany({
    where: {
      type: { in: EMAILED_TYPES },
      emailedAt: null,
      readAt: null,
      createdAt: { gt: new Date(Date.now() - MAX_AGE_HOURS * 3_600_000) },
      // Jamais vers les boîtes injoignables : comptes anonymisés (RGPD),
      // comptes de démo/seed et fixtures — les bounces ruinent la
      // réputation d'envoi du domaine.
      user: {
        AND: [
          { email: { not: { endsWith: ".invalid" } } },
          { email: { not: { endsWith: "@demo.dev" } } },
          { email: { not: { endsWith: ".test" } } },
        ],
      },
    },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 50, // le cron quotidien draine le reste si gros volume
  });

  const base = appUrl();
  for (const notification of pending) {
    const { text, html } = renderEmail({
      name: notification.user.name,
      title: notification.title,
      body: notification.body,
      link: `${base}${notification.href}`,
      prefsLink: `${base}/notifications`,
    });
    try {
      const { sent } = await sender({
        to: notification.user.email,
        subject: notification.title,
        html,
        text,
      });
      // Échec (fournisseur, config absente) : rien n'est marqué, le cron
      // retentera tant que la notification est fraîche et non lue.
      if (sent) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { emailedAt: new Date() },
        });
      }
    } catch (error) {
      console.error(`[notif-email] envoi impossible pour ${notification.id} :`, error);
    }
  }
}
