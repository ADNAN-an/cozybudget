import { getDashboardData } from "@/lib/actions/dashboard";
import { getSelectedMonth } from "@/lib/month";
import { PageHeader } from "@/components/layout/page-header";
import { BalanceHero } from "@/components/dashboard/balance-hero";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { GoalsDebtsOverview } from "@/components/dashboard/goals-debts-overview";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const month = await getSelectedMonth();
  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your monthly financial overview"
        month={month}
      />

      <BalanceHero balance={data.balance} />

      <SummaryCards summary={data.summary} />

      <IncomeExpenseChart data={data.chartData} summary={data.chartSummary} />

      <GoalsDebtsOverview goals={data.goals} debts={data.debts} />

      <RecentActivity activities={data.activities} />
    </div>
  );
}
