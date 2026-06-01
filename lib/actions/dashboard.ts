"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getSelectedMonth } from "@/lib/month";
import { monthRange } from "@/lib/dates";
import { toNumber } from "@/lib/format";
import { getCurrentBalance } from "@/lib/actions/balance";
import { getIncomeDisplayLabel } from "@/lib/categories";

type TrendPoint = {
  date: string;
  label: string;
  balance: number;
};

async function getBalanceTrendLast30Days(
  userId: string,
  currentBalance: number
): Promise<{
  points: TrendPoint[];
  current: number;
  delta30Days: number;
}> {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const [incomes, expenses, contributions, debtPayments] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true, amount: true },
    }),
    prisma.savingsContribution.findMany({
      where: { goal: { userId }, date: { gte: start, lte: end } },
      select: { date: true, amount: true },
    }),
    prisma.debtPayment.findMany({
      where: { debt: { userId }, date: { gte: start, lte: end } },
      select: { date: true, amount: true },
    }),
  ]);

  const dailyChanges = new Map<string, number>();
  const keyFor = (d: Date) => d.toISOString().slice(0, 10);
  const add = (key: string, delta: number) => {
    dailyChanges.set(key, (dailyChanges.get(key) ?? 0) + delta);
  };

  incomes.forEach((row) => add(keyFor(row.date), toNumber(row.amount)));
  expenses.forEach((row) => add(keyFor(row.date), -toNumber(row.amount)));
  contributions.forEach((row) => add(keyFor(row.date), -toNumber(row.amount)));
  debtPayments.forEach((row) => add(keyFor(row.date), -toNumber(row.amount)));

  const totalWindowDelta = [...dailyChanges.values()].reduce(
    (sum, val) => sum + val,
    0
  );
  const beforeWindowBalance = currentBalance - totalWindowDelta;

  const points: TrendPoint[] = [];
  let running = beforeWindowBalance;
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    running += dailyChanges.get(key) ?? 0;
    points.push({
      date: key,
      label: `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`,
      balance: Number(running.toFixed(2)),
    });
  }

  return {
    points,
    current: Number(currentBalance.toFixed(2)),
    delta30Days: Number(totalWindowDelta.toFixed(2)),
  };
}

async function sumIncomes(userId: string, start: Date, end: Date) {
  const result = await prisma.income.aggregate({
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumExpenses(userId: string, start: Date, end: Date) {
  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumContributions(userId: string, start: Date, end: Date) {
  const result = await prisma.savingsContribution.aggregate({
    where: {
      goal: { userId },
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

async function sumDebtPayments(userId: string, start: Date, end: Date) {
  const result = await prisma.debtPayment.aggregate({
    where: {
      debt: { userId },
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return result._sum.amount ? toNumber(result._sum.amount) : 0;
}

export async function getDashboardData() {
  const user = await requireUser();
  const month = await getSelectedMonth();
  const { start, end } = monthRange(month);

  const [income, expenses, savings, debtPaid, goals, debts, balance] =
    await Promise.all([
      sumIncomes(user.id, start, end),
      sumExpenses(user.id, start, end),
      sumContributions(user.id, start, end),
      sumDebtPayments(user.id, start, end),
      prisma.savingsGoal.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
      }),
      prisma.debt.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
      }),
      getCurrentBalance(),
    ]);

  const net = income - expenses - savings - debtPaid;

  const trend = await getBalanceTrendLast30Days(user.id, balance.currentBalance);

  const [recentIncomes, recentExpenses, recentContributions, recentPayments] =
    await Promise.all([
      prisma.income.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.savingsContribution.findMany({
        where: { goal: { userId: user.id } },
        include: { goal: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.debtPayment.findMany({
        where: { debt: { userId: user.id } },
        include: { debt: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

  type Activity = {
    id: string;
    type: "income" | "expense" | "savings" | "debt";
    label: string;
    amount: number;
    date: string;
  };

  const activities: Activity[] = [
    ...recentIncomes.map((i) => ({
      id: i.id,
      type: "income" as const,
      label: getIncomeDisplayLabel(i.category, i.source),
      amount: toNumber(i.amount),
      date: i.date.toISOString(),
    })),
    ...recentExpenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      label: e.description,
      amount: toNumber(e.amount),
      date: e.date.toISOString(),
    })),
    ...recentContributions.map((c) => ({
      id: c.id,
      type: "savings" as const,
      label: c.goal.name,
      amount: toNumber(c.amount),
      date: c.date.toISOString(),
    })),
    ...recentPayments.map((p) => ({
      id: p.id,
      type: "debt" as const,
      label: p.debt.name,
      amount: toNumber(p.amount),
      date: p.date.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    month,
    balance,
    summary: { income, expenses, savings, debtPaid, net },
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      current: toNumber(g.currentAmount),
      target: g.targetAmount ? toNumber(g.targetAmount) : null,
    })),
    debts: debts.map((d) => ({
      id: d.id,
      name: d.name,
      original: toNumber(d.originalAmount),
      remaining: toNumber(d.remainingAmount),
    })),
    chartData: trend.points,
    chartSummary: {
      current: trend.current,
      delta30Days: trend.delta30Days,
    },
    activities,
  };
}
