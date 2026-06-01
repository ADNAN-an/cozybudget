"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { CategoryGroup } from "@/lib/categories";

type Props<T extends string> = {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  groups: CategoryGroup<T>[];
  placeholder?: string;
  id?: string;
};

export function GroupedCategorySelect<T extends string>({
  label,
  value,
  onValueChange,
  groups,
  placeholder = "Select category",
  id,
}: Props<T>) {
  const flatItems = groups.flatMap((g) =>
    g.items.map((item) => ({
      value: item.value,
      label: `${item.label}`,
    }))
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) => v && onValueChange(v as T)}
        items={flatItems}
      >
        <SelectTrigger id={id} className="h-12 text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </SelectLabel>
              {group.items.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  className="min-h-11 rounded-lg px-3 py-2.5 text-base"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
