"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveModal } from "@/components/layout/responsive-modal";
import { Fab } from "@/components/layout/fab";
import { AmountInput } from "@/components/forms/amount-input";
import { DateInput } from "@/components/forms/date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSavingsGoal,
  addContribution,
  deleteSavingsGoal,
} from "@/lib/actions/savings";
import { toNumber } from "@/lib/format";
import { useCurrency } from "@/components/providers/currency-provider";
import type { MonthKey } from "@/lib/dates";
import type {
  SerializedContribution,
  SerializedSavingsGoal,
} from "@/lib/serialize";
import { Trash2 } from "lucide-react";

type Props = {
  goals: SerializedSavingsGoal[];
  contributions: SerializedContribution[];
  month: MonthKey;
};

export function SavingsPageClient({ goals, contributions, month }: Props) {
  const { formatCurrency } = useCurrency();
  const [goalOpen, setGoalOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [goalId, setGoalId] = useState(goals[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const goalSelectItems = goals.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  async function handleCreateGoal(formData: FormData) {
    startTransition(async () => {
      const result = await createSavingsGoal(formData);
      if (result.error) {
        toast.error("Could not create goal");
        return;
      }
      toast.success("Savings goal created");
      setGoalOpen(false);
    });
  }

  async function handleContribution(formData: FormData) {
    formData.set("goalId", goalId);
    startTransition(async () => {
      const result = await addContribution(formData);
      if (result.error) {
        toast.error("Could not add contribution");
        return;
      }
      toast.success("Contribution added");
      setContribOpen(false);
    });
  }

  function handleDeleteGoal(id: string) {
    if (!confirm("Delete this savings goal?")) return;
    startTransition(async () => {
      const result = await deleteSavingsGoal(id);
      if (result.error) toast.error(result.error);
      else toast.success("Goal deleted");
    });
  }

  return (
    <>
      <PageHeader
        title="Savings"
        description="Goals and contributions"
        month={month}
        action={
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => setGoalOpen(true)}
          >
            New goal
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground sm:col-span-2">
            Create a savings goal to start tracking.
          </div>
        ) : (
          goals.map((goal) => {
            const current = goal.currentAmount;
            const target = goal.targetAmount;
            const progress = target
              ? Math.min(100, (current / target) * 100)
              : null;

            return (
              <Card key={goal.id} className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  {current === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-semibold tabular-nums text-primary">
                    {formatCurrency(current)}
                  </p>
                  {target != null && (
                    <>
                      <Progress value={progress ?? 0} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round(progress ?? 0)}% of {formatCurrency(target)}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {contributions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Contributions this month
          </h2>
          <ul className="space-y-2">
            {contributions.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{c.goal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-primary tabular-nums">
                  {formatCurrency(c.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {goals.length > 0 && (
        <Fab
          onClick={() => {
            setGoalId(goals[0]?.id ?? "");
            setContribOpen(true);
          }}
          label="Add contribution"
        />
      )}

      <ResponsiveModal
        open={goalOpen}
        onOpenChange={setGoalOpen}
        title="New savings goal"
      >
        <form action={handleCreateGoal} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Emergency fund"
              className="h-12 text-base"
            />
          </div>
          <AmountInput name="targetAmount" id="targetAmount" required={false} />
          <p className="text-xs text-muted-foreground">
            Target is optional — leave amount empty if open-ended.
          </p>
          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            Create goal
          </Button>
        </form>
      </ResponsiveModal>

      <ResponsiveModal
        open={contribOpen}
        onOpenChange={setContribOpen}
        title="Add contribution"
        description="Link money to a specific savings goal"
      >
        <form action={handleContribution} className="space-y-4">
          <div className="space-y-2">
            <Label>Savings goal</Label>
            <Select
              value={goalId}
              onValueChange={(v) => v && setGoalId(v)}
              items={goalSelectItems}
            >
              <SelectTrigger className="h-12 w-full text-base shadow-sm">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem
                    key={g.id}
                    value={g.id}
                    label={g.name}
                    className="min-h-11"
                  >
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AmountInput />
          <DateInput />
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" className="h-12 text-base" />
          </div>
          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            Add contribution
          </Button>
        </form>
      </ResponsiveModal>
    </>
  );
}
