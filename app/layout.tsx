import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cozy Budget",
  description: "Personal budget tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cozy Budget",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <AuthSessionProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
