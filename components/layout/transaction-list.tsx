"use client";

import { formatDate } from "@/lib/format";
import { useCurrency } from "@/components/providers/currency-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionColumn<T> = {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
};

type Props<T extends { id: string }> = {
  items: T[];
  columns: TransactionColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  amountKey?: (item: T) => number;
  titleKey?: (item: T) => string;
  subtitleKey?: (item: T) => string;
  dateKey?: (item: T) => Date;
  badge?: (item: T) => React.ReactNode;
};

export function TransactionList<T extends { id: string }>({
  items,
  columns,
  onEdit,
  onDelete,
  emptyMessage = "No entries yet.",
  amountKey,
  titleKey,
  subtitleKey,
  dateKey,
  badge,
}: Props<T>) {
  const { formatCurrency } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const hasActions = onEdit || onDelete;

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {col.header}
                </th>
              ))}
              {hasActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.cell(item)}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={onEdit ? () => onEdit(item) : undefined}
                      onDelete={onDelete ? () => onDelete(item.id) : undefined}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {titleKey && (
                  <p className="font-medium truncate">{titleKey(item)}</p>
                )}
                {subtitleKey && (
                  <p className="text-sm text-muted-foreground truncate">
                    {subtitleKey(item)}
                  </p>
                )}
                {dateKey && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(dateKey(item))}
                  </p>
                )}
                {badge && <div className="mt-2">{badge(item)}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                {amountKey && (
                  <span className="text-lg font-semibold tabular-nums">
                    {formatCurrency(amountKey(item))}
                  </span>
                )}
                {hasActions && (
                  <RowActions
                    onEdit={onEdit ? () => onEdit(item) : undefined}
                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  if (!onEdit && !onDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" />
        }
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="min-h-11">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="min-h-11 text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AmountCell({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { formatCurrency } = useCurrency();
  return (
    <span className={cn("font-medium tabular-nums", className)}>
      {formatCurrency(amount)}
    </span>
  );
}
