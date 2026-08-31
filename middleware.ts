import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, sha256Hex } from "@/lib/preview";

// ============================================================
// ZUGANGS-STEUERUNG (Entwicklungsphase / Pre-Launch)
//
// Zwei per Env steuerbare Modi, die zusammenspielen:
//
//  COMING_SOON=1        → Öffentlichkeit sieht NUR die Coming-Soon-Seite
//                         (Warteliste). Alle anderen Seiten leiten auf "/".
//  PREVIEW_PASSWORD=…   → Team-Zugang: nach Eingabe unter /preview wird ein
//                         Cookie gesetzt, das Coming-Soon/Gate überspringt.
//
// Ist nur PREVIEW_PASSWORD gesetzt (ohne COMING_SOON), liegt die GANZE Seite
// hinter der Passworteingabe. Sind beide leer → normaler Betrieb.
// Zum Launch: beide Env-Variablen in Vercel entfernen.
//
// Clerk: eigenständige Instanz, Login unter /sign-in, /sign-up.
// ============================================================

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/preview",
  "/api/preview(.*)",
  "/coming-soon",
  "/api/waitlist(.*)",
]);

const comingSoonOn =
  process.env.COMING_SOON === "1" || process.env.COMING_SOON === "true";

export default clerkMiddleware(async (auth, req) => {
  const password = process.env.PREVIEW_PASSWORD;
  const hasPreview = password
    ? req.cookies.get(PREVIEW_COOKIE)?.value === (await sha256Hex(password))
    : false;

  const path = req.nextUrl.pathname;

  // 1) COMING-SOON-Sperre (öffentlich) — Team mit Preview-Cookie ausgenommen.
  if (comingSoonOn && !hasPreview) {
    const allowed =
      path === "/coming-soon" ||
      path === "/preview" ||
      path.startsWith("/api/preview") ||
      path.startsWith("/api/waitlist");
    if (allowed) return NextResponse.next();

    if (path === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/coming-soon";
      return NextResponse.rewrite(url);
    }
    // Alle anderen Seiten → Startseite (Coming Soon).
    const home = req.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  // 2) Reiner Passwortschutz (kein Coming Soon): ganze Seite hinter /preview.
  if (password && !hasPreview && !comingSoonOn && !isPublicRouteGate(path)) {
    const url = req.nextUrl.clone();
    url.pathname = "/preview";
    url.search = "";
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // 3) Clerk-Auth für geschützte Routen.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Routen, die auch beim reinen Passwortschutz erreichbar bleiben müssen.
function isPublicRouteGate(path: string) {
  return (
    path === "/preview" ||
    path.startsWith("/api/preview") ||
    path === "/coming-soon" ||
    path.startsWith("/api/waitlist")
  );
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
