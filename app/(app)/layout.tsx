import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { getUserCurrency } from "@/lib/actions/settings";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currency = await getUserCurrency();

  return (
    <CurrencyProvider currency={currency}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col lg:pl-0">
          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </CurrencyProvider>
  );
}
