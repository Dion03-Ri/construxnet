import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AppShell from "@/components/AppShell";
import CacheBuster from "@/components/CacheBuster";
import { clerkAppearance, clerkLocalization } from "@/lib/clerk";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display-Schrift fuer grosse Marketing-Ueberschriften. Archivo ist eine
// Schweizer Grotesk mit geschlossenen Formen und schmaler Laufweite — sie
// traegt 80–96 px, ohne breiig zu werden. Die Oberflaeche in der App bleibt
// Inter; die beiden treffen sich nie in derselben Zeile.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Obtanet",
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
      localization={clerkLocalization}
      appearance={clerkAppearance}
    >
      <html lang="de-CH" className={`${inter.variable} ${archivo.variable}`}>
        <body className="min-h-screen font-sans text-slate-900 antialiased">
          <CacheBuster />
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
