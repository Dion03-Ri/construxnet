"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useFrischBeiRueckkehr, useLive } from "@/lib/live";

/**
 * Das Lieferantenkonto — die Lizenz zum Bieten.
 *
 * Man kauft sie nicht, man wird dazu zugelassen. Deshalb steht hier auch
 * kein Kaufknopf: es gibt einen Antrag, eine Prüfung durch einen Menschen,
 * und erst danach zahlt man — ab dem zweiten Jahr.
 *
 * Warum eine eigene Abfrage und nicht `companies.role`: Die Rolle wählt
 * man bei der Anmeldung selbst. Sie sagt, was jemand über sich behauptet,
 * nicht was er darf.
 */

export type Bietfaehigkeit = { ok: boolean; grund: string };

export type Lieferantenkonto = {
  status: "BEANTRAGT" | "ZUGELASSEN" | "ABGELEHNT" | "GESPERRT";
  nachweis_text: string | null;
  noga_code: string | null;
  begruendung: string | null;
  entschieden_am: string | null;
  frei_bis: string | null;
  bezahlt_bis: string | null;
  beantragt_am: string;
};

export function useLieferantenkonto() {
  const supabase = useSupabaseBrowser();
  const [konto, setKonto] = useState<Lieferantenkonto | null>(null);
  const [darf, setDarf] = useState<Bietfaehigkeit | null>(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const holen = useCallback(async () => {
    const [k, b] = await Promise.all([
      supabase
        .from("lieferantenkonten")
        .select("status, nachweis_text, noga_code, begruendung, entschieden_am, frei_bis, bezahlt_bis, beantragt_am")
        .maybeSingle(),
      supabase.rpc("meine_bietfaehigkeit"),
    ]);
    setKonto((k.data as Lieferantenkonto | null) ?? null);
    const zeile = Array.isArray(b.data) ? b.data[0] : b.data;
    setDarf((zeile as Bietfaehigkeit) ?? null);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    void holen();
  }, [holen]);

  // Wird der Antrag zugelassen, soll das ohne Neuladen ankommen — die
  // Entscheidung faellt woanders, oft Stunden spaeter.
  useLive(supabase, "lieferantenkonto", ["lieferantenkonten"], holen);
  useFrischBeiRueckkehr(holen);

  const beantragen = useCallback(
    async (nachweis: string, noga: string) => {
      setFehler(null);
      const { error } = await supabase.rpc("lieferantenkonto_beantragen", {
        p_nachweis_text: nachweis,
        p_noga: noga || null,
      });
      if (error) setFehler(error.message);
      await holen();
      return !error;
    },
    [supabase, holen],
  );

  return { konto, darf, laden, fehler, beantragen, neuLaden: holen };
}
