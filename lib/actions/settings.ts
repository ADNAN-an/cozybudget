"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isCurrencyCode, type CurrencyCode } from "@/lib/currency";
import { revalidatePath } from "next/cache";

export async function getUserCurrency(): Promise<CurrencyCode> {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { currency: true },
  });
  return user.currency;
}

export async function getSettings() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { currency: true, email: true },
  });
  return {
    currency: user.currency,
    email: user.email,
  };
}

export async function updateCurrency(formData: FormData) {
  const sessionUser = await requireUser();
  const currency = formData.get("currency");

  if (typeof currency !== "string" || !isCurrencyCode(currency)) {
    return { error: "Invalid currency" };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { currency },
  });

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { success: true };
}
