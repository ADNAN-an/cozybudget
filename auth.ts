import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { getAuthPasswordHash } from "@/lib/auth-env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const envEmail = process.env.AUTH_USER_EMAIL;
        const envHash = getAuthPasswordHash();

        if (!envEmail || !envHash) {
          console.error("AUTH_USER_EMAIL or AUTH_USER_PASSWORD_HASH not set");
          return null;
        }

        if (email.toLowerCase() !== envEmail.toLowerCase()) return null;

        const valid = await bcrypt.compare(password, envHash);
        if (!valid) return null;

        let user = await prisma.user.findUnique({
          where: { email: envEmail.toLowerCase() },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { email: envEmail.toLowerCase() },
          });
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
});
