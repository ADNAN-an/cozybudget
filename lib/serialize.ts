import { toNumber } from "@/lib/format";
import type {
  Income,
  IncomeCategory,
  Expense,
  SavingsGoal,
  SavingsContribution,
  Debt,
  DebtPayment,
} from "@/lib/generated/prisma/client";

function toIso(date: Date): string {
  return date.toISOString();
}

export type SerializedIncome = {
  id: string;
  amount: number;
  category: IncomeCategory;
  source: string | null;
  note: string | null;
  date: string;
};

export type SerializedExpense = {
  id: string;
  amount: number;
  category: Expense["category"];
  description: string;
  date: string;
};

export type SerializedSavingsGoal = {
  id: string;
  name: string;
  targetAmount: number | null;
  currentAmount: number;
};

export type SerializedContribution = {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  goal: { name: string };
};

export type SerializedDebt = {
  id: string;
  name: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string | null;
};

export type SerializedDebtPayment = {
  id: string;
  amount: number;
  date: string;
  debt: { name: string };
};

export function serializeIncome(row: Income): SerializedIncome {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    category: row.category,
    source: row.source,
    note: row.note,
    date: toIso(row.date),
  };
}

export function serializeExpense(row: Expense): SerializedExpense {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    category: row.category,
    description: row.description,
    date: toIso(row.date),
  };
}

export function serializeSavingsGoal(row: SavingsGoal): SerializedSavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.targetAmount ? toNumber(row.targetAmount) : null,
    currentAmount: toNumber(row.currentAmount),
  };
}

export function serializeContribution(
  row: SavingsContribution & { goal: { name: string } }
): SerializedContribution {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    date: toIso(row.date),
    note: row.note,
    goal: { name: row.goal.name },
  };
}

export function serializeDebt(row: Debt): SerializedDebt {
  return {
    id: row.id,
    name: row.name,
    originalAmount: toNumber(row.originalAmount),
    remainingAmount: toNumber(row.remainingAmount),
    dueDate: row.dueDate ? toIso(row.dueDate) : null,
  };
}

export function serializeDebtPayment(
  row: DebtPayment & { debt: { name: string } }
): SerializedDebtPayment {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    date: toIso(row.date),
    debt: { name: row.debt.name },
  };
}
