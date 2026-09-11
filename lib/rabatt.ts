"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Die Rabattstaffel — aus der Datenbank, nicht aus dem Quelltext.
 *
 * Vorher stand sie an DREI Stellen: `PROC_TIERS` in `data/procurement.ts`,
 * `STEPS` in `lib/bundles.ts` und in der Datenbank. Alle drei in
 * Stückzahlen, alle drei mit anderen Zahlen als heute gültig. Genau diesen
 * Fehler hatte schon SourceOn: zwei Dateien, beide mit dem Vermerk „MUSS
 * synchron bleiben", und beide waren es nicht.
 *
 * `rabattstufen` ist öffentlich lesbar — eine Garantie, die man nicht
 * nachschlagen kann, ist keine. Deshalb darf der Browser sie holen und
 * selbst rechnen, statt bei jedem Tastendruck eine Abfrage zu stellen.
 */

export type Stufe = { material_category: string; ab_chf: number; rabatt_pct: number };

export function useRabattstufen() {
  const supabase = useSupabaseBrowser();
  const [stufen, setStufen] = useState<Stufe[]>([]);
  const [laden, setLaden] = useState(true);

  const holen = useCallback(async () => {
    const { data } = await supabase
      .from("rabattstufen")
      .select("material_category, ab_chf, rabatt_pct")
      .order("ab_chf");
    setStufen((data ?? []) as Stufe[]);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    void holen();
  }, [holen]);

  /**
   * Was dieser Firma bei diesem Bestellwert garantiert ist.
   *
   * `null` heisst „keine eigene Garantie" und ist etwas anderes als 0 %:
   * entweder liegt der Wert unter der Einstiegsschwelle, oder die Kategorie
   * lässt sich gar nicht bündeln. Beides muss der Aufrufer unterscheiden
   * können.
   */
  const meinMindestrabatt = useCallback(
    (kategorie: string, wertChf: number): number | null => {
      const passend = stufen
        .filter((s) => s.material_category === kategorie && s.ab_chf <= wertChf)
        .sort((a, b) => b.ab_chf - a.ab_chf)[0];
      return passend ? Number(passend.rabatt_pct) : null;
    },
    [stufen],
  );

  /** Lässt sich diese Kategorie überhaupt bündeln? */
  const buendelbar = useCallback(
    (kategorie: string) => stufen.some((s) => s.material_category === kategorie),
    [stufen],
  );

  /** Die Einstiegsschwelle einer Kategorie — ab wann es eine Garantie gibt. */
  const einstieg = useCallback(
    (kategorie: string): number | null => {
      const werte = stufen.filter((s) => s.material_category === kategorie).map((s) => Number(s.ab_chf));
      return werte.length ? Math.min(...werte) : null;
    },
    [stufen],
  );

  return { stufen, laden, meinMindestrabatt, buendelbar, einstieg };
}
