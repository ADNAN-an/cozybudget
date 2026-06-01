import type { Currency } from "@/lib/generated/prisma/client";

export type CurrencyCode = Currency;

export const CURRENCY_OPTIONS: {
  value: CurrencyCode;
  label: string;
  description: string;
}[] = [
  { value: "USD", label: "US Dollar", description: "USD ($)" },
  { value: "EUR", label: "Euro", description: "EUR (€)" },
  { value: "MAD", label: "Moroccan Dirham", description: "MAD (د.م.)" },
];

const FORMATTERS: Record<
  CurrencyCode,
  { locale: string; currency: string }
> = {
  USD: { locale: "en-US", currency: "USD" },
  EUR: { locale: "de-DE", currency: "EUR" },
  MAD: { locale: "fr-MA", currency: "MAD" },
};

export function formatMoney(amount: number, code: CurrencyCode): string {
  const { locale, currency } = FORMATTERS[code];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value === "USD" || value === "EUR" || value === "MAD";
}
