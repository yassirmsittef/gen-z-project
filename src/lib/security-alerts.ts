import { LOGIN_BURST_ALERT_THRESHOLD } from "@/lib/constants";
import { LOGIN_WINDOW_MINUTES } from "@/lib/login-rate-limit";
import type { NotificationKey } from "@/lib/notification-catalog";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { notify } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

/**
 * Les alertes de sécurité vers les ADMIN — le pendant humain des journaux :
 * les échecs de connexion étaient enregistrés, les litiges arrivaient chez
 * Stripe, le quota de traduction se fermait en silence, et PERSONNE n'était
 * prévenu. Même mécanique que l'alerte de stockage : une notification
 * non masquable, dédupliquée sur les non-lues, relayée par email.
 */
export async function alertAdmins(
  key: Extract<NotificationKey, `securityAlert.${string}`>,
  params: Record<string, string | number | null>,
  href = "/admin",
  options: { flushEmails?: boolean } = {}
): Promise<void> {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length === 0) return;
  // Dédupliqué par CLÉ sur les non-lues — pas par type : une rafale de mots
  // de passe non lue ne doit pas faire taire le litige bancaire qui suit.
  const dejaLa = await prisma.notification.findMany({
    where: { userId: { in: admins.map((a) => a.id) }, type: "SECURITY_ALERT", key, readAt: null },
    select: { userId: true },
  });
  const servis = new Set(dejaLa.map((n) => n.userId));
  for (const admin of admins) {
    if (servis.has(admin.id)) continue;
    await notify({ userId: admin.id, type: "SECURITY_ALERT", key, params, href });
  }
  // L'email part d'ici, où l'on sait qu'une alerte vient de naître — sauf
  // pour ce qui peut attendre le prochain relais (cron quotidien, ou la
  // prochaine alerte pressante) : la saturation de traduction n'a rien
  // d'urgent, et la lecture de quelqu'un ne doit pas déclencher un envoi.
  if (options.flushEmails !== false) await sendPendingNotificationEmails();
}

/**
 * Une rafale d'échecs de connexion, tous comptes confondus, sur la fenêtre
 * de l'anti brute-force : c'est la signature d'un balayage de mots de passe.
 * Appelé après chaque échec ; une seule alerte non lue à la fois.
 */
export async function checkLoginBurst(): Promise<boolean> {
  const count = await prisma.loginAttempt.count({
    where: { createdAt: { gt: new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000) } },
  });
  if (count < LOGIN_BURST_ALERT_THRESHOLD) return false;
  await alertAdmins("securityAlert.loginBurst", { count, minutes: LOGIN_WINDOW_MINUTES });
  return true;
}
