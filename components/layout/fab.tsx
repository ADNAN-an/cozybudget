"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  label: string;
  className?: string;
};

export function Fab({ onClick, label, className }: Props) {
  return (
    <Button
      size="lg"
      className={cn(
        "fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8 lg:right-8",
        className
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
