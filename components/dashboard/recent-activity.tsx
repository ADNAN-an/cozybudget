import { formatMoney } from "@/lib/currency";
import { getUserCurrency } from "@/lib/actions/settings";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  type: "income" | "expense" | "savings" | "debt";
  label: string;
  amount: number;
  date: string;
};

const typeLabels = {
  income: "Income",
  expense: "Expense",
  savings: "Savings",
  debt: "Debt payment",
};

const typeStyles = {
  income: "bg-primary/10 text-primary",
  expense: "bg-orange-100 text-orange-800",
  savings: "bg-emerald-100 text-emerald-800",
  debt: "bg-rose-100 text-rose-800",
};

export async function RecentActivity({
  activities,
}: {
  activities: Activity[];
}) {
  const currency = await getUserCurrency();
  const fmt = (n: number) => formatMoney(n, currency);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a) => (
              <li
                key={`${a.type}-${a.id}`}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs font-normal", typeStyles[a.type])}
                    >
                      {typeLabels[a.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.date)}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-semibold tabular-nums",
                    a.type === "income" ? "text-primary" : "text-foreground"
                  )}
                >
                  {a.type === "income" ? "+" : "−"}
                  {fmt(a.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
