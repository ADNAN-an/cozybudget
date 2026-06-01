import { cookies } from "next/headers";
import {
  currentMonthKey,
  monthKeyToString,
  parseMonthKey,
  type MonthKey,
} from "@/lib/dates";

const COOKIE_NAME = "budget-month";

export async function getSelectedMonth(): Promise<MonthKey> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return parseMonthKey(value) ?? currentMonthKey();
}

export { COOKIE_NAME, monthKeyToString };
