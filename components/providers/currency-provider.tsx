"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import {
  formatMoney,
  type CurrencyCode,
} from "@/lib/currency";
import { toNumber, type NumericValue } from "@/lib/format";

type CurrencyContextValue = {
  currency: CurrencyCode;
  formatCurrency: (amount: NumericValue) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyCode;
  children: React.ReactNode;
}) {
  const formatCurrency = useCallback(
    (amount: NumericValue) => formatMoney(toNumber(amount), currency),
    [currency]
  );

  const value = useMemo(
    () => ({ currency, formatCurrency }),
    [currency, formatCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
