"use client";

import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Trailing-Slashes entfernen (siehe lib/supabase.ts) — verhindert
// "Invalid path specified in request URL".
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/**
 * Browser-seitiger Supabase-Client mit nativer Clerk-Third-Party-Auth.
 *
 * In Client Components verwenden. Das Clerk-Session-Token wird pro Request
 * via `accessToken()` mitgegeben, sodass die RLS-Policies greifen. Der Client
 * wird an die aktuelle Clerk-Session gebunden (memoisiert).
 */
export function useSupabaseBrowser() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        async accessToken() {
          return session ? ((await session.getToken()) ?? null) : null;
        },
      }),
    [session],
  );
}
