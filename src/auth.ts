import NextAuth, { CredentialsSignin } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { hashPassword, needsRehash, verifyPassword } from "@/lib/password";
import {
  needsRevalidation,
  reconcileClaims,
  type SessionClaims,
} from "@/lib/session-claims";
import { consumeRecoveryCode, mfaRequired } from "@/lib/mfa";
import { checkLoginBurst } from "@/lib/security-alerts";
import { verifyTotp } from "@/lib/totp";
import { MAX_LOGIN_FAILURES_PER_IP, LOGIN_IP_WINDOW_MINUTES } from "@/lib/constants";
import { ipFromHeaders, ipKey, recordHit, throttleHits } from "@/lib/throttle";
import { loginSchema } from "@/lib/validation";

/** Hachage leurre (coût 12, comme les vrais) : le temps de réponse d'un
 *  compte inconnu doit ressembler à celui d'un compte existant. */
const LEURRE_BCRYPT = "$2a$12$RYOKCF.XQQ2U9FCcyecO4.LmgsmXeSrUQLmB.2HVDcEVo2l1Z0Jcm";

/** Trop d'échecs récents : le code traverse Auth.js jusqu'à loginAction. */
class LoginRateLimited extends CredentialsSignin {
  code = "rate-limited";
}
/** Mot de passe juste, mais le compte exige un code : le formulaire le demande. */
class TotpRequired extends CredentialsSignin {
  code = "totp-required";
}
class TotpInvalid extends CredentialsSignin {
  code = "totp-invalid";
}

/**
 * Durée de vie d'une session : 7 jours sans activité (30 par défaut chez
 * Auth.js — long pour une plateforme qui manipule de l'argent), et un jeton
 * ré-émis chaque jour d'usage : une session active ne tombe pas, une session
 * abandonnée s'éteint en une semaine.
 */
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_S = 24 * 60 * 60;

/**
 * Un JWT ne se révoque pas : une fois signé, il vaut jusqu'à son expiration.
 * On contourne en faisant porter au jeton la VERSION de session du compte,
 * et en la reconfrontant à la base au plus toutes les 5 minutes
 * (src/lib/session-claims.ts). Changer son mot de passe l'incrémente : les
 * sessions ouvertes ailleurs — dont celle d'un voleur — tombent dans les
 * 5 minutes, au lieu de tenir 7 jours. Le coût : une lecture de base toutes
 * les 5 minutes par session, pas une par requête.
 */

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials, request) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      // Anti brute-force, deux axes vérifiés AVANT bcrypt (coût identique pour
      // l'attaquant, existence du compte jamais révélée) : par COMPTE (10
      // échecs / 15 min) et par ADRESSE — sans ce second axe, le « password
      // spraying » (un mot de passe courant contre mille emails) ne
      // déclenchait jamais un seul verrou.
      const cleIp = ipKey("login", ipFromHeaders(request.headers));
      const echecsIp = await throttleHits(cleIp, LOGIN_IP_WINDOW_MINUTES);
      if (echecsIp >= MAX_LOGIN_FAILURES_PER_IP) throw new LoginRateLimited();
      if (await isLoginLocked(email)) throw new LoginRateLimited();

      const echec = async () => {
        await recordLoginFailure(email);
        await recordHit(cleIp);
        // Une rafale tous comptes confondus prévient les admins.
        await checkLoginBurst();
        return null;
      };

      const user = await prisma.user.findUnique({ where: { email } });
      // Compte inconnu (ou sans mot de passe) : on compare quand même, contre
      // un hachage leurre — trouvé par l'audit : ~240 ms pour un compte
      // existant contre ~34 ms sinon, de quoi énumérer les comptes au
      // chronomètre malgré le message identique.
      const valid = await verifyPassword(password, user?.passwordHash ?? LEURRE_BCRYPT);
      if (!user?.passwordHash || !valid) return echec();

      // Le code n'est demandé qu'APRÈS un mot de passe juste : qui ne l'a pas
      // n'apprend même pas que la double authentification existe. Un code
      // faux compte comme un échec de connexion — le même verrou (10 en
      // 15 min) rend l'essai des 1 000 000 de codes possibles sans intérêt.
      if (mfaRequired(user)) {
        const code = parsed.data.code?.trim();
        if (!code) throw new TotpRequired();
        // Le code du téléphone d'abord ; à défaut, un code de secours (usage
        // unique) pour qui a perdu son téléphone.
        const okTotp = verifyTotp(user.totpSecret!, code);
        const okSecours = !okTotp && (await consumeRecoveryCode(user.id, code));
        if (!okTotp && !okSecours) {
          await echec();
          throw new TotpInvalid();
        }
      }

      await clearLoginFailures(email);
      // Le mot de passe est en clair sous la main, et vérifié : c'est le seul
      // moment où l'on peut relever le coût d'un vieux hachage sans rien
      // demander au membre.
      if (needsRehash(user.passwordHash)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await hashPassword(password) },
        });
      }
      return { id: user.id, name: user.name, email: user.email, image: user.avatarUrl };
    },
  }),
];

export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
if (googleEnabled) providers.push(Google);

// Le modèle User expose `avatarUrl` (spec) là où Auth.js attend `image` :
// on adapte l'écriture à la création (OAuth), le reste est compatible.
const baseAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...baseAdapter,
  async createUser({ id: _id, image, ...data }: AdapterUser) {
    const user = await prisma.user.create({
      data: { ...data, avatarUrl: image ?? null },
    });
    return { ...user, image: user.avatarUrl, email: user.email } as AdapterUser;
  },
};

const production = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_S, updateAge: SESSION_UPDATE_AGE_S },
  pages: { signIn: "/login" },
  trustHost: true,
  providers,
  // `__Host-` : le navigateur refuse alors ce cookie s'il n'est pas Secure,
  // limité à `/`, et SANS attribut Domain — un sous-domaine compromis ne peut
  // plus poser un cookie de session à notre place. En développement (HTTP),
  // ce préfixe est impossible : on garde le nom par défaut.
  cookies: production
    ? {
        sessionToken: {
          name: "__Host-authjs.session-token",
          options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
        },
      }
    : undefined,
  callbacks: {
    async jwt({ token, user, trigger }) {
      const claims = token as typeof token & SessionClaims;
      const now = Date.now();

      // À la connexion : le jeton emporte la version courante.
      if (user?.id) {
        const compte = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sessionVersion: true },
        });
        return { ...claims, sv: compte?.sessionVersion ?? 0, chk: now };
      }

      if (!needsRevalidation(claims, now, trigger === "update")) return claims;
      if (!claims.sub) return null;
      const compte = await prisma.user.findUnique({
        where: { id: claims.sub },
        select: { sessionVersion: true, email: true },
      });
      const verdict = reconcileClaims(claims, compte, now);
      return verdict ? { ...claims, ...verdict } : null;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
