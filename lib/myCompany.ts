"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Die ID der eigenen Firma.
 *
 * Ermittelt wird sie in der Datenbank aus dem angemeldeten Konto, nicht im
 * Browser. Der frühere Weg — `companies` nach `clerk_user_id` filtern —
 * funktionierte nur, solange diese Spalte für alle lesbar war; sie ist es
 * seit Migration 19 nicht mehr, aus gutem Grund.
 *
 * Wer stattdessen `.limit(1)` nimmt, bekommt eine beliebige fremde Firma:
 * das Verzeichnis ist absichtlich offen, „die erste Zeile" ist also nicht
 * die eigene. Genau dieser Fehler steckte in den Benachrichtigungen.
 */
export function useMyCompanyId() {
  const supabase = useSupabaseBrowser();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("current_company_id");
    setId(typeof data === "string" ? data : null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  return { myCompanyId: id, loading };
}

/** Einmalige Abfrage für Stellen, die keinen Hook brauchen. */
export async function fetchMyCompanyId(
  supabase: ReturnType<typeof useSupabaseBrowser>,
): Promise<string | null> {
  const { data } = await supabase.rpc("current_company_id");
  return typeof data === "string" ? data : null;
}
