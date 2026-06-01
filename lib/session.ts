import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/user";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await ensureDbUser({
    id: session.user.id,
    email: session.user.email ?? "",
  });

  return {
    id: user.id,
    email: user.email,
  };
}
