"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/month";
import { parseMonthKey } from "@/lib/dates";
import { revalidatePath } from "next/cache";

export async function setSelectedMonth(monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return { error: "Invalid month" };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, monthKey, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
  return { success: true };
}
