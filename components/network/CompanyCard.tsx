"use client";

import Link from "next/link";
import {
  BadgeCheck,
  UserPlus,
  Handshake,
  Clock,
  Check,
  X,
  MessageSquare,
  MapPin,
  Factory,
  Building2,
} from "lucide-react";
import { ROLE_LABEL, initials, type ConnState, type NetCompany } from "@/lib/network";
import { cn } from "@/lib/utils";

/**
 * Firmenkarte des Netzwerks — eine Darstellung für Vorschläge, Entdecken und
 * die Verbindungsliste.
 *
 * Bewusst ohne dunkles Kopfband mit überlappendem Logo: das Logo lag halb im
 * Schwarzen und war kaum lesbar. Stattdessen eine ruhige, helle Karte, in der
 * das Logo vollständig auf hellem Grund steht.
 */
export default function CompanyCard({
  company,
  conn,
  canAct,
  onConnect,
  onAccept,
  onRemove,
  onRequest,
  onDismiss,
}: {
  company: NetCompany;
  conn?: ConnState;
  canAct: boolean;
  onConnect: (id: string) => void;
  onAccept?: (connId: string) => void;
  onRemove?: (connId: string) => void;
  onRequest?: (c: NetCompany) => void;
  onDismiss?: (id: string) => void;
}) {
  const connected = conn?.status === "CONNECTED";
  const pendingOut = conn?.status === "PENDING" && conn.direction === "outgoing";
  const pendingIn = conn?.status === "PENDING" && conn.direction === "incoming";
  const isSupplier = company.role === "SUPPLIER";
  const RoleIcon = isSupplier ? Factory : Building2;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-[#0B1522] p-4 transition-all",
        connected ? "border-brand/30" : "border-white/[0.08] hover:border-brand/40 hover:shadow-cardhover",
      )}
    >
      {onDismiss && !conn && (
        <button
          type="button"
          onClick={() => onDismiss(company.id)}
          aria-label="Vorschlag ausblenden"
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-white/25 transition-colors hover:bg-white/[0.07] hover:text-white/55"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <Link
          href={`/company/${company.id}`}
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg text-[14px] font-bold ring-1",
            isSupplier
              ? "bg-brand/10 text-brand-700 ring-brand/20"
              : "bg-navy-900/[0.06] text-navy-900 ring-navy-900/10",
          )}
        >
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(company.company_name)
          )}
        </Link>

        <div className={cn("min-w-0 flex-1", onDismiss && !conn && "pr-5")}>
          <Link
            href={`/company/${company.id}`}
            className="flex items-center gap-1 text-[14.5px] font-semibold leading-tight text-white hover:text-brand"
          >
            <span className="truncate">{company.company_name}</span>
            {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-white/55">
            <RoleIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
            {ROLE_LABEL[company.role] ?? company.role}
          </p>
          {(company.city || company.canton) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-white/40">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {[company.city, company.canton].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Stand der Beziehung — sagt in einem Wort, woran man ist. */}
      <div className="mt-3">
        {connected ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-brand/25 bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
            <Check className="h-3 w-3" /> Verbunden
          </span>
        ) : pendingOut ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/55">
            <Clock className="h-3 w-3" /> Einladung offen
          </span>
        ) : pendingIn ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-brand/25 bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
            Möchte sich vernetzen
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/55">
            {isSupplier ? "Möglicher Lieferant" : "Möglicher Bündel-Partner"}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-1.5 border-t border-white/[0.06] pt-3">
        {connected ? (
          <>
            <Link
              href={`/messages?to=${company.id}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:text-brand"
            >
              <MessageSquare className="h-4 w-4" /> Nachricht
            </Link>
            {isSupplier && onRequest && (
              <button
                type="button"
                onClick={() => onRequest(company)}
                title="Direkt anfragen"
                aria-label={`${company.company_name} direkt anfragen`}
                className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
              >
                <Handshake className="h-4 w-4" />
              </button>
            )}
          </>
        ) : pendingIn && onAccept && onRemove ? (
          <>
            <button
              type="button"
              onClick={() => onAccept(conn!.id)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
            >
              <Check className="h-4 w-4" /> Annehmen
            </button>
            <button
              type="button"
              onClick={() => onRemove(conn!.id)}
              className="rounded-md border border-white/[0.08] px-3 py-2 text-[13px] font-semibold text-white/55 transition-colors hover:bg-white/[0.05]"
            >
              Ignorieren
            </button>
          </>
        ) : pendingOut ? (
          <button
            type="button"
            onClick={() => onRemove?.(conn!.id)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-2 text-[13px] font-semibold text-white/55 transition-colors hover:border-white/[0.16] hover:text-white/75"
          >
            Einladung zurückziehen
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onConnect(company.id)}
              disabled={!canAct}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" /> Vernetzen
            </button>
            {/* Zweiter Weg zum Preis: ohne Bündelung direkt anfragen. */}
            {isSupplier && onRequest && (
              <button
                type="button"
                onClick={() => onRequest(company)}
                disabled={!canAct}
                title="Direkt anfragen"
                aria-label={`${company.company_name} direkt anfragen`}
                className="inline-flex items-center justify-center rounded-md border border-white/[0.08] px-3 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Handshake className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
