import { z } from "zod";
import {
  EXPENSE_CATEGORY_VALUES,
  INCOME_CATEGORY_VALUES,
} from "@/lib/categories";

export const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    message: "Enter a positive amount",
  });

export const dateSchema = z.string().min(1, "Date is required");

export const incomeSchema = z.object({
  amount: amountSchema,
  category: z.enum(INCOME_CATEGORY_VALUES),
  source: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  date: dateSchema,
  note: z.string().max(500).optional(),
});

export const expenseSchema = z.object({
  amount: amountSchema,
  category: z.enum(EXPENSE_CATEGORY_VALUES),
  description: z.string().min(1, "Description is required").max(200),
  date: dateSchema,
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!Number.isNaN(parseFloat(v)) && parseFloat(v) > 0),
      { message: "Target must be positive" }
    ),
});

export const contributionSchema = z.object({
  goalId: z.string().min(1),
  amount: amountSchema,
  date: dateSchema,
  note: z.string().max(500).optional(),
});

export const debtSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  originalAmount: amountSchema,
  dueDate: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const debtPaymentSchema = z.object({
  debtId: z.string().min(1),
  amount: amountSchema,
  date: dateSchema,
  note: z.string().max(500).optional(),
});
