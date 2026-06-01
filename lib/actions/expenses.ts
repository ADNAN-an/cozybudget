"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { expenseSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getSelectedMonth } from "@/lib/month";
import { monthRange } from "@/lib/dates";
import type { ExpenseCategory } from "@/lib/generated/prisma/client";
import { serializeExpense } from "@/lib/serialize";

export async function getExpenses() {
  const user = await requireUser();
  const month = await getSelectedMonth();
  const { start, end } = monthRange(month);

  const rows = await prisma.expense.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
  });

  return rows.map(serializeExpense);
}

export async function createExpense(formData: FormData) {
  const user = await requireUser();
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { amount, category, description, date } = parsed.data;

  await prisma.expense.create({
    data: {
      userId: user.id,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      description,
      date: new Date(date),
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await requireUser();
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: { _form: ["Not found"] } };

  const { amount, category, description, date } = parsed.data;

  await prisma.expense.update({
    where: { id },
    data: {
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      description,
      date: new Date(date),
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const user = await requireUser();
  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: "Not found" };

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}
