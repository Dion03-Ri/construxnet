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
    <ClerkProvider
      isSatellite={process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true"}
      domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
    >
      <html lang="de-CH">
        <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
