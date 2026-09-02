"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  CATEGORY_CODE,
  PROC_MATERIALS,
  PROC_CATEGORIES,
  type ProcCategory,
  type ProcMaterial,
} from "@/data/procurement";

export type CustomStatus = "PRIVATE" | "SHARED" | "MERGED";

export type CustomMaterial = {
  id: string;
  company_id: string;
  material_id: string;
  label: string;
  sia: string | null;
  unit: string;
  category: string;
  price: number | null;
  status: CustomStatus;
  merged_into: string | null;
  created_at: string;
};

export const STATUS_LABEL: Record<CustomStatus, string> = {
  PRIVATE: "Nur intern",
  SHARED: "Freigegeben",
  MERGED: "Zusammengelegt",
};

function isCategory(v: string): v is ProcCategory {
  return (PROC_CATEGORIES as string[]).includes(v);
}

/** Ein Datenbankeintrag in der Form, die der Rest der Anwendung erwartet. */
export function toProcMaterial(c: CustomMaterial): ProcMaterial {
  return {
    key: `db-${c.id}`,
    id: c.material_id,
    label: c.label,
    sia: c.sia ?? "Frei erfasst — Spezifikation offen",
    unit: c.unit,
    kbobPrice: c.price ?? 0,
    category: isCategory(c.category) ? c.category : PROC_CATEGORIES[0],
  };
}

/**
 * Eigene und freigegebene Materialien.
 *
 * Zusammengelegte tauchen im Katalog nicht mehr auf — sie zeigen auf eine
 * andere Nummer, und dorthin gehört der Bedarf. In der Verwaltung bleiben
 * sie sichtbar, damit nachvollziehbar ist, was womit verschmolzen wurde.
 */
export function useCustomMaterials(myCompanyId?: string) {
  const supabase = useSupabaseBrowser();
  const [rows, setRows] = useState<CustomMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("custom_materials")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setError(null);
      setRows((data ?? []) as CustomMaterial[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mine = useMemo(
    () => (myCompanyId ? rows.filter((r) => r.company_id === myCompanyId) : []),
    [rows, myCompanyId],
  );

  /** Katalog plus alles, was nutzbar ist — die Liste für Suche und Auswahl. */
  const catalog = useMemo<ProcMaterial[]>(
    () => [
      ...rows.filter((r) => r.status !== "MERGED").map(toProcMaterial),
      ...PROC_MATERIALS,
    ],
    [rows],
  );

  return { rows, mine, catalog, loading, error, reload };
}

/**
 * Ein neues Material anlegen.
 *
 * Die Nummer vergibt die Datenbank, nicht der Client: nur dort lässt sich
 * ausschliessen, dass zwei gleichzeitige Erfassungen dieselbe bekommen.
 */
export async function createCustomMaterial(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  companyId: string,
  input: {
    label: string;
    sia: string;
    unit: string;
    price: number;
    category: ProcCategory;
    share: boolean;
  },
): Promise<{ material?: ProcMaterial; error?: string }> {
  const code = CATEGORY_CODE[input.category];
  const { data: idData, error: idErr } = await supabase.rpc("next_material_id", {
    p_code: code,
  });
  if (idErr || typeof idData !== "string") {
    return { error: idErr?.message ?? "Materialnummer konnte nicht vergeben werden." };
  }

  const row = {
    company_id: companyId,
    material_id: idData,
    label: input.label.trim(),
    sia: input.sia.trim() || null,
    unit: input.unit.trim(),
    category: input.category,
    price: input.price || null,
    status: input.share ? "SHARED" : "PRIVATE",
  };

  const { data, error } = await supabase
    .from("custom_materials")
    .insert(row)
    .select()
    .single();

  if (error) return { error: error.message };
  return { material: toProcMaterial(data as CustomMaterial) };
}
