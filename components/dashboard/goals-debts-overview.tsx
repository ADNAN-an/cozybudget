import { formatMoney } from "@/lib/currency";
import { getUserCurrency } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

type Goal = {
  id: string;
  name: string;
  current: number;
  target: number | null;
};

type Debt = {
  id: string;
  name: string;
  original: number;
  remaining: number;
};

export async function GoalsDebtsOverview({
  goals,
  debts,
}: {
  goals: Goal[];
  debts: Debt[];
}) {
  const currency = await getUserCurrency();
  const fmt = (n: number) => formatMoney(n, currency);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Savings goals</h2>
          <Link href="/savings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {goals.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No savings goals yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map((g) => {
              const progress =
                g.target && g.target > 0
                  ? Math.min(100, (g.current / g.target) * 100)
                  : null;
              return (
                <Card key={g.id} className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{g.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-lg font-semibold text-primary tabular-nums">
                      {fmt(g.current)}
                    </p>
                    {g.target != null && (
                      <>
                        <Progress value={progress ?? 0} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          of {fmt(g.target)}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Debts</h2>
          <Link href="/debts" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {debts.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No debts tracked
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {debts.map((d) => {
              const paid =
                d.original > 0
                  ? Math.min(100, ((d.original - d.remaining) / d.original) * 100)
                  : 0;
              return (
                <Card key={d.id} className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{d.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-lg font-semibold tabular-nums">
                      {fmt(d.remaining)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        remaining
                      </span>
                    </p>
                    <Progress value={paid} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(paid)}% paid off
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
