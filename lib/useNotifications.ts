"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Gavel,
  UserPlus,
  Tag,
  Trophy,
  Clock,
  MessageSquare,
  XCircle,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";

export type NoticeCat = "pool" | "offer" | "network";

export type Notice = {
  /** Stabil über Neuladen hinweg — leitet sich aus dem Vorgang ab. */
  id: string;
  cat: NoticeCat;
  icon: LucideIcon;
  tone: string;
  actor: string;
  text: string;
  /** Zeitpunkt des Vorgangs, ISO. */
  at: string;
  href: string;
};

export const NOTICE_TABS: { key: "all" | NoticeCat; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "pool", label: "Bündel" },
  { key: "offer", label: "Angebote" },
  { key: "network", label: "Netzwerk" },
];

const TONE = {
  gold: "text-brand bg-brand/10",
  navy: "text-accent bg-accent-50",
  rose: "text-rose-600 bg-rose-50",
} as const;

/** „vor 12 Min." / „vor 3 Std." / „vor 2 Tagen" */
export function relTime(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.round(h / 24);
  return d === 1 ? "vor 1 Tag" : `vor ${d} Tagen`;
}

/**
 * Benachrichtigungen aus dem ableiten, was ohnehin in der Datenbank steht.
 *
 * Keine eigene Tabelle: die müsste bei jedem Vorgang mitgeschrieben werden
 * und liefe früher oder später auseinander. Eine Meldung über ein Bündel,
 * das es nicht mehr gibt, ist schlimmer als gar keine.
 *
 * Gespeichert wird nur, wann zuletzt alles gelesen wurde.
 */
export function useNotifications() {
  const supabase = useSupabaseBrowser();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Die eigene Firma über die Datenbank bestimmen. Ein `.limit(1)` auf
    // companies liefert eine beliebige fremde Firma — das Verzeichnis ist
    // absichtlich offen, "die erste Zeile" ist nicht die eigene.
    const myId = await fetchMyCompanyId(supabase);
    const me = myId
      ? await supabase
          .from("companies")
          .select("id, role, notifications_seen_at")
          .eq("id", myId)
          .maybeSingle()
      : { data: null };

    const isSupplier = (me.data as { role?: string } | null)?.role === "SUPPLIER";
    setSeenAt((me.data as { notifications_seen_at?: string } | null)?.notifications_seen_at ?? null);

    if (!myId) {
      setNotices([]);
      setLoading(false);
      return;
    }

    const [conns, requests, participations, messages] = await Promise.all([
      supabase
        .from("connections")
        .select("id, company_id_a, company_id_b, requested_by, status, created_at")
        .eq("status", "PENDING"),
      supabase
        .from("direct_requests")
        .select(
          "id, status, material_label, quantity, unit, created_at, updated_at, buyer_company_id, supplier_company_id, buyer:companies!direct_requests_buyer_company_id_fkey(company_name), supplier:companies!direct_requests_supplier_company_id_fkey(company_name), offers:direct_offers(unit_price, created_at, status)",
        )
        .order("updated_at", { ascending: false })
        .limit(30),
      supabase
        .from("bundle_participations")
        .select("bundle_id, requested_volume, status")
        .neq("status", "CANCELLED"),
      supabase
        .from("messages")
        .select("id, sender_company_id, content, created_at, read_at, sender:companies!messages_sender_company_id_fkey(company_name)")
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    const out: Notice[] = [];

    // Verbindungsanfragen, die an mich gerichtet sind.
    for (const c of (conns.data ?? []) as Record<string, string>[]) {
      if (c.requested_by === myId) continue;
      out.push({
        id: `conn:${c.id}`,
        cat: "network",
        icon: UserPlus,
        tone: TONE.navy,
        actor: "Neue Verbindungsanfrage",
        text: "wartet auf deine Antwort.",
        at: c.created_at,
        href: "/network/requests",
      });
    }

    type Req = {
      id: string;
      status: string;
      material_label: string;
      quantity: number;
      unit: string;
      created_at: string;
      updated_at: string;
      buyer_company_id: string;
      supplier_company_id: string;
      buyer: { company_name: string } | null;
      supplier: { company_name: string } | null;
      offers: { unit_price: number; created_at: string; status: string }[];
    };

    for (const r of (requests.data ?? []) as unknown as Req[]) {
      const iAmSupplier = r.supplier_company_id === myId;

      // Lieferant: eine offene Anfrage wartet auf ein Angebot.
      if (iAmSupplier && r.status === "OPEN") {
        out.push({
          id: `req:${r.id}:open`,
          cat: "offer",
          icon: Handshake,
          tone: TONE.gold,
          actor: r.buyer?.company_name ?? "Ein Bauunternehmen",
          text: `fragt ${Number(r.quantity).toLocaleString("de-CH")} ${r.unit} ${r.material_label} an.`,
          at: r.created_at,
          href: "/dashboard?view=requests",
        });
      }

      // Besteller: ein Angebot ist eingetroffen.
      if (!iAmSupplier && r.status === "OFFERED") {
        const latest = [...r.offers]
          .filter((o) => o.status === "OPEN")
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
        if (latest) {
          out.push({
            id: `req:${r.id}:offer:${latest.created_at}`,
            cat: "offer",
            icon: Tag,
            tone: TONE.gold,
            actor: r.supplier?.company_name ?? "Ein Baustoffwerk",
            text: `bietet CHF ${Number(latest.unit_price).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${r.unit} für ${r.material_label}.`,
            at: latest.created_at,
            href: "/dashboard?view=requests",
          });
        }
      }
    }

    // Zustand der eigenen Bündel.
    const myBundleIds = ((participations.data ?? []) as { bundle_id: string }[]).map(
      (p) => p.bundle_id,
    );
    if (myBundleIds.length > 0) {
      const { data: bs } = await supabase
        .from("bundles")
        .select(
          "id, material_label, title, region, status, deadline, bid_deadline, awarded_price, unit, current_discount_pct, current_tier, failed_reason, created_at",
        )
        .in("id", myBundleIds);

      type B = {
        id: string;
        material_label: string | null;
        title: string;
        region: string;
        status: string;
        deadline: string;
        bid_deadline: string | null;
        awarded_price: number | null;
        unit: string;
        current_discount_pct: number;
        current_tier: number;
        failed_reason: string | null;
      };

      for (const b of (bs ?? []) as B[]) {
        const name = `${b.material_label ?? b.title} · ${b.region}`;
        if (b.status === "SEALED_BIDDING") {
          out.push({
            id: `bundle:${b.id}:bidding`,
            cat: "pool",
            icon: Gavel,
            tone: TONE.navy,
            actor: name,
            text: "ist in der Ausschreibung — die Werke bieten jetzt verdeckt.",
            at: b.bid_deadline ?? b.deadline,
            href: "/pools",
          });
        } else if (b.status === "AWARDED") {
          out.push({
            id: `bundle:${b.id}:awarded`,
            cat: "pool",
            icon: Trophy,
            tone: TONE.gold,
            actor: name,
            text: b.awarded_price
              ? `ist vergeben — Zuschlag bei CHF ${Number(b.awarded_price).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${b.unit}.`
              : "ist vergeben.",
            at: b.bid_deadline ?? b.deadline,
            href: "/pools",
          });
        } else if (b.status === "FAILED") {
          out.push({
            id: `bundle:${b.id}:failed`,
            cat: "pool",
            icon: XCircle,
            tone: TONE.rose,
            actor: name,
            text: b.failed_reason ?? "kam nicht zustande — ohne Verpflichtung für dich.",
            at: b.deadline,
            href: "/pools",
          });
        } else if (b.status === "OPEN") {
          const h = (new Date(b.deadline).getTime() - Date.now()) / 3_600_000;
          if (h > 0 && h < 72) {
            out.push({
              id: `bundle:${b.id}:closing`,
              cat: "pool",
              icon: Clock,
              tone: TONE.gold,
              actor: name,
              text: `schliesst in ${Math.round(h)} Std. — bis dahin zählt jede zusätzliche Menge.`,
              at: new Date(Date.now() - 60_000).toISOString(),
              href: "/pools",
            });
          }
        }
      }
    }

    // Ungelesene Nachrichten an mich.
    type Msg = {
      id: string;
      sender_company_id: string;
      content: string;
      created_at: string;
      sender: { company_name: string } | null;
    };
    for (const m of (messages.data ?? []) as unknown as Msg[]) {
      if (m.sender_company_id === myId) continue;
      out.push({
        id: `msg:${m.id}`,
        cat: "network",
        icon: MessageSquare,
        tone: TONE.navy,
        actor: m.sender?.company_name ?? "Neue Nachricht",
        text: m.content.split("\n")[0].slice(0, 90),
        at: m.created_at,
        href: `/messages?to=${m.sender_company_id}`,
      });
    }

    out.sort((a, b) => b.at.localeCompare(a.at));
    setNotices(out);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = useMemo(
    () => (seenAt ? notices.filter((n) => n.at > seenAt).length : notices.length),
    [notices, seenAt],
  );

  const isUnread = useCallback(
    (n: Notice) => (seenAt ? n.at > seenAt : true),
    [seenAt],
  );

  const markAllSeen = useCallback(async () => {
    setSeenAt(new Date().toISOString());
    await supabase.rpc("mark_notifications_seen").then(undefined, () => undefined);
  }, [supabase]);

  return { notices, unread, isUnread, markAllSeen, loading, reload: load };
}
