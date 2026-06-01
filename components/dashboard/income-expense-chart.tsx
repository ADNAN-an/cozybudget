"use client";

import { useMemo } from "react";
import { useCurrency } from "@/components/providers/currency-provider";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const isMobile = useIsMobile();

  const displayData = useMemo(() => {
    if (!isMobile || data.length <= 8) return data;
    const step = Math.ceil(data.length / 8);
    return data.filter((_, index) => index % step === 0 || index === data.length - 1);
  }, [data, isMobile]);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today
            </p>
            <CardTitle
              className={cn(
                "mt-1 text-2xl leading-tight sm:text-4xl",
                summary.current < 0 && "text-destructive"
              )}
            >
              {formatCurrency(summary.current)}
            </CardTitle>
          </div>
          <div className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 sm:w-auto sm:text-right">
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
      <CardContent className="px-2 pb-4 sm:px-6">
        <div className="h-[220px] w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayData}
              margin={{
                top: 8,
                right: isMobile ? 4 : 12,
                left: isMobile ? -8 : 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" className="stroke-border/70" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: isMobile ? 10 : 11 }}
                minTickGap={isMobile ? 8 : 24}
                tickMargin={6}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 11 }}
                tickFormatter={(v) => {
                  const n = Number(v);
                  const abs = Math.abs(n);
                  if (abs >= 1000) {
                    return `${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
                  }
                  return `${n.toFixed(0)}`;
                }}
                width={isMobile ? 40 : 52}
              />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  return point?.date ?? "";
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: isMobile ? "12px" : "14px",
                }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 5" />
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--chart-1)"
                strokeWidth={isMobile ? 2.5 : 3}
                fill="url(#balanceFill)"
                dot={false}
                activeDot={{ r: isMobile ? 4 : 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
