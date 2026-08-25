import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ============================================================
// EIGENER LOGIN (kein Satellite-Modus).
// ConstruxNet nutzt eine eigenständige Clerk-Instanz mit
// selbst-gehosteten Login-Seiten unter /sign-in und /sign-up.
// Die Sign-in/Sign-up-URLs sind im ClerkProvider (app/layout.tsx)
// gesetzt; diese Routen sind unten als public freigegeben.
//
// ENV-Variablen (siehe .env.example):
//   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
//   CLERK_SECRET_KEY
//   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY
//
// WICHTIG: KEINE Satellite-Variablen setzen — falls noch vorhanden,
// auf Vercel entfernen: NEXT_PUBLIC_CLERK_IS_SATELLITE,
// NEXT_PUBLIC_CLERK_DOMAIN sowie auf SourceOn zeigende
// NEXT_PUBLIC_CLERK_SIGN_IN_URL / NEXT_PUBLIC_CLERK_SIGN_UP_URL.
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
