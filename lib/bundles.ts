"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

export type BundleStatus =
  | "OPEN"
  | "SEALED_BIDDING"
  | "AWARDED"
  | "FAILED"
  | "CANCELLED";

export type Bundle = {
  id: string;
  title: string;
  material_id: string | null;
  material_label: string | null;
  material_category: string;
  sia_specification: string;
  region: string;
  unit: string;
  target_volume: number;
  current_volume: number;
  current_tier: number;
  current_discount_pct: number;
  participant_count: number;
  kbob_reference_price: number | null;
  min_participants_for_bidding: number;
  deadline: string;
  status: BundleStatus;
  created_at: string;
};

/** Die eigene Teilnahme an einem Bündel — sichtbar ist nur die eigene. */
export type MyParticipation = {
  bundle_id: string;
  requested_volume: number;
  project_id: string | null;
  status: string;
};

/** Stunden bis zur Frist. Negativ heisst abgelaufen. */
export function hoursLeft(deadline: string): number {
  return (new Date(deadline).getTime() - Date.now()) / 3_600_000;
}

/** „noch 3 Tage" / „noch 5 Std." / „abgelaufen" */
export function deadlineLabel(deadline: string): string {
  const h = hoursLeft(deadline);
  if (h <= 0) return "abgelaufen";
  if (h < 48) return `noch ${Math.round(h)} Std.`;
  return `noch ${Math.round(h / 24)} Tage`;
}

/**
 * Wie viel fehlt bis zur nächsten Rabattstufe?
 *
 * Dieselbe Staffel wie in data/procurement.ts und in der Datenbank.
 * Steht die Menge schon auf der höchsten Stufe, gibt es kein Nächstes.
 */
const STEPS = [
  { at: 101, tier: 2, discount: 9 },
  { at: 201, tier: 3, discount: 12 },
  { at: 351, tier: 4, discount: 16 },
  { at: 501, tier: 5, discount: 20 },
];

export function nextStep(volume: number) {
  return STEPS.find((s) => volume < s.at) ?? null;
}

/**
 * Offene Bündel und die eigenen Teilnahmen.
 *
 * Bündel sind für alle lesbar — anders liesse sich nicht sehen, wo sich
 * etwas sammelt. Sichtbar sind ausschliesslich Summen; wer beiträgt,
 * verrät die Datenbank niemandem.
 */
export function useBundles() {
  const supabase = useSupabaseBrowser();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [mine, setMine] = useState<MyParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [b, p] = await Promise.all([
      supabase
        .from("bundles")
        .select("*")
        .in("status", ["OPEN", "SEALED_BIDDING"])
        .order("deadline", { ascending: true }),
      supabase
        .from("bundle_participations")
        .select("bundle_id, requested_volume, project_id, status")
        .neq("status", "CANCELLED"),
    ]);

    if (b.error) {
      setError(b.error.message);
      setBundles([]);
    } else {
      setError(null);
      setBundles((b.data ?? []) as Bundle[]);
    }
    setMine((p.data ?? []) as MyParticipation[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const myBundleIds = useMemo(
    () => new Set(mine.map((m) => m.bundle_id)),
    [mine],
  );

  return { bundles, mine, myBundleIds, loading, error, reload };
}

export type DemandInput = {
  materialId: string;
  materialLabel: string;
  sia: string;
  unit: string;
  category: string;
  region: string;
  volume: number;
  kbobPrice: number;
  projectId: string | null;
};

/**
 * Bedarf einreichen.
 *
 * Ob daraus ein neues Bündel wird oder eine Teilnahme an einem
 * bestehenden, entscheidet die Datenbank — nur dort lässt sich
 * ausschliessen, dass zwei gleichzeitige Einreichungen zwei Töpfe
 * erzeugen, wo einer entstehen sollte.
 */
export async function submitDemand(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  input: DemandInput,
): Promise<{ bundleId?: string; error?: string }> {
  const { data, error } = await supabase.rpc("submit_demand", {
    p_material_id: input.materialId,
    p_material_label: input.materialLabel,
    p_sia: input.sia,
    p_unit: input.unit,
    p_category: input.category,
    p_region: input.region,
    p_volume: input.volume,
    p_kbob_price: input.kbobPrice || null,
    p_project_id: input.projectId,
  });
  if (error) return { error: error.message };
  return { bundleId: data as string };
}

export async function withdrawDemand(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("withdraw_demand", {
    p_bundle_id: bundleId,
  });
  return error ? { error: error.message } : {};
}
