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
  /** Frist für Angebote — erst gesetzt, wenn die Ausschreibung läuft. */
  bid_deadline: string | null;
  awarded_price: number | null;
  awarded_supplier_id: string | null;
  failed_reason: string | null;
  status: BundleStatus;
  created_at: string;
};

/** Das eigene Gebot auf ein Bündel. Fremde Gebote sieht niemand. */
export type MyBid = {
  id: string;
  bundle_id: string;
  list_price_net: number;
  customer_price_net: number;
  is_winning_bid: boolean;
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
/**
 * Gemeinsamer Abruf für alle Aufrufer.
 *
 * Auf dem Dashboard verwenden mehrere Bereiche gleichzeitig useBundles —
 * Übersicht, eigene Bündel, Ausschreibungen. Ohne Bündelung stellt jeder
 * dieselben zwei Abfragen und ruft dazu advance_due_bundles() auf. Ein
 * kurzer gemeinsamer Zwischenspeicher macht daraus einen Durchgang.
 */
let inflight: Promise<{ bundles: Bundle[]; mine: MyParticipation[]; error: string | null }> | null =
  null;
let cachedAt = 0;
let cached: { bundles: Bundle[]; mine: MyParticipation[]; error: string | null } | null = null;
const CACHE_MS = 3_000;

export function invalidateBundles() {
  cached = null;
  cachedAt = 0;
  inflight = null;
}

export function useBundles() {
  const supabase = useSupabaseBrowser();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [mine, setMine] = useState<MyParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    // Ohne Zeitgeber schalten fällige Bündel beim Lesen weiter: abgelaufene
    // Sammelphasen gehen in die Ausschreibung oder werden aufgelöst,
    // abgelaufene Angebotsfristen bekommen ihren Zuschlag. Idempotent —
    // schlägt der Aufruf fehl (Migration noch nicht eingespielt), läuft
    // der Rest trotzdem.
    await supabase.rpc("advance_due_bundles").then(undefined, () => undefined);

    const [b, p] = await Promise.all([
      supabase
        .from("bundles")
        .select("*")
        .in("status", ["OPEN", "SEALED_BIDDING", "AWARDED"])
        .order("deadline", { ascending: true }),
      supabase
        .from("bundle_participations")
        .select("bundle_id, requested_volume, project_id, status")
        .neq("status", "CANCELLED"),
    ]);

    return {
      bundles: b.error ? [] : ((b.data ?? []) as Bundle[]),
      mine: (p.data ?? []) as MyParticipation[],
      error: b.error?.message ?? null,
    };
  }, [supabase]);

  const reload = useCallback(
    async (force = true) => {
      if (force) invalidateBundles();
      if (!inflight) {
        if (cached && Date.now() - cachedAt < CACHE_MS) {
          setBundles(cached.bundles);
          setMine(cached.mine);
          setError(cached.error);
          setLoading(false);
          return;
        }
        inflight = fetchAll().finally(() => {
          inflight = null;
        });
      }
      const res = await inflight;
      cached = res;
      cachedAt = Date.now();
      setBundles(res.bundles);
      setMine(res.mine);
      setError(res.error);
      setLoading(false);
    },
    [fetchAll],
  );

  useEffect(() => {
    void reload(false);
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

/**
 * Gebot abgeben oder nachbessern.
 *
 * Der Listenpreis ist optional und dient nur der Anzeige — bewertet wird
 * gegen den KBOB-Referenzpreis des Bündels. Sonst könnte ein Werk seinen
 * Listenpreis hochsetzen und mit grossem Rabatt gewinnen, ohne billiger
 * zu sein.
 */
export async function placeBid(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
  customerPrice: number,
  listPrice: number,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("place_bid", {
    p_bundle_id: bundleId,
    p_list_price: listPrice || 0,
    p_customer_price: customerPrice,
  });
  return error ? { error: error.message } : {};
}

/** Die eigenen Gebote. Fremde liefert die Datenbank grundsätzlich nicht. */
export function useMyBids() {
  const supabase = useSupabaseBrowser();
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("supplier_bids")
      .select("id, bundle_id, list_price_net, customer_price_net, is_winning_bid, created_at");
    setBids((data ?? []) as MyBid[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { bids, loading, reload };
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
