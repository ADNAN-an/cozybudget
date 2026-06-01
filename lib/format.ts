import { formatMoney, type CurrencyCode } from "@/lib/currency";

export type NumericValue =
  | number
  | string
  | { toNumber(): number }
  | { toString(): string };

export function toNumber(value: NumericValue): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if ("toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return parseFloat(value.toString());
}

export function formatCurrency(
  amount: NumericValue,
  currency: CurrencyCode = "USD"
): string {
  const n = typeof amount === "number" ? amount : toNumber(amount);
  return formatMoney(n, currency);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
