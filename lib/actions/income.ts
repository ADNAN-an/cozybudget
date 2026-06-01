"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { incomeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getSelectedMonth } from "@/lib/month";
import { monthRange } from "@/lib/dates";
import { monthKeyToString } from "@/lib/month";
import { serializeIncome } from "@/lib/serialize";

export async function getIncomes() {
  const user = await requireUser();
  const month = await getSelectedMonth();
  const { start, end } = monthRange(month);

  const rows = await prisma.income.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
  });

  return rows.map(serializeIncome);
}

export async function createIncome(formData: FormData) {
  const user = await requireUser();
  const parsed = incomeSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    source: formData.get("source") || undefined,
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { amount, category, source, date, note } = parsed.data;

  await prisma.income.create({
    data: {
      userId: user.id,
      amount: parseFloat(amount),
      category,
      source: source ?? null,
      date: new Date(date),
      note: note || null,
    },
  });

  revalidatePath("/income");
  revalidatePath("/");
  return { success: true };
}

export async function updateIncome(id: string, formData: FormData) {
  const user = await requireUser();
  const parsed = incomeSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    source: formData.get("source") || undefined,
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.income.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: { _form: ["Not found"] } };

  const { amount, category, source, date, note } = parsed.data;

  await prisma.income.update({
    where: { id },
    data: {
      amount: parseFloat(amount),
      category,
      source: source ?? null,
      date: new Date(date),
      note: note || null,
    },
  });

  revalidatePath("/income");
  revalidatePath("/");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const user = await requireUser();
  const existing = await prisma.income.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: "Not found" };

  await prisma.income.delete({ where: { id } });
  revalidatePath("/income");
  revalidatePath("/");
  return { success: true };
}

export async function getIncomeMonthKey() {
  const month = await getSelectedMonth();
  return monthKeyToString(month);
}
