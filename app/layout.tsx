import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConstruxNet",
  description: "Smart Bündelung für Schweizer Baumaterialien",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <ClerkProvider>
      <html lang="de-CH">
        <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
