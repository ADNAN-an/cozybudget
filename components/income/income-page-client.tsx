"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionList, AmountCell } from "@/components/layout/transaction-list";
import { ResponsiveModal } from "@/components/layout/responsive-modal";
import { Fab } from "@/components/layout/fab";
import { AmountInput } from "@/components/forms/amount-input";
import { DateInput } from "@/components/forms/date-input";
import { GroupedCategorySelect } from "@/components/forms/grouped-category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createIncome,
  updateIncome,
  deleteIncome,
} from "@/lib/actions/income";
import { formatDate } from "@/lib/format";
import type { MonthKey } from "@/lib/dates";
import type { SerializedIncome } from "@/lib/serialize";
import type { IncomeCategory } from "@/lib/generated/prisma/client";
import {
  INCOME_CATEGORY_GROUPS,
  INCOME_CATEGORY_COLORS,
  getIncomeCategoryLabel,
  getIncomeDisplayLabel,
} from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  incomes: SerializedIncome[];
  month: MonthKey;
};

export function IncomePageClient({ incomes, month }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedIncome | null>(null);
  const [category, setCategory] = useState<IncomeCategory>("SALARY");
  const [pending, startTransition] = useTransition();

  const items = incomes.map((i) => ({
    ...i,
    date: new Date(i.date),
    amountNum: i.amount,
  }));

  function openCreate() {
    setEditing(null);
    setCategory("SALARY");
    setOpen(true);
  }

  function openEdit(item: SerializedIncome) {
    setEditing(item);
    setCategory(item.category);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("category", category);
    startTransition(async () => {
      const result = editing
        ? await updateIncome(editing.id, formData)
        : await createIncome(formData);

      if (result.error) {
        toast.error("Could not save income");
        return;
      }

      toast.success(editing ? "Income updated" : "Income added");
      setOpen(false);
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this income entry?")) return;
    startTransition(async () => {
      const result = await deleteIncome(id);
      if (result.error) toast.error(result.error);
      else toast.success("Income deleted");
    });
  }

  return (
    <>
      <PageHeader
        title="Income"
        description="Track money coming in this month"
        month={month}
      />

      <TransactionList
        items={items}
        amountKey={(i) => i.amountNum}
        titleKey={(i) => getIncomeDisplayLabel(i.category, i.source)}
        dateKey={(i) => i.date}
        badge={(i) => (
          <Badge
            variant="secondary"
            className={cn(
              "font-normal",
              INCOME_CATEGORY_COLORS[i.category]
            )}
          >
            {getIncomeCategoryLabel(i.category)}
          </Badge>
        )}
        onEdit={(i) => {
          const raw = incomes.find((inc) => inc.id === i.id);
          if (raw) openEdit(raw);
        }}
        onDelete={handleDelete}
        emptyMessage="No income logged this month. Tap + to add one."
        columns={[
          {
            key: "category",
            header: "Category",
            cell: (i) => (
              <Badge
                variant="secondary"
                className={cn(
                  "font-normal",
                  INCOME_CATEGORY_COLORS[i.category]
                )}
              >
                {getIncomeCategoryLabel(i.category)}
              </Badge>
            ),
          },
          {
            key: "detail",
            header: "Detail",
            cell: (i) => (
              <span className="text-muted-foreground">
                {i.source?.trim() || "—"}
              </span>
            ),
          },
          {
            key: "date",
            header: "Date",
            cell: (i) => formatDate(i.date),
          },
          {
            key: "amount",
            header: "Amount",
            cell: (i) => (
              <AmountCell amount={i.amountNum} className="text-primary" />
            ),
          },
        ]}
      />

      <Fab onClick={openCreate} label="Add income" />

      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit income" : "Add income"}
      >
        <form
          key={editing?.id ?? "new"}
          action={handleSubmit}
          className="space-y-4"
        >
          <AmountInput
            defaultValue={editing ? String(editing.amount) : ""}
          />
          <GroupedCategorySelect
            label="Category"
            value={category}
            onValueChange={setCategory}
            groups={INCOME_CATEGORY_GROUPS}
            placeholder="Select income type"
            id="income-category"
          />
          <div className="space-y-2">
            <Label htmlFor="source">Detail (optional)</Label>
            <Input
              id="source"
              name="source"
              defaultValue={editing?.source ?? ""}
              placeholder="Employer, client, fund name…"
              className="h-12 text-base"
            />
          </div>
          <DateInput defaultValue={editing?.date} />
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              name="note"
              defaultValue={editing?.note ?? ""}
              className="h-12 text-base"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full text-base"
            disabled={pending}
          >
            {pending ? "Saving…" : editing ? "Update" : "Add income"}
          </Button>
        </form>
      </ResponsiveModal>
    </>
  );
}
