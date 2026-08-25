import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConstruxNet",
  description:
    "Das B2B-Netzwerk der Schweizer Baubranche — Vernetzung, Feed und Smart Pools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={{ variables: { colorPrimary: "#F97316" } }}
    >
      <html lang="de-CH">
        <body className="min-h-screen bg-navy-950 text-slate-100 antialiased">
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
