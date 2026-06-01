export type MonthKey = { year: number; month: number };

export function parseMonthKey(value: string | undefined): MonthKey | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function currentMonthKey(): MonthKey {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthKeyToString({ year, month }: MonthKey): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthRange({ year, month }: MonthKey) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function addMonths({ year, month }: MonthKey, delta: number): MonthKey {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function lastNMonths(n: number): MonthKey[] {
  const result: MonthKey[] = [];
  let current = currentMonthKey();
  for (let i = n - 1; i >= 0; i--) {
    result.push(addMonths(current, -i));
  }
  return result;
}
