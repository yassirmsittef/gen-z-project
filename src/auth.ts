import NextAuth, { CredentialsSignin } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { loginSchema } from "@/lib/validation";

/** Trop d'échecs récents : le code traverse Auth.js jusqu'à loginAction. */
class LoginRateLimited extends CredentialsSignin {
  code = "rate-limited";
}

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      // Anti brute-force : vérifié AVANT bcrypt, même pour un email inconnu
      // (coût identique pour l'attaquant, existence du compte jamais révélée).
      if (await isLoginLocked(email)) throw new LoginRateLimited();

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) {
        await recordLoginFailure(email);
        return null;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        await recordLoginFailure(email);
        return null;
      }

      await clearLoginFailures(email);
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers,
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
