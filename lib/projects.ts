"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

export type ProjectStatus = "PLANNED" | "ACTIVE" | "PAUSED" | "DONE";

export type Project = {
  id: string;
  company_id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  canton: string | null;
  starts_on: string | null;
  ends_on: string | null;
  budget: number | null;
  status: ProjectStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: "Geplant",
  ACTIVE: "Läuft",
  PAUSED: "Pausiert",
  DONE: "Abgeschlossen",
};

/** Kurzform für Auswahllisten: „Neubau MFH · Zürich". */
export function projectLabel(p: Project) {
  return p.city ? `${p.name} · ${p.city}` : p.name;
}

/**
 * Die Baustellen der eigenen Firma.
 *
 * Läuft über RLS — die Abfrage braucht keine Firmen-ID, die Datenbank
 * liefert von sich aus nur die eigenen Projekte.
 */
export function useProjects() {
  const supabase = useSupabaseBrowser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("projects")
      .select("*")
      .order("status", { ascending: true })
      .order("created_at", { ascending: false });
    if (err) {
      // Solange die Migration nicht eingespielt ist, gibt es die Tabelle
      // noch nicht. Das ist kein Fehler, den der Nutzer sehen muss —
      // die Oberfläche zeigt dann einfach den leeren Zustand.
      setError(err.message);
      setProjects([]);
    } else {
      setError(null);
      setProjects((data ?? []) as Project[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { projects, loading, error, reload };
}
