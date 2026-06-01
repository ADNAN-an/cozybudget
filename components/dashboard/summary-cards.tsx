"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  CreditCard,
} from "lucide-react";

type Summary = {
  income: number;
  expenses: number;
  savings: number;
  debtPaid: number;
  net: number;
};

const cards = [
  {
    key: "income" as const,
    label: "Income",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "expenses" as const,
    label: "Expenses",
    icon: Receipt,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  {
    key: "net" as const,
    label: "Net cash flow",
    icon: Wallet,
    color: "text-foreground",
    bg: "bg-muted",
  },
  {
    key: "savings" as const,
    label: "Saved",
    icon: PiggyBank,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "debtPaid" as const,
    label: "Debt paid",
    icon: CreditCard,
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
];

export function SummaryCards({ summary }: { summary: Summary }) {
  const { formatCurrency } = useCurrency();
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-visible">
      {cards.map(({ key, label, icon: Icon, color, bg }) => {
        const value = summary[key];
        const isNet = key === "net";
        return (
          <Card
            key={key}
            className={cn(
              "min-w-[160px] shrink-0 snap-start rounded-2xl shadow-sm lg:min-w-0",
              isNet && value < 0 && "border-destructive/30"
            )}
          >
            <CardContent className="flex flex-col gap-2 p-4">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "text-xl font-semibold tabular-nums",
                  isNet && value < 0 && "text-destructive",
                  isNet && value >= 0 && "text-primary"
                )}
              >
                {formatCurrency(value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
