"use client";

import { useState, useTransition } from "react";
import { useCurrency } from "@/components/providers/currency-provider";
import { updateOpeningBalance } from "@/lib/actions/balance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/layout/responsive-modal";
import { AmountInput } from "@/components/forms/amount-input";
import { Pencil, Wallet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BalanceData = {
  currentBalance: number;
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalDebtPaid: number;
  fromActivity: number;
};

export function BalanceHero({ balance }: { balance: BalanceData }) {
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { currentBalance, openingBalance, fromActivity } = balance;

  async function handleOpeningBalance(formData: FormData) {
    startTransition(async () => {
      const result = await updateOpeningBalance(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Starting balance updated");
      setOpen(false);
    });
  }

  return (
    <>
      <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-card shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                Available now
              </div>
              <p
                className={cn(
                  "text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
                  currentBalance < 0 ? "text-destructive" : "text-foreground"
                )}
              >
                {formatCurrency(currentBalance)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                Starting balance {formatCurrency(openingBalance)} + logged
                activity{" "}
                {fromActivity >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(fromActivity))}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="min-h-10 shrink-0 gap-1.5"
              onClick={() => setOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Adjust start</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title="Starting balance"
        description="Money you already had before tracking in this app (e.g. cash in your account on day one)."
      >
        <form
          key={open ? "open" : "closed"}
          action={handleOpeningBalance}
          className="space-y-4"
        >
          <AmountInput
            name="amount"
            id="opening-balance"
            defaultValue={String(openingBalance)}
          />
          <p className="text-xs text-muted-foreground">
            Example: if you had $1,100 in your bank when you started using the
            app, enter 1100 here. Then log income and expenses as they happen.
          </p>
          <Button
            type="submit"
            className="h-12 w-full text-base"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save starting balance"}
          </Button>
        </form>
      </ResponsiveModal>
    </>
  );
}
