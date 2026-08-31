/** @type {import('next').NextConfig} */

// Personalisierte / dynamische Seiten dürfen NICHT langfristig gecacht werden
// (weder vom Browser noch von einer CDN-Schicht), sonst sehen eingeloggte
// Nutzer nach einem Deploy alte Inhalte. Statische Assets unter /_next/static
// behalten dagegen bewusst ihr Immutable-Caching (neue Deploys = neue Hashes).
const NO_STORE = "private, no-store, no-cache, max-age=0, must-revalidate";

// HTML-Routen der App (Dokument-Responses). Bewusst ohne /_next/*, damit
// gehashte JS/CSS-Assets weiterhin dauerhaft cachebar bleiben.
const DYNAMIC_ROUTES = [
  "/",
  "/coming-soon",
  "/preview",
  "/feed",
  "/network",
  "/network/:path*",
  "/dashboard",
  "/messages",
  "/beschaffung",
  "/pools",
  "/pools/:path*",
  "/kbob",
  "/map",
  "/notifications",
  "/termine",
  "/onboarding",
  "/profile",
  "/company/:path*",
  "/admin-control",
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return DYNAMIC_ROUTES.map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: NO_STORE }],
    }));
  },
};

module.exports = nextConfig;
