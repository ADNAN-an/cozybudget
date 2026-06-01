"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { toNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function sumAllIncomes(userId: string) {
  const result = await prisma.income.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumAllExpenses(userId: string) {
  const result = await prisma.expense.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumAllContributions(userId: string) {
  const result = await prisma.savingsContribution.aggregate({
    where: { goal: { userId } },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumAllDebtPayments(userId: string) {
  const result = await prisma.debtPayment.aggregate({
    where: { debt: { userId } },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

export async function getCurrentBalance() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { openingBalance: true },
  });

  const openingBalance = toNumber(user?.openingBalance ?? 0);

  const [totalIncome, totalExpenses, totalSavings, totalDebtPaid] =
    await Promise.all([
      sumAllIncomes(sessionUser.id),
      sumAllExpenses(sessionUser.id),
      sumAllContributions(sessionUser.id),
      sumAllDebtPayments(sessionUser.id),
    ]);

  const fromActivity =
    totalIncome - totalExpenses - totalSavings - totalDebtPaid;
  const currentBalance = openingBalance + fromActivity;

  return {
    currentBalance,
    openingBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalDebtPaid,
    fromActivity,
  };
}

const openingBalanceSchema = z.object({
  amount: z
    .string()
    .min(1)
    .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Enter a valid amount",
    }),
});

export async function updateOpeningBalance(formData: FormData) {
  const sessionUser = await requireUser();
  const parsed = openingBalanceSchema.safeParse({
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { error: "Invalid amount" };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { openingBalance: parseFloat(parsed.data.amount) },
  });

  revalidatePath("/");
  return { success: true };
}
