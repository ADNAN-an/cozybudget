import { prisma } from "@/lib/db";

type SessionUser = {
  id: string;
  email: string;
};

/**
 * JWT may reference a user id that no longer exists after DB reset/migrate.
 * Resolve by id, then email, then create — keeps solo login working.
 */
export async function ensureDbUser(sessionUser: SessionUser) {
  const existingById = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });
  if (existingById) return existingById;

  const email = (
    sessionUser.email ||
    process.env.AUTH_USER_EMAIL ||
    ""
  ).toLowerCase();

  if (!email) {
    throw new Error("No user email available to restore session");
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingByEmail) return existingByEmail;

  return prisma.user.create({
    data: { email },
  });
}
