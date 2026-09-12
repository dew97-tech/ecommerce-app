import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/security/rate-limit"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"

const DUMMY_PASSWORD_HASH = bcrypt.hashSync("invalid-password", 10)
const LOGIN_LIMIT = 8
const LOGIN_WINDOW_MS = 10 * 60 * 1000

async function getUser(email) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const normalizedEmail = email.toLowerCase();

        const limit = checkRateLimit(`login:${normalizedEmail}`, {
          limit: LOGIN_LIMIT,
          windowMs: LOGIN_WINDOW_MS,
        });

        if (!limit.allowed) {
          console.warn(`[auth] Too many login attempts for ${normalizedEmail}`);
          return null;
        }

        const user = await getUser(normalizedEmail);
        const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
        const passwordsMatch = await bcrypt.compare(password, passwordHash);

        if (!user || !passwordsMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
})
