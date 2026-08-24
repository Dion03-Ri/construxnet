import { createClient } from "@supabase/supabase-js";

// Eigenständiges ConstruxNet Supabase-Projekt — bewusst getrennt
// von SourceOn's Supabase-Instanz. Keine Cross-Project-Queries.

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-seitiger Client mit Service Role — NUR in Server
// Components / Route Handlers verwenden, nie im Client-Bundle.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
