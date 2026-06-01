"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartPoint = {
  date: string;
  label: string;
  balance: number;
};

export function IncomeExpenseChart({
  data,
  summary,
}: {
  data: ChartPoint[];
  summary: { current: number; delta30Days: number };
}) {
  const { formatCurrency } = useCurrency();
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today
            </p>
            <CardTitle
              className={cn(
                "mt-1 text-3xl sm:text-4xl",
                summary.current < 0 && "text-destructive"
              )}
            >
              {formatCurrency(summary.current)}
            </CardTitle>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Last 30 days
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold tabular-nums",
                summary.delta30Days >= 0 ? "text-primary" : "text-destructive"
              )}
            >
              {summary.delta30Days >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(summary.delta30Days))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" className="stroke-border/70" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                minTickGap={24}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const abs = Math.abs(Number(v));
                  if (abs >= 1000) return `${Number(v) / 1000}K`;
                  return `${Number(v).toFixed(0)}`;
                }}
                width={52}
              />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 5" />
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--chart-1)"
                strokeWidth={3}
                fill="url(#balanceFill)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
