"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateCurrency } from "@/lib/actions/settings";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialCurrency: CurrencyCode;
  email: string;
};

export function SettingsForm({ initialCurrency, email }: Props) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [currency, setCurrency] = useState(initialCurrency);
  const [pending, startTransition] = useTransition();

  const selectItems = CURRENCY_OPTIONS.map((c) => ({
    value: c.value,
    label: `${c.label} (${c.description})`,
  }));

  async function handleSubmit(formData: FormData) {
    formData.set("currency", currency);
    startTransition(async () => {
      const result = await updateCurrency(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Currency updated");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {email}</CardDescription>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Choose how amounts are displayed across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Display currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => v && setCurrency(v as CurrencyCode)}
                items={selectItems}
              >
                <SelectTrigger className="h-12 w-full text-base shadow-sm">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      label={c.label}
                      className="min-h-11"
                    >
                      {c.label} — {c.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Preview: {formatCurrency(1234.56)}
            </p>
            <Button
              type="submit"
              className="h-12 w-full text-base sm:w-auto sm:px-8"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save currency"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
