"use client";

import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { sanitizeAccessToken } from "./token";

// Nur Origin verwenden (siehe lib/supabase.ts) — verhindert
// "Invalid path specified in request URL".
function cleanUrl(raw?: string): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  try {
    return new URL(v).origin;
  } catch {
    return v.replace(/\/+$/, "");
  }
}

const SUPABASE_URL = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
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
          try {
            if (!session) return null;
            return sanitizeAccessToken(await session.getToken());
          } catch {
            return null;
          }
        },
      }),
    [session],
  );
}
