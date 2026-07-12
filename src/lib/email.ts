/**
 * Envoi d'email transactionnel — fournisseur derrière une seule fonction.
 * Aujourd'hui : Resend (simple POST, pas de SDK). Demain Brevo ou autre :
 * seule cette implémentation change.
 *
 * ⚠️ Resend sans domaine vérifié n'autorise l'envoi qu'à l'adresse du compte
 * Resend lui-même (suffisant pour tester le circuit). Pour écrire à tous les
 * membres : vérifier un domaine chez Resend, ou passer sur un fournisseur à
 * expéditeur simple vérifié (Brevo).
 */

export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "GeniGain <onboarding@resend.dev>";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!emailEnabled) {
    // Jamais de lien de réinitialisation dans les logs de prod.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email désactivé] à: ${input.to} — sujet: ${input.subject}\n${input.text}`);
    }
    return { sent: false, error: "Envoi d'email non configuré." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[email] échec d'envoi (${response.status}) : ${detail.slice(0, 300)}`);
    return { sent: false, error: `Le fournisseur d'email a refusé (${response.status}).` };
  }
  return { sent: true };
}
