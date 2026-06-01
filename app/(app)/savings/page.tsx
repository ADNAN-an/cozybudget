import { getSavingsGoals, getMonthlyContributions } from "@/lib/actions/savings";
import { getSelectedMonth } from "@/lib/month";
import { SavingsPageClient } from "@/components/savings/savings-page-client";

export default async function SavingsPage() {
  const [goals, contributions, month] = await Promise.all([
    getSavingsGoals(),
    getMonthlyContributions(),
    getSelectedMonth(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <SavingsPageClient
        goals={goals}
        contributions={contributions}
        month={month}
      />
    </div>
  );
}
