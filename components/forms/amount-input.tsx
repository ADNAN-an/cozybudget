import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  defaultValue?: string;
  name?: string;
  id?: string;
  required?: boolean;
};

export function AmountInput({
  defaultValue,
  name = "amount",
  id = "amount",
  required = true,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Amount</Label>
      <Input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        placeholder="0.00"
        defaultValue={defaultValue ?? ""}
        required={required}
        className="h-12 text-base"
      />
    </div>
  );
}
