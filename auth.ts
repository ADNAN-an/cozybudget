import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { getAuthPasswordHash, getAuthEnvStatus } from "@/lib/auth-env";

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

        const envEmail = process.env.AUTH_USER_EMAIL?.trim().toLowerCase();
        const envHash = getAuthPasswordHash();
        const envStatus = getAuthEnvStatus();

        if (!envEmail || !envHash) {
          console.error("Auth env incomplete:", envStatus);
          return null;
        }

        if (email.toLowerCase() !== envEmail) {
          console.error("Auth email mismatch for login attempt");
          return null;
        }

        const valid = await bcrypt.compare(password, envHash);
        if (!valid) {
          console.error("Auth password mismatch for login attempt");
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { email: envEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { email: envEmail },
          });
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
});
