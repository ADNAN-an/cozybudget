import type {
  ExpenseCategory,
  IncomeCategory,
} from "@/lib/generated/prisma/client";

export type CategoryGroup<T extends string> = {
  label: string;
  items: { value: T; label: string }[];
};

export const EXPENSE_CATEGORY_GROUPS: CategoryGroup<ExpenseCategory>[] = [
  {
    label: "Housing",
    items: [
      { value: "RENT", label: "Rent" },
      { value: "MORTGAGE", label: "Mortgage" },
      { value: "WATER", label: "Water" },
      { value: "ELECTRICITY", label: "Electricity" },
      { value: "GAS", label: "Gas / heating" },
      { value: "INTERNET", label: "Internet" },
      { value: "TV", label: "TV / streaming" },
      { value: "HOME_MAINTENANCE", label: "Home maintenance" },
    ],
  },
  {
    label: "Food & drinks",
    items: [
      { value: "GROCERIES", label: "Groceries" },
      { value: "RESTAURANTS", label: "Restaurants" },
      { value: "COFFEE", label: "Coffee & cafes" },
      { value: "DELIVERY", label: "Food delivery" },
    ],
  },
  {
    label: "Transport",
    items: [
      { value: "FUEL", label: "Fuel" },
      { value: "PUBLIC_TRANSIT", label: "Public transit" },
      { value: "RIDE_SHARE", label: "Taxi / ride-share" },
      { value: "PARKING", label: "Parking" },
      { value: "CAR_MAINTENANCE", label: "Car maintenance" },
    ],
  },
  {
    label: "Lifestyle",
    items: [
      { value: "CLOTHES", label: "Clothes" },
      { value: "ELECTRONICS", label: "Electronics" },
      { value: "GYM", label: "Gym & fitness" },
      { value: "SUBSCRIPTION", label: "Subscriptions" },
      { value: "ENTERTAINMENT", label: "Entertainment" },
      { value: "PERSONAL_CARE", label: "Personal care" },
      { value: "HEALTH", label: "Health & medical" },
    ],
  },
  {
    label: "Other",
    items: [
      { value: "UTILITIES", label: "Utilities (other)" },
      { value: "EDUCATION", label: "Education" },
      { value: "GIFTS", label: "Gifts" },
      { value: "TAXES", label: "Taxes" },
      { value: "FEES", label: "Fees & charges" },
      { value: "OTHER", label: "Other" },
    ],
  },
];

export const INCOME_CATEGORY_GROUPS: CategoryGroup<IncomeCategory>[] = [
  {
    label: "Work",
    items: [
      { value: "SALARY", label: "Salary" },
      { value: "FREELANCE", label: "Freelance" },
      { value: "BUSINESS", label: "Business income" },
      { value: "BONUS", label: "Bonus" },
    ],
  },
  {
    label: "Investments & assets",
    items: [
      { value: "INVESTMENT", label: "Investment returns" },
      { value: "DIVIDENDS", label: "Dividends" },
      { value: "RENTAL_INCOME", label: "Rental income" },
    ],
  },
  {
    label: "Other",
    items: [
      { value: "GIFT", label: "Gift" },
      { value: "REFUND", label: "Refund" },
      { value: "OTHER", label: "Other" },
    ],
  },
];

export const EXPENSE_CATEGORIES = EXPENSE_CATEGORY_GROUPS.flatMap((g) => g.items);
export const INCOME_CATEGORIES = INCOME_CATEGORY_GROUPS.flatMap((g) => g.items);

export const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map(
  (c) => c.value
) as [ExpenseCategory, ...ExpenseCategory[]];

export const INCOME_CATEGORY_VALUES = INCOME_CATEGORIES.map(
  (c) => c.value
) as [IncomeCategory, ...IncomeCategory[]];

const expenseLabelMap = new Map(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);
const incomeLabelMap = new Map(
  INCOME_CATEGORIES.map((c) => [c.value, c.label])
);

export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  return expenseLabelMap.get(category) ?? category;
}

export function getIncomeCategoryLabel(category: IncomeCategory): string {
  return incomeLabelMap.get(category) ?? category;
}

export function getIncomeDisplayLabel(
  category: IncomeCategory,
  source: string | null
): string {
  const base = getIncomeCategoryLabel(category);
  const detail = source?.trim();
  return detail ? `${base} · ${detail}` : base;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENT: "bg-amber-100 text-amber-900",
  MORTGAGE: "bg-amber-100 text-amber-800",
  WATER: "bg-sky-100 text-sky-800",
  ELECTRICITY: "bg-yellow-100 text-yellow-900",
  GAS: "bg-orange-100 text-orange-800",
  INTERNET: "bg-blue-100 text-blue-800",
  TV: "bg-indigo-100 text-indigo-800",
  HOME_MAINTENANCE: "bg-stone-100 text-stone-800",
  GROCERIES: "bg-lime-100 text-lime-900",
  RESTAURANTS: "bg-orange-100 text-orange-800",
  COFFEE: "bg-amber-50 text-amber-800",
  DELIVERY: "bg-rose-100 text-rose-800",
  FUEL: "bg-slate-100 text-slate-800",
  PUBLIC_TRANSIT: "bg-cyan-100 text-cyan-900",
  RIDE_SHARE: "bg-violet-100 text-violet-800",
  PARKING: "bg-gray-100 text-gray-800",
  CAR_MAINTENANCE: "bg-zinc-100 text-zinc-800",
  CLOTHES: "bg-pink-100 text-pink-800",
  ELECTRONICS: "bg-purple-100 text-purple-800",
  GYM: "bg-emerald-100 text-emerald-800",
  SUBSCRIPTION: "bg-fuchsia-100 text-fuchsia-800",
  ENTERTAINMENT: "bg-violet-100 text-violet-900",
  PERSONAL_CARE: "bg-teal-100 text-teal-800",
  HEALTH: "bg-rose-100 text-rose-900",
  UTILITIES: "bg-slate-100 text-slate-700",
  EDUCATION: "bg-blue-100 text-blue-900",
  GIFTS: "bg-pink-50 text-pink-700",
  TAXES: "bg-red-100 text-red-800",
  FEES: "bg-neutral-100 text-neutral-700",
  OTHER: "bg-stone-100 text-stone-600",
};

export const INCOME_CATEGORY_COLORS: Record<IncomeCategory, string> = {
  SALARY: "bg-primary/15 text-primary",
  FREELANCE: "bg-emerald-100 text-emerald-800",
  BUSINESS: "bg-blue-100 text-blue-800",
  BONUS: "bg-amber-100 text-amber-900",
  INVESTMENT: "bg-indigo-100 text-indigo-800",
  DIVIDENDS: "bg-violet-100 text-violet-800",
  RENTAL_INCOME: "bg-cyan-100 text-cyan-900",
  GIFT: "bg-pink-100 text-pink-800",
  REFUND: "bg-slate-100 text-slate-700",
  OTHER: "bg-stone-100 text-stone-600",
};
