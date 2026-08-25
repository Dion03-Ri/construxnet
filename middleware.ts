import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ============================================================
// SATELLITE-DOMAIN-SETUP für Shared Login mit SourceOn.
// ConstruxNet verwendet dieselbe Clerk-Instanz wie SourceOn,
// meldet sich aber als "Satellite" an — SourceOn bleibt die
// Primary Domain. Beim ersten Besuch macht Clerk automatisch
// einen Redirect-Handshake, um die bestehende Session zu
// übernehmen (kein Cookie-Sharing nötig, funktioniert auch mit
// zwei unabhängigen Vercel-Subdomains).
//
// ENV-Variablen (siehe .env.example):
//   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY   -> gleicher Key wie SourceOn
//   CLERK_SECRET_KEY                    -> gleicher Key wie SourceOn
//   NEXT_PUBLIC_CLERK_IS_SATELLITE=true
//   NEXT_PUBLIC_CLERK_DOMAIN            -> diese ConstruxNet-Domain
//   NEXT_PUBLIC_CLERK_SIGN_IN_URL       -> https://<sourceon-domain>/sign-in
//   NEXT_PUBLIC_CLERK_SIGN_UP_URL       -> https://<sourceon-domain>/sign-up
// ============================================================

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});
export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
