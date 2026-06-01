"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function parseDefaultDate(value?: Date | string): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  const d = new Date(value);
  return isValid(d) ? d : undefined;
}

type Props = {
  defaultValue?: Date | string;
  name?: string;
  id?: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
};

export function DateInput({
  defaultValue,
  name = "date",
  id = "date",
  label = "Date",
  required = true,
  optional = false,
  placeholder,
}: Props) {
  const initial = parseDefaultDate(defaultValue);
  const [date, setDate] = React.useState<Date | undefined>(
    initial ?? (optional ? undefined : new Date())
  );
  const [open, setOpen] = React.useState(false);

  const hiddenValue = date ? format(date, "yyyy-MM-dd") : "";
  const displayLabel = date
    ? format(date, "EEEE, MMM d, yyyy")
    : (placeholder ??
      (optional ? "Pick a date (optional)" : "Pick a date"));

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        type="hidden"
        name={name}
        id={id}
        value={hiddenValue}
        required={required && !optional}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            "inline-flex h-12 w-full items-center justify-start gap-2 rounded-xl border border-input bg-card px-3 text-base font-normal shadow-sm transition-colors",
            "hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-xl p-0 shadow-lg"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              setDate(selected);
              if (selected) setOpen(false);
            }}
            defaultMonth={date ?? new Date()}
            captionLayout="dropdown"
            startMonth={new Date(2015, 0)}
            endMonth={new Date(2035, 11)}
            className="p-3 [--cell-size:2.75rem] sm:[--cell-size:2.5rem]"
          />
          {optional && date && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-muted-foreground"
                onClick={() => {
                  setDate(undefined);
                  setOpen(false);
                }}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
