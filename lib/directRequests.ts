"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

export type RequestStatus =
  | "OPEN"
  | "OFFERED"
  | "ACCEPTED"
  | "DECLINED"
  | "WITHDRAWN";

export type OfferStatus = "OPEN" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";

export type DirectOffer = {
  id: string;
  request_id: string;
  supplier_company_id: string;
  unit_price: number;
  delivery_promise: string | null;
  valid_until: string | null;
  note: string | null;
  status: OfferStatus;
  created_at: string;
};

export type DirectRequest = {
  id: string;
  buyer_company_id: string;
  supplier_company_id: string;
  project_id: string | null;
  material_key: string;
  material_label: string;
  spec: string | null;
  unit: string;
  quantity: number;
  kbob_reference_price: number | null;
  delivery_window: string | null;
  note: string | null;
  respond_by: string | null;
  status: RequestStatus;
  created_at: string;
  buyer: { id: string; company_name: string; city: string | null } | null;
  supplier: { id: string; company_name: string; city: string | null } | null;
  offers: DirectOffer[];
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  OPEN: "Warte auf Angebot",
  OFFERED: "Angebot liegt vor",
  ACCEPTED: "Angenommen",
  DECLINED: "Abgelehnt",
  WITHDRAWN: "Zurückgezogen",
};

/** Offen heisst: es kann sich noch etwas bewegen. */
export function isLive(status: RequestStatus) {
  return status === "OPEN" || status === "OFFERED";
}

/**
 * Das aktuell gültige Angebot einer Anfrage.
 *
 * Nachgebesserte Angebote kommen dazu statt zu ersetzen, damit der
 * Verlauf erhalten bleibt. Massgeblich ist ein angenommenes Angebot,
 * sonst das jüngste offene.
 */
export function currentOffer(r: DirectRequest): DirectOffer | null {
  const accepted = r.offers.find((o) => o.status === "ACCEPTED");
  if (accepted) return accepted;
  const open = r.offers
    .filter((o) => o.status === "OPEN")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return open[0] ?? null;
}

/**
 * Abstand zum KBOB-Referenzpreis in Prozent. Negativ = günstiger.
 * Null, wenn keine Referenz hinterlegt ist.
 */
export function deltaToKbob(r: DirectRequest, o: DirectOffer): number | null {
  if (!r.kbob_reference_price) return null;
  return ((o.unit_price - r.kbob_reference_price) / r.kbob_reference_price) * 100;
}

/** Ein Angebot ist abgelaufen, wenn seine Gültigkeit vorbei ist. */
export function isExpired(o: DirectOffer) {
  if (!o.valid_until) return false;
  return o.valid_until < new Date().toISOString().slice(0, 10);
}

const SELECT = `
  *,
  buyer:companies!direct_requests_buyer_company_id_fkey(id, company_name, city),
  supplier:companies!direct_requests_supplier_company_id_fkey(id, company_name, city),
  offers:direct_offers(*)
`;

/**
 * Alle Anfragen, an denen die eigene Firma beteiligt ist — als
 * Besteller wie als Lieferant. RLS sortiert aus, was nicht zu sehen ist.
 */
export function useDirectRequests() {
  const supabase = useSupabaseBrowser();
  const [requests, setRequests] = useState<DirectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("direct_requests")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setRequests([]);
    } else {
      setError(null);
      setRequests((data ?? []) as unknown as DirectRequest[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { requests, loading, error, reload };
}
