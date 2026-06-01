"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PiggyBank,
  CreditCard,
  Wallet,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/debts", label: "Debts", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg tracking-tight">Cozy Budget</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-4">
        <Link
          href="/settings"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full min-h-11 justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
