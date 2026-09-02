"use client";

import { useMemo } from "react";
import {
  useDirectRequests,
  currentOffer,
  type DirectRequest,
} from "@/lib/directRequests";

/**
 * Welche Beschaffungs-Materialien fallen unter welche KBOB-Reihe?
 *
 * Die Index-Reihen sind grob (vier Warengruppen), der Materialkatalog ist
 * fein. Hier wird über den Schlüssel-Anfang zugeordnet — das reicht,
 * solange die Katalogschlüssel ihrer Gruppe folgen.
 */
const GROUP_PREFIXES: Record<string, string[]> = {
  beton: ["beton", "estrich", "zement", "kalk"],
  stahl: ["stahl"],
  kies: ["kies", "sand", "rc-"],
  transport: ["transport", "diesel"],
};

export type Purchase = {
  id: string;
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

function belongsTo(materialKey: string, group: string) {
  return (GROUP_PREFIXES[group] ?? []).some((p) => materialKey.startsWith(p));
}

function toPurchase(r: DirectRequest): Purchase | null {
  const offer = currentOffer(r);
  if (!offer || offer.status !== "ACCEPTED") return null;
  return {
    id: r.id,
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
 * Die eigenen abgeschlossenen Einkäufe, nach Index-Warengruppe.
 *
 * Bewusst nur angenommene Angebote: was tatsächlich zustande gekommen
 * ist, taugt als Vergleich zum Referenzpreis — ein offenes Angebot nicht.
 */
export function useOwnPurchases(group: string) {
  const { requests, loading, error } = useDirectRequests();

  const purchases = useMemo(() => {
    return requests
      .filter((r) => r.status === "ACCEPTED" && belongsTo(r.material_key, group))
      .map(toPurchase)
      .filter((p): p is Purchase => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [requests, group]);

  /** Durchschnittlicher Abstand zum Referenzpreis, mengengewichtet. */
  const avgDelta = useMemo(() => {
    const withRef = purchases.filter((p) => p.reference && p.reference > 0);
    if (withRef.length === 0) return null;
    const totalQty = withRef.reduce((s, p) => s + p.quantity, 0);
    if (totalQty === 0) return null;
    const weighted = withRef.reduce(
      (s, p) => s + ((p.unitPrice - p.reference!) / p.reference!) * p.quantity,
      0,
    );
    return (weighted / totalQty) * 100;
  }, [purchases]);

  return { purchases, avgDelta, loading, error };
}
