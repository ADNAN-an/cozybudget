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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDebt,
  addDebtPayment,
  deleteDebt,
} from "@/lib/actions/debts";
import { toNumber } from "@/lib/format";
import { useCurrency } from "@/components/providers/currency-provider";
import type { MonthKey } from "@/lib/dates";
import type { SerializedDebt, SerializedDebtPayment } from "@/lib/serialize";

type Props = {
  debts: SerializedDebt[];
  payments: SerializedDebtPayment[];
  month: MonthKey;
};

export function DebtsPageClient({ debts, payments, month }: Props) {
  const { formatCurrency } = useCurrency();
  const [debtOpen, setDebtOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [debtId, setDebtId] = useState(
    debts.find((d) => d.remainingAmount > 0)?.id ?? debts[0]?.id ?? ""
  );
  const [pending, startTransition] = useTransition();

  const activeDebts = debts.filter((d) => d.remainingAmount > 0);

  const debtSelectItems = activeDebts.map((d) => ({
    value: d.id,
    label: `${d.name} (${formatCurrency(d.remainingAmount)} left)`,
  }));

  async function handleCreateDebt(formData: FormData) {
    startTransition(async () => {
      const result = await createDebt(formData);
      if (result.error) {
        toast.error("Could not create debt");
        return;
      }
      toast.success("Debt added");
      setDebtOpen(false);
    });
  }

  async function handlePayment(formData: FormData) {
    formData.set("debtId", debtId);
    startTransition(async () => {
      const result = await addDebtPayment(formData);
      if (result.error) {
        toast.error("Could not record payment");
        return;
      }
      toast.success("Payment recorded");
      setPaymentOpen(false);
    });
  }

  function handleDeleteDebt(id: string) {
    if (!confirm("Delete this debt?")) return;
    startTransition(async () => {
      const result = await deleteDebt(id);
      if (result.error) toast.error(result.error);
      else toast.success("Debt deleted");
    });
  }

  return (
    <>
      <PageHeader
        title="Debts"
        description="Track what you owe and payments"
        month={month}
        action={
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => setDebtOpen(true)}
          >
            New debt
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {debts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground">
            Add a debt to start tracking payments.
          </div>
        ) : (
          debts.map((debt) => {
            const original = debt.originalAmount;
            const remaining = debt.remainingAmount;
            const paid = original - remaining;
            const progress =
              original > 0 ? Math.min(100, (paid / original) * 100) : 0;
            const paidOff = remaining <= 0;

            return (
              <Card key={debt.id} className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{debt.name}</CardTitle>
                    {paidOff && (
                      <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                        Paid off
                      </Badge>
                    )}
                  </div>
                  {paid === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => handleDeleteDebt(debt.id)}
                    >
                      Remove
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold tabular-nums text-destructive">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progress)}% paid · {formatCurrency(original)} total
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {payments.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Payments this month
          </h2>
          <ul className="space-y-2">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{p.debt.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeDebts.length > 0 && (
        <Fab
          onClick={() => {
            setDebtId(activeDebts[0]?.id ?? "");
            setPaymentOpen(true);
          }}
          label="Record payment"
        />
      )}

      <ResponsiveModal open={debtOpen} onOpenChange={setDebtOpen} title="New debt">
        <form action={handleCreateDebt} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Credit card, student loan…"
              className="h-12 text-base"
            />
          </div>
          <AmountInput
            name="originalAmount"
            id="originalAmount"
          />
          <DateInput
            name="dueDate"
            id="dueDate"
            label="Due date (optional)"
            required={false}
            optional
          />
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" className="h-12 text-base" />
          </div>
          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            Add debt
          </Button>
        </form>
      </ResponsiveModal>

      <ResponsiveModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        title="Record payment"
        description="Link payment to a specific debt"
      >
        <form action={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label>Debt</Label>
            <Select
              value={debtId}
              onValueChange={(v) => v && setDebtId(v)}
              items={debtSelectItems}
            >
              <SelectTrigger className="h-12 w-full text-base shadow-sm">
                <SelectValue placeholder="Select debt" />
              </SelectTrigger>
              <SelectContent>
                {activeDebts.map((d) => (
                  <SelectItem
                    key={d.id}
                    value={d.id}
                    label={d.name}
                    className="min-h-11"
                  >
                    {d.name} ({formatCurrency(d.remainingAmount)} left)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AmountInput />
          <DateInput />
          <div className="space-y-2">
            <Label htmlFor="pay-note">Note (optional)</Label>
            <Input id="pay-note" name="note" className="h-12 text-base" />
          </div>
          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            Record payment
          </Button>
        </form>
      </ResponsiveModal>
    </>
  );
}
