import { getIncomes } from "@/lib/actions/income";
import { getSelectedMonth } from "@/lib/month";
import { IncomePageClient } from "@/components/income/income-page-client";

export default async function IncomePage() {
  const [incomes, month] = await Promise.all([getIncomes(), getSelectedMonth()]);

  return (
    <div className="mx-auto max-w-4xl">
      <IncomePageClient incomes={incomes} month={month} />
    </div>
  );
}
