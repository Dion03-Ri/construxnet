"use client";

import { useMemo } from "react";
import {
  useDirectRequests,
  currentOffer,
  type DirectRequest,
} from "@/lib/directRequests";

/**
 * Welche Beschaffungs-Materialien fallen unter welche Index-Reihe?
 *
 * Die Index-Reihen sind grob (vier Warengruppen), der Materialkatalog ist
 * fein (über dreissig Positionen). Zugeordnet wird über den
 * Schlüssel-Anfang. Was in keine Gruppe passt — Dämmung, Mauerwerk, Holz,
 * Asphalt, Rohre, Bauchemie — bekommt die Gruppe null und wird auf der
 * Seite gesondert ausgewiesen, statt zu verschwinden.
 */
const GROUP_PREFIXES: Record<string, string[]> = {
  beton: ["beton-", "estrich", "zement-", "kalk", "moertel"],
  stahl: ["stahl-"],
  kies: ["kies-", "sand-", "rc-"],
  transport: ["transport", "diesel"],
};

export const INDEX_GROUPS = Object.keys(GROUP_PREFIXES);

export function groupOf(materialKey: string): string | null {
  for (const [group, prefixes] of Object.entries(GROUP_PREFIXES)) {
    if (prefixes.some((p) => materialKey.startsWith(p))) return group;
  }
  return null;
}

export type Purchase = {
  id: string;
  /** Index-Warengruppe, oder null wenn der Index sie nicht führt. */
  group: string | null;
  /** Periode im Format der Index-Reihe, z. B. "2026-Q2". */
  period: string;
  date: string;
  materialLabel: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reference: number | null;
  supplier: string;
};

function toPeriod(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

function toPurchase(r: DirectRequest): Purchase | null {
  const offer = currentOffer(r);
  if (!offer || offer.status !== "ACCEPTED") return null;
  return {
    id: r.id,
    group: groupOf(r.material_key),
    period: toPeriod(offer.created_at),
    date: offer.created_at,
    materialLabel: r.material_label,
    unit: r.unit,
    quantity: Number(r.quantity),
    unitPrice: Number(offer.unit_price),
    reference: r.kbob_reference_price != null ? Number(r.kbob_reference_price) : null,
    supplier: r.supplier?.company_name ?? "Lieferant",
  };
}

/**
 * Durchschnittlicher Abstand zum Referenzpreis in Prozent.
 *
 * Gewichtet wird nach Auftragswert, nicht nach Menge: 500 m³ Beton und
 * 2 t Stahl lassen sich als Mengen nicht sinnvoll gegeneinander wiegen,
 * als Franken schon.
 */
export function averageDelta(purchases: Purchase[]): number | null {
  const withRef = purchases.filter((p) => p.reference && p.reference > 0);
  if (withRef.length === 0) return null;
  const totalValue = withRef.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  if (totalValue === 0) return null;
  const weighted = withRef.reduce(
    (s, p) =>
      s + ((p.unitPrice - p.reference!) / p.reference!) * (p.quantity * p.unitPrice),
    0,
  );
  return (weighted / totalValue) * 100;
}

/**
 * Alle eigenen abgeschlossenen Einkäufe.
 *
 * Bewusst nur angenommene Angebote aus Direktanfragen: was tatsächlich
 * zustande gekommen ist, taugt als Vergleich zum Referenzpreis — ein
 * offenes Angebot nicht. Bündel-Teilnahmen sind nicht dabei, weil dort
 * (noch) kein Abschlusspreis erfasst wird.
 */
export function useOwnPurchases() {
  const { requests, loading, error } = useDirectRequests();

  const purchases = useMemo(
    () =>
      requests
        .filter((r) => r.status === "ACCEPTED")
        .map(toPurchase)
        .filter((p): p is Purchase => p !== null)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [requests],
  );

  return { purchases, loading, error };
}
