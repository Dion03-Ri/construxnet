"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useFrischBeiRueckkehr, useLive } from "@/lib/live";

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
  lieferantenpreis_net: number | null;
  customer_price_net: number;
  anteil_pct: number;
  puffer_pct: number;
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

    // Der Fehler der EIGENEN Teilnahmen wurde hier verschluckt: `p.data ??
    // []` machte aus einer Absage eine leere Liste. Genau dadurch blieb
    // eine kaputte Zeilenregel monatelang unbemerkt — auf `/pools` war
    // „Meine" einfach leer, und nichts wurde rot. Ein Fehler, den niemand
    // sieht, ist schlimmer als einer, der stört.
    return {
      bundles: b.error ? [] : ((b.data ?? []) as Bundle[]),
      mine: (p.data ?? []) as MyParticipation[],
      error: b.error?.message ?? p.error?.message ?? null,
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

  /**
   * Bündel live. Ein neues Bündel, ein Beitritt, ein Zuschlag — das muss
   * auf der Seite stehen, ohne dass jemand neu lädt. `force` ist dabei
   * wichtig: sonst antwortete der Zwischenspeicher mit dem alten Stand.
   */
  const neuLaden = useCallback(() => {
    void reload(true);
  }, [reload]);
  useLive(supabase, "buendel", ["bundles", "bundle_participations"], neuLaden);
  useFrischBeiRueckkehr(neuLaden);

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
  projectId: string;
  /** Erster Liefermonat, `YYYY-MM-01`. */
  lieferVon: string;
  /** Letzter Liefermonat, `YYYY-MM-01`. */
  lieferBis: string;
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
    p_liefer_von: input.lieferVon,
    p_liefer_bis: input.lieferBis,
  });
  if (error) return { error: lesbarerFehler(error.message) };
  return { bundleId: data as string };
}

/**
 * Datenbankmeldungen, die dem Nutzer etwas sagen sollen.
 *
 * Der Waechter fuer die Abo-Grenzen wirft eine Ausnahme mit dem Praefix
 * `PLAN_LIMIT:`. Ohne Uebersetzung stuende im Formular eine Zeile
 * PostgreSQL-Prosa samt Funktionsnamen und Zeilennummer.
 */
function lesbarerFehler(meldung: string): string {
  const i = meldung.indexOf("PLAN_LIMIT:");
  if (i >= 0) return meldung.slice(i + "PLAN_LIMIT:".length).trim();
  return meldung;
}

/** Was ein Werk für ein Bündel mindestens bieten muss, und woraus es besteht. */
export type Mindestgebot = {
  kbob: number;
  mindestrabatt_pct: number;
  provision_pct: number;
  gesamtrabatt_pct: number;
  max_lieferantenpreis: number;
  bestellerpreis: number;
};

export async function holeMindestgebot(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
): Promise<Mindestgebot | null> {
  const { data } = await supabase.rpc("mindestgebot", { p_bundle_id: bundleId });
  const zeile = Array.isArray(data) ? data[0] : data;
  return (zeile as Mindestgebot) ?? null;
}

/** Die Mengenkurve eines Bündels über die Monate, mit der eigenen Kapazität. */
export type KapazitaetsZeile = {
  monat: string;
  gebraucht: number;
  erklaert: number;
  frei_gebucht: number;
  frei_offen: number;
};

export async function holeKapazitaetFuer(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
): Promise<KapazitaetsZeile[]> {
  const { data } = await supabase.rpc("meine_kapazitaet_fuer", { p_bundle_id: bundleId });
  return (data ?? []) as KapazitaetsZeile[];
}

/** Die Baustellen einer Ausschreibung — grobe Lage, ohne Firmennamen. */
export type AusschreibungsBaustelle = {
  lage: string;
  menge: number;
  liefer_von: string;
  liefer_bis: string;
};

export async function holeAusschreibungsBaustellen(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
): Promise<AusschreibungsBaustelle[]> {
  const { data } = await supabase.rpc("ausschreibung_baustellen", { p_bundle_id: bundleId });
  return (data ?? []) as AusschreibungsBaustelle[];
}

/**
 * Gebot abgeben oder nachbessern.
 *
 * Übergeben wird der Preis, den das WERK je Einheit erhalten will — nicht
 * der des Bestellers. So denkt ein Werk auch: „ich gebe 17.25 % ab." Den
 * Bestellerpreis rechnet die Datenbank daraus, indem sie die Provision
 * aufschlägt; müsste das Werk sie im Kopf abziehen, rechnet irgendwann
 * eines falsch.
 *
 * Der Listenpreis ist optional und dient nur der Anzeige — bewertet wird
 * gegen den KBOB-Referenzpreis des Bündels. Sonst könnte ein Werk seinen
 * Listenpreis hochsetzen und mit grossem Rabatt gewinnen, ohne billiger
 * zu sein.
 *
 * Ein Gebot unter Mindestrabatt + Provision weist die Datenbank ab, mit
 * einer Meldung, die sagt woran es liegt.
 */
export async function placeBid(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
  lieferantenpreis: number,
  listPrice: number,
  anteilPct = 100,
  pufferPct = 0,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("place_bid", {
    p_bundle_id: bundleId,
    p_lieferantenpreis: lieferantenpreis,
    p_list_price: listPrice || 0,
    p_anteil_pct: anteilPct,
    p_puffer_pct: pufferPct,
  });
  return error ? { error: error.message } : {};
}

/**
 * Gebot zurückziehen.
 *
 * Dieselbe Regel wie beim Besteller: frei bis zur eigenen Frist, danach
 * gebunden. Ein Rückzug nach dem Zuschlag ist kein Rückzug, sondern ein
 * Vertragsbruch — die Datenbank weist ihn ab. Die reservierte Kapazität
 * wird dabei freigegeben, sonst blockierte ein zurückgezogenes Gebot
 * weiter Monate, die längst wieder frei sind.
 */
export async function gebotZurueckziehen(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("gebot_zurueckziehen", { p_bundle_id: bundleId });
  return error ? { error: error.message } : {};
}

/** Die eigenen Gebote. Fremde liefert die Datenbank grundsätzlich nicht. */
export function useMyBids() {
  const supabase = useSupabaseBrowser();
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("supplier_bids")
      .select("id, bundle_id, list_price_net, lieferantenpreis_net, customer_price_net, anteil_pct, puffer_pct, is_winning_bid, created_at");
    // Auch hier nicht stillschweigend leeren: ein Werk, das seine eigenen
    // Gebote nicht sieht, soll erfahren warum.
    setFehler(error?.message ?? null);
    setBids((data ?? []) as MyBid[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { bids, loading, fehler, reload };
}

export async function withdrawDemand(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  bundleId: string,
  projectId?: string | null,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("withdraw_demand", {
    p_bundle_id: bundleId,
    p_project_id: projectId ?? null,
  });
  return error ? { error: error.message } : {};
}
