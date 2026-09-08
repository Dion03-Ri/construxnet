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
    /* Eine Zeile, keine Karte.

       Bei dreissig Firmen ergaben dreissig umrandete Kaesten eine Wand,
       in der keine wichtiger war als die andere — und der Vernetzen-Knopf
       lief ueber die ganze Breite, weil er in einer schmalen Spalte
       entworfen war. Jetzt: links wer, rechts was man tun kann,
       dazwischen Luft. Getrennt nur durch eine Haarlinie. */
    <div className="group relative flex flex-col gap-4 border-t border-white/[0.08] py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center">
      {onDismiss && !conn && (
        <button
          type="button"
          onClick={() => onDismiss(company.id)}
          aria-label="Vorschlag ausblenden"
          className="absolute right-0 top-4 grid h-7 w-7 place-items-center rounded-lg text-white/25 transition-colors hover:bg-white/[0.07] hover:text-white/55"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <Link
          href={`/company/${company.id}`}
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-[13px] font-bold",
            isSupplier ? "bg-brand/15 text-brand" : "bg-white/[0.08] text-white/70",
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
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-white/40">
            <span className="inline-flex items-center gap-1">
              <RoleIcon className="h-3.5 w-3.5 shrink-0" />
              {ROLE_LABEL[company.role] ?? company.role}
            </span>
            {(company.city || company.canton) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[company.city, company.canton].filter(Boolean).join(" · ")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stand der Beziehung — ein Wort, kein Etikett. */}
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
          connected || pendingIn ? "text-brand" : "text-white/30",
        )}
      >
        {connected ? (
          <><Check className="h-3 w-3" /> Verbunden</>
        ) : pendingOut ? (
          <><Clock className="h-3 w-3" /> Einladung offen</>
        ) : pendingIn ? (
          "Möchte sich vernetzen"
        ) : isSupplier ? (
          "Möglicher Lieferant"
        ) : (
          "Möglicher Bündel-Partner"
        )}
      </span>

      <div className="flex shrink-0 gap-2">
        {connected ? (
          <>
            <Link
              href={`/messages?to=${company.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] px-3.5 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:text-brand"
            >
              <MessageSquare className="h-4 w-4" /> Nachricht
            </Link>
            {isSupplier && onRequest && (
              <button
                type="button"
                onClick={() => onRequest(company)}
                title="Direkt anfragen"
                aria-label={`${company.company_name} direkt anfragen`}
                className="inline-flex items-center justify-center rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-navy-950 transition-colors hover:bg-brand-600"
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
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-navy-950 transition-colors hover:bg-brand-600"
            >
              <Check className="h-4 w-4" /> Annehmen
            </button>
            <button
              type="button"
              onClick={() => onRemove(conn!.id)}
              className="rounded-lg border border-white/[0.10] px-3.5 py-2 text-[13px] font-semibold text-white/55 transition-colors hover:bg-white/[0.05]"
            >
              Ignorieren
            </button>
          </>
        ) : pendingOut ? (
          <button
            type="button"
            onClick={() => onRemove?.(conn!.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] px-3.5 py-2 text-[13px] font-semibold text-white/55 transition-colors hover:border-white/[0.16] hover:text-white/75"
          >
            Einladung zurückziehen
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onConnect(company.id)}
              disabled={!canAct}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand/40 px-4 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.10] px-3 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
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
