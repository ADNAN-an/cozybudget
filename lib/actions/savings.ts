"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { savingsGoalSchema, contributionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getSelectedMonth } from "@/lib/month";
import { monthRange } from "@/lib/dates";
import { toNumber } from "@/lib/format";
import { serializeContribution, serializeSavingsGoal } from "@/lib/serialize";

export async function getSavingsGoals() {
  const user = await requireUser();
  const rows = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(serializeSavingsGoal);
}

export async function getMonthlyContributions() {
  const user = await requireUser();
  const month = await getSelectedMonth();
  const { start, end } = monthRange(month);

  const rows = await prisma.savingsContribution.findMany({
    where: {
      goal: { userId: user.id },
      date: { gte: start, lte: end },
    },
    include: { goal: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return rows.map(serializeContribution);
}

export async function createSavingsGoal(formData: FormData) {
  const user = await requireUser();
  const parsed = savingsGoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, targetAmount } = parsed.data;

  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name,
      targetAmount: targetAmount ? parseFloat(targetAmount) : null,
      currentAmount: 0,
    },
  });

  revalidatePath("/savings");
  revalidatePath("/");
  return { success: true };
}

export async function addContribution(formData: FormData) {
  const user = await requireUser();
  const parsed = contributionSchema.safeParse({
    goalId: formData.get("goalId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { goalId, amount, date, note } = parsed.data;
  const value = parseFloat(amount);

  const goal = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) return { error: { _form: ["Goal not found"] } };

  await prisma.$transaction([
    prisma.savingsContribution.create({
      data: {
        goalId,
        amount: value,
        date: new Date(date),
        note: note || null,
      },
    }),
    prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: { increment: value },
      },
    }),
  ]);

  revalidatePath("/savings");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSavingsGoal(id: string) {
  const user = await requireUser();
  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId: user.id },
  });
  if (!goal) return { error: "Not found" };
  if (toNumber(goal.currentAmount) > 0) {
    return { error: "Cannot delete a goal with a balance. Withdraw funds first." };
  }

  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/savings");
  revalidatePath("/");
  return { success: true };
}

export async function deleteContribution(id: string) {
  const user = await requireUser();
  const contribution = await prisma.savingsContribution.findFirst({
    where: { id, goal: { userId: user.id } },
    include: { goal: true },
  });
  if (!contribution) return { error: "Not found" };

  const amount = toNumber(contribution.amount);

  await prisma.$transaction([
    prisma.savingsContribution.delete({ where: { id } }),
    prisma.savingsGoal.update({
      where: { id: contribution.goalId },
      data: {
        currentAmount: { decrement: amount },
      },
    }),
  ]);

  revalidatePath("/savings");
  revalidatePath("/");
  return { success: true };
}
