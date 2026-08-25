import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Eigenständiges ConstruxNet Supabase-Projekt — bewusst getrennt
// von SourceOn's Supabase-Instanz. Keine Cross-Project-Queries.

// Abschliessende Slashes entfernen — ein Trailing-Slash in der Env-Var
// erzeugt sonst "//rest/v1/..." und Supabase antwortet mit
// "Invalid path specified in request URL".
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/**
 * Server-seitiger Supabase-Client mit nativer Clerk-Third-Party-Auth.
 *
 * Reicht das Clerk-Session-Token via `accessToken()` an Supabase weiter
 * (KEIN veraltetes JWT-Template). Damit sehen die RLS-Policies den
 * eingeloggten Clerk-User über `auth.jwt() ->> 'sub'`.
 *
 * Nur in Server Components, Route Handlers oder Server Actions verwenden —
 * `@clerk/nextjs/server` darf nicht ins Client-Bundle gelangen.
 */
export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}

/**
 * Server-seitiger Client mit Service-Role — umgeht RLS.
 * NUR in Server Components / Route Handlers verwenden, nie im Client-Bundle.
 */
export function supabaseAdmin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
