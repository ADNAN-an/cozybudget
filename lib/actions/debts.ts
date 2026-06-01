"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { debtSchema, debtPaymentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getSelectedMonth } from "@/lib/month";
import { monthRange } from "@/lib/dates";
import { toNumber } from "@/lib/format";
import { serializeDebt, serializeDebtPayment } from "@/lib/serialize";

export async function getDebts() {
  const user = await requireUser();
  const rows = await prisma.debt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(serializeDebt);
}

export async function getMonthlyPayments() {
  const user = await requireUser();
  const month = await getSelectedMonth();
  const { start, end } = monthRange(month);

  const rows = await prisma.debtPayment.findMany({
    where: {
      debt: { userId: user.id },
      date: { gte: start, lte: end },
    },
    include: { debt: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return rows.map(serializeDebtPayment);
}

export async function createDebt(formData: FormData) {
  const user = await requireUser();
  const parsed = debtSchema.safeParse({
    name: formData.get("name"),
    originalAmount: formData.get("originalAmount"),
    dueDate: formData.get("dueDate") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, originalAmount, dueDate, note } = parsed.data;
  const amount = parseFloat(originalAmount);

  await prisma.debt.create({
    data: {
      userId: user.id,
      name,
      originalAmount: amount,
      remainingAmount: amount,
      dueDate: dueDate?.trim() ? new Date(dueDate) : null,
      note: note || null,
    },
  });

  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function addDebtPayment(formData: FormData) {
  const user = await requireUser();
  const parsed = debtPaymentSchema.safeParse({
    debtId: formData.get("debtId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { debtId, amount, date, note } = parsed.data;
  const value = parseFloat(amount);

  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId: user.id },
  });
  if (!debt) return { error: { _form: ["Debt not found"] } };

  const remaining = Math.max(0, toNumber(debt.remainingAmount) - value);

  await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        debtId,
        amount: value,
        date: new Date(date),
        note: note || null,
      },
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: { remainingAmount: remaining },
    }),
  ]);

  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDebt(id: string) {
  const user = await requireUser();
  const debt = await prisma.debt.findFirst({
    where: { id, userId: user.id },
  });
  if (!debt) return { error: "Not found" };
  if (toNumber(debt.remainingAmount) < toNumber(debt.originalAmount)) {
    return { error: "Cannot delete a debt with payment history." };
  }

  await prisma.debt.delete({ where: { id } });
  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDebtPayment(id: string) {
  const user = await requireUser();
  const payment = await prisma.debtPayment.findFirst({
    where: { id, debt: { userId: user.id } },
    include: { debt: true },
  });
  if (!payment) return { error: "Not found" };

  const amount = toNumber(payment.amount);
  const newRemaining = Math.min(
    toNumber(payment.debt.originalAmount),
    toNumber(payment.debt.remainingAmount) + amount
  );

  await prisma.$transaction([
    prisma.debtPayment.delete({ where: { id } }),
    prisma.debt.update({
      where: { id: payment.debtId },
      data: { remainingAmount: newRemaining },
    }),
  ]);

  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}
