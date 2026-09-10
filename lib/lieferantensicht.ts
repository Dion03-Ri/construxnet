"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useFrischBeiRueckkehr, useLive } from "@/lib/live";

/**
 * Die Sicht eines Baustoffwerks auf sein eigenes Geschäft.
 *
 * Alles hier liest über Datenbankfunktionen, nicht über Tabellen. Der
 * Grund ist der gestaffelte Zuschnitt: Während der Ausschreibung darf ein
 * Werk je Baustelle nur die grobe Lage sehen, nach dem Zuschlag die volle
 * Adresse — und nur für das Bündel, das es gewonnen hat. Eine Zeilenregel
 * gilt überall; eine Funktion gilt genau dort, wo sie gemeint ist.
 */

export type Zuschlag = {
  bundle_id: string;
  titel: string;
  region: string | null;
  einheit: string | null;
  menge: number | null;
  mein_preis: number | null;
  bestellerpreis: number | null;
  provision_pct: number | null;
  provision_chf: number | null;
  liefer_von: string | null;
  liefer_bis: string | null;
  zugeschlagen_am: string | null;
  abgeschlossen_am: string | null;
  baustellen: number;
};

export type ZuschlagBaustelle = {
  baustelle: string;
  firma: string;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  kanton: string | null;
  menge: number;
  liefer_von: string;
  liefer_bis: string;
  kontakt: string | null;
};

export type Abrechnungszeile = {
  bundle_id: string;
  titel: string;
  menge: number | null;
  einheit: string | null;
  provision_pct: number | null;
  provision_chf: number | null;
  faellig_am: string | null;
  bezahlt_am: string | null;
  offen: boolean;
};

export type Kapazitaetszeile = {
  material_category: string;
  monat: string;
  menge: number;
  einheit: string | null;
};

/** Zuschläge und Abrechnung in einem Zug — beide hängen an denselben Bündeln. */
export function useZuschlaege() {
  const supabase = useSupabaseBrowser();
  const [zuschlaege, setZuschlaege] = useState<Zuschlag[]>([]);
  const [abrechnung, setAbrechnung] = useState<Abrechnungszeile[]>([]);
  const [laden, setLaden] = useState(true);

  const holen = useCallback(async () => {
    const [z, a] = await Promise.all([
      supabase.rpc("meine_zuschlaege"),
      supabase.rpc("meine_abrechnung"),
    ]);
    setZuschlaege((z.data ?? []) as Zuschlag[]);
    setAbrechnung((a.data ?? []) as Abrechnungszeile[]);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    void holen();
  }, [holen]);
  useLive(supabase, "zuschlaege", ["bundles"], holen);
  useFrischBeiRueckkehr(holen);

  const baustellen = useCallback(
    async (bundleId: string): Promise<ZuschlagBaustelle[]> => {
      const { data } = await supabase.rpc("zuschlag_baustellen", { p_bundle_id: bundleId });
      return (data ?? []) as ZuschlagBaustelle[];
    },
    [supabase],
  );

  return { zuschlaege, abrechnung, laden, baustellen, neuLaden: holen };
}

/** Das eigene Lieferprofil: welche Menge je Material und Monat. */
export function useKapazitaet() {
  const supabase = useSupabaseBrowser();
  const [zeilen, setZeilen] = useState<Kapazitaetszeile[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const holen = useCallback(async () => {
    const { data } = await supabase
      .from("lieferant_kapazitaet")
      .select("material_category, monat, menge, einheit")
      .order("material_category")
      .order("monat");
    setZeilen((data ?? []) as Kapazitaetszeile[]);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    void holen();
  }, [holen]);
  useFrischBeiRueckkehr(holen);

  const setzen = useCallback(
    async (kategorie: string, von: string, bis: string, menge: number, einheit: string) => {
      setFehler(null);
      const { error } = await supabase.rpc("kapazitaet_setzen", {
        p_kategorie: kategorie,
        p_von: von,
        p_bis: bis,
        p_menge: menge,
        p_einheit: einheit || null,
      });
      if (error) setFehler(error.message);
      await holen();
      return !error;
    },
    [supabase, holen],
  );

  return { zeilen, laden, fehler, setzen, neuLaden: holen };
}
