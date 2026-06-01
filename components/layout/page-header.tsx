import { MonthPicker } from "@/components/layout/month-picker";
import type { MonthKey } from "@/lib/dates";

type Props = {
  title: string;
  description?: string;
  month: MonthKey;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, month, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <MonthPicker month={month} />
        {action}
      </div>
    </div>
  );
}
