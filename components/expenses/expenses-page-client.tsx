"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionList, AmountCell } from "@/components/layout/transaction-list";
import { ResponsiveModal } from "@/components/layout/responsive-modal";
import { Fab } from "@/components/layout/fab";
import { AmountInput } from "@/components/forms/amount-input";
import { DateInput } from "@/components/forms/date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GroupedCategorySelect } from "@/components/forms/grouped-category-select";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/actions/expenses";
import {
  EXPENSE_CATEGORY_GROUPS,
  CATEGORY_COLORS,
  getExpenseCategoryLabel,
} from "@/lib/categories";
import { formatDate } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/generated/prisma/client";
import type { MonthKey } from "@/lib/dates";
import type { SerializedExpense } from "@/lib/serialize";
import { cn } from "@/lib/utils";

type Props = {
  expenses: SerializedExpense[];
  month: MonthKey;
};

export function ExpensesPageClient({ expenses, month }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedExpense | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>("GROCERIES");
  const [pending, startTransition] = useTransition();

  const items = expenses.map((e) => ({
    ...e,
    date: new Date(e.date),
    amountNum: e.amount,
  }));

  function openCreate() {
    setEditing(null);
    setCategory("GROCERIES");
    setOpen(true);
  }

  function openEdit(item: SerializedExpense) {
    setEditing(item);
    setCategory(item.category);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("category", category);
    startTransition(async () => {
      const result = editing
        ? await updateExpense(editing.id, formData)
        : await createExpense(formData);

      if (result.error) {
        toast.error("Could not save expense");
        return;
      }

      toast.success(editing ? "Expense updated" : "Expense added");
      setOpen(false);
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result.error) toast.error(result.error);
      else toast.success("Expense deleted");
    });
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Log what you spend this month"
        month={month}
      />

      <TransactionList
        items={items}
        amountKey={(i) => i.amountNum}
        titleKey={(i) => i.description}
        subtitleKey={(i) => getExpenseCategoryLabel(i.category)}
        dateKey={(i) => i.date}
        badge={(i) => (
          <Badge
            variant="secondary"
            className={cn("font-normal", CATEGORY_COLORS[i.category])}
          >
            {getExpenseCategoryLabel(i.category)}
          </Badge>
        )}
        onEdit={(i) => {
          const raw = expenses.find((e) => e.id === i.id);
          if (raw) openEdit(raw);
        }}
        onDelete={handleDelete}
        emptyMessage="No expenses this month. Tap + to log one."
        columns={[
          {
            key: "description",
            header: "Description",
            cell: (i) => <span className="font-medium">{i.description}</span>,
          },
          {
            key: "category",
            header: "Category",
            cell: (i) => (
              <Badge
                variant="secondary"
                className={cn("font-normal", CATEGORY_COLORS[i.category])}
              >
                {getExpenseCategoryLabel(i.category)}
              </Badge>
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
              <AmountCell amount={i.amountNum} className="text-accent-foreground" />
            ),
          },
        ]}
      />

      <Fab onClick={openCreate} label="Add expense" />

      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit expense" : "Add expense"}
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
            groups={EXPENSE_CATEGORY_GROUPS}
            placeholder="Select category"
            id="expense-category"
          />
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={editing?.description ?? ""}
              required
              className="h-12 text-base"
            />
          </div>
          <DateInput defaultValue={editing?.date} />
          <Button
            type="submit"
            className="h-12 w-full text-base"
            disabled={pending}
          >
            {pending ? "Saving…" : editing ? "Update" : "Add expense"}
          </Button>
        </form>
      </ResponsiveModal>
    </>
  );
}
