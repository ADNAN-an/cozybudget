import { getDebts, getMonthlyPayments } from "@/lib/actions/debts";
import { getSelectedMonth } from "@/lib/month";
import { DebtsPageClient } from "@/components/debts/debts-page-client";

export default async function DebtsPage() {
  const [debts, payments, month] = await Promise.all([
    getDebts(),
    getMonthlyPayments(),
    getSelectedMonth(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <DebtsPageClient debts={debts} payments={payments} month={month} />
    </div>
  );
}
