"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useBundles, type Bundle } from "@/lib/bundles";
import { useZuschlaege } from "@/lib/lieferantensicht";

/**
 * Die Zahlen des Dashboards — aus echten Zeilen, nicht aus dem Quelltext.
 *
 * Hier standen bis zuletzt feste Beträge: „CHF 4.2 Mio.", „1'847
 * Bestellungen", „13.8 % Ersparnis", vier erfundene Bestellungen mit
 * PDF-Knopf und drei erfundene SIA-Verträge. Sie standen bei JEDEM Konto,
 * auch bei einem frisch angelegten, das noch nichts bestellt hat.
 *
 * Das ist schlimmer als eine leere Seite. Eine leere Seite sagt „hier ist
 * noch nichts"; eine erfundene Zahl sagt „so steht es um dich" — und
 * danach richtet sich jemand. Beim Testen kommt dazu, dass man nicht mehr
 * unterscheiden kann, ob eine Bestellung angekommen ist oder ob man die
 * Attrappe ansieht.
 *
 * Was es nicht gibt, gibt es jetzt nicht: keine Zeile, keine Zahl.
 */

export type Kennzahl = { label: string; value: string; delta: number | null };

export type Bestellung = {
  bundleId: string;
  /** Belegnummer: die des SIA-Vertrags, sonst aus der Bündelkennung. */
  nummer: string;
  /** Nummer des SIA-118-Vertrags, sofern einer entstanden ist. */
  vertrag: string | null;
  material: string;
  materialId: string | null;
  sia: string;
  menge: number;
  einheit: string;
  einzelpreis: number | null;
  betrag: number | null;
  datum: string;
  status: "In Arbeit" | "Abgeschlossen";
};

export type Vertrag = {
  id: string;
  bundleId: string | null;
  nummer: string;
  material: string;
  menge: number;
  einheit: string;
  preis: number;
  status: "Aktiv" | "Abgeschlossen";
};

export type MonatsWert = { m: string; v: number };
export type KategorieWert = { name: string; amount: number };

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function chfKurz(v: number): string {
  if (v >= 1_000_000) return `CHF ${(v / 1_000_000).toLocaleString("de-CH", { maximumFractionDigits: 1 })} Mio.`;
  return `CHF ${Math.round(v).toLocaleString("de-CH")}`;
}

/**
 * Ein Zeitpunkt, an dem ein Bündel für den Besteller zur Bestellung wurde.
 * `completed_at` steht nicht auf dem Bündel-Typ; der Zuschlag ist der
 * belastbare Moment, und ohne ihn bleibt das Anlegedatum.
 */
function datumVon(b: Bundle): Date {
  return new Date(b.deadline ?? b.created_at);
}

export function useKennzahlen(rolle: "buyer" | "supplier") {
  const supabase = useSupabaseBrowser();
  const { bundles, mine, loading: bundlesLaden } = useBundles();
  const { zuschlaege, laden: zuschlaegeLaden } = useZuschlaege();

  const [vertraege, setVertraege] = useState<Vertrag[]>([]);
  const [vertraegeLaden, setVertraegeLaden] = useState(true);

  const holeVertraege = useCallback(async () => {
    // Die Zeilenregel zeigt beide Seiten ihre eigenen Verträge — Besteller
    // wie Werk. Ein Filter auf die eigene Firma ist deshalb nicht nötig
    // und wäre eine zweite Wahrheit neben der Regel.
    const { data } = await supabase
      .from("sia_contracts")
      .select("id, contract_number, bundle_id, total_contract_volume, final_unit_price_net, created_at")
      .order("created_at", { ascending: false });
    setVertraege(
      (data ?? []).map((r) => {
        const b = bundles.find((x) => x.id === r.bundle_id);
        return {
          id: r.id as string,
          bundleId: (r.bundle_id as string | null) ?? null,
          nummer: r.contract_number as string,
          material: b?.material_label ?? b?.title ?? "—",
          menge: Number(r.total_contract_volume),
          einheit: b?.unit ?? "",
          preis: Number(r.final_unit_price_net),
          status: b?.status === "AWARDED" ? "Aktiv" : "Abgeschlossen",
        } satisfies Vertrag;
      }),
    );
    setVertraegeLaden(false);
  }, [supabase, bundles]);

  useEffect(() => {
    void holeVertraege();
  }, [holeVertraege]);

  /** Die eigenen Teilnahmen, nach Bündel nachschlagbar. */
  const meineMenge = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of mine) m.set(p.bundle_id, (m.get(p.bundle_id) ?? 0) + Number(p.requested_volume));
    return m;
  }, [mine]);

  /** Zugeschlagene Bündel, an denen diese Firma als Bestellerin hängt. */
  const meineZuschlaege = useMemo(
    () => bundles.filter((b) => b.status === "AWARDED" && meineMenge.has(b.id)),
    [bundles, meineMenge],
  );

  const bestellungen = useMemo<Bestellung[]>(() => {
    if (rolle !== "buyer") return [];
    const vertragZu = new Map(vertraege.filter((v) => v.bundleId).map((v) => [v.bundleId as string, v.nummer]));
    return meineZuschlaege
      .map((b) => {
        const menge = meineMenge.get(b.id) ?? 0;
        const preis = b.awarded_price != null ? Number(b.awarded_price) : null;
        const vertrag = vertragZu.get(b.id) ?? null;
        return {
          bundleId: b.id,
          // Ohne Vertrag gibt es keine amtliche Nummer. Statt eine zu
          // erfinden, wird die Bündelkennung gekürzt — sie ist echt und
          // in der Datenbank wiederzufinden.
          nummer: vertrag ?? `OBT-${b.id.slice(0, 8).toUpperCase()}`,
          vertrag,
          material: b.material_label ?? b.title,
          materialId: b.material_id,
          sia: b.sia_specification,
          menge,
          einheit: b.unit,
          einzelpreis: preis,
          betrag: preis != null ? preis * menge : null,
          datum: datumVon(b).toLocaleDateString("de-CH"),
          status: "In Arbeit" as const,
        };
      })
      .sort((a, b) => (a.datum < b.datum ? 1 : -1));
  }, [rolle, meineZuschlaege, meineMenge, vertraege]);

  /** Monatsvolumen der letzten zwölf Monate, in Tausend Franken. */
  const monatsVolumen = useMemo<MonatsWert[]>(() => {
    const jetzt = new Date();
    const faecher: MonatsWert[] = [];
    const index = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(jetzt.getFullYear(), jetzt.getMonth() - i, 1);
      const schluessel = `${d.getFullYear()}-${d.getMonth()}`;
      index.set(schluessel, faecher.length);
      faecher.push({ m: MONATE[d.getMonth()], v: 0 });
    }

    const eintrag = (d: Date, betrag: number) => {
      const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (i != null) faecher[i].v += betrag / 1000;
    };

    if (rolle === "buyer") {
      for (const b of meineZuschlaege) {
        if (b.awarded_price == null) continue;
        eintrag(datumVon(b), Number(b.awarded_price) * (meineMenge.get(b.id) ?? 0));
      }
    } else {
      for (const z of zuschlaege) {
        if (z.mein_preis == null || z.menge == null || !z.zugeschlagen_am) continue;
        eintrag(new Date(z.zugeschlagen_am), Number(z.mein_preis) * Number(z.menge));
      }
    }
    return faecher.map((f) => ({ ...f, v: Math.round(f.v) }));
  }, [rolle, meineZuschlaege, meineMenge, zuschlaege]);

  /** Ausgaben je Materialkategorie — nur Besteller, nur Zugeschlagenes. */
  const nachKategorie = useMemo<KategorieWert[]>(() => {
    if (rolle !== "buyer") return [];
    const m = new Map<string, number>();
    for (const b of meineZuschlaege) {
      if (b.awarded_price == null) continue;
      const betrag = Number(b.awarded_price) * (meineMenge.get(b.id) ?? 0);
      m.set(b.material_category, (m.get(b.material_category) ?? 0) + betrag);
    }
    return [...m.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [rolle, meineZuschlaege, meineMenge]);

  const kennzahlen = useMemo<Kennzahl[]>(() => {
    if (rolle === "buyer") {
      const volumen = bestellungen.reduce((s, o) => s + (o.betrag ?? 0), 0);
      // Der erzielte Vorteil, gemessen am Referenzpreis, den das Bündel
      // bei der Anfrage festgehalten hat. Bündel ohne Referenz zählen
      // nicht mit — ein Durchschnitt über eine fehlende Zahl wäre keiner.
      const messbar = meineZuschlaege.filter(
        (b) => b.awarded_price != null && b.kbob_reference_price != null && Number(b.kbob_reference_price) > 0,
      );
      const schnitt =
        messbar.length === 0
          ? null
          : messbar.reduce(
              (s, b) =>
                s +
                ((Number(b.kbob_reference_price) - Number(b.awarded_price)) / Number(b.kbob_reference_price)) * 100,
              0,
            ) / messbar.length;
      const laufend = bundles.filter(
        (b) => meineMenge.has(b.id) && (b.status === "OPEN" || b.status === "SEALED_BIDDING"),
      ).length;

      return [
        { label: "Beschaffungsvolumen", value: volumen > 0 ? chfKurz(volumen) : "—", delta: null },
        { label: "Zugeschlagene Bündel", value: String(bestellungen.length), delta: null },
        { label: "Ø erzielter Vorteil", value: schnitt == null ? "—" : `${schnitt.toFixed(1)} %`, delta: null },
        { label: "Laufende Bündel", value: String(laufend), delta: null },
      ];
    }

    const volumen = zuschlaege.reduce(
      (s, z) => s + (z.mein_preis != null && z.menge != null ? Number(z.mein_preis) * Number(z.menge) : 0),
      0,
    );
    const provision = zuschlaege.reduce((s, z) => s + (z.provision_chf != null ? Number(z.provision_chf) : 0), 0);
    const offene = bundles.filter((b) => b.status === "SEALED_BIDDING").length;

    return [
      { label: "Zugesprochenes Volumen", value: volumen > 0 ? chfKurz(volumen) : "—", delta: null },
      { label: "Gewonnene Zuschläge", value: String(zuschlaege.length), delta: null },
      { label: "Offene Ausschreibungen", value: String(offene), delta: null },
      { label: "Provision (zugeschlagen)", value: provision > 0 ? chfKurz(provision) : "—", delta: null },
    ];
  }, [rolle, bestellungen, meineZuschlaege, meineMenge, bundles, zuschlaege]);

  return {
    kennzahlen,
    bestellungen,
    vertraege,
    monatsVolumen,
    nachKategorie,
    laden: bundlesLaden || vertraegeLaden || (rolle === "supplier" && zuschlaegeLaden),
  };
}
