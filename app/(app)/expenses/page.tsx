import { getExpenses } from "@/lib/actions/expenses";
import { getSelectedMonth } from "@/lib/month";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";

export default async function ExpensesPage() {
  const [expenses, month] = await Promise.all([
    getExpenses(),
    getSelectedMonth(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <ExpensesPageClient expenses={expenses} month={month} />
    </div>
  );
}
