"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/format";
import { addMonths, monthKeyToString, parseMonthKey, type MonthKey } from "@/lib/dates";
import { setSelectedMonth } from "@/lib/actions/month";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  month: MonthKey;
};

export function MonthPicker({ month }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(delta: number) {
    const next = addMonths(month, delta);
    startTransition(async () => {
      await setSelectedMonth(monthKeyToString(next));
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0"
        disabled={pending}
        onClick={() => navigate(-1)}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-medium sm:text-base">
        {formatMonthLabel(month.year, month.month)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0"
        disabled={pending}
        onClick={() => navigate(1)}
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function MonthPickerFromString({ monthKey }: { monthKey: string }) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return null;
  return <MonthPicker month={parsed} />;
}
