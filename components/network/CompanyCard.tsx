"use client";

import Link from "next/link";
import { BadgeCheck, UserPlus, Handshake, Clock, Check, X, MessageSquare } from "lucide-react";
import { GRID_BG, ROLE_LABEL, initials, type ConnState, type NetCompany } from "@/lib/network";
import { cn } from "@/lib/utils";

/**
 * Firmenkarte des Netzwerks — eine Darstellung für Vorschläge, Entdecken und
 * die eigene Verbindungsliste. Der Zustand der Verbindung bestimmt, welche
 * Handlung angeboten wird.
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

  return (
    /* Handy: kompakte Zeile, damit viele Firmen auf den Bildschirm passen.
       Ab sm die Karte mit dunklem Kopf wie im uebrigen Netzwerk. */
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-brand/40 hover:shadow-cardhover sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 sm:text-center">
      {onDismiss && !conn && (
        <button
          type="button"
          onClick={() => onDismiss(company.id)}
          aria-label="Vorschlag ausblenden"
          className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative hidden h-14 overflow-hidden bg-navy-900 sm:block">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={GRID_BG} />
      </div>

      <Link
        href={`/company/${company.id}`}
        className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-[13px] font-bold text-slate-700 sm:hidden"
      >
        {company.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(company.company_name)
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col items-start sm:items-center sm:px-4 sm:pb-4">
        <Link
          href={`/company/${company.id}`}
          className="hidden h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-base font-bold text-slate-700 shadow-sm sm:-mt-8 sm:flex"
        >
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
          ) : (
            initials(company.company_name)
          )}
        </Link>
        <Link
          href={`/company/${company.id}`}
          className="flex max-w-full items-center gap-1 text-[14px] font-semibold text-slate-900 hover:text-brand sm:mt-2 sm:justify-center sm:text-[15px]"
        >
          <span className="truncate">{company.company_name}</span>
          {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
        </Link>
        <p className="truncate text-xs text-slate-500">
          {ROLE_LABEL[company.role] ?? company.role}
          {company.city ? ` · ${company.city}` : company.canton ? ` · ${company.canton}` : ""}
        </p>
        <span
          className={cn(
            "mt-2 hidden rounded-md border px-2.5 py-0.5 text-[11px] font-medium sm:inline-block",
            company.role === "SUPPLIER"
              ? "border-brand/25 bg-brand/5 text-brand-700"
              : "border-slate-200 bg-slate-50 text-slate-500",
          )}
        >
          {company.role === "SUPPLIER" ? "Möglicher Lieferant" : "Möglicher Bündel-Partner"}
        </span>

        <div className="mt-2.5 flex w-full gap-1.5 sm:mt-3.5">
          {connected ? (
            <>
              <Link
                href={`/messages?to=${company.id}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
              >
                <MessageSquare className="h-4 w-4" /> Nachricht
              </Link>
              {company.role === "SUPPLIER" && onRequest && (
                <button
                  type="button"
                  onClick={() => onRequest(company)}
                  title="Direkt anfragen"
                  aria-label={`${company.company_name} direkt anfragen`}
                  className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
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
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
              >
                <Check className="h-4 w-4" /> Annehmen
              </button>
              <button
                type="button"
                onClick={() => onRemove(conn!.id)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
              >
                Ignorieren
              </button>
            </>
          ) : pendingOut ? (
            <button
              type="button"
              onClick={() => onRemove?.(conn!.id)}
              title="Einladung zurückziehen"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            >
              <Clock className="h-4 w-4" /> Angefragt
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onConnect(company.id)}
                disabled={!canAct}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" /> Vernetzen
              </button>
              {/* Zweiter Weg zum Preis: ohne Bündelung direkt anfragen. */}
              {company.role === "SUPPLIER" && onRequest && (
                <button
                  type="button"
                  onClick={() => onRequest(company)}
                  disabled={!canAct}
                  title="Direkt anfragen"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Handshake className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
